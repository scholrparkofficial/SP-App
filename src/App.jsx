import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateBatches from "./components/PrivateBatches";
import Home from "./components/Home";

import Messages from "./components/Messages";
import AIChat from "./components/AIChat";
import BatchPage from "./components/BatchPage";
import VideoPage from "./components/VideoPage";
import YourNoteEditor from "./components/YourNoteEditor";
import YourNotesLibrary from "./components/YourNotesLibrary";
import AccountSettings from "./components/AccountSettings";


function AppWrapper() {
  const location = useLocation();

  // Decide on which paths Navbar should appear
  const showNavbarOnPaths = ["/", "/private-batches", "/your-notes"];

  const shouldShowNavbar = showNavbarOnPaths.includes(location.pathname);

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


