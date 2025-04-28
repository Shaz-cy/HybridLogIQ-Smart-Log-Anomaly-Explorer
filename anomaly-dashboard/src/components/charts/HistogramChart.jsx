import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
} from "recharts";

const HistogramChart = ({ errors }) => {
  // Early return if data is missing or invalid
  if (!Array.isArray(errors) || errors.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm">
        No histogram data available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={errors}
          margin={{ top: 10, right: 20, bottom: 60, left: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="range"
            angle={-40}
            textAnchor="end"
            interval={0}
            height={60}
            tick={{ fontSize: 10 }}
          >
            <Label value="Reconstruction Error Range" offset={-50} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label value="Count" angle={-90} position="insideLeft" offset={-5} />
          </YAxis>
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            formatter={(value, name) => [`${value} entries`, "Count"]}
            labelFormatter={(label) => `Range: ${label}`}
          />
          <Bar dataKey="count" fill="#FF7582" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistogramChart;
