import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: "Hello! I'm your AI assistant 🤖. How can I help?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const formatText = (text) => {
    // Bold: **word**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *word*
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Line breaks
    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(userInput);

      const botText =
        result?.response?.text?.() || "⚠️ Sorry, I couldn’t generate a reply.";

      const botReply = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Gemini error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "⚠️ Error: " + error.message,
          sender: "bot",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md text-sm shadow
                ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-100 rounded-bl-none"
                }`}
              dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-100 shadow">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white dark:bg-gray-800 flex border-t border-gray-200 dark:border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          placeholder="iMessage your AI..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-full shadow disabled:opacity-50 hover:bg-blue-600 dark:hover:bg-blue-700"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
