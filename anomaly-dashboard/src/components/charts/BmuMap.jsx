import React, { useState } from "react";

const BmuMap = ({ src = "http://localhost:5000/bmu" }) => {
  const [timestamp, setTimestamp] = useState(Date.now());

  const refreshImage = () => setTimestamp(Date.now());

  return (
    <div className="w-full text-center relative bg-gray-100 p-4 rounded-xl">
      <div className="relative inline-block">
        {/* Y-axis */}
        <div className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 text-xs text-gray-500 rotate-[-90deg]">
          Neuron Y
        </div>
        {/* X-axis */}
        <div className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
          Neuron X
        </div>

        <img
          src={`${src}?t=${timestamp}`}
          alt="SOM BMU Activation Map"
          className="mx-auto rounded-lg shadow-md border border-gray-300 bg-white"
          style={{ maxWidth: "100%", height: "auto" }}
          loading="lazy"
          onError={() => {
            console.warn("❌ BMU map failed to load — refreshing...");
            refreshImage();
          }}
          onLoad={() => console.log("✅ BMU map loaded successfully")}
        />
      </div>
      <p className="text-xs mt-2 text-gray-500">SOM BMU Activation Map</p>
    </div>
  );
};

export default BmuMap;
