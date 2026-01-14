export const config = {
  runtime: "nodejs",
};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method-not-allowed" });
  }

  try {
    const { publicId, resourceType = "video" } = req.body || {};

    if (!publicId) {
      return res.status(400).json({ error: "publicId is required" });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("❌ Cloudinary delete error", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}
