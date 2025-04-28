import React, { useState } from "react";

const TrainingUploader = ({ onTrainSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("❗ Please select a training file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setStatus("⏳ Training in progress...");

      const response = await fetch("http://localhost:5000/train", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Training failed");

      const data = await response.json();
      onTrainSuccess && onTrainSuccess(data);
      setStatus("✅ Model trained successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Training failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-black">
      <h2 className="text-xl font-bold text-sunset-plum mb-4">🧠 Upload Training Data</h2>

      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept=".log,.txt"
          onChange={handleFileChange}
          className="border p-2 rounded-md"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-sunset-plum hover:bg-sunset-rose text-white px-5 py-2 rounded-md transition"
        >
          {uploading ? "Training..." : "Train"}
        </button>
      </div>

      {file && (
        <p className="text-sm text-sunset-plum mt-2">
          Selected: <strong>{file.name}</strong>
        </p>
      )}

      {status && (
        <p className="mt-2 text-sm text-sunset-plum font-medium">{status}</p>
      )}
    </div>
  );
};

export default TrainingUploader;
