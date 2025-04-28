import React from "react";

const RawLogView = ({ logs }) => {
  if (!logs) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(logs.join("\n"));
  };

  return (
    <div className="bg-white text-black rounded-xl shadow p-4 mt-6">
      <h2 className="text-2xl font-semibold text-sunset-plum mb-2">📄 Raw Logs</h2>
      <textarea
        className="w-full h-64 p-2 border rounded font-mono overflow-auto resize-none"
        readOnly
        value={logs.join("\n")}
      />
      <button
        onClick={copyToClipboard}
        className="mt-2 text-sm bg-[#FF7582] hover:bg-[#C56C86] text-white px-3 py-1 rounded"
      >
        📋 Copy Logs
      </button>
    </div>
  );
};

export default RawLogView;
