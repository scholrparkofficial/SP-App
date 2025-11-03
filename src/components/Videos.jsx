import React, { useEffect, useState } from 'react';
import { getVideos, getUserDetails } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getVideos();
        // Fetch uploader names for videos (if available)
        const uploaderIds = Array.from(new Set(res.map(r => r.uploaderId).filter(Boolean)));
        const uploaderMap = {};
        await Promise.all(uploaderIds.map(async (id) => {
          try {
            const user = await getUserDetails(id);
            if (user) uploaderMap[id] = user.displayName || user.email || id;
          } catch (e) {
            // ignore
          }
        }));

        const withNames = res.map(r => ({ ...r, uploaderName: uploaderMap[r.uploaderId] }));
        if (mounted) setVideos(withNames);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Videos</h1>
          <div>
            <button onClick={() => navigate('/upload')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upload</button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading videos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(v => (
              <div key={v.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="relative">
                  <img src={v.thumbnailUrl || '/video-placeholder.png'} alt={v.title} className="w-full h-48 object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{v.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{v.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <button onClick={() => navigate(`/video/${v.id}`)} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Play</button>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      <div>{new Date(v.createdAt?.toDate ? v.createdAt.toDate() : v.createdAt).toLocaleString()}</div>
                      {v.uploaderId && (
                        <div className="text-xs text-gray-500">By {v.uploaderName || v.uploaderId}</div>
                      )}
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
