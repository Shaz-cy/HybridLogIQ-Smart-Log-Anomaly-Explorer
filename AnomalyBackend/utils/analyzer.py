import os
import time
import torch
import numpy as np
import joblib
import threading
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report
from minisom import MiniSom
from transformers import RobertaTokenizer, RobertaModel

from .autoencoder import Autoencoder
from .file_handler import load_log_file
from utils.visualize import (
    generate_heatmap,
    visualize_som_2d,
    generate_error_histogram,
    generate_heatmap_grid,
    visualize_som_bmu_map
)

# === Load RoBERTa once globally ===
tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
model = RobertaModel.from_pretrained("roberta-base")
model.eval()

# === Cache to avoid redundant embeddings ===
embedding_cache = {}

def batch_list(data, batch_size):
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

def embed_logs(logs, batch_size=64):
    all_embeddings = []
    unique_logs = list(set(logs))

    for batch in batch_list(unique_logs, batch_size):
        uncached = [log for log in batch if log not in embedding_cache]
        if uncached:
            inputs = tokenizer(uncached, return_tensors="pt", truncation=True, padding=True, max_length=128)
            with torch.no_grad():
                outputs = model(**inputs)
                embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
                for i, log in enumerate(uncached):
                    embedding_cache[log] = embeddings[i]
    return np.vstack([embedding_cache[log] for log in logs])

def get_top_anomalies(logs, scores, top_n=10):
    sorted_items = sorted(zip(logs, scores), key=lambda x: x[1], reverse=True)
    return [{"log": log, "score": round(score, 6)} for log, score in sorted_items[:top_n]]

def categorize_severity(errors):
    return [
        "High" if e > 0.07 else "Medium" if e > 0.05 else "Low"
        for e in errors
    ]

def analyze_logs(logs, batch_size=64):
    if not os.path.exists("models/latest.txt"):
        raise RuntimeError("Model not trained. Please upload training data first.")

    with open("models/latest.txt") as f:
        MODEL_PATH, SCALER_PATH = f.read().splitlines()

    # === Embedding and scaling ===
    embedded = embed_logs(logs, batch_size=batch_size)
    scaler = joblib.load(SCALER_PATH)
    scaled_emb = scaler.transform(embedded)
    input_dim = scaled_emb.shape[1]

    # === Load Autoencoder and run reconstruction ===
    autoencoder = Autoencoder(input_dim)
    try:
        autoencoder.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device("cpu")))
    except Exception as e:
        raise RuntimeError("❌ Model file format invalid or incompatible. Please retrain the model.") from e

    autoencoder.eval()
    test_tensor = torch.tensor(scaled_emb).float()
    recon = autoencoder(test_tensor).detach().numpy()
    reconstruction_error = np.mean((scaled_emb - recon) ** 2, axis=1)

    # === Load or train SOM ===
    som_path = "models/som.pkl"
    if os.path.exists(som_path):
        som = joblib.load(som_path)
    else:
        som = MiniSom(x=6, y=6, input_len=input_dim, sigma=1.0, learning_rate=0.5)
        som.train_random(scaled_emb, 50)
        joblib.dump(som, som_path)

    winners = [som.winner(x) for x in scaled_emb]

    # === Parallel or direct visualization ===
    visual_threads = [
        threading.Thread(target=generate_heatmap, args=(reconstruction_error,)),
        threading.Thread(target=visualize_som_2d, args=(som, scaled_emb, reconstruction_error)),
        threading.Thread(target=generate_error_histogram, args=(reconstruction_error,)),
        threading.Thread(target=visualize_som_bmu_map, args=(som, scaled_emb))
    ]
    if len(logs) > 500:
        [t.start() for t in visual_threads]
        [t.join() for t in visual_threads]
    else:
        [t.run() for t in visual_threads]

    # === Histogram Binning ===
    hist_counts, hist_bins = np.histogram(reconstruction_error, bins="auto")
    histogram_data = [
        {
            "range": f"{round(hist_bins[i], 4)} - {round(hist_bins[i + 1], 4)}",
            "count": int(hist_counts[i])
        }
        for i in range(len(hist_counts))
    ]

    # === Severity and Summary ===
    severity_labels = categorize_severity(reconstruction_error)
    avg_error = round(np.mean(reconstruction_error), 6)
    high_sev_count = severity_labels.count("High")
    top_cluster_tuple = Counter(winners).most_common(1)[0][0]
    top_cluster = list(map(int, top_cluster_tuple))

    # === Classification Report (based on keyword heuristic) ===
    try:
        ground_truth = [1 if any(k in log for k in ["ERROR", "CRITICAL", "ALERT"]) else 0 for log in logs]
        predicted = [1 if s in ["High", "Medium"] else 0 for s in severity_labels]
        print("\n✅ Classification Report:\n")
        print(classification_report(ground_truth, predicted, target_names=["Normal", "Anomaly"]))
    except Exception as e:
        print("⚠️ Evaluation skipped (error generating report):", e)

    return {
        "logs": logs,
        "scores": reconstruction_error.tolist(),
        "top_anomalies": get_top_anomalies(logs, reconstruction_error, top_n=len(logs)),
        "summary": {
            "total_logs": len(logs),
            "anomalies_detected": high_sev_count,
            "avg_error": avg_error,
            "high_severity_count": high_sev_count,
            "top_som_cluster": top_cluster
        },
        "model_scores": {
            "autoencoder": reconstruction_error.tolist(),
            "som_clusters": winners
        },
        "heatmap_path": "/heatmap",
        "som_path": "/som",
        "histogram_path": "/histogram",
        "gridsearch_path": "/gridsearch",
        "bmu_path": "/bmu",
        "histogram_data": histogram_data,
        "severity": severity_labels
    }

