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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
  <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-10 w-full max-w-lg text-center border border-gray-200">
    <h2 className="text-3xl font-bold mb-6 text-indigo-700">Upload Legal Document</h2>

        <input
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="mb-6 block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none p-2"
        />

        {file && (
          <p className="text-sm text-gray-600 mb-6 break-words">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors duration-200"
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>
    </div>
  );
}
