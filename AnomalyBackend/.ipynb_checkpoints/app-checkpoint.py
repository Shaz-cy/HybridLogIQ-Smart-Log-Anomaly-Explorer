from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import traceback
import json
import numpy as np
import datetime

from utils.analyzer import analyze_logs, retrain_model_from_logs
from utils.file_handler import load_log_file

app = Flask(__name__)
CORS(app)

# === Folder Setup ===
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
TRAINING_FOLDER = 'training_data'
TRAINING_LOGS_FOLDER = os.path.join(TRAINING_FOLDER, 'logs')

for folder in [UPLOAD_FOLDER, RESULTS_FOLDER, TRAINING_FOLDER, TRAINING_LOGS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# === NumPy to Native JSON Conversion ===
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

# === Upload Log File, Add to Training Pool, Retrain, and Analyze ===
@app.route("/analyze", methods=["POST"])
def analyze_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    timestamped_name = f"train_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
    saved_path = os.path.join(TRAINING_LOGS_FOLDER, timestamped_name)
    file.save(saved_path)

    try:
        # 🔄 Combine all training logs
        all_logs = []
        for fname in os.listdir(TRAINING_LOGS_FOLDER):
            file_path = os.path.join(TRAINING_LOGS_FOLDER, fname)
            if os.path.isfile(file_path) and not fname.startswith('.'):
                with open(file_path, "r", encoding="utf-8") as f:
                    all_logs.extend([line.strip() for line in f if line.strip()])

        # 🧠 Retrain on the full history
        retrain_model_from_logs(all_logs)

        # 🔍 Analyze just the newly uploaded logs
        uploaded_logs = load_log_file(saved_path)
        full_result = analyze_logs(uploaded_logs)

        with open(os.path.join(RESULTS_FOLDER, "anomalies.json"), "w") as f:
            json.dump(convert_to_python(full_result), f, indent=2)

        return jsonify(convert_to_python(full_result))

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# === Optional: Train Only (No Analysis) ===
@app.route("/train", methods=["POST"])
def train_model_only():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

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

        retrain_model_from_logs(all_logs)

        return jsonify({"message": f"✅ Model trained on {len(all_logs)} combined logs."})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# === Result Endpoints ===
@app.route("/results", methods=["GET"])
def get_results():
    path = os.path.join(RESULTS_FOLDER, "anomalies.json")
    if os.path.exists(path):
        with open(path) as f:
            return f.read()
    else:
        return jsonify({"error": "No results found"}), 404

@app.route("/heatmap", methods=["GET"])
def get_heatmap():
    path = os.path.join(RESULTS_FOLDER, "heatmap.png")
    return send_file(path) if os.path.exists(path) else jsonify({"error": "Heatmap not found"}), 404

@app.route("/som", methods=["GET"])
def get_som():
    path = os.path.join(RESULTS_FOLDER, "som_clusters.png")
    return send_file(path) if os.path.exists(path) else jsonify({"error": "SOM map not found"}), 404

@app.route("/histogram", methods=["GET"])
def get_histogram():
    path = os.path.join(RESULTS_FOLDER, "error_distribution.png")
    return send_file(path) if os.path.exists(path) else jsonify({"error": "Histogram not found"}), 404

@app.route("/gridsearch", methods=["GET"])
def get_gridsearch():
    path = os.path.join(RESULTS_FOLDER, "heatmap_grid.png")
    return send_file(path) if os.path.exists(path) else jsonify({"error": "Grid Search Heatmap not found"}), 404

@app.route("/bmu", methods=["GET"])
def get_bmu_map():
    path = os.path.join(RESULTS_FOLDER, "som_bmu_map.png")
    return send_file(path) if os.path.exists(path) else jsonify({"error": "BMU map not found"}), 404

# === Run Server ===
if __name__ == "__main__":
    app.run(debug=True)
