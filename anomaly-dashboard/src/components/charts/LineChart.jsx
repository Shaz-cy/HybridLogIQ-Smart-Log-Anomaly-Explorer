// src/components/charts/LineChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const LineChart = ({ dataPoints }) => {
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm">
        No data to display
      </div>
    );
  }

  const labels = dataPoints.map((_, i) => i + 1);

  const data = {
    labels,
    datasets: [
      {
        label: "Reconstruction Error",
        data: dataPoints,
        fill: true,
        borderColor: "#FF7582",
        backgroundColor: "rgba(255, 117, 130, 0.2)",
        pointRadius: dataPoints.map((val) => (val > 0.07 ? 4 : 2)),
        pointBackgroundColor: dataPoints.map((val) =>
          val > 0.07 ? "#dc2626" : "#FF7582"
        ),
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => val.toFixed(2),
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 25,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Index: ${context.dataIndex} | Error: ${context.raw.toFixed(6)}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-56">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
