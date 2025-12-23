import React, { useState, useEffect } from "react";
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
  Menu,
  ChevronDown,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, googleLogin, logout } = useAuth();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle("dark", savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("darkMode", String(next));
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <div className="sticky top-0 z-30 bg-green-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 shadow-md backdrop-blur-sm">
        <div className="container-main flex items-center justify-between h-14 md:h-16">
          {/* LEFT */}
          <div className="flex items-center gap-3 flex-none">
            <img
              src="/width_1024.webp"
              alt="Logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-sm"
            />
            <span className="font-bold text-lg md:text-xl text-gray-800 dark:text-gray-200 whitespace-nowrap">
              ScholrPark
            </span>
          </div>

          {/* CENTER */}
          <div className="hidden md:flex items-center gap-3 md:gap-10 flex-1 justify-center">
            <Link to="/" className="nav-item" title="Home">
              <Home size={20} />
              <span className="whitespace-nowrap">Home</span>
            </Link>

            <Link to="/videos" className="nav-item" title="Videos">
              <span className="whitespace-nowrap">Videos</span>
            </Link>

            <Link to="/private-batches" className="hidden md:flex nav-item" title="Private Batches">
              <BookOpen size={20} />
              <span className="whitespace-nowrap">Private Batches</span>
            </Link>

            <Link to="/your-notes" className="hidden md:flex nav-item" title="Notes">
              <FileText size={20} />
              <span className="whitespace-nowrap">Notes</span>
            </Link>

            <button
              onClick={() => {
                setIsMessagesOpen(true);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              className="nav-item relative"
              title="Messages"
            >
              <MessageCircle size={20} />
              <span className="whitespace-nowrap">Messages</span>
              {/* example small badge */}
              <span className="absolute -top-0.5 -right-0.5">
                <span className="badge-dot" />
              </span>
            </button>

            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                setIsMessagesOpen(false);
                setIsProfileOpen(false);
              }}
              className="nav-item relative"
              title="Notifications"
            >
              <Bell size={20} />
              <span className="whitespace-nowrap">Notifications</span>
              <span className="absolute -top-0.5 -right-0.5">
                <span className="badge-dot" />
              </span>
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 flex-none">
            <div className="hidden md:flex items-center gap-2">
              {/* extra space for future icons */}
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-md"
              aria-expanded={isProfileOpen}
            >
              <img
                src={user?.photoURL || "/avatar.png"}
                alt="Profile"
                className="w-9 h-9 rounded-full border"
              />
              <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200 text-ellipsis">
                {user?.displayName?.split(" ")[0]}
              </span>
              <ChevronDown size={16} className="hidden md:inline text-gray-500" />
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md focus-visible:ring-2 focus-visible:ring-primary-300"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden">
          <div className="absolute right-0 top-0 w-72 h-full bg-white dark:bg-gray-800 shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/width_1024.webp" className="w-8 h-8 rounded-md" />
                <span className="font-bold">ScholrPark</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>

            <nav className="space-y-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">
                <Home size={18} /> Home
              </Link>

              <Link to="/videos" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">
                Videos
              </Link>

              <Link to="/private-batches" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">
                <BookOpen size={18} /> Private Batches
              </Link>

              <Link to="/your-notes" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">
                <FileText size={18} /> Notes
              </Link>

              <button onClick={() => { setIsMessagesOpen(true); setIsMobileMenuOpen(false); }} className="nav-item w-full text-left">
                <MessageCircle size={18} /> Messages
              </button>

              <button onClick={() => { setIsNotificationsOpen(true); setIsMobileMenuOpen(false); }} className="nav-item w-full text-left">
                <Bell size={18} /> Notifications
              </button>

              <div className="border-t pt-3">
                {user ? (
                  <>
                    <button onClick={() => { navigate('/account'); setIsMobileMenuOpen(false); }} className="panel-btn w-full">
                      <Settings size={16} /> Account Settings
                    </button>

                    <button onClick={handleLogout} className="panel-btn w-full bg-red-500 text-white">
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { handleGoogleLogin(); setIsMobileMenuOpen(false); }} className="btn-primary w-full">
                      Continue with Google
                    </button>
                    <button onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }} className="btn-secondary w-full">
                      Sign In
                    </button>
                  </>
                )}

                <button onClick={toggleDarkMode} className="panel-btn w-full">
                  {darkMode ? <Moon size={16} /> : <Sun size={16} />} Dark Mode
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* PROFILE PANEL */}
      {isProfileOpen && (
        <div className="fixed top-0 right-0 w-full md:w-72 h-full bg-white dark:bg-gray-800 z-50 shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">Profile</h2>
            <button onClick={() => setIsProfileOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {user ? (
              <>
                <p className="font-semibold">{user.displayName}</p>

                <button
                  onClick={() => navigate("/account")}
                  className="panel-btn"
                >
                  <Settings size={16} /> Account Settings
                </button>

                <button
                  onClick={() => { navigate('/my-videos'); setIsProfileOpen(false); }}
                  className="panel-btn"
                >
                  <FileText size={16} /> My Videos
                </button>

                <button
                  onClick={() => setShowHelpModal(true)}
                  className="panel-btn"
                >
                  <HelpCircle size={16} /> Help
                </button>

                <button
                  onClick={handleLogout}
                  className="panel-btn bg-red-500 text-white"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={handleGoogleLogin} className="btn-primary">
                  Continue with Google
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-secondary"
                >
                  Sign In
                </button>
              </>
            )}

            <button onClick={toggleDarkMode} className="panel-btn">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />} Dark Mode
            </button>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <Messages
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
      />

      {/* NOTIFICATIONS */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoogleLogin={handleGoogleLogin}
      />

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-bold mb-2">Help</h3>
            <p>Click Messages to start chatting.</p>
            <button onClick={() => setShowHelpModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