def retrain_model_from_logs(logs, train_ratio=0.8, batch_size=64):
    os.makedirs("models", exist_ok=True)

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    model_path = f"models/autoencoder_{timestamp}.pt"
    scaler_path = f"models/scaler_{timestamp}.save"
    som_path = "models/som.pkl"
    metadata_path = f"models/metadata_{timestamp}.txt"

    train_emb = embed_logs(logs, batch_size=batch_size)
    scaler = MinMaxScaler()
    scaled_train = scaler.fit_transform(train_emb)
    input_dim = scaled_train.shape[1]

    # === Grid Search for Autoencoder ===
    bottlenecks = [8, 16, 32]
    learning_rates = [0.01, 0.001]
    grid_errors = []

    for b_size in bottlenecks:
        row_errors = []
        for lr in learning_rates:
            ae = Autoencoder(input_dim, bottleneck_dim=b_size)
            optimizer = torch.optim.Adam(ae.parameters(), lr=lr)
            criterion = torch.nn.MSELoss()
            X_train_tensor = torch.tensor(scaled_train).float()
            for epoch in range(15):
                output = ae(X_train_tensor)
                loss = criterion(output, X_train_tensor)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            ae.eval()
            recon = ae(X_train_tensor).detach().numpy()
            error = np.mean((scaled_train - recon) ** 2)
            row_errors.append(error)
        grid_errors.append(row_errors)

    generate_heatmap_grid(np.array(grid_errors), bottlenecks, learning_rates)

    # === Final Autoencoder Training ===
    autoencoder = Autoencoder(input_dim)
    optimizer = torch.optim.Adam(autoencoder.parameters(), lr=0.001)
    criterion = torch.nn.MSELoss()
    X_train_tensor = torch.tensor(scaled_train).float()
    for epoch in range(50):
        output = autoencoder(X_train_tensor)
        loss = criterion(output, X_train_tensor)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    torch.save(autoencoder.state_dict(), model_path)
    joblib.dump(scaler, scaler_path)

    with open("models/latest.txt", "w") as f:
        f.write(f"{model_path}\n{scaler_path}")

    with open(metadata_path, "w") as meta:
        meta.write(f"Model Timestamp: {timestamp}\n")
        meta.write(f"Logs Used: {len(logs)} lines\n")
        meta.write(f"Model Path: {model_path}\n")
        meta.write(f"Scaler Path: {scaler_path}\n")

    # === Train SOM ===
    som = MiniSom(x=6, y=6, input_len=input_dim, sigma=1.0, learning_rate=0.5)
    som.train_random(scaled_train, 50)
    joblib.dump(som, som_path)

    # Save baseline logs for reuse/debugging
    os.makedirs("uploads", exist_ok=True)
    with open("uploads/baseline_logs.txt", "w") as f:
        f.write("\n".join(logs))

    return True

