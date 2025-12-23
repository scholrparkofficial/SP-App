// server/index.js
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
app.use(cors());
app.use(express.json());

// Configure cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/api/cloudinary/delete', async (req, res) => {
  try {
    const { publicId, resourceType = 'video' } = req.body;
    if (!publicId) return res.status(400).json({ error: 'publicId is required' });

    // Destroy the resource (for videos resource_type must be 'video')
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    // result is an object with result: 'ok' or 'not found'/"error"
    if (result.result === 'ok' || result.result === 'not found') {
      return res.json({ result: 'ok', raw: result });
    }

    return res.status(500).json({ error: 'delete-failed', raw: result });
  } catch (err) {
    console.error('Cloudinary delete error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
