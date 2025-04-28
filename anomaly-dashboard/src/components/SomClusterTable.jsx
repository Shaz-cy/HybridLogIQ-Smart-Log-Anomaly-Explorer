// src/components/SomClusterTable.jsx
import React from "react";
import { countBy } from "lodash";

const SomClusterTable = ({ clusters }) => {
  if (!clusters || clusters.length === 0) return null;

  const clusterCounts = countBy(clusters.map(c => `${c[0]},${c[1]}`));

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border text-sm text-left">
        <thead className="bg-sunset-dark text-white">
          <tr>
            <th className="px-4 py-2">Cluster (x,y)</th>
            <th className="px-4 py-2">Log Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(clusterCounts).map(([cluster, count]) => (
            <tr key={cluster} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{cluster}</td>
              <td className="px-4 py-2">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SomClusterTable;
