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
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

import Messages from "./Messages";
import NotificationsPanel from "./NotificationsPanel";
import LoginModal from "./LoginModal";
import FirstTimeHelpModal from "./FirstTimeHelpModal";
import { useAuth } from "../contexts/AuthContext";
import { getNewMessages, getNewNotifications } from "../firebase";

export default function Navbar() {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const navigate = useNavigate();
  const { user, googleLogin, logout } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkUpdates = async () => {
      try {
        const messages = await getNewMessages(user.uid);
        const notifications = await getNewNotifications(user.uid);
        setHasNewMessages(messages.length > 0);
        setHasNewNotifications(notifications.length > 0);
      } catch (e) {
        console.error(e);
      }
    };

    checkUpdates();
  }, [user]);

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
    <div className="overflow-x-hidden">
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-40 bg-green-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 shadow-md backdrop-blur-sm">
        <div className="container-main flex items-center justify-between h-14 md:h-16">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <img
              src="/width_1024.webp"
              alt="Logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg"
            />
            <span className="font-bold text-lg md:text-xl ml-5 m-14 bg-slate-300 px-2 py-1 rounded-lg">
              ScholrPark
            </span>
          </div>

          {/* CENTER */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link to="/" className="nav-item"><Home size={20} /> Home</Link>
            <Link to="/videos" className="nav-item">Videos</Link>
            <Link to="/private-batches" className="nav-item"><BookOpen size={20} /> Private Batches</Link>
            <Link to="/your-notes" className="nav-item"><FileText size={20} /> Notes</Link>

            <button onClick={() => setShowHelpModal(true)} className="nav-item">
              <HelpCircle size={20} /> Help
            </button>

            <button
              onClick={() => {
                setIsMessagesOpen(true);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              className="nav-item relative"
            >
              <MessageCircle size={20} /> Messages
              {hasNewMessages && <span className="badge-dot absolute -top-1 -right-1" />}
            </button>

            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                setIsMessagesOpen(false);
                setIsProfileOpen(false);
              }}
              className="nav-item relative"
            >
              <Bell size={20} /> Notifications
              {hasNewNotifications && <span className="badge-dot absolute -top-1 -right-1" />}
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsProfileOpen(true);
                setIsMessagesOpen(false);
                setIsNotificationsOpen(false);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-md focus-visible:ring-2"
            >
              <img
                src={user?.photoURL || "/avatar.png"}
                className="w-9 h-9 rounded-full border"
              />
              <span className="hidden md:inline max-w-[120px] truncate text-sm">
                {user?.displayName?.split(" ")[0]}
              </span>
              <ChevronDown size={16} className="hidden md:inline opacity-60" />
            </button>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden">
          <div className="absolute right-0 top-0 w-72 h-full bg-white dark:bg-gray-800 p-4">
            <button onClick={() => setIsMobileMenuOpen(false)} className="mb-4">
              <X />
            </button>

            <nav className="space-y-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">Home</Link>
              <Link to="/videos" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">Videos</Link>
              <Link to="/private-batches" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">Private Batches</Link>
              <Link to="/your-notes" onClick={() => setIsMobileMenuOpen(false)} className="nav-item block">Notes</Link>
            </nav>
          </div>
        </div>
      )}

      {/* PROFILE BACKDROP + PANEL */}
      {isProfileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsProfileOpen(false)}
          />

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

                  <button onClick={() => navigate("/account")} className="panel-btn">
                    <Settings size={16} /> Account Settings
                  </button>

                  <button onClick={() => navigate("/my-videos")} className="panel-btn">
                    <FileText size={16} /> My Videos
                  </button>

                  {user.email === (import.meta.env.VITE_ADMIN_EMAIL || "scholrpark.official@gmail.com") && (
                    <button onClick={() => navigate("/admin")} className="panel-btn">
                      <ShieldCheck size={16} /> Admin Panel
                    </button>
                  )}

                  <button onClick={handleLogout} className="panel-btn bg-red-500 text-white">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleGoogleLogin} className="btn-primary">
                    Continue with Google
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="btn-secondary">
                    Sign In
                  </button>
                </>
              )}

              <button onClick={toggleDarkMode} className="panel-btn">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />} Dark Mode
              </button>
            </div>
          </div>
        </>
      )}

      {/* PANELS */}
      <Messages isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGoogleLogin={handleGoogleLogin} />
      <FirstTimeHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
