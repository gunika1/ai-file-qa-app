import { useState } from "react";
import axios from "axios";

const API_URL = "https://ai-file-qa-app.onrender.com";

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
      alert("Summary failed.");
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
    <div className="min-h-screen bg-[#FAF7F5] px-3 py-4 text-[#3A3330] sm:px-5 md:px-10 md:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 rounded-3xl bg-[#E8DCD5] px-5 py-7 shadow-sm sm:mb-8 sm:px-7 md:rounded-[2rem] md:px-10 md:py-9">
          <p className="mb-3 inline-block rounded-full bg-white/60 px-4 py-2 text-xs font-semibold sm:text-sm">
            ✨ AI Powered Document Q&A
          </p>

          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
            Ask questions from your files instantly.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#3A3330]/70 sm:text-base md:text-lg">
            Upload a PDF, generate summaries, and chat with your document using AI.
          </p>
        </header>

        <main className="grid gap-5 lg:grid-cols-[390px_1fr] xl:grid-cols-[420px_1fr]">
          <section className="space-y-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem]">
              <h2 className="mb-4 text-xl font-bold sm:text-2xl">Upload File</h2>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#C7A9A0] bg-[#FAF7F5] px-4 py-8 text-center transition hover:bg-[#E8DCD5]/60 sm:py-10">
                <span className="text-4xl">📄</span>
                <span className="mt-3 font-semibold">Choose PDF File</span>
                <span className="mt-1 text-xs text-[#3A3330]/60 sm:text-sm">
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
                <div className="mt-4 break-words rounded-2xl bg-[#E8DCD5]/70 p-4 text-xs sm:text-sm">
                  Selected: <b>{file.name}</b>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loadingUpload}
                className="mt-5 w-full rounded-full bg-[#3A3330] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C7A9A0] disabled:opacity-60 sm:text-base"
              >
                {loadingUpload ? "Uploading..." : "Upload File"}
              </button>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem]">
              <h2 className="mb-4 text-xl font-bold sm:text-2xl">Uploaded File</h2>

              {uploadedFile ? (
                <div className="rounded-2xl bg-[#BFD3C1]/50 p-4">
                  <p className="text-xs text-[#3A3330]/70 sm:text-sm">Current file</p>
                  <p className="break-words text-sm font-bold sm:text-base">
                    {uploadedFile}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#3A3330]/60">No file uploaded yet.</p>
              )}

              <button
                onClick={handleSummary}
                disabled={loadingSummary}
                className="mt-5 w-full rounded-full bg-[#C7A9A0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3A3330] disabled:opacity-60 sm:text-base"
              >
                {loadingSummary ? "Generating..." : "Generate Summary"}
              </button>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem]">
              <h2 className="mb-4 text-xl font-bold sm:text-2xl">Summary</h2>
              <div className="max-h-[280px] min-h-[140px] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-[#FAF7F5] p-4 text-xs leading-6 text-[#3A3330]/75 sm:text-sm md:max-h-[340px]">
                {summary || "Summary will appear here."}
              </div>
            </div>
          </section>

          <section className="flex h-[75vh] min-h-[560px] flex-col rounded-3xl bg-white shadow-sm sm:min-h-[650px] md:rounded-[2rem] lg:h-auto lg:min-h-[760px]">
            <div className="border-b border-[#E8DCD5] p-5 sm:p-6">
              <h2 className="text-xl font-bold sm:text-2xl">🤖 AI Chatbot</h2>
              <p className="mt-1 text-xs text-[#3A3330]/60 sm:text-sm">
                Ask questions from uploaded PDF
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <div className="text-5xl">🤖</div>
                    <h3 className="mt-4 text-lg font-bold sm:text-xl">Start asking</h3>
                    <p className="mt-2 px-4 text-sm text-[#3A3330]/60">
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
                    className={`max-w-[92%] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-xs leading-6 sm:max-w-[82%] sm:px-5 sm:text-sm ${
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
                <p className="text-xs text-[#3A3330]/60 sm:text-sm">
                  AI is thinking...
                </p>
              )}
            </div>

            <div className="border-t border-[#E8DCD5] p-3 sm:p-5">
              <div className="flex items-center gap-2 rounded-3xl bg-[#FAF7F5] p-2 sm:rounded-full sm:gap-3">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask something..."
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none sm:px-4"
                />

                <button
                  onClick={handleChat}
                  disabled={loadingChat}
                  className="shrink-0 rounded-full bg-[#3A3330] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C7A9A0] disabled:opacity-60 sm:h-12 sm:px-6"
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