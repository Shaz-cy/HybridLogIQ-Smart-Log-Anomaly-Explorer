from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import traceback
import json
import numpy as np
import datetime
import logging

from utils.analyzer import analyze_logs, retrain_model_from_logs
from utils.file_handler import load_log_file

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# === Folder Setup ===
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
TRAINING_FOLDER = 'training_data'
TRAINING_LOGS_FOLDER = os.path.join(TRAINING_FOLDER, 'logs')

for folder in [UPLOAD_FOLDER, RESULTS_FOLDER, TRAINING_FOLDER, TRAINING_LOGS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

ALLOWED_EXTENSIONS = {'.log', '.txt'}

# === Helper Functions ===
def allowed_file(filename):
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)

def convert_to_python(obj):
    if isinstance(obj, dict):
        return {k: convert_to_python(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_python(i) for i in obj]
    elif isinstance(obj, tuple):
        return [convert_to_python(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.generic):
        return obj.item()
    else:
        return obj

# === Health Check ===
@app.route("/status", methods=["GET"])
def health_check():
    return jsonify({"status": "HybridLogIQ backend running ✅"}), 200

# === Analyze Log File ===
@app.route("/analyze", methods=["POST"])
def analyze_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Only .log or .txt files allowed"}), 400

    filename = secure_filename(file.filename)
    timestamped_name = f"train_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
    saved_path = os.path.join(TRAINING_LOGS_FOLDER, timestamped_name)
    file.save(saved_path)

    try:
        # Read all training logs
        all_logs = []
        for fname in os.listdir(TRAINING_LOGS_FOLDER):
            file_path = os.path.join(TRAINING_LOGS_FOLDER, fname)
            if os.path.isfile(file_path) and not fname.startswith('.'):
                with open(file_path, "r", encoding="utf-8") as f:
                    all_logs.extend([line.strip() for line in f if line.strip()])

        # Check if retraining is necessary
        last_count_file = "models/last_log_count.txt"
        current_log_count = len(all_logs)
        should_retrain = True

        if os.path.exists(last_count_file):
            with open(last_count_file) as f:
                last_count = int(f.read().strip())
                if current_log_count == last_count:
                    should_retrain = False

        if should_retrain:
            retrain_model_from_logs(all_logs)
            with open(last_count_file, "w") as f:
                f.write(str(current_log_count))
        else:
            logging.info("✅ Skipping retraining — no new logs.")

        uploaded_logs = load_log_file(saved_path)
        batch_size = max(32, min(128, len(uploaded_logs) // 10))
        full_result = analyze_logs(uploaded_logs, batch_size=batch_size)

        if "summary" in full_result and "top_cluster" in full_result["summary"]:
            full_result["summary"]["top_cluster"] = [int(x) for x in full_result["summary"]["top_cluster"]]

        with open(os.path.join(RESULTS_FOLDER, "anomalies.json"), "w") as f:
            json.dump(convert_to_python(full_result), f, indent=2)

        return jsonify(convert_to_python(full_result))

    except Exception as e:
        logging.exception("❌ Error during analysis:")
        return jsonify({"error": str(e)}), 500

# === Train Only ===
@app.route("/train", methods=["POST"])
def train_model_only():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Only .log or .txt files allowed"}), 400

    filename = secure_filename(file.filename)
    timestamped_name = f"train_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
    saved_path = os.path.join(TRAINING_LOGS_FOLDER, timestamped_name)
    file.save(saved_path)

    try:
        all_logs = []
        for fname in os.listdir(TRAINING_LOGS_FOLDER):
            file_path = os.path.join(TRAINING_LOGS_FOLDER, fname)
            if os.path.isfile(file_path) and not fname.startswith('.'):
                with open(file_path, "r", encoding="utf-8") as f:
                    all_logs.extend([line.strip() for line in f if line.strip()])

        batch_size = max(32, min(128, len(all_logs) // 10))
        retrain_model_from_logs(all_logs, batch_size=batch_size)

        return jsonify({"message": f"✅ Model trained on {len(all_logs)} combined logs."})
    except Exception as e:
        logging.exception("❌ Error during training:")
        return jsonify({"error": str(e)}), 500

# === Visualizations and Results Endpoints ===
@app.route("/results", methods=["GET"])
def get_results():
    path = os.path.join(RESULTS_FOLDER, "anomalies.json")
    return send_file(path) if os.path.exists(path) else jsonify({"error": "No results found"}), 404

@app.route("/heatmap", methods=["GET"])
def get_heatmap():
    return serve_image("heatmap.png", "Heatmap")

@app.route("/som", methods=["GET"])
def get_som():
    return serve_image("som_clusters.png", "SOM")

@app.route("/histogram", methods=["GET"])
def get_histogram():
    return serve_image("error_distribution.png", "Histogram")

@app.route("/gridsearch", methods=["GET"])
def get_gridsearch():
    return serve_image("heatmap_grid.png", "Grid Search Heatmap")

@app.route("/bmu", methods=["GET"])
def get_bmu_map():
    return serve_image("som_bmu_map.png", "BMU Map")

# === Helper to Serve Images ===
def serve_image(filename, label):
    path = os.path.join(RESULTS_FOLDER, filename)
    if os.path.exists(path):
        return send_file(path)
    return jsonify({"error": f"{label} not found"}), 404

# === Run Server ===
if __name__ == "__main__":
    app.run(debug=True)
