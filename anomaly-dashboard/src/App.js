import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import TrainingUploader from "./components/TrainingUploader"; // ✅ NEW
import SummaryCards from "./components/SummaryCards";
import ResultTable from "./components/ResultTable";
import ModelInsights from "./components/ModelInsights";
import RawLogView from "./components/RawLogView";
import Visualizations from "./components/Visualizations";
import LineChart from "./components/charts/LineChart";
import SeverityTable from "./components/SeverityTable";

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainStatus, setTrainStatus] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-black">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-100 py-2 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-center text-blue-900">
          🚨 HybridLogIQ: Smart Log Anomaly Explorer
        </h1>
      </div>

      {loading && (
        <div className="text-center text-sunset-plum font-medium mb-4">
          ⏳ Processing... Please wait.
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Upload + Train Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-xl p-4 bg-white">
          <div>
            <h2 className="text-xl font-semibold mb-2">🧠Training Data</h2>
            <TrainingUploader
              onTrainSuccess={(data) => {
                setTrainStatus(data.message || "✅ Model trained successfully.");
                setResults(null);
              }}
            />
            {trainStatus && (
              <p className="mt-2 text-green-600 font-medium">{trainStatus}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">📂 Analyze New Log File</h2>
            <FileUploader
              onUploadStart={() => {
                setLoading(true);
                setTrainStatus("");
              }}
              onUploadSuccess={(data) => {
                setLoading(false);
                if (data.logs && data.scores) {
                  setResults(data);
                } else {
                  alert("⚠️ Model not trained or invalid results received.");
                }
              }}
            />
          </div>
        </div>

        {/* Summary Cards */}
        {results?.summary && (
          <div className="bg-white border border-gray-300 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-2">📊 Summary Overview</h2>
            <SummaryCards summary={results.summary} />
          </div>
        )}

        {/* Raw Logs + Anomalies */}
        {results?.logs && results?.scores && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-xl p-4 bg-white">
            <div>
              <h2 className="text-xl font-semibold mb-2">📚Logs</h2>
              <RawLogView logs={results.logs} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">🔍Detected Anomalies List</h2>
              {results.logs.map((log, idx) => results.severity[idx]).includes("High") ? (
                <ResultTable
                  anomalies={results.logs
                    .map((log, idx) => ({
                      log,
                      score: results.scores[idx],
                      severity: results.severity[idx],
                    }))
                    .filter((entry) => entry.severity === "High")
                    .sort((a, b) => b.score - a.score)}
                />
              ) : (
                <div className="text-gray-500 text-sm italic">
                  ✅ No high severity anomalies detected!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights + Severity */}
        {results?.model_scores && results?.severity && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-xl p-4 bg-white">
            <div>
              <h2 className="text-xl font-semibold mb-2">Insights</h2>
              <ModelInsights modelScores={results.model_scores} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">🚨 Severity Table </h2>
              <SeverityTable
                scores={results.scores}
                severities={results.severity}
              />
            </div>
          </div>
        )}

        {/* Line Chart */}
        {results?.scores && (
          <div className="bg-white border border-gray-300 rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              📈 Anomalies Detected Over Time
            </h2>
            <LineChart dataPoints={results.scores} />
          </div>
        )}

        {/* Visualization Flow */}
        {results && (
          <div className="bg-white border border-gray-300 rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-sunset-plum text-center mb-4">
            </h2>
            <Visualizations
              heatmapData={results.scores}
              somData={results.model_scores?.som_clusters || []}
              histogramData={results.histogram_data || []}
              topAnomalies={results.top_anomalies || []}
              severity={results.severity || []}
              totalLogs={results.summary?.total_logs || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;