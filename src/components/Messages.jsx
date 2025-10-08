import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini (Paste your key in .env)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function MessagesPanel({ isOpen, onClose }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [aiActive, setAIActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Normal chats
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Alice",
      avatar: "/avatars/alice.png",
      messages: [{ sender: "bot", text: "Hey there!", time: "10:00 AM" }],
    },
    { id: 2, name: "Bob", avatar: "/avatars/bob.png", messages: [] },
    {
      id: 3,
      name: "Project Team",
      avatar: "/avatars/team.png",
      messages: [{ sender: "bot", text: "Meeting at 3 PM", time: "9:30 AM" }],
    },
  ]);

  // AI chat
  const [aiMessages, setAIMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI assistant 🤖. How can I help?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, chats, aiMessages]);

  // ✅ Text formatter: bold, italic, line breaks
  const formatText = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/\n/g, "<br/>");
    return formatted;
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const userMsg = {
      sender: "user",
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (aiActive) {
      setAIMessages((prev) => [...prev, userMsg]);
      setMessageInput("");
      setLoading(true);

      try {
        const result = await model.generateContent(userMsg.text);
        const aiReply = {
          sender: "ai",
          text: result.response.text(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setAIMessages((prev) => [...prev, aiReply]);
      } catch (error) {
        console.error("Gemini API Error:", error);
        setAIMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "⚠️ Sorry, something went wrong.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else if (selectedChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...chat.messages, userMsg] }
            : chat
        )
      );

      // Fake normal bot reply
      setTimeout(() => {
        const botReply = {
          sender: "bot",
          text: "Bot reply: " + userMsg.text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? { ...chat, messages: [...chat.messages, botReply] }
              : chat
          )
        );
      }, 700);

      setMessageInput("");
    }
  };

  const startAIChat = () => {
    setAIActive(true);
    setSelectedChat(null);
  };

  const openChat = (chat) => {
    setSelectedChat(chat);
    setAIActive(false);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold">
          {aiActive ? "AI Chat" : selectedChat ? selectedChat.name : "Messages"}
        </h2>
        <button onClick={onClose} className="text-red-500 text-xl font-bold">
          ✖
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-32 border-r overflow-y-auto bg-gray-50 flex flex-col">
          <button
            onClick={startAIChat}
            className="p-2 mb-2 text-white bg-green-500 rounded mx-2 hover:bg-green-600"
          >
            Park AI
          </button>

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 ${
                selectedChat?.id === chat.id ? "bg-gray-300 font-bold" : ""
              }`}
              onClick={() => openChat(chat)}
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="truncate">{chat.name}</span>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col relative p-3 bg-gray-100">
          {(selectedChat || aiActive) ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-16 space-y-3">
                {/* Normal Chat */}
                {selectedChat &&
                  selectedChat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-sm shadow text-sm ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-300 text-black rounded-bl-none"
                        }`}
                        dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                      />
                      <div className="text-xs text-gray-500 mt-1 ml-2">
                        {msg.time}
                      </div>
                    </div>
                  ))}

                {/* AI Chat */}
                {aiActive &&
                  aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-sm shadow text-sm ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-green-200 text-black rounded-bl-none"
                        }`}
                        dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                      />
                      <div className="text-xs text-gray-500 mt-1 ml-2">
                        {msg.time}
                      </div>
                    </div>
                  ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-2xl bg-green-100 text-black shadow text-sm">
                      🤖 AI is typing...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef}></div>
              </div>

              {/* Input */}
              <div className="absolute bottom-0 left-0 right-0 p-2 flex border-t bg-white">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full shadow disabled:opacity-50"
                  disabled={loading}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-10">
              Select a chat or click <strong>Park AI</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
