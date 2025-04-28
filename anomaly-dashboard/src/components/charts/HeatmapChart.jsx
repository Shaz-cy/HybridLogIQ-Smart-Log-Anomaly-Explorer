import React from "react";
import { Tooltip } from "react-tooltip";

// Color from green (low) to red (high) using HSL
const getColor = (value) => {
  const hue = ((1 - value) * 120).toFixed(0); // 120 = green, 0 = red
  return `hsl(${hue}, 100%, 50%)`;
};

const HeatmapChart = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  const min = Math.min(...errors);
  const max = Math.max(...errors);
  const range = max - min || 1;

  return (
    <div className="w-full text-center">
      {/* Min / Max */}
      <div className="flex justify-between text-xs text-gray-700 mb-1 px-1">
        <span>Min: {min.toFixed(4)}</span>
        <span>Max: {max.toFixed(4)}</span>
      </div>

      {/* Actual Colored Bar */}
      <div className="flex h-4 rounded overflow-hidden border border-gray-300 shadow-inner">
        {errors.map((error, i) => {
          const normalized = (error - min) / range;
          const bgColor = getColor(normalized);
          return (
            <div
              key={i}
              style={{
                backgroundColor: bgColor,
                width: `${100 / errors.length}%`,
              }}
              data-tooltip-id={`tooltip-${i}`}
              data-tooltip-content={`Error: ${error.toFixed(6)}`}
              className="hover:opacity-80 cursor-pointer transition-all"
            >
              <Tooltip id={`tooltip-${i}`} />
            </div>
          );
        })}
      </div>

      {/* Label under bar */}
      <p className="text-xs text-gray-500 mt-2">Reconstruction Error Heatmap</p>
    </div>
  );
};

export default HeatmapChart;