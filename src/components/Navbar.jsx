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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const navigate = useNavigate();
  const { user, googleLogin, logout } = useAuth();

  /* ---------- Dark Mode ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("darkMode", String(next));
  };

  /* ---------- Notifications ---------- */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const messages = await getNewMessages(user.uid);
      const notifications = await getNewNotifications(user.uid);
      setHasNewMessages(messages.length > 0);
      setHasNewNotifications(notifications.length > 0);
    })();
  }, [user]);

  const closeAllPanels = () => {
    setIsMessagesOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeAllPanels();
  };

  return (
    <div className="overflow-x-hidden">
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 left-0 w-full z-50 bg-green-50/90 dark:bg-slate-900/90 backdrop-blur border-b border-green-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <img src="/width_1024.webp" className="w-9 h-9 rounded-lg" />
            <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              ScholrPark
            </span>
          </div>

          {/* CENTER (DESKTOP) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="nav-link"><Home size={18}/> Home</Link>
            <Link to="/videos" className="nav-link">Videos</Link>
            <Link to="/private-batches" className="nav-link"><BookOpen size={18}/> Batches</Link>
            <Link to="/your-notes" className="nav-link"><FileText size={18}/> Notes</Link>

            <button onClick={() => setShowHelpModal(true)} className="nav-link">
              <HelpCircle size={18}/> Help
            </button>

            <button onClick={() => { closeAllPanels(); setIsMessagesOpen(true); }} className="nav-link relative">
              <MessageCircle size={18}/> Messages
              {hasNewMessages && <span className="badge-dot" />}
            </button>

            <button onClick={() => { closeAllPanels(); setIsNotificationsOpen(true); }} className="nav-link relative">
              <Bell size={18}/> Alerts
              {hasNewNotifications && <span className="badge-dot" />}
            </button>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="hidden md:flex p-2 rounded-md hover:bg-green-100 dark:hover:bg-slate-700">
              {darkMode ? <Moon size={18}/> : <Sun size={18}/>}
            </button>

            <button onClick={() => { closeAllPanels(); setIsProfileOpen(true); }} className="flex items-center gap-2">
              <img src={user?.photoURL || "/avatar.png"} className="w-8 h-8 rounded-full border" />
              <ChevronDown size={16} className="hidden md:block opacity-60"/>
            </button>

            <button className="md:hidden p-2" onClick={() => { closeAllPanels(); setIsMobileMenuOpen(true); }}>
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR ================= */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-800 z-50 p-5 flex flex-col gap-3">

            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
            </div>

            <button onClick={() => navigate("/")} className="sidebar-btn"><Home size={16}/> Home</button>
            <button onClick={() => navigate("/videos")} className="sidebar-btn">Videos</button>
            <button onClick={() => navigate("/private-batches")} className="sidebar-btn"><BookOpen size={16}/> Batches</button>
            <button onClick={() => navigate("/your-notes")} className="sidebar-btn"><FileText size={16}/> Notes</button>

            {/* ✅ MESSAGES */}
            <button
              onClick={() => { closeAllPanels(); setIsMessagesOpen(true); }}
              className="sidebar-btn relative"
            >
              <MessageCircle size={16}/> Messages
              {hasNewMessages && <span className="badge-dot" />}
            </button>

            {/* ✅ ALERTS */}
            <button
              onClick={() => { closeAllPanels(); setIsNotificationsOpen(true); }}
              className="sidebar-btn relative"
            >
              <Bell size={16}/> Alerts
              {hasNewNotifications && <span className="badge-dot" />}
            </button>

            <button onClick={toggleDarkMode} className="sidebar-btn mt-3">
              {darkMode ? <Moon size={16}/> : <Sun size={16}/>} Dark Mode
            </button>
          </aside>
        </>
      )}

      {/* ================= PANELS & MODALS ================= */}
      <Messages isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGoogleLogin={handleGoogleLogin} />
      <FirstTimeHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
