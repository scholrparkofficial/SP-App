import React from "react";
import { X, Video } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileSlider({
  isOpen,
  onClose,
  isLoggedIn,
  handleLogin,
  handleLogout
}) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Profile
        </h2>
        <button onClick={onClose}>
          <X size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {isLoggedIn ? (
          <>
            {/* My Videos */}
            <Link
              to="/my-videos"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <Video size={18} />
              My Videos
            </Link>

            {/* Account Settings */}
            <Link
              to="/account"
              onClick={onClose}
              className="px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Account Settings
            </Link>

            {/* Logout */}
            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              handleLogin();
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
