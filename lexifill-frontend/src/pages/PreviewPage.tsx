import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as mammoth from "mammoth";

export default function PreviewPage() {
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("filled-document.docx");
  const [docHtml, setDocHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const url = localStorage.getItem("filledDocURL");
    const storedName = localStorage.getItem("filledFileName");
    if (url) setDocUrl(url);
    if (storedName) setFileName(storedName);
  }, []);

  useEffect(() => {
    if (!docUrl) return;

    const fetchAndConvertDoc = async () => {
      setLoading(true);
      try {
        const res = await fetch(docUrl);
        const arrayBuffer = await res.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocHtml(result.value);
      } catch (err) {
        console.error("Error reading docx:", err);
        setDocHtml("<p>Failed to load document preview.</p>");
      } finally {
        setLoading(false);
      }
    };

    fetchAndConvertDoc();
  }, [docUrl]);

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
   <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
  <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full max-w-3xl">
    <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Preview Your Document</h2>


      {loading ? (
        <p className="text-gray-700">Loading preview...</p>
      ) : (
        <div
      className="doc-preview border rounded-lg p-6 overflow-auto max-h-[600px] bg-gray-50"
      dangerouslySetInnerHTML={{ __html: docHtml }}
    />
      )}
      <div className="mt-4 flex gap-4 justify-center">
        <a
          href={docUrl}
          download={fileName}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Download Document
        </a>
        <button
          onClick={() => navigate("/fill")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Edit Answers
        </button>
      </div>
    </div>
    </div>
  );
}

