basic app frontend in react

## Cloudinary (Video uploads)

This project uses Cloudinary for client-side video uploads (unsigned preset) instead of Firebase Storage.

Quick setup:

1. Create a Cloudinary account: https://cloudinary.com
2. Create an **unsigned** upload preset under Dashboard → Settings → Upload → Upload presets.
3. Copy your **Cloud name** and the upload preset name into `.env.local` using the `.env.example` as reference:

   ```bash
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
   ```

4. Restart the dev server (`npm run dev` / `yarn dev`).

See `CLOUDINARY_SETUP.md` for more detailed steps and security notes.
