import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, UserPlus } from "lucide-react";
import { getVideoById, getVideos, deleteVideo } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function VideoPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const v = await getVideoById(videoId);
        const list = await getVideos();
        if (!mounted) return;
        setVideo(v);
        setSuggested(list.filter(i => i.id !== videoId));
        setLikes((v?.likes) || 0);
        setFollowers((v?.followers) || 0);
      } catch (err) {
        console.error(err);
        if (mounted) setLoadError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [videoId]);

  const handleDelete = async () => {
    if (!video) return;
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteVideo({ id: video.id, videoPublicId: video.videoPublicId, thumbnailPublicId: video.thumbnailPublicId });
      // Navigate away after delete
      navigate('/videos');
    } catch (err) {
      console.error(err);
      setDeleteError(err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: video?.title,
      text: video?.description,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (loadError) return <div className="p-6 text-red-500">Error loading video: {loadError}</div>;
  if (!video) return <div className="p-6">Video not found</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4">
          {video.videoUrl ? (
            <div className="rounded-2xl shadow-lg overflow-hidden bg-black">
              <video className="w-full" controls src={video.videoUrl} />
            </div>
          ) : (
            <div className="rounded-2xl shadow-lg p-8 bg-gray-200 text-center">No playable video URL</div>
          )}

          {/* Video Info */}
          <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{video.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">{video.description}</p>

            {/* Action Buttons with Counters */}
            <div className="flex gap-4 mt-4 items-center">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                onClick={() => setLikes(likes + 1)}
              >
                <ThumbsUp size={18} /> Like ({likes})
              </button>

              {/* Delete button - only show if uploader */}
              {user && user.uid === video.uploaderId && (
                <button
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg ml-auto"
                  onClick={handleDelete}
                >
                  {deleting ? 'Deleting...' : 'Delete Video'}
                </button>
              )}

              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                onClick={handleShare}
              >
                <Share2 size={18} /> Share
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                onClick={() => setFollowers(followers + 1)}
              >
                <UserPlus size={18} /> Follow Channel ({followers})
              </button>
            </div>
          </div>

          {/* Comments placeholder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mt-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Comments</h2>
            <p className="text-gray-500 dark:text-gray-400">User comments will appear here...</p>
          </div>
        </div>

        {/* Suggested Videos Sidebar */}
        <div
          className="w-full lg:w-96 flex flex-col gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Suggested Videos</h2>
          {suggested.map(v => (
            <div
              key={v.id}
              className="flex gap-3 cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-2 rounded-lg shadow-sm transition-all duration-200"
              onClick={() => navigate(`/video/${v.id}`)}
            >
              <img
                src={v.thumbnailUrl || '/video-placeholder.png'}
                alt={v.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div className="flex flex-col justify-center">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{v.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{(v.description || '').slice(0, 60)}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
