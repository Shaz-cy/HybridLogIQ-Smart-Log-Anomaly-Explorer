// components/ModelInsights.jsx
import React from "react";

const ModelInsights = ({ modelScores }) => {
  if (!modelScores) return null;

  const autoencoderStats = modelScores.autoencoder || [];
  const somClusters = modelScores.som_clusters || [];

  // Count how many times each SOM cluster won
  const somFrequency = {};
  somClusters.forEach((coords) => {
    const key = `(${coords[0]},${coords[1]})`;
    somFrequency[key] = (somFrequency[key] || 0) + 1;
  });

  return (
    <div className="bg-white text-black p-4 mt-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-sunset-plum mb-2">🧠 Model Insights</h2>

      {/* Autoencoder Error Stats */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">📉 Autoencoder Reconstruction Errors</h3>
        <p>Total Entries: {autoencoderStats.length}</p>
        <p>
          Average Error:{" "}
          {autoencoderStats.length > 0
            ? autoencoderStats
                .reduce((a, b) => a + b, 0)
                .toFixed(6) / autoencoderStats.length
            : "—"}
        </p>
      </div>

      {/* SOM Cluster Distribution */}
      <div>
        <h3 className="font-semibold mb-1">📊 SOM Cluster Hits</h3>
        <ul className="list-disc pl-4 text-sm">
          {Object.entries(somFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(([cluster, count]) => (
              <li key={cluster}>
                Cluster {cluster}: <strong>{count}</strong> logs
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ModelInsights;
