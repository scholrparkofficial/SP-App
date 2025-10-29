import React from 'react';

export default function FirstTimeHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold dark:text-white">Welcome — Quick Start</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-200 space-y-3">
          <p className="leading-relaxed">Welcome to ScholrPark! A couple quick pointers to get you started.</p>

          <div>
            <h4 className="font-semibold mb-1 dark:text-white">How to sign up or log in</h4>
            <p className="text-gray-600 dark:text-gray-300">Use the sign up / log in modal that just opened. You can also continue with Google.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-1 dark:text-white">Messages</h4>
            <p className="text-gray-600 dark:text-gray-300">Open Messages (chat bubble) to start conversations. Use the search box to find people or create groups.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-1 dark:text-white">Where to find more help</h4>
            <p className="text-gray-600 dark:text-gray-300">Open Help & Support from the profile menu or the Messages header anytime.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Got it</button>
          </div>
        </div>
      </div>
    </div>
  );
}
