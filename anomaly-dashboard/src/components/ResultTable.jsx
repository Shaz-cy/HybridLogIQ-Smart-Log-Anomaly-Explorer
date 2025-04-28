import React from "react";

function ResultTable({ anomalies }) {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div className="mt-8 p-4 bg-white text-black rounded-xl shadow">
      <h2 className="text-xl font-semibold text-sunset-plum mb-3">🔍 All Detected Anomalies</h2>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-sunset-plum text-white sticky top-0">
            <tr>
              <th className="p-2 text-left">Score</th>
              <th className="p-2 text-left">Log Entry</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((item, index) => (
              <tr key={index} className="border-b hover:bg-sunset-bg/10">
                <td className="p-2 font-semibold text-sunset-coral">{item.score.toFixed(6)}</td>
                <td className="p-2">{item.log}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultTable;

