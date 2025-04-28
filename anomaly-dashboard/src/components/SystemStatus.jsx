import React from "react";

const SystemStatus = ({ summary }) => {
  if (!summary) return null;

  const { total_logs, anomalies_detected, precision, recall, f1_score } = summary;
  const healthy = anomalies_detected < total_logs * 0.2;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">🖥️ System Status</h2>

      <p className="mb-1">
        Status:{" "}
        <span className={`font-semibold ${healthy ? "text-green-600" : "text-red-600"}`}>
          {healthy ? "Healthy" : "Unstable"}
        </span>
      </p>

      <p className="mb-1">
        Total Logs: <strong>{total_logs}</strong>
      </p>
      <p className="mb-1">
        Anomalies Detected: <strong>{anomalies_detected}</strong>
      </p>

      {precision !== undefined && (
        <>
          <p className="mb-1">Precision: <strong>{precision}%</strong></p>
          <p className="mb-1">Recall: <strong>{recall}%</strong></p>
          <p className="mb-1">F1 Score: <strong>{f1_score}%</strong></p>
        </>
      )}
    </div>
  );
};

export default SystemStatus;
