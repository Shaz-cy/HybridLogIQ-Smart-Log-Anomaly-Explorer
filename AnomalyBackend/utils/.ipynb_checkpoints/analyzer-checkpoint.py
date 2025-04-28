import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from minisom import MiniSom
from utils.embedding import embed_logs
from utils.autoencoder import build_autoencoder
from utils.heatmap import generate_heatmap

UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'

def analyze_logs():
    try:
        # === Step 1: Load uploaded logs ===
        uploaded_files = os.listdir(UPLOAD_FOLDER)
        if not uploaded_files:
            return {"error": "No uploaded log file found."}, None

        log_file = os.path.join(UPLOAD_FOLDER, uploaded_files[-1])
        with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
            logs = [line.strip() for line in f if line.strip()]
        log_messages = [' '.join(line.split()[8:]) for line in logs]

        # === Step 2: Embedding ===
        embeddings = embed_logs(log_messages)

        # === Step 3: Scaling + train/test split ===
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(embeddings)
        X_train, X_test = train_test_split(X_scaled, test_size=0.2, random_state=42)

        # === Step 4: Autoencoder ===
        ae = build_autoencoder(X_train.shape[1])
        ae.fit(X_train, X_train, epochs=20, batch_size=50, validation_split=0.1, verbose=0)

        X_pred = ae.predict(X_scaled)
        reconstruction_error = np.mean(np.square(X_scaled - X_pred), axis=1)

        threshold = np.percentile(reconstruction_error, 95)
        is_anomaly = reconstruction_error > threshold

        # === Step 5: SOM Clustering ===
        som = MiniSom(x=10, y=10, input_len=X_scaled.shape[1], sigma=1.0, learning
