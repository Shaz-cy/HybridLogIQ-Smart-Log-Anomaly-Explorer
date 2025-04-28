import React from "react";

const GridSearchHeatmap = ({ src = "http://localhost:5000/gridsearch" }) => {
  return (
    <div className="text-center w-full">
      <img
        src={src}
        alt="Autoencoder Grid Search Heatmap"
        className="mx-auto rounded-lg shadow-md border border-gray-200"
        style={{ maxWidth: "100%", height: "auto" }}
        loading="lazy"
      />
      <p className="text-xs mt-2 text-gray-500">
        Autoencoder Hyperparameter Grid Search
      </p>
    </div>
  );
};

export default GridSearchHeatmap;
