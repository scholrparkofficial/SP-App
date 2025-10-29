import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  MessageCircle,
  Bell,
  X,
  Moon,
  Sun,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";
import Messages from "./Messages";
import NotificationsPanel from "./NotificationsPanel";
import LoginModal from "./LoginModal";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, googleLogin, logout } = useAuth();

  React.useEffect(() => {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsProfileOpen(false);
  };

  return (
    <>
      {/* Navbar */}
  <div className="flex items-center justify-between bg-green-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 px-3 md:px-6 h-14 md:h-16 shadow-md">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-0.5 rounded-lg bg-transparent">
            <img
              src="/width_1024.webp"
              alt="Logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain"
            />
          </div>
          <span className="font-bold text-lg md:text-xl text-gray-800 dark:text-gray-200">ScholrPark</span>
        </div>

        {/* Center: Navigation - Compact on mobile, full on desktop */}
        <div className="flex items-center gap-3 md:gap-10">
          <Link
            to="/"
            className="flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded"
            aria-label="Home"
          >
            <Home size={22} />
            <span className="text-xs md:text-sm">Home</span>
          </Link>

          {/* Hidden on small screens to simplify mobile navbar */}
          <Link
            to="/private-batches"
            className="hidden md:flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded"
            aria-label="Private Batches"
          >
            <BookOpen size={22} />
            <span className="text-xs md:text-sm">Private Batches</span>
          </Link>

          {/* Hidden on small screens to keep navbar compact */}
          <Link
            to="/your-notes"
            className="hidden md:flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded"
            aria-label="Notes"
          >
            <FileText size={22} />
            <span className="text-xs md:text-sm">Notes</span>
          </Link>

          <button
            onClick={() => {
              setIsMessagesOpen(true);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className="flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded"
            aria-label="Messages"
          >
            <MessageCircle size={22} />
            <span className="text-xs md:text-sm hidden md:inline">Messages</span>
            <span className="text-xs md:hidden">Chat</span>
          </button>

          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              setIsMessagesOpen(false);
              setIsProfileOpen(false);
            }}
            className="flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded"
            aria-label="Notifications"
          >
            <Bell size={22} />
            <span className="text-xs md:text-sm hidden md:inline">Notifications</span>
            <span className="text-xs md:hidden">Alerts</span>
          </button>
        </div>

        {/* Right: Search Bar + Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Hidden on very small screens, shown on larger mobile */}
          <div className="hidden sm:flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-40 md:w-64">
            <input
              type="search"
              placeholder="Search..."
              className="flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          </div>

          <button
            onClick={() => {
              setIsProfileOpen(true);
              setIsMessagesOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="focus:outline-none"
            aria-label="Open profile"
          >
            <img
              src={user?.photoURL || "/avatar.png"}
              alt={user?.displayName || "Profile"}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
            />
          </button>
          
        </div>
      </div>

      {/* Slide-in Messages Panel */}
      <Messages
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
      />

      {/* Slide-in Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

{/* Slide-in Profile Panel */}
{isProfileOpen && (
  <div className="fixed top-0 right-0 w-full md:w-72 h-full bg-white dark:bg-gray-800 shadow-lg z-50 flex flex-col">
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-600">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
      <button onClick={() => setIsProfileOpen(false)}>
        <X size={20} className="text-gray-500 dark:text-gray-400" />
      </button>
    </div>

    <div className="p-4 flex flex-col gap-4 overflow-y-auto">
      {user ? (
        <>
          <div className="flex items-center gap-3">
            <img
              src={user.photoURL || "/avatar.png"}
              alt="User"
              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{user.displayName || user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Account Settings Button */}
          <button
            onClick={() => {
              setIsProfileOpen(false);
              navigate("/account");
            }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Settings size={18} className="text-gray-700 dark:text-gray-300" /> <span className="text-gray-700 dark:text-gray-300">Account Settings</span>
          </button>

          {/* Notes & Private Batches - accessible from profile on mobile */}
          <button
            onClick={() => {
              setIsProfileOpen(false);
              navigate('/your-notes');
            }}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FileText size={18} className="text-gray-700 dark:text-gray-300" /> <span className="text-gray-700 dark:text-gray-300">Notes</span>
          </button>

          <button
            onClick={() => {
              setIsProfileOpen(false);
              navigate('/private-batches');
            }}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <BookOpen size={18} className="text-gray-700 dark:text-gray-300" /> <span className="text-gray-700 dark:text-gray-300">Private Batches</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <HelpCircle size={18} className="text-gray-700 dark:text-gray-300" /> <span className="text-gray-700 dark:text-gray-300">Help & Support</span>
          </button>

          <button
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={handleLogout}
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Continue with Google
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900"
          >
            Sign Up / Log In
          </button>
        </>
      )}

      {/* Divider */}
      <hr className="border-gray-200 dark:border-gray-600" />

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
        {darkMode ? <Moon size={18} className="text-gray-700 dark:text-gray-300" /> : <Sun size={18} className="text-gray-700 dark:text-gray-300" />}
      </button>
    </div>
  </div>
)}

<LoginModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onGoogleLogin={handleGoogleLogin}
/>
      {/* Profile Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold dark:text-white">Help for Messages</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-200 space-y-3">
              <p className="leading-relaxed">This section explains how to access the <strong>Messages</strong> feature and add people to conversations.</p>

              <div>
                <h4 className="font-semibold mb-1 dark:text-white">How to go to Messages</h4>
                <p className="text-gray-600 dark:text-gray-300">Click the <strong>Messages</strong> icon in the navbar (chat bubble). You can also open Messages from the main menu by tapping <strong>Chat</strong> on mobile.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1 dark:text-white">How to add new people in Messages</h4>
                <ol className="list-decimal list-inside ml-4 text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Open <strong>Messages</strong> and use the <strong>Search</strong> field to find people by name or email.</li>
                  <li>Click a search result to start a private conversation with that person.</li>
                  <li>To add multiple people, create a <strong>New Group</strong> inside Messages and invite users when prompted.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-1 dark:text-white">Notes</h4>
                <p className="text-gray-600 dark:text-gray-300">This help content will be updated when new messaging features are added (for example, notes, attachments, or richer collaborators).</p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => {
                    setIsMessagesOpen(true);
                    setIsProfileOpen(false);
                    setShowHelpModal(false);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Open Messages
                </button>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
