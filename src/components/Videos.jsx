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
                uploaderMap[id] = user.displayName || user.email || id;
              }
            } catch {
              /* ignore */
            }
          })
        );

        const enriched = res.map(v => ({
          ...v,
          uploaderName: uploaderMap[v.uploaderId]
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
  // Fetch likes + followers
  // =========================
  useEffect(() => {
    if (!videos.length) return;

    let mounted = true;

    (async () => {
      try {
        const rawFollowers = await getFollowersForChannels();

        // ✅ Normalize followers → ALWAYS number
        const normalizedFollowers = {};
        Object.entries(rawFollowers || {}).forEach(([channelId, data]) => {
          if (typeof data === 'number') {
            normalizedFollowers[channelId] = data;
          } else if (data?.count !== undefined) {
            normalizedFollowers[channelId] = Number(data.count) || 0;
          } else if (Array.isArray(data?.users)) {
            normalizedFollowers[channelId] = data.users.length;
          } else {
            normalizedFollowers[channelId] = 0;
          }
        });

        const likesData = {};
        videos.forEach(v => {
          likesData[v.id] =
            Number(v.likesCount) ||
            (Array.isArray(v.likes) ? v.likes.length : 0) ||
            0;
        });

        if (mounted) {
          setLikesMap(likesData);
          setFollowersMap(normalizedFollowers);

          // Debug helpers
          window.__VIDEOS = videos;
          window.__FOLLOWERS = normalizedFollowers;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Videos
          </h1>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">
            Loading videos...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(v => (
              <div
                key={v.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                <img
                  src={v.thumbnailUrl || '/video-placeholder.png'}
                  alt={v.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {v.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                    {v.description}
                  </p>

                  <div className="mt-4 flex justify-between items-end">
                    <button
                      onClick={() => navigate(`/video/${v.id}`)}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Play
                    </button>

                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>
                        {new Date(
                          v.createdAt?.toDate
                            ? v.createdAt.toDate()
                            : v.createdAt
                        ).toLocaleString()}
                      </div>

                      {v.uploaderId && (
                        <div>
                          By {v.uploaderName || v.uploaderId}
                        </div>
                      )}

                      <div>Likes: {likesMap[v.id] || 0}</div>
                      <div>
                        Followers:{' '}
                        {followersMap[v.uploaderId] ?? 0}
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
