import React, { useEffect, useState } from 'react';
import {
  getVideos,
  getUserDetails,
  getFollowersForChannels
} from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likesMap, setLikesMap] = useState({});
  const [followersMap, setFollowersMap] = useState({});
  const navigate = useNavigate();

  // =========================
  // Fetch videos + uploader names
  // =========================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getVideos();

        const uploaderIds = Array.from(
          new Set(res.map(v => v.uploaderId).filter(Boolean))
        );

        const uploaderMap = {};
        await Promise.all(
          uploaderIds.map(async (id) => {
            try {
              const user = await getUserDetails(id);
              if (user) {
                uploaderMap[id] = user.displayName || user.email || 'Unknown';
              }
            } catch {
              /* ignore */
            }
          })
        );

        const enriched = res.map(v => ({
          ...v,
          uploaderName: uploaderMap[v.uploaderId] || 'Unknown'
        }));

        if (mounted) setVideos(enriched);
      } catch (err) {
        console.error('Error loading videos:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // =========================
  // Fetch likes + followers (FIXED)
  // =========================
  useEffect(() => {
    if (!videos.length) return;

    let mounted = true;

    (async () => {
      try {
        const rawFollowers = await getFollowersForChannels();

        // Normalize followers → always number
        const normalizedFollowers = {};
        Object.entries(rawFollowers || {}).forEach(([channelId, data]) => {
          if (typeof data === 'number') {
            normalizedFollowers[channelId] = data;
          } else if (Array.isArray(data)) {
            normalizedFollowers[channelId] = data.length;
          } else if (data && typeof data === 'object') {
            normalizedFollowers[channelId] = Object.keys(data).length;
          } else {
            normalizedFollowers[channelId] = 0;
          }
        });

        // ✅ Normalize likes → always number
        const likesData = {};
        videos.forEach(v => {
          if (typeof v.likesCount === 'number') {
            likesData[v.id] = v.likesCount;
          } else if (Array.isArray(v.likes)) {
            likesData[v.id] = v.likes.length;
          } else if (v.likes && typeof v.likes === 'object') {
            likesData[v.id] = Object.keys(v.likes).length;
          } else {
            likesData[v.id] = 0;
          }
        });

        if (mounted) {
          setLikesMap(likesData);
          setFollowersMap(normalizedFollowers);
        }
      } catch (err) {
        console.error('Error loading likes/followers:', err);
      }
    })();

    return () => { mounted = false; };
  }, [videos]);

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Videos
          </h1>
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">
            Loading videos...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(v => (
              <div
                key={v.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <img
                  src={v.thumbnailUrl || '/video-placeholder.png'}
                  alt={v.title}
                  className="w-full h-44 sm:h-48 object-cover"
                />

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2">
                    {v.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-3">
                    {v.description}
                  </p>

                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/video/${v.id}`)}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Play
                    </button>

                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>
                        {new Date(
                          v.createdAt?.toDate
                            ? v.createdAt.toDate()
                            : v.createdAt
                        ).toLocaleDateString()}
                      </div>

                      <div>By {v.uploaderName}</div>
                      <div>👍 Likes: {likesMap[v.id] || 0}</div>
                      <div>
                        👥 Followers: {followersMap[v.uploaderId] ?? 0}
                      </div>
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
