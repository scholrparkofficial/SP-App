import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Send, Users, Trash2, HelpCircle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "../contexts/AuthContext";
import CreateGroupModal from "./CreateGroupModal";
import { 
  searchUsers, 
  getOrCreateConversation, 
  sendMessage as sendMessageToFirestore, 
  getConversationMessages,
  getUserConversations,
  getUserDetails,
  getGroupsForUser,
  getGroupDetails,
  getGroupMessages,
  sendGroupMessage,
  deleteGroup,
  markMessageAsRead,
  deleteMessageForMe,
  deleteMessageForEveryone,
  markGroupMessageAsRead,
  deleteGroupMessageForMe,
  deleteGroupMessageForEveryone,
  getConversationDetails,
  db
} from "../firebase";
import { onSnapshot, query, orderBy } from "firebase/firestore";

// Simple Dice's coefficient bigram similarity (returns 0..1)
function bigramSimilarity(a = "", b = "") {
  const s = String(a).toLowerCase();
  const t = String(b).toLowerCase();
  if (!s.length || !t.length) return 0;
  if (s === t) return 1;
  const makeBigrams = (str) => {
    const out = [];
    for (let i = 0; i < str.length - 1; i++) {
      out.push(str.slice(i, i + 2));
    }
    return out;
  };
  const sB = makeBigrams(s);
  const tB = makeBigrams(t);
  if (sB.length === 0 || tB.length === 0) return 0;
  let intersection = 0;
  const tBcopy = tB.slice();
  sB.forEach((bg) => {
    const idx = tBcopy.indexOf(bg);
    if (idx > -1) {
      intersection++;
      tBcopy.splice(idx, 1);
    }
  });
  return (2.0 * intersection) / (sB.length + tB.length);
}

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function Messages({ isOpen, onClose }) {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [aiActive, setAIActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [conversationUsers, setConversationUsers] = useState({}); // Store user details for each conversation
  const [messages, setMessages] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [chatType, setChatType] = useState(null); // "private" or "group"
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [messageOptionsId, setMessageOptionsId] = useState(null); // Track which message's options are shown
  const [showHelp, setShowHelp] = useState(false);
  const messagesEndRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(() => {
    try {
      return localStorage.getItem('messagesPanelWidth') || '33%';
    } catch (e) {
      return '33%';
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const resizerRef = useRef(null);

  // AI chat messages
  const [aiMessages, setAIMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI assistant 🤖. How can I help?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Load conversations on mount
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Save panel width when changed
  useEffect(() => {
    try {
      localStorage.setItem('messagesPanelWidth', panelWidth);
    } catch (e) {
      // ignore
    }
  }, [panelWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newWidth = Math.max(300, window.innerWidth - clientX); // anchored to right
      const maxW = Math.floor(window.innerWidth * 0.95);
      const final = Math.min(newWidth, maxW);
      setPanelWidth(final + 'px');
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  // Load conversations when user becomes available
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchForUsers();
      } else {
        setSearchResults([]);
        setSearchError("");
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedChat || !user) {
      setMessages([]);
      return;
    }

    try {
      const messagesQuery = chatType === "group" ? getGroupMessages(selectedChat.id) : getConversationMessages(selectedChat.id);
      const unsubscribe = onSnapshot(
        messagesQuery, 
        (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messagesData);
        },
        (error) => {
          console.error("Error loading messages:", error);
          setMessages([]);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up message listener:", error);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages]);

  const loadConversations = async () => {
    try {
      // Load private conversations
      const convos = await getUserConversations(user.uid);
      setConversations(convos);
      
      // Load groups
      const userGroups = await getGroupsForUser(user.uid);
      setGroups(userGroups);
      
      // Fetch user details for each conversation
      const userDetailsMap = {};
      await Promise.all(
        convos.map(async (conv) => {
          const otherUserId = conv.participants.find(p => p !== user.uid);
          if (otherUserId) {
            try {
              const userDetails = await getUserDetails(otherUserId);
              if (userDetails) {
                userDetailsMap[conv.id] = userDetails;
              }
            } catch (err) {
              console.error("Error fetching user details:", err);
            }
          }
        })
      );
      setConversationUsers(userDetailsMap);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
      setGroups([]);
    }
  };

  const searchForUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError("");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const results = await searchUsers(searchTerm);
      // Filter out current user
      const filtered = results.filter(u => u.uid !== user.uid);

      // Apply fuzzy matching (require ~50% bigram similarity with name or email)
      const threshold = 0.5;
      const matches = filtered.filter((u) => {
        const nameScore = bigramSimilarity(searchTerm, u.displayName || "");
        const emailScore = bigramSimilarity(searchTerm, u.email || "");
        return Math.max(nameScore, emailScore) >= threshold;
      });

      setSearchResults(matches);
      if (matches.length === 0 && searchTerm.trim()) {
        setSearchError("No close matches");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchError("Error searching users");
    } finally {
      setSearching(false);
    }
  };

  const startConversation = async (otherUser) => {
    try {
      const conversationId = await getOrCreateConversation(user.uid, otherUser.uid);
      const conversation = {
        id: conversationId,
        otherUser,
        lastMessage: "",
        lastMessageAt: new Date(),
      };
      setSelectedChat(conversation);
      setSearchTerm("");
      setSearchResults([]);
      loadConversations();
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const formatText = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/\n/g, "<br/>");
    return formatted;
  };

  const handleGroupCreated = async (groupId) => {
    await loadConversations();
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      await loadConversations();
      setSelectedChat(null);
      setChatType(null);
      setShowDeleteConfirm(null);
      alert("Group deleted successfully!");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    if (aiActive) {
      const userMsg = {
        sender: "user",
        text: messageInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
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
      try {
        if (chatType === "group") {
          await sendGroupMessage(selectedChat.id, user.uid, messageInput);
        } else {
          await sendMessageToFirestore(selectedChat.id, user.uid, messageInput);
        }
        setMessageInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const startAIChat = () => {
    setAIActive(true);
    setSelectedChat(null);
  };

  const openChat = (chat) => {
    setSelectedChat(chat);
    setAIActive(false);
    setChatType(null);
  };

  const openGroup = (group) => {
    setSelectedChat(group);
    setChatType("group");
    setAIActive(false);
  };

  const openPrivateChat = (chat) => {
    setSelectedChat(chat);
    setChatType("private");
    setAIActive(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        width: isDesktop ? panelWidth : '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
      className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Resizer handle (desktop only) */}
      {isDesktop && (
        <div
          ref={resizerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="absolute left-0 top-0 h-full w-6 -ml-6 cursor-col-resize z-50 flex items-center justify-start"
          title="Drag to resize"
        >
          <div className="w-1 h-30 bg-gray-300 dark:bg-gray-600 rounded-r-md ml-1" />
          <div className="hidden lg:block -ml-1 mb-60 text-xs text-red-500 dark:text-gray-300 rotate-90 origin-left">Drag_to_adjust</div>
        </div>
      )}
      {/* Header */}
  <div className="flex justify-between items-center p-3 md:p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-3 flex-1">
          {(selectedChat || aiActive) && (
            <button 
              onClick={() => {
                setSelectedChat(null);
                setAIActive(false);
                setChatType(null);
              }} 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-base md:text-lg font-bold dark:text-white truncate">
            {aiActive ? "AI Chat" : selectedChat ? selectedChat.otherUser?.displayName || "Chat" : "Messages"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Desktop / tablet textual Help button */}
          <button
            onClick={() => setShowHelp(true)}
            className="hidden md:inline-flex px-3 py-1 rounded text-sm border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100"
            title="Help & Support"
          >
            Help
          </button>
          {/* Mobile icon Help button */}
          <button
            onClick={() => setShowHelp(true)}
            className="md:hidden p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Help & Support"
            aria-label="Help & Support"
          >
            <HelpCircle size={18} />
          </button>
          <button onClick={onClose} className="text-red-500 text-xl font-bold ml-2">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile when chat is selected, shown on desktop */}
        <div className={`hidden md:flex md:w-48 border-r dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900 flex-col ${
          selectedChat || aiActive ? "" : "flex"
        }`}>
          {/* New Chat Button */}
          <div className="p-2 border-b dark:border-gray-700">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>

          {/* Search Results */}
          {searching && (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          )}
          {searchError && (
            <div className="p-2 text-sm text-red-500 dark:text-red-400">
              {searchError}
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="border-b dark:border-gray-700">
              {searchResults.map((result) => (
                <div
                  key={result.uid}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => startConversation(result)}
                >
                  <img
                        src={result.photoURL || "/avatar.svg"}
                        alt={result.displayName}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/avatar.svg'; }}
                        className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm dark:text-white truncate">{result.displayName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Group Button */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="m-2 p-2 text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Group</span>
          </button>

          {/* AI Chat Button */}
          <button
            onClick={startAIChat}
            className="m-2 p-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span>AI Chat</span>
            </div>
          </button>

          {/* Groups Section */}
          {groups.length > 0 && (
            <div className="px-2 py-2 border-b dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <Users size={14} />
                <span>GROUPS ({groups.length})</span>
              </div>
            </div>
          )}

          {/* Groups List */}
          {groups.length > 0 && (
            <div className="overflow-y-auto border-b dark:border-gray-700">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    selectedChat?.id === group.id && chatType === "group" ? "bg-gray-300 dark:bg-gray-600 font-bold" : ""
                  }`}
                  onClick={(e) => {
                    if (!e.target.closest('.delete-btn')) {
                      openGroup(group);
                    }
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Users size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm dark:text-white truncate font-medium">
                      {group.name}
                    </div>
                    {group.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {group.lastMessage}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(group.id);
                    }}
                    className="delete-btn p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Delete group"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Private Chats Section */}
          {conversations.length > 0 && (
            <div className="px-2 py-2 border-b dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                CHATS ({conversations.length})
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const otherUserId = conv.participants.find(p => p !== user.uid);
              const otherUser = conversationUsers[conv.id];
              
              return (
                <div
                  key={conv.id}
                  className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    selectedChat?.id === conv.id ? "bg-gray-300 dark:bg-gray-600 font-bold" : ""
                  }`}
                  onClick={() => openPrivateChat({ id: conv.id, otherUser: otherUser || { uid: otherUserId } })}
                >
                  <img
                    src={otherUser?.photoURL || "/avatar.svg"}
                    alt={otherUser?.displayName || "User"}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/avatar.svg'; }}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm dark:text-white truncate">
                      {otherUser?.displayName || otherUser?.email || "Unknown User"}
                    </div>
                    {conv.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Sidebar - Shown on mobile when no chat is selected */}
        {!selectedChat && !aiActive && (
          <div className="flex-1 flex flex-col overflow-hidden md:hidden">
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {/* Search */}
              <div className="p-2 border-b dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>

              {/* Search Results */}
              {searching && (
                <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              )}
              {searchError && (
                <div className="p-2 text-sm text-red-500 dark:text-red-400">
                  {searchError}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="border-b dark:border-gray-700">
                  {searchResults.map((result) => (
                    <div
                      key={result.uid}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => startConversation(result)}
                    >
                      <img
                        src={result.photoURL || "/avatar.svg"}
                        alt={result.displayName}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/avatar.svg'; }}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm dark:text-white truncate">{result.displayName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400">Showing close matches only</div>
              )}

              {/* Create Group Button - Mobile */}
              <button
                onClick={() => setShowCreateGroup(true)}
                className="m-2 p-3 text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New Group</span>
              </button>

              {/* AI Chat Button */}
              <button
                onClick={startAIChat}
                className="m-2 p-3 text-white bg-green-500 rounded hover:bg-green-600"
              >
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI Chat</span>
                </div>
              </button>

              {/* Groups Section - Mobile */}
              {groups.length > 0 && (
                <div className="px-2 py-2 border-t dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <Users size={14} />
                    <span>GROUPS</span>
                  </div>
                </div>
              )}

              {/* Groups List - Mobile */}
              {groups.length > 0 && groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => openGroup(group)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Users size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm dark:text-white truncate font-medium">
                      {group.name}
                    </div>
                    {group.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {group.lastMessage}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(group.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Delete group"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}

              {/* Chats Section - Mobile */}
              {conversations.length > 0 && (
                <div className="px-2 py-2 border-t dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    CHATS
                  </div>
                </div>
              )}

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => {
                  const otherUserId = conv.participants.find(p => p !== user.uid);
                  const otherUser = conversationUsers[conv.id];
                  
                  return (
                    <div
                      key={conv.id}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => openPrivateChat(conv)}
                    >
                      <img
                        src={otherUser?.photoURL || "/avatar.svg"}
                        alt={otherUser?.displayName || "User"}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm dark:text-white truncate">
                          {otherUser?.displayName || otherUser?.email || "Unknown User"}
                        </div>
                        {conv.lastMessage && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chat Window */}
        <div className="flex-1 flex flex-col relative p-2 md:p-3 bg-gray-100 dark:bg-gray-700">
          {selectedChat || aiActive ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-20 md:mb-16 space-y-3">
                {/* Real Chat */}
                {selectedChat &&
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.uid;
                    // Skip messages that are deleted for the current user
                    if (msg.deletedFor?.includes(user.uid)) return null;

                    // Mark message as read if it's not from current user
                    if (!isMe) {
                      try {
                        if (chatType === "group") {
                          if (!msg.read || !msg.read.includes(user.uid)) {
                            // Debug logs to verify user/conversation/message state before write
                            try {
                              console.log('DBG markGroupMessageAsRead -> currentUser uid:', user?.uid);
                              console.log('DBG markGroupMessageAsRead -> conversation id:', selectedChat?.id, 'participants:', selectedChat?.participants);
                              console.log('DBG markGroupMessageAsRead -> message id:', msg.id, 'current read:', msg.read);
                            } catch (e) {
                              // ignore
                            }

                            // markGroupMessageAsRead returns a promise; catch rejections to avoid uncaught promise
                            markGroupMessageAsRead(selectedChat.id, msg.id, user.uid).catch((err) => {
                              console.error('markGroupMessageAsRead failed:', err);
                            });
                          }
                        } else {
                          if (msg.readBy && !msg.readBy.includes(user.uid)) {
                            // Debug logs to verify user/conversation/message state before write
                            try {
                              console.log('DBG markMessageAsRead -> currentUser uid:', user?.uid);
                              console.log('DBG markMessageAsRead -> conversation id:', selectedChat?.id, 'participants:', selectedChat?.participants);
                              console.log('DBG markMessageAsRead -> message id:', msg.id, 'current readBy:', msg.readBy);
                            } catch (e) {
                              // ignore
                            }

                            // Fetch server-side conversation doc and log participants for debugging
                            try {
                              getConversationDetails(selectedChat.id)
                                .then((convDoc) => {
                                  console.log('DBG server conversation doc participants:', convDoc?.participants);
                                })
                                .catch((err) => console.error('DBG getConversationDetails failed:', err));
                            } catch (e) {
                              // ignore
                            }

                            // markMessageAsRead returns a promise; catch rejections to avoid uncaught promise
                            markMessageAsRead(selectedChat.id, msg.id, user.uid).catch((err) => {
                              console.error('markMessageAsRead failed:', err);
                            });
                          }
                        }
                      } catch (err) {
                        console.error('Error marking message read:', err);
                      }
                    }

                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}>
                        <div 
                          className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-sm shadow text-sm ${
                isMe
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-bl-none"
                          }`}
                          onClick={() => isMe && setMessageOptionsId(messageOptionsId === msg.id ? null : msg.id)}
                        >
                          {msg.deletedForEveryone ? (
                            <span className="italic text-gray-500 dark:text-gray-400">
                              This message was deleted
                            </span>
                          ) : (
                            msg.text
                          )}
                          <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                            {formatTimestamp(msg.timestamp)}
                            {isMe && (
                              <div className="ml-1">
                                {(msg.readBy?.length > 0 || msg.read?.length > 0) ? (
                                  <span title="Read">✓✓</span>
                                ) : (
                                  <span title="Sent">✓</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Message options dropdown */}
                        {messageOptionsId === msg.id && isMe && !msg.deletedForEveryone && (
                          <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                            <button
                              onClick={async () => {
                                try {
                                  if (chatType === "group") {
                                    await deleteGroupMessageForEveryone(selectedChat.id, msg.id);
                                  } else {
                                    await deleteMessageForEveryone(selectedChat.id, msg.id);
                                  }
                                  setMessageOptionsId(null);
                                } catch (error) {
                                  console.error('Error deleting message for everyone:', error);
                                  alert('Failed to delete message for everyone.');
                                }
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Delete for everyone
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  if (chatType === "group") {
                                    await deleteGroupMessageForMe(selectedChat.id, msg.id, user.uid);
                                  } else {
                                    await deleteMessageForMe(selectedChat.id, msg.id, user.uid);
                                  }
                                  setMessageOptionsId(null);
                                } catch (error) {
                                  console.error('Error deleting message for me:', error);
                                  alert('Failed to delete message for you.');
                                }
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Delete for me
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* AI Chat */}
                {aiActive &&
                  aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-sm shadow text-sm ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-green-200 dark:bg-green-600 text-black dark:text-white rounded-bl-none"
                      }`} dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                        {msg.time}
                      </div>
                    </div>
                  ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-2xl bg-green-100 dark:bg-green-600 text-black dark:text-white shadow text-sm">
                      🤖 AI is typing...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef}></div>
              </div>

              {/* Input */}
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 flex gap-2 border-t dark:border-gray-600 bg-white dark:bg-gray-800">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-full shadow disabled:opacity-50 flex items-center gap-2 md:text-base"
                  disabled={loading}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center mt-10">
              Search for a user or click <strong className="text-green-500">AI Chat</strong>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        currentUser={user}
        onCreateSuccess={handleGroupCreated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Delete Group</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this group? This action cannot be undone and all messages will be lost.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGroup(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-extrabold dark:text-white">Messages — Help & Support</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-lg font-semibold"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-200">
              <p className="mb-4">Quick guide to using <strong>Messages</strong> in the app.</p>

              <section className="mb-4">
                <h4 className="text-sm font-semibold dark:text-white mb-2">Start a conversation</h4>
                <ol className="list-decimal list-inside ml-4 space-y-1 leading-relaxed text-gray-600 dark:text-gray-300">
                  <li>Use the <strong>search</strong> field to find a user by name or email.</li>
                  <li>Click a search result to start a private chat.</li>
                </ol>
              </section>

              <section className="mb-4">
                <h4 className="text-sm font-semibold dark:text-white mb-2">Create a group</h4>
                <ol className="list-decimal list-inside ml-4 space-y-1 leading-relaxed text-gray-600 dark:text-gray-300">
                  <li>Click <strong>New Group</strong> and follow the prompts to create a group.</li>
                  <li>After creation, the group appears in the <strong>Groups</strong> list.</li>
                </ol>
              </section>

              <section className="mb-4">
                <h4 className="text-sm font-semibold dark:text-white mb-2">AI Chat</h4>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">Click <strong>AI Chat</strong> to start a conversation with the built-in assistant. Type messages and the assistant will reply in the chat window.</p>
              </section>

              <section className="mb-4">
                <h4 className="text-sm font-semibold dark:text-white mb-2">Send messages</h4>
                <ol className="list-decimal list-inside ml-4 space-y-1 leading-relaxed text-gray-600 dark:text-gray-300">
                  <li>Type in the input at the bottom and press <strong>Enter</strong> or click the send button.</li>
                  <li>Messages go to the selected chat: group or private.</li>
                </ol>
              </section>

              <section className="mb-4">
                <h4 className="text-sm font-semibold dark:text-white mb-2">Delete messages</h4>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">If it's your message, click it to open options and choose <em>Delete for everyone</em> or <em>Delete for me</em>. Deleted-for-everyone messages show a placeholder.</p>
              </section>

              <section className="mb-4">
                <h4 className="text-sm font-semibold dark:text-white mb-2">Other notes</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <li>Unread/read status is shown by ticks on your messages.</li>
                  <li>The sidebar collapses on small screens—use the mobile layout for compact devices.</li>
                  <li>Search is debounced (500ms) to reduce load while typing.</li>
                </ul>
              </section>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
