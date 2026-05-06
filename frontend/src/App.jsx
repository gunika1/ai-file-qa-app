import { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF file first");

    setLoadingUpload(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData);
      setUploadedFile(res.data.filename);
      alert("File uploaded successfully");
    } catch {
      alert("Upload failed. Backend check karo.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSummary = async () => {
    setLoadingSummary(true);

    try {
      const res = await axios.post(`${API_URL}/summary`);
      setSummary(res.data.summary);
    } catch {
      alert("Summary failed");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChat = async () => {
    if (!question.trim()) return;

    const userText = question;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setQuestion("");
    setLoadingChat(true);

    const formData = new FormData();
    formData.append("question", userText);

    try {
      const res = await axios.post(`${API_URL}/chat`, formData);
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Backend check karo." },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-[#E8DCD5] px-6 py-8 shadow-sm md:px-10">
          <p className="mb-3 inline-block rounded-full bg-white/60 px-4 py-2 text-sm font-semibold">
            ✨ AI Powered Document Q&A
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Ask questions from your files instantly.
          </h1>

          <p className="mt-4 max-w-2xl text-[#3A3330]/70 md:text-lg">
            Upload a PDF, generate summaries, and chat with your document using AI.
          </p>
        </header>

        <main className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Upload File</h2>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#C7A9A0] bg-[#FAF7F5] px-5 py-10 text-center hover:bg-[#E8DCD5]/60">
                <span className="text-4xl">📄</span>
                <span className="mt-3 font-semibold">Choose PDF File</span>
                <span className="mt-1 text-sm text-[#3A3330]/60">
                  Click here to upload your document
                </span>

                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {file && (
                <div className="mt-4 rounded-2xl bg-[#E8DCD5]/70 p-4 text-sm">
                  Selected: <b>{file.name}</b>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loadingUpload}
                className="mt-5 w-full rounded-full bg-[#3A3330] px-6 py-3 font-semibold text-white hover:bg-[#C7A9A0]"
              >
                {loadingUpload ? "Uploading..." : "Upload File"}
              </button>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Uploaded File</h2>

              {uploadedFile ? (
                <div className="rounded-2xl bg-[#BFD3C1]/50 p-4">
                  <p className="text-sm text-[#3A3330]/70">Current file</p>
                  <p className="font-bold">{uploadedFile}</p>
                </div>
              ) : (
                <p className="text-[#3A3330]/60">No file uploaded yet.</p>
              )}

              <button
                onClick={handleSummary}
                disabled={loadingSummary}
                className="mt-5 w-full rounded-full bg-[#C7A9A0] px-6 py-3 font-semibold text-white hover:bg-[#3A3330]"
              >
                {loadingSummary ? "Generating..." : "Generate Summary"}
              </button>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Summary</h2>
              <div className="min-h-[160px] rounded-2xl bg-[#FAF7F5] p-4 text-sm leading-6 text-[#3A3330]/75">
                {summary || "Summary will appear here."}
              </div>
            </div>
          </section>

          <section className="flex min-h-[700px] flex-col rounded-[2rem] bg-white shadow-sm">
            <div className="border-b border-[#E8DCD5] p-6">
              <h2 className="text-2xl font-bold">🤖 AI Chatbot</h2>
              <p className="mt-1 text-sm text-[#3A3330]/60">
                Ask questions from uploaded PDF
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <div className="text-5xl">🤖</div>
                    <h3 className="mt-4 text-xl font-bold">Start asking</h3>
                    <p className="mt-2 text-[#3A3330]/60">
                      Upload your PDF and ask anything.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm leading-6 ${
                      msg.role === "user"
                        ? "bg-[#3A3330] text-white"
                        : "bg-[#FAF7F5] text-[#3A3330]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loadingChat && (
                <p className="text-sm text-[#3A3330]/60">AI is thinking...</p>
              )}
            </div>

            <div className="border-t border-[#E8DCD5] p-5">
              <div className="flex gap-3 rounded-full bg-[#FAF7F5] p-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask something..."
                  className="flex-1 bg-transparent px-4 outline-none"
                />

                <button
                  onClick={handleChat}
                  className="h-12 rounded-full bg-[#3A3330] px-6 font-semibold text-white hover:bg-[#C7A9A0]"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}