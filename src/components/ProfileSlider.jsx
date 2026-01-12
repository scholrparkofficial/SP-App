import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileSlider({ isOpen, onClose, isLoggedIn, handleLogin, handleLogout }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Profile</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {isLoggedIn ? (
          <>
            {/* Account Settings link */}
            <Link
              to="/account"
              className="px-4 py-2 text-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={onClose}
            >
              Account Settings
            </Link>

            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="px-4 py-2 text-center bg-red-500 text-white rounded-md hover:bg-red-600 transition"
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
            className="px-4 py-2 text-center bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
