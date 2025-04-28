import React, { useState } from "react";

const FileUploader = ({ onUploadSuccess, onUploadStart }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("❗ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setStatus("⏳ Uploading...");
      if (onUploadStart) onUploadStart();

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.error?.includes("Model not trained")) {
          setStatus("❌ Model not trained. Please upload training data first.");
        } else {
          setStatus("❌ Upload failed. Check backend logs.");
        }
        return;
      }

      onUploadSuccess(data); // Notify App.js
      setStatus("✅ Upload complete!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-black">
      <h2 className="text-xl font-bold text-sunset-plum mb-4">📁 Upload Log File</h2>

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
          className="bg-sunset-coral hover:bg-sunset-rose text-white px-5 py-2 rounded-md transition"
        >
          {uploading ? "Uploading..." : "Upload"}
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

export default FileUploader;
