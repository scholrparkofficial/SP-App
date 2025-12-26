Cloudinary setup for MyApp

Follow these steps to enable video uploads to Cloudinary from the frontend:

1) Create a Cloudinary account
   - Go to https://cloudinary.com and sign up for a free account.

2) Create an unsigned upload preset
   - In the Cloudinary Dashboard go to Settings -> Upload -> Upload presets.
   - Create a new upload preset and set it to "Unsigned" (allow uploading directly from the browser).
   - Optionally configure folder, allowed formats, size limits, etc.
   - Note the preset name (you will set this in your .env).

3) Note your Cloud name
   - In the Dashboard, copy your "Cloud name" (you will set this in your .env).

4) Add Vite environment variables
   - Create a `.env` or `.env.local` file in the repo root (same level as `package.json`).
   - Add the following lines (replace with your values):

     VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
     VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset

   - IMPORTANT: Never commit secrets. For browser unsigned upload you only need cloud name and unsigned preset. Keep your repo private or add `.env*` to `.gitignore`.

5) Restart your dev server
   - Vite reads `.env` on start, so restart `npm run dev` / `yarn dev` after adding env vars.

6) Optional: Adjust client file size limits and validation
   - `src/components/UploadVideo.jsx` previously implemented a 50 MB sample limit; the client-side check has been removed. Adjust server/Cloudinary settings if you need to enforce a different limit (Cloudinary free tier may have limits).

7) Verify
   - Open `/upload`, select a video and upload. The video will be uploaded to Cloudinary (progress shown) and a metadata record will be created in Firestore `videos` collection with `videoUrl`, `videoPublicId`, `thumbnailUrl` and `thumbnailPublicId`.

9) Deleting videos
   - To delete a video from the app, the uploader can open the video page and click **Delete Video** (confirmation required).
   - Deleting performs two actions:
     1. Calls a server endpoint (`POST /api/cloudinary/delete`) to remove the video and thumbnail from Cloudinary (requires server-side Cloudinary API key/secret)
     2. Deletes the Firestore document for the video from the `videos` collection
   - To run the server locally, create `server/.env` with:
     ```
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     ```
   - Start the server in `server/` folder: `npm install && npm start` (port 4001 by default)
   - Set `VITE_CLOUDINARY_SERVER_URL` in your client `.env.local` to `http://localhost:4001` (or your hosted URL) and restart the dev server.

Troubleshooting tips
- If the upload fails immediately, ensure `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are set and the preset is unsigned.
- If progress is not reported, ensure your browser allows large file uploads and there is no network proxy blocking large requests.

Security note
- This guide uses an unsigned preset which allows client-side uploads without exposing API secret. For production and stricter control consider building a server-side signed upload flow.

If you want, I can also add a small environment example file and update README to mention Cloudinary setup.