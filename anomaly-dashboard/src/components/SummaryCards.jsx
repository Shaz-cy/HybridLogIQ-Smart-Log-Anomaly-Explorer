import React from "react";

const SummaryCards = ({ summary }) => {
  const {
    total_logs,
    anomalies_detected,
    avg_error,
    high_severity_count,
    top_som_cluster,
  } = summary || {};

  const formatCluster = (cluster) => {
    try {
      const parsed = typeof cluster === "string" ? JSON.parse(cluster) : cluster;
      if (Array.isArray(parsed) && parsed.length === 2) {
        return (
          <span className="text-lg font-semibold tracking-wide">
            ({parsed[0]}, {parsed[1]})
          </span>
        );
      }
    } catch {
      return cluster ?? "N/A";
    }
    return "N/A";
  };

  const cardData = [
    { title: "Total Logs", value: total_logs ?? "N/A" },
    { title: "Anomalies Detected", value: anomalies_detected ?? "N/A" },
    { title: "Avg Error", value: avg_error?.toFixed(6) ?? "N/A" },
    { title: "High Severity", value: high_severity_count ?? "N/A" },
    { title: "Top SOM Cluster", value: formatCluster(top_som_cluster) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-2xl p-4 text-center opacity-0 animate-fadeInUp min-w-[120px] min-h-[90px] flex flex-col justify-center"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationFillMode: "forwards",
          }}
        >
          <h3 className="text-sm font-medium text-gray-500 whitespace-nowrap">
            {card.title}
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {typeof card.value === "string" ? (
              <span className="truncate block">{card.value}</span>
            ) : (
              card.value
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
