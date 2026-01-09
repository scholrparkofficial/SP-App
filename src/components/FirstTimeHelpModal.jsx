import React from 'react';

export default function FirstTimeHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold dark:text-white">Help & Support — How to use ScholrPark</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-200 space-y-5">
          <p className="leading-relaxed">This guide explains core workflows and where to find additional resources. Click any section to jump in.</p>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">1) Account & Profiles</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Create an account via email or use <strong>Continue with Google</strong>.</li>
              <li>Your profile stores display name and photo; update them in <em>Account Settings</em>.</li>
              <li>Admins are determined by the configured admin email — admin-only controls will appear automatically.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">2) Uploading a Video</h4>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Open <strong>Upload</strong>, provide a title, short description and select a video file.</li>
              <li>We generate a thumbnail (best-effort) and upload the video to Cloudinary. Progress is shown during upload.</li>
              <li>All new uploads are created with status <strong>pending</strong>. You will be redirected to <strong>My Videos</strong> after upload.</li>
              <li>An admin reviews pending videos — once approved they become public and visible on the Videos feed.</li>
            </ol>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Note: If you see an error about Cloudinary deletion or upload, check the server configuration files (CLOUDINARY_SETUP.md) or contact support.</p>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">3) My Videos (manage your uploads)</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Open <strong>My Videos</strong> to see your uploads and their approval status.</li>
              <li>Non-admin users cannot approve videos — the <strong>Approve</strong> action is for admins only.</li>
              <li>If your video is pending, you'll see a banner: <em>"Your video is pending admin approval and will be made public after verification."</em></li>
              <li>Deleting a video removes metadata from the database and will also delete the file from Cloudinary if the server is configured.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">4) Admin Moderation (for admins)</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Admins can open <strong>Manage Videos</strong> or the <strong>Admin Panel</strong> to review pending uploads.</li>
              <li>Approving a video sets its status to <strong>public</strong> and publishes it to the public feed.</li>
              <li>Force delete removes Cloudinary resources via the server endpoint and deletes the Firestore document.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">5) Watching, Liking & Following</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Public videos are visible to everyone on the <strong>Videos</strong> feed and on the home page.</li>
              <li>Click a video to watch; you can like videos and follow channels to get updates.</li>
              <li>Uploader controls (delete) are shown to the uploader; admin controls are shown to admins.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">6) Comments & Messages</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Use the <strong>Comments</strong> section on a video to discuss with others.</li>
              <li><strong>Messages</strong> (chat) supports 1:1 and group conversations; create groups from the Messages UI.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">7) Dark Mode & Appearance</h4>
            <p className="text-gray-600 dark:text-gray-300">Toggle dark mode in your profile panel. The interface uses a sober, low-contrast dark theme for comfortable reading.</p>
          </section>

          <section>
            <h4 className="font-semibold mb-2 dark:text-white">8) Troubleshooting & Support</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>If uploads fail, verify Cloudinary settings and that the helper server is running (see server logs).</li>
              <li>If deletion shows errors about missing server URL, set <strong>VITE_CLOUDINARY_SERVER_URL</strong> in your frontend .env and restart the dev server.</li>
              <li>For persistent issues, contact support at <a href="mailto:dasritabrata05@scholrpark.com" className="underline">dasritabrata05@scholrpark.com</a> with a brief description and screenshots.</li>
            </ul>
          </section>

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
