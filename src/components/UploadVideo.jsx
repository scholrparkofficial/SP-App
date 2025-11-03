import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadVideoFile } from '../firebase';

export default function UploadVideo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [cancelUploadFn, setCancelUploadFn] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  // Capture a thumbnail from the video file (first frame at 1s)
  const generateThumbnail = (file) => new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      video.muted = true;
      video.currentTime = 1;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      video.addEventListener('loadeddata', () => {
        // Seek to 0.5s if shorter
        const duration = video.duration || 1;
        video.currentTime = Math.min(1, Math.max(0.1, duration / 2));
      });

      video.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 180;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            cleanup();
            resolve(blob);
          }, 'image/jpeg', 0.75);
        } catch (err) {
          cleanup();
          resolve(null);
        }
      });

      video.addEventListener('error', (e) => {
        cleanup();
        resolve(null);
      });
    } catch (err) {
      resolve(null);
    }
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('You must be signed in to upload.');
      return;
    }
    if (!file) {
      setError('Please select a video file.');
      return;
    }
    // Client-side validation
    const MAX_BYTES = 50 * 1024 * 1024; // 50 MB default for free-tier safety
    if (file.size > MAX_BYTES) {
      setError('File is too large. Max 50 MB allowed on this plan.');
      return;
    }
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (mp4, webm, etc).');
      return;
    }
    setUploading(true);
    try {
      const thumb = await generateThumbnail(file);
      if (thumb) {
        const url = URL.createObjectURL(thumb);
        setThumbPreview(url);
      }
  // uploadVideoFile now returns { promise, cancel }
  const { promise, cancel } = uploadVideoFile({ file, title, description, uploaderId: user.uid, thumbnailBlob: thumb, onProgress: (p) => setProgress(p) });
  if (cancel) setCancelUploadFn(() => cancel);
  const res = await promise;
  // navigate to videos feed or the video page
  navigate(`/video/${res.id}`);
    } catch (err) {
      console.error(err);
      if (err && err.message === 'upload-cancelled') {
        setError('Upload cancelled.');
      } else {
        setError('Upload failed. Try again.');
      }
    } finally {
      setUploading(false);
      setProgress(0);
      if (cancelUploadFn) setCancelUploadFn(null);
    }
  };

  const handleCancel = () => {
    if (cancelUploadFn) {
      try { cancelUploadFn(); } catch (e) { console.warn(e); }
      setCancelUploadFn(null);
      setUploading(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (thumbPreview) {
        try { URL.revokeObjectURL(thumbPreview); } catch (e) {}
      }
      if (cancelUploadFn) {
        try { cancelUploadFn(); } catch (e) {}
      }
    };
  }, [thumbPreview, cancelUploadFn]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Video</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">Home</button>
          </div>
        </div>
        {!user && <p className="text-red-500 mb-4">You must be signed in to upload videos.</p>}
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <textarea
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={4}
          />
          <input type="file" accept="video/*" onChange={handleFileChange} className="w-full" />

          {thumbPreview && (
            <img src={thumbPreview} alt="thumbnail preview" className="w-full h-40 object-cover rounded mt-2" />
          )}

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button disabled={uploading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {uploading ? `Uploading ${progress}%` : 'Upload'}
            </button>
            <button type="button" onClick={() => navigate('/videos')} className="px-4 py-3 border rounded w-full sm:w-auto">
              Back to Videos
            </button>
            {uploading && (
              <button type="button" onClick={handleCancel} className="px-4 py-3 border rounded w-full sm:w-auto text-red-600">
                Cancel Upload
              </button>
            )}
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded mt-3 overflow-hidden">
              <div className="bg-blue-600 h-2" style={{ width: `${progress}%` }} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
