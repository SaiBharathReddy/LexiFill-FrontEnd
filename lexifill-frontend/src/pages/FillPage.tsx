import { useState, useEffect, useRef } from "react";
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ sender: "AI" | "User"; text: string }[]>([]);
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!data || !data.placeholders || data.placeholders.length === 0) {
    return <p className="text-center mt-10">No data found. Please upload a document first.</p>;
  }

  const placeholders: (Placeholder & { key: string })[] = data.placeholders.map(
    (ph: Placeholder, idx: number) => ({ ...ph, key: `${ph.placeholder}_${idx}` })
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

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmitAnswer = () => {
    const currentPh = placeholders[currentIndex];
    const answer = userInput.trim();
    if (!answer) return;

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
          answers: values,
          placeholders: placeholders,
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
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50">
  <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Fill Placeholders</h2>

  <div className="flex-1 w-full bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg max-h-[500px] overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === "AI" ? "justify-start" : "justify-end"}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${
                m.sender === "AI" ? "bg-gray-200 text-gray-900" : "bg-blue-600 text-white"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {currentIndex < placeholders.length ? (
        <div className="flex w-full mt-4 gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer..."
            onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
          />
          <button
            onClick={handleSubmitAnswer}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
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
