import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getNotifications } from "../firebase";

export default function NotificationsPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fetchedNotifications = await getNotifications(); // Fetch notifications from backend
        if (mounted) setNotifications(fetchedNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">Notifications</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {notifications.length > 0 ? (
          notifications.map((note, index) => (
            <div
              key={index}
              className="p-2 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition"
            >
              {note}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No new notifications</p>
        )}
      </div>
    </div>
  );
}
