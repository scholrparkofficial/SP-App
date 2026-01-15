import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadVideoFile } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import Tooltip from './Tooltip';

export default function UploadVideo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [customThumb, setCustomThumb] = useState(null);
  const [customThumbPreview, setCustomThumbPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState(null);
  const [cancelUploadFn, setCancelUploadFn] = useState(null);

  /* ------------------ handlers ------------------ */

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleThumbnailChange = (e) => {
    const img = e.target.files[0];
    if (!img) return;

    setCustomThumb(img);

    if (customThumbPreview) {
      try { URL.revokeObjectURL(customThumbPreview); } catch (e) {}
    }

    const previewUrl = URL.createObjectURL(img);
    setCustomThumbPreview(previewUrl);

    if (thumbPreview) {
      try { URL.revokeObjectURL(thumbPreview); } catch (e) {}
      setThumbPreview(null);
    }
  };

  // Generate thumbnail from video (best-effort)
  const generateThumbnail = (file) =>
    new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        video.muted = true;

        video.addEventListener('loadeddata', () => {
          video.currentTime = Math.min(1, video.duration / 2 || 0.5);
        });

        video.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 180;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              resolve(blob);
            },
            'image/jpeg',
            0.75
          );
        });

        video.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          resolve(null);
        });
      } catch {
        resolve(null);
      }
    });

  /* ------------------ upload ------------------ */

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!user || !file || !title || !description) {
      setError('Please fill all fields and select a video.');
      return;
    }

    setUploading(true);
    setError('');
    setServerError(null);

    try {
      let thumbnailBlob = null;

      if (customThumb) {
        thumbnailBlob = customThumb;
      } else {
        thumbnailBlob = await generateThumbnail(file);
        if (thumbnailBlob) {
          const preview = URL.createObjectURL(thumbnailBlob);
          setThumbPreview(preview);
        }
      }

      const tempAccountEmail = 'scholrpark.official@gmail.com';

      const { promise, cancel } = uploadVideoFile({
        file,
        title,
        description,
        uploaderId: user.uid,
        thumbnailBlob,
        status: 'pending',
        reviewer: tempAccountEmail,
        onProgress: (p) => setProgress(p),
      });

      if (cancel) setCancelUploadFn(() => cancel);

      await promise;

      toast.success('Upload complete — pending admin approval.');
      navigate('/my-videos');
    } catch (err) {
      console.error(err);
      setServerError(err);
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress(0);
      setCancelUploadFn(null);
    }
  };

  const handleCancel = () => {
    try {
      cancelUploadFn?.();
    } catch {}
    setUploading(false);
    setProgress(0);
  };

  /* ------------------ cleanup ------------------ */

  useEffect(() => {
    return () => {
      try { thumbPreview && URL.revokeObjectURL(thumbPreview); } catch {}
      try { customThumbPreview && URL.revokeObjectURL(customThumbPreview); } catch {}
      try { cancelUploadFn?.(); } catch {}
    };
  }, [thumbPreview, customThumbPreview, cancelUploadFn]);

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Upload Video
        </h2>

        {!user && <p className="text-red-500 mb-4">You must be signed in.</p>}

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="text"
            placeholder="Video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />

          <textarea
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input type="file" accept="video/*" onChange={handleFileChange} />

          <div>
            <label className="block text-sm font-medium mb-1">
              Thumbnail (optional)
            </label>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          </div>

          {customThumbPreview && (
            <img src={customThumbPreview} className="h-40 w-full object-cover rounded" />
          )}

          {!customThumbPreview && thumbPreview && (
            <img src={thumbPreview} className="h-40 w-full object-cover rounded" />
          )}

          {error && <p className="text-red-500">{error}</p>}

          {serverError?.message && (
            <details className="text-xs">
              <summary>Server details</summary>
              <pre>{serverError.message}</pre>
            </details>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? `Uploading (${progress}%)` : 'Upload Video'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/videos')}
              className="border px-4 py-2 rounded"
            >
              Back
            </button>

            {uploading && (
              <button
                type="button"
                onClick={handleCancel}
                className="border px-4 py-2 rounded text-red-600"
              >
                Cancel
              </button>
            )}
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
