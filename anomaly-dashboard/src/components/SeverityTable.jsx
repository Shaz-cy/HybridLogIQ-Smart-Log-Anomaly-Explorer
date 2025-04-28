import React from "react";

const SeverityTable = ({ scores, severities }) => {
  if (!scores || !severities) return null;

  const rows = scores.map((score, idx) => ({
    score: score.toFixed(6),
    level: severities[idx]
  }));

  const grouped = {
    High: rows.filter(r => r.level === "High").length,
    Medium: rows.filter(r => r.level === "Medium").length,
    Low: rows.filter(r => r.level === "Low").length,
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-center mb-3 text-red-500">🛑 Severity Categorization</h3>
      <table className="table-auto w-full text-center">
        <thead>
          <tr>
            <th className="px-2 py-1">Severity Level</th>
            <th className="px-2 py-1">Log Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([level, count]) => (
            <tr key={level}>
              <td className="border px-2 py-1 font-medium">{level}</td>
              <td className="border px-2 py-1">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeverityTable;
