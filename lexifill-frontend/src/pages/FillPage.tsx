import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Placeholder {
  placeholder: string;
  context?: string;
  question: string;
}

export default function FillPage() {
  const parsed = localStorage.getItem("parsedData");
  const data = parsed ? JSON.parse(parsed) : null;
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ sender: "AI" | "User"; text: string }[]>([]);
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!data || !data.placeholders || data.placeholders.length === 0) {
    return <p>No data found. Please upload a document first.</p>;
  }

  // Generate unique keys for each placeholder instance
  const placeholders: (Placeholder & { key: string })[] = data.placeholders.map(
    (ph: Placeholder, idx: number) => ({
      ...ph,
      key: `${ph.placeholder}_${idx}`,
    })
  );

  // Show each AI question when index changes
  useEffect(() => {
    if (currentIndex >= placeholders.length) return;

    const q = placeholders[currentIndex].question;
    setMessages((prev) => {
      if (prev.length && prev[prev.length - 1].text === q && prev[prev.length - 1].sender === "AI")
        return prev;
      return [...prev, { sender: "AI", text: q }];
    });
  }, [currentIndex]);

  const handleSubmitAnswer = () => {
    const currentPh = placeholders[currentIndex];
    const answer = userInput.trim();
    if (!answer) return;

    // Store by unique key (avoids overwriting repeated placeholders)
    setValues((prev) => ({ ...prev, [currentPh.key]: answer }));

    setMessages((prev) => [...prev, { sender: "User", text: answer }]);
    setUserInput("");
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: data.fileId,
          answers: values,               // keyed by unique key
          placeholders: placeholders,    // each placeholder also has its key
        }),
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      localStorage.setItem("filledDocURL", url);
      navigate("/preview");
    } catch (err) {
      console.error(err);
      alert("Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-2xl p-8 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Fill Placeholders</h2>

      <div className="chat-box space-y-2 mb-4 max-h-[400px] overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg ${
              m.sender === "AI" ? "bg-gray-100 text-gray-800" : "bg-indigo-600 text-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {currentIndex < placeholders.length ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your answer..."
            onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
          />
          <button
            onClick={handleSubmitAnswer}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate Document"}
        </button>
      )}
    </div>
  );
}
