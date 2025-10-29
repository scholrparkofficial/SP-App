import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateBatches from "./components/PrivateBatches";
import Home from "./components/Home";
import LoginModal from "./components/LoginModal";
import FirstTimeHelpModal from "./components/FirstTimeHelpModal";
import { useAuth } from "./contexts/AuthContext";

import Messages from "./components/Messages";
import AIChat from "./components/AIChat";
import BatchPage from "./components/BatchPage";
import VideoPage from "./components/VideoPage";
import YourNoteEditor from "./components/YourNoteEditor";
import YourNotesLibrary from "./components/YourNotesLibrary";
import AccountSettings from "./components/AccountSettings";


function AppWrapper() {
  const location = useLocation();
  const { user, googleLogin } = useAuth();
  // Decide on which paths Navbar should appear
  const showNavbarOnPaths = ["/", "/private-batches", "/your-notes"];

  const shouldShowNavbar = showNavbarOnPaths.includes(location.pathname);

  const [showFirstVisitLogin, setShowFirstVisitLogin] = React.useState(false);
  const [showFirstTimeHelp, setShowFirstTimeHelp] = React.useState(false);

  // On first visit (client-side), open login/signup
  React.useEffect(() => {
    try {
      const visited = localStorage.getItem('sp_hasVisited');
      if (!visited) {
        localStorage.setItem('sp_hasVisited', 'true');
        // only show login modal if user is not signed in
        if (!user) setShowFirstVisitLogin(true);
      }
    } catch (e) {}
  }, [user]);

  // After a first-time successful login, show help once per user
  React.useEffect(() => {
    if (user) {
      try {
        const key = `sp_help_shown_${user.uid}`;
        const shown = localStorage.getItem(key);
        if (!shown) {
          setShowFirstTimeHelp(true);
          localStorage.setItem(key, 'true');
        }
      } catch (e) {}
    }
  }, [user]);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/private-batches" element={<PrivateBatches />} />
        <Route path="/your-notes" element={<YourNotesLibrary />} />
        <Route path="/your-notes/editor/:noteId" element={<YourNoteEditor />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/batch/:id" element={<BatchPage />} />
        <Route path="/video/:videoId" element={<VideoPage />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/account" element={<AccountSettings />} />
      </Routes>

      <LoginModal
        isOpen={showFirstVisitLogin && !user}
        onClose={() => setShowFirstVisitLogin(false)}
        onGoogleLogin={async () => {
          try {
            await googleLogin();
            setShowFirstVisitLogin(false);
          } catch (err) {
            console.error(err);
          }
        }}
      />

      <FirstTimeHelpModal isOpen={showFirstTimeHelp} onClose={() => setShowFirstTimeHelp(false)} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}


