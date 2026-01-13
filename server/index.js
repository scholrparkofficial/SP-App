// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(express.json());

// Configure cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary env at startup to provide clearer errors
const missingCloudinary =
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET;
if (missingCloudinary) {
  console.warn(
    "Warning: Cloudinary admin credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env or env. Admin delete calls will fail."
  );
}

app.post("/api/cloudinary/delete", async (req, res) => {
  try {
    const { publicId, resourceType = "video" } = req.body || {};
    if (!publicId)
      return res.status(400).json({ error: "publicId is required" });

    // If credentials are missing return a clear error instead of letting Cloudinary SDK fail
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res
        .status(500)
        .json({
          error: "missing-cloudinary-credentials",
          message: "Server missing Cloudinary admin credentials",
        });
    }

    // Destroy the resource (for videos resource_type must be 'video')
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    // result is an object with result: 'ok' or 'not found'/"error"
    if (result.result === "ok" || result.result === "not found") {
      return res.json({ result: "ok", raw: result });
    }

    return res.status(500).json({ error: "delete-failed", raw: result });
  } catch (err) {
    console.error("Cloudinary delete error", err);
    // If Cloudinary SDK returns nested error
    const message = (err && err.message) || String(err);
    return res.status(500).json({ error: "server-error", message });
  }
});

// Simple health check to confirm server is running
app.get("/health", (req, res) => res.json({ status: "ok", time: Date.now() }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
