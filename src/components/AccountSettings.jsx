// src/pages/AccountSettings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountSettings({ navbarProfileUpdater }) {
  const navigate = useNavigate();
  const [watchTime, setWatchTime] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "John Doe",
    email: "johndoe@email.com",
    avatar: "/avatar.png",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Simulate fetching watch time (replace with backend call)
    const savedWatchTime = 12.5;
    setWatchTime(savedWatchTime);
  }, []);

  // Handle profile updates
  const handleProfileSave = () => {
    console.log("Profile updated:", profileData);
    setIsEditingProfile(false);

    // Update the Navbar profile picture globally if passed as prop
    if (navbarProfileUpdater) {
      navbarProfileUpdater(profileData.avatar, profileData.username);
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    console.log("Password changed:", passwordData);
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    alert("Password updated successfully!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-start p-6">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Account Settings</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Homepage
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={profileData.avatar}
              alt="User"
              className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
              title="Click to change profile picture"
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profileData.username}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.email}</p>
          </div>
        </div>

        {/* Editable Profile Form */}
        {isEditingProfile ? (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <span className="text-gray-600 dark:text-gray-300">Username</span>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) =>
                  setProfileData({ ...profileData, username: e.target.value })
                }
                className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <span className="text-gray-600 dark:text-gray-300">Email</span>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleProfileSave}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <span className="text-gray-600 dark:text-gray-300">Username</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{profileData.username}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <span className="text-gray-600 dark:text-gray-300">Email</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{profileData.email}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <span className="text-gray-600 dark:text-gray-300">Total Watch Time</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{watchTime} hrs</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <span className="text-gray-600 dark:text-gray-300">Membership</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">Free Plan</span>
            </div>

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* Password Change Form */}
        {isChangingPassword ? (
          <div className="space-y-4 mb-6">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handlePasswordChange}
              >
                Save Password
              </button>
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 mb-4"
            onClick={() => setIsChangingPassword(true)}
          >
            Change / Add Password
          </button>
        )}
      </div>
    </div>
  );
}
