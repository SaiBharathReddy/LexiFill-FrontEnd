import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PreviewPage() {
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("filled-document.docx");
  const navigate = useNavigate();

  useEffect(() => {
    const url = localStorage.getItem("filledDocURL");
    const storedName = localStorage.getItem("filledFileName");
    if (url) setDocUrl(url);
    if (storedName) setFileName(storedName);
  }, []);

  if (!docUrl) {
    return (
      <div className="bg-white shadow rounded-2xl p-8 w-full max-w-md text-center">
        <p className="text-gray-700 mb-4">
          No filled document found. Please generate one first.
        </p>
        <button
          onClick={() => navigate("/fill")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-2xl p-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-semibold mb-6">Your Document is Ready!</h2>

      <p className="text-gray-700 mb-4">
        Click below to download your filled document:
      </p>

      <a
        href={docUrl}
        download={fileName}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mb-4 inline-block"
      >
        Download Document
      </a>

      <div className="mt-4">
        <button
          onClick={() => navigate("/fill")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Edit Answers
        </button>
      </div>
    </div>
  );
}
