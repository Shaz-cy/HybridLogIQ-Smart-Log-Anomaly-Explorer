# HybridLogIQ-Smart-Log-Anomaly-Explorer
AI-powered tool for detecting and visualizing anomalies in system logs

📌 About the Project
HybridLogIQ is a smart, hybrid deep learning-based system designed for automatic anomaly detection in system logs.
It combines NLP techniques with unsupervised deep learning to identify and cluster anomalies from unstructured log data without requiring labeled datasets.

🧠 Core Features
🔍 Semantic Embedding of logs using RoBERTa (Transformer model).
📉 Autoencoder for anomaly score generation based on reconstruction errors.
🧩 Self-Organizing Maps (SOM) for unsupervised clustering and visualization.
📊 Interactive Dashboards built with React.js and Tailwind CSS.
🚀 End-to-End Solution: Upload logs ➔ Analyze ➔ Visualize anomalies in real time.
🔒 No need for labeled training data — fully unsupervised system.

⚙️ Technologies Used
Python 3
Flask
React.js
Tailwind CSS
PyTorch
scikit-learn
MiniSom
HuggingFace Transformers (RoBERTa)

📋 How to Run Locally
Backend (Flask API)
bash
Copy code
cd AnomalyBackend
pip install -r requirements.txt
python app.py
Frontend (React Dashboard)
bash
Copy code
cd anomaly-dashboard
npm install
npm run dev

📊 Visualizations
Heatmaps of error distribution
SOM cluster maps
Anomaly scoring histograms
BMU (Best Matching Unit) visualization maps

🚀 Applications
Log monitoring in cloud infrastructure
IoT systems anomaly detection
Enterprise server error analysis
Security log forensics





