import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideos, deleteVideo, updateVideoStatus } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Only admins should reach here; get all videos including pending
        const list = await getVideos({ includePrivate: true });
        if (!mounted) return;
        setVideos(list || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [user]);

  const handleApprove = async (video) => {
    try {
      const result = await updateVideoStatus(video.id, 'public');
      if (result.success) {
        toast.success('Video approved and made public.');
        setVideos(videos.filter(v => v.id !== video.id));
      } else {
        toast.error(result.error || 'Failed to approve video.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while approving the video.');
    }
  };

  const handleDelete = async (v) => {
    if (!v) return;
    if (!confirm('Delete this video? This will remove the file from Cloudinary and the database.')) return;
    setDeletingId(v.id);
    try {
      await deleteVideo({ id: v.id, videoPublicId: v.videoPublicId, thumbnailPublicId: v.thumbnailPublicId });
      setVideos(prev => prev.filter(x => x.id !== v.id));
      toast.success('Video deleted');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed: ' + (err?.message || String(err)));
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return <div className="p-6">Please sign in to access admin panel.</div>;

  // Basic admin guard — UI-level only.
  if (user.email !== (import.meta.env.VITE_ADMIN_EMAIL || 'scholrpark.official@gmail.com')) {
    return <div className="p-6">Not authorized.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-4 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Admin Control Panel</h2>
          <div>
            <button onClick={() => navigate('/my-videos')} className="px-3 py-2 bg-blue-600 text-white rounded">My Videos</button>
          </div>
        </div>

        {loading ? (
          <div>Loading videos…</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {videos.map(v => (
              <div key={v.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 flex items-center gap-3">
                <img src={v.thumbnailUrl || '/video-placeholder.png'} className="w-28 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{v.title}</div>
                      <div className="text-sm text-gray-500">{v.uploaderId || 'unknown'}</div>
                      <div className="text-xs text-gray-400">Status: {v.status || 'pending'}</div>
                    </div>
                    <div className="flex gap-2">
                      {v.status !== 'public' && (
                        <button onClick={() => handleApprove(v)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      )}
                      <button onClick={() => navigate(`/video/${v.id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">Open</button>
                      <button onClick={() => handleDelete(v)} disabled={deletingId === v.id} className="px-3 py-1 bg-red-600 text-white rounded">{deletingId === v.id ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
