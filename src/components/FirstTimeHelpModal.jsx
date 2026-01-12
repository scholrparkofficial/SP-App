import React from "react";

export default function FirstTimeHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-5 sm:p-7 max-h-[85vh] overflow-y-auto shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg sm:text-xl font-bold dark:text-white">
            Welcome to ScholrPark — How to Get Started
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 space-y-6">

          <p className="leading-relaxed">
            This short guide will help you understand how ScholrPark works.
            Whether you’re a student or a teacher, you’ll find everything you need
            to get started smoothly — no technical knowledge required.
          </p>

          {/* Section 1 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              1. Creating Your Account
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Sign up using your email or simply choose <strong>Continue with Google</strong>.</li>
              <li>Your profile shows your name and photo so others can recognize you.</li>
              <li>You can edit your profile anytime from <strong>Account Settings</strong>.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              2. Uploading a Learning Video
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Click on <strong>Upload</strong> from the menu.</li>
              <li>Add a clear title and a short description of your video.</li>
              <li>Select your video file and wait for it to upload.</li>
              <li>Once uploaded, your video will be reviewed before becoming public.</li>
            </ol>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              💡 Don’t worry — this review is only to ensure quality and safety for students.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              3. Managing Your Videos
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Open <strong>My Videos</strong> to see all videos you have uploaded.</li>
              <li>You can easily check whether a video is pending or already public.</li>
              <li>You can delete your own videos anytime if needed.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              4. Watching & Exploring Content
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Browse educational videos from the home or videos section.</li>
              <li>Tap on any video to start learning instantly.</li>
              <li>Like videos and follow creators to see more from them.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              5. Comments & Conversations
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Ask questions or share thoughts in the comments below a video.</li>
              <li>Use Messages to chat one-on-one or in groups.</li>
              <li>Group chats are perfect for classes and study discussions.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              6. Dark Mode & Comfort
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Switch between light and dark mode from your profile.
              Dark mode is designed to be easy on the eyes during long study sessions.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h4 className="font-semibold mb-2 dark:text-white">
              7. Need Help?
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>If something doesn’t work as expected, try refreshing the page.</li>
              <li>For any issues or questions, feel free to reach out to us.</li>
              <li>
                📧 Email:{" "}
                <a
                  href="mailto:dasritabrata05@scholrpark.com"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  dasritabrata05@scholrpark.com
                </a>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <div className="flex justify-end pt-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Got it, let’s learn 🚀
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
