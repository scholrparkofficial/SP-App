import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVideos } from "../firebase";

export default function Home() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getVideos();
        if (!mounted) return;
        setVideos(list || []);
      } catch (err) {
        console.error('Failed to load videos', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  return (
    <div className="bg-green-50 dark:bg-gray-900 min-h-screen">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Latest Videos</h1>
          <div>
            <button onClick={() => navigate('/videos')} className="px-3 py-1 bg-blue-600 text-white rounded">Browse all</button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading videos...</p>
        ) : (
          <>
            {videos.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">No videos uploaded yet</p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Be the first to upload a video.</p>
                <div className="mt-4">
                  <button onClick={() => navigate('/upload')} className="px-4 py-2 bg-green-600 text-white rounded">Upload a video</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(v => (
                  <div key={v.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow cursor-pointer" onClick={() => navigate(`/video/${v.id}`)}>
                    <img src={v.thumbnailUrl || '/video-placeholder.png'} alt={v.title} className="w-full h-44 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{v.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{(v.description || '').slice(0, 100)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
