import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVideosByUploader, deleteVideo, updateVideoStatus, getVideos } from '../firebase';
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

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        let list = [];
        if (user.email === 'scholrpark.official@gmail.com') {
          // admin: fetch all videos for moderation
          list = await getVideos({ includePrivate: true });
        } else {
          const res = await getVideosByUploader(user.uid);
          list = (res && res.data) ? res.data : (res || []);
          if (res && res.indexRequired) setIndexRequired(true);
          if (res && res.originalError) console.warn('Index fallback used:', res.originalError);
        }
        if (!mounted) return;
        setVideos(list);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [user]);

  const handleApprove = async (video) => {
    if (!video) return;
    try {
      const result = await updateVideoStatus(video.id, 'public'); // Update video status to public
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
      const msg = err?.message || String(err);
      if (/permission/i.test(msg)) {
        toast.error('Insufficient permissions to delete — please update Firestore rules for admin deletion.');
      } else {
        toast.error('Delete failed: ' + msg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return <div className="p-6">Please sign in to manage your videos.</div>;
  if (loading) return <div className="p-6">Loading your videos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Videos</h2>
          <div>
            <button onClick={() => navigate('/upload')} className="px-3 py-2 bg-green-600 text-white rounded">Upload New</button>
          </div>
        </div>

        {error && <div className="text-red-500 mb-3">{error}</div>}

        {indexRequired && (
          <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-100">
            Firestore composite index is required for ordering this query — your results are shown but may be slower. You can create the index in the Firebase Console: <a className="underline" href="https://console.firebase.google.com/v1/r/project/scholrpark/firestore/indexes?create_composite=Cklwcm9qZWN0cy9zY2hvbHJwYXJrL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy92aWRlb3MvaW5kZXhlcy9fEAEaDgoKdXBsb2FkZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI" target="_blank" rel="noreferrer">Create index</a> — or keep using the fallback (client-side sort).
          </div>
        )}

        {videos.length === 0 && (
          <div className="text-gray-600">You have not uploaded any videos yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map(v => (
            <div key={v.id} className="border rounded p-3 bg-gray-50 dark:bg-gray-700">
              <div className="flex gap-3">
                <img src={v.thumbnailUrl || '/video-placeholder.png'} alt={v.title} className="w-28 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{v.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{(v.description || '').slice(0, 100)}</p>

                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <div>Likes: <strong>{v.likes || 0}</strong></div>
                    <div>Views: <strong>{v.views || 0}</strong></div>
                    <div>Uploaded: <strong>{v.createdAt?.toDate ? v.createdAt.toDate().toLocaleString() : (v.createdAt || '')}</strong></div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => navigate(`/video/${v.id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">Open</button>
                    <button disabled={deletingId === v.id} onClick={() => handleDelete(v)} className="px-3 py-1 bg-red-500 text-white rounded">
                      {deletingId === v.id ? 'Deleting...' : 'Delete'}
                    </button>
                    <button onClick={() => handleApprove(v)} className="px-3 py-1 bg-green-600 text-white rounded">
                      Approve
                    </button>
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
