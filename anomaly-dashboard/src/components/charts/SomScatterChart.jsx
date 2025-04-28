import React from "react";

const SomScatterChart = ({ clusters }) => {
  if (!clusters || !Array.isArray(clusters)) return null;

  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden shadow border border-gray-200">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 10 10"
        preserveAspectRatio="none"
      >
        {/* Grid Background */}
        <rect width="100%" height="100%" fill="#f9fafb" />

        {/* Grid Lines */}
        <g stroke="#d1d5db" strokeWidth="0.05">
          {[...Array(11)].map((_, i) => (
            <line key={`v-${i}`} x1={i} y1={0} x2={i} y2={10} />
          ))}
          {[...Array(11)].map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i} x2={10} y2={i} />
          ))}
        </g>

        {/* Cluster Points */}
        {clusters.map(([x, y], i) => (
          <circle
            key={i}
            cx={x + 0.5}
            cy={y + 0.5}
            r={0.3}
            fill="orange"
            stroke="black"
            strokeWidth="0.05"
          >
            <title>{`Cluster (${x}, ${y})`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default SomScatterChart;

