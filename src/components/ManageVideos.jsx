import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getVideosByUploader,
  deleteVideo,
  updateVideoStatus,
  getVideos
} from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function ManageVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indexRequired, setIndexRequired] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || 'scholrpark.official@gmail.com';

  // =========================
  // Fetch videos
  // =========================
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        let list = [];

        if (user.email === ADMIN_EMAIL) {
          list = await getVideos({ includePrivate: true });
        } else {
          const res = await getVideosByUploader(user.uid);
          list = res?.data || res || [];
          if (res?.indexRequired) setIndexRequired(true);
        }

        if (mounted) setVideos(list);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err?.message || 'Failed to load videos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [user]);

  // =========================
  // Helpers
  // =========================
  const getLikesCount = (v) => {
    if (typeof v.likesCount === 'number') return v.likesCount;
    if (Array.isArray(v.likes)) return v.likes.length;
    if (v.likes && typeof v.likes === 'object')
      return Object.keys(v.likes).length;
    return 0;
  };

  // =========================
  // Actions
  // =========================
  const handleApprove = async (video) => {
    if (!user || user.email !== ADMIN_EMAIL) {
      toast.error('Only admins can approve videos.');
      return;
    }

    try {
      const result = await updateVideoStatus(video.id, 'public');
      if (result.success) {
        toast.success('Video approved successfully.');
        setVideos(prev => prev.filter(v => v.id !== video.id));
      } else {
        toast.error(result.error || 'Approval failed.');
      }
    } catch {
      toast.error('Something went wrong while approving.');
    }
  };

  const handleDelete = async (video) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setDeletingId(video.id);
    try {
      await deleteVideo({
        id: video.id,
        videoPublicId: video.videoPublicId,
        thumbnailPublicId: video.thumbnailPublicId
      });
      setVideos(prev => prev.filter(v => v.id !== video.id));
      toast.success('Video deleted successfully.');
    } catch (err) {
      toast.error(err?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // UI
  // =========================
  if (!user)
    return <div className="p-6">Please sign in to manage your videos.</div>;

  if (loading)
    return <div className="p-6">Loading your videos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            My Videos
          </h2>
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Upload New
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        {indexRequired && (
          <div className="mb-4 p-3 rounded bg-yellow-50 dark:bg-yellow-900 text-sm text-yellow-800 dark:text-yellow-100">
            Some results may load slower. This does not affect your videos.
          </div>
        )}

        {videos.length === 0 && (
          <p className="text-gray-600 dark:text-gray-300">
            You haven’t uploaded any videos yet.
          </p>
        )}

        {/* Video List */}
        <div className="space-y-4">
          {videos.map(v => (
            <div
              key={v.id}
              className="border rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                
                {/* Thumbnail */}
                <img
                  src={v.thumbnailUrl || '/video-placeholder.png'}
                  alt={v.title}
                  className="w-full sm:w-36 h-40 sm:h-20 object-cover rounded"
                />

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {v.title || 'Untitled Video'}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {v.description || 'No description'}
                  </p>

                  {v.status !== 'public' && (
                    <div className="mt-2 p-2 rounded bg-yellow-100 dark:bg-yellow-900 text-xs text-yellow-800 dark:text-yellow-100">
                      This video is waiting for approval.
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
                    <div>👍 Likes: <strong>{getLikesCount(v)}</strong></div>
                    <div>👁 Views: <strong>{v.views || 0}</strong></div>
                    <div>
                      📅 {v.createdAt?.toDate
                        ? v.createdAt.toDate().toLocaleDateString()
                        : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/video/${v.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Open
                    </button>

                    <button
                      disabled={deletingId === v.id}
                      onClick={() => handleDelete(v)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      {deletingId === v.id ? 'Deleting…' : 'Delete'}
                    </button>

                    {user.email === ADMIN_EMAIL && (
                      <button
                        onClick={() => handleApprove(v)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
