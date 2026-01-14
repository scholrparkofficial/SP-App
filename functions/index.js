import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { logger } from "firebase-functions";
import { v2 as cloudinary } from "cloudinary";

/**
 * Limit max instances (cost control)
 */
setGlobalOptions({ maxInstances: 10 });

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * DELETE VIDEO FUNCTION
 */
export const deleteVideo = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method-not-allowed" });
  }

  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "publicId is required" });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    logger.info("Cloudinary delete result", result);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (err) {
    logger.error("Cloudinary delete failed", err);
    return res.status(500).json({
      error: err.message,
    });
  }
});
