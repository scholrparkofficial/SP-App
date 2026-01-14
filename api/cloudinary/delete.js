export const config = {
  runtime: "nodejs",
};

const cloudinary = require("cloudinary").v2;



// Configure Cloudinary from environment variables (set these in Vercel or server/.env locally)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method-not-allowed' });
  }

  try {
    const { publicId, resourceType = 'video' } = req.body || {};
    if (!publicId) return res.status(400).json({ error: 'publicId is required' });

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    if (result.result === 'ok' || result.result === 'not found') {
      return res.json({ result: 'ok', raw: result });
    }

    return res.status(500).json({ error: 'delete-failed', raw: result });
  } catch (err) {
    console.error('Cloudinary delete error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
