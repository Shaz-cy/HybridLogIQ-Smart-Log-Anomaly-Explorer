import React, { useEffect } from "react";
import HeatmapChart from "./charts/HeatmapChart";
import SomScatterChart from "./charts/SomScatterChart";
import HistogramChart from "./charts/HistogramChart";
import GridSearchHeatmap from "./charts/GridSearchHeatmap";
import BmuMap from "./charts/BmuMap";

const Visualizations = ({ heatmapData, somData, histogramData, totalLogs }) => {
  useEffect(() => {
    console.log("🔥 Heatmap Data:", heatmapData);
    console.log("🧠 SOM Data:", somData);
    console.log("📉 Histogram Data:", histogramData);
  }, [heatmapData, somData, histogramData]);

  return (
    <div className="bg-white text-black p-6 rounded-xl shadow mt-6 space-y-10">
      <h2 className="text-2xl font-bold text-sunset-plum text-center mb-6">
        📊 Results Visualization Flow
      </h2>

      {/* 🔁 Step Flow Section */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-8">
        {/* Step 0: Input Logs */}
        <div className="flex-1 min-w-[220px] text-center">
          <h3 className="font-semibold text-lg mb-2">📄 Input Logs</h3>
          <p className="text-2xl font-bold text-sunset-rose">{totalLogs ?? "N/A"}</p>
          <p className="text-xs text-gray-500">Uploaded Log Entries</p>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center">
          <div className="text-3xl text-sky-500">➡️</div>
        </div>

        {/* Step 1: Autoencoder Heatmap */}
        <div className="flex-1 min-w-[240px] text-center">
          <h3 className="font-semibold text-lg mb-2">🔥 Autoencoder</h3>
          <HeatmapChart errors={heatmapData} />
          <p className="text-xs mt-2 text-gray-500">Reconstruction Error Heatmap</p>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center">
          <div className="text-3xl text-sky-500">➡️</div>
        </div>

        {/* Step 2: SOM Clustering */}
        <div className="flex-1 min-w-[240px] text-center">
          <h3 className="font-semibold text-lg mb-2">🧠 SOM Clusters</h3>
          <SomScatterChart clusters={somData} />
          <p className="text-xs mt-2 text-gray-500">BMUs in 6×6 Neuron Grid</p>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center">
          <div className="text-3xl text-sky-500">➡️</div>
        </div>

        {/* Step 3: Error Histogram */}
        <div className="flex-1 min-w-[240px] text-center">
          <h3 className="font-semibold text-lg mb-2">📉 Distribution</h3>
          <HistogramChart errors={histogramData} />
          <p className="text-xs mt-2 text-gray-500">Reconstruction Error Histogram</p>
        </div>
      </div>

      {/* Flow Summary */}
      <div className="text-center text-sm text-gray-400 mt-2 italic">
        🔁 Flow: Input → Autoencoder → SOM → Histogram → BMU Activation
      </div>

      {/* Step 4: Grid Search Heatmap */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-center mb-2 text-sunset-plum">
          🔬 Autoencoder Grid Search Insights
        </h3>
        <GridSearchHeatmap />
      </div>

      {/* Step 5: BMU Activation Map */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-center mb-2 text-sunset-plum">
          🧠 SOM BMU Activation Map
        </h3>
        <p className="text-xs text-center text-gray-500 mb-2">
          Includes labeled axes: Neuron X (horizontal) & Neuron Y (vertical)
        </p>
        <BmuMap />
      </div>
    </div>
  );
};

export default Visualizations;


