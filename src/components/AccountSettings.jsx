// src/pages/AccountSettings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AccountSettings({ navbarProfileUpdater }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [watchTime, setWatchTime] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    avatar: "/avatar.png",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* =======================
     Load user data
  ======================= */
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.photoURL || "/avatar.png",
      });
    }
  }, [user]);

  /* =======================
     Redirect if not logged in
  ======================= */
  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  /* =======================
     Watch time (mock)
  ======================= */
  useEffect(() => {
    setWatchTime(12.5);
  }, []);

  /* =======================
     Profile Save
  ======================= */
  const handleProfileSave = async () => {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: profileData.email,
          displayName: profileData.username,
          photoURL: profileData.avatar,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      const { updateProfile } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      await updateProfile(auth.currentUser, {
        displayName: profileData.username,
        photoURL: profileData.avatar,
      });

      if (navbarProfileUpdater) {
        navbarProfileUpdater(profileData.avatar, profileData.username);
      }

      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  /* =======================
     Password Change
  ======================= */
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const { updatePassword } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      await updatePassword(auth.currentUser, passwordData.newPassword);

      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      alert("Password updated successfully!");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        alert("Please re-login to change password.");
      } else {
        alert(error.message);
      }
    }
  };

  /* =======================
     Avatar Change
  ======================= */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  /* =======================
     Loading
  ======================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-6 py-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6">
        
        {/* ================= Header ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Account Settings
          </h1>

          <button
            onClick={() => navigate("/")}
            className="self-start sm:self-auto px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>

        {/* ================= Profile Card ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="relative self-center sm:self-auto">
            <img
              src={profileData.avatar}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-600"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profileData.username}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {profileData.email}
            </p>
          </div>
        </div>

        {/* ================= Profile Info ================= */}
        {!isEditingProfile ? (
          <div className="space-y-4">
            {[
              ["Username", profileData.username],
              ["Email", profileData.email],
              ["Total Watch Time", `${watchTime} hrs`],
              ["Membership", "Free Plan"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2"
              >
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {label}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {value}
                </span>
              </div>
            ))}

            <button
              onClick={() => setIsEditingProfile(true)}
              className="w-full sm:w-fit mt-4 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={profileData.username}
              onChange={(e) =>
                setProfileData({ ...profileData, username: e.target.value })
              }
              className="w-full input"
              placeholder="Username"
            />

            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="w-full input"
              placeholder="Email"
            />

            <div className="flex gap-3">
              <button
                onClick={handleProfileSave}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ================= Password ================= */}
        <div className="mt-8">
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full sm:w-fit px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Change / Add Password
            </button>
          ) : (
            <div className="space-y-3">
              {["currentPassword", "newPassword", "confirmPassword"].map(
                (field, idx) => (
                  <input
                    key={idx}
                    type="password"
                    placeholder={field.replace(/([A-Z])/g, " $1")}
                    value={passwordData[field]}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full input"
                  />
                )
              )}

              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Save Password
                </button>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
