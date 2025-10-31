// UploadPage.tsx (updated)
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded && uploaded.name.endsWith(".docx")) {
      setFile(uploaded);
    } else {
      alert("Please upload a .docx file");
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please upload a document first");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Save backend response to localStorage
      localStorage.setItem("parsedData", JSON.stringify(data));
      navigate("/fill");
    } catch (err) {
      console.error(err);
      alert("Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
      <h2 className="text-xl font-semibold mb-4">Upload Legal Document</h2>

      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
      />

      {file && (
        <p className="text-sm text-gray-600 mb-4">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </div>
  );
}
