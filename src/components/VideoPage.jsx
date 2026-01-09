import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, UserPlus, ShieldCheck } from "lucide-react";
import {
  getVideoById,
  getVideos,
  deleteVideo,
  likeVideo,
  unlikeVideo,
  followChannel,
  updateVideoStatus
} from "../firebase";
import { getFollowersForChannels } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Comments from "./Comments";

export default function VideoPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [video, setVideo] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const isUploader = user && user.uid === video?.uploaderId;
  const isAdmin = user && user.email === "scholrpark.official@gmail.com";

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

        const likeCount =
          v?.likesCount ?? (Array.isArray(v?.likes) ? v.likes.length : 0);
        setLikes(likeCount);
        // prefer video-level followersCount if present, otherwise fetch from followers collection
        if (typeof v?.followersCount === "number" && v.followersCount >= 0) {
          setFollowers(v.followersCount);
        } else {
          try {
            const followersMap = await getFollowersForChannels();
            setFollowers(followersMap[v.uploaderId] || 0);
          } catch (e) {
            console.error("Failed to load followers mapping", e);
            setFollowers(0);
          }
        }

        if (user && Array.isArray(v?.likes)) {
          setLiked(v.likes.includes(user.uid));
        }
      } catch (err) {
        console.error(err);
        setLoadError(err?.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [videoId, user]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      setDeleting(true);
      await deleteVideo({
        id: video.id,
        videoPublicId: video.videoPublicId,
        thumbnailPublicId: video.thumbnailPublicId
      });
      success("Video deleted");
      navigate("/videos");
    } catch (err) {
      console.error(err);
      error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!user) return alert("Sign in to like");
    try {
      if (liked) {
        setLiked(false);
        setLikes(l => Math.max(0, l - 1));
        await unlikeVideo(video.id, user.uid);
      } else {
        setLiked(true);
        setLikes(l => l + 1);
        await likeVideo(video.id, user.uid);
      }
    } catch (err) {
      console.error(err);
      setLiked(v => !v);
      error("Failed to update like");
    }
  };

  const handleFollow = async () => {
    if (!user) return alert("Sign in to follow");
    try {
      const res = await followChannel(video.uploaderId, user.uid);
      if (res?.success) {
        setFollowers(f => f + 1);
        success("Following channel");
      } else {
        error(res?.error || "Follow failed");
      }
    } catch (err) {
      console.error(err);
      error("Follow failed");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (loadError) return <div className="p-6 text-red-500">{loadError}</div>;
  if (!video) return <div className="p-6">Video not found</div>;

  // Restrict access to non-public videos unless the user is the uploader or an admin
  if (video.status && video.status !== 'public' && !isUploader && !isAdmin) {
    return <div className="p-6">This video is pending approval and not available.</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Video Player */}
          <div className="bg-black rounded-xl overflow-hidden">
            <video
              className="w-full max-h-[70vh] object-contain"
              controls
              src={video.videoUrl}
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {video.title}
          </h1>

          {/* ACTION BAR */}
          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                liked ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <ThumbsUp size={18} /> {likes}
            </button>

            {user && !isUploader && (
              <button
                onClick={handleFollow}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                <UserPlus size={18} /> {followers}
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              <Share2 size={18} /> Share
            </button>

            {/* UPLOADER CONTROLS */}
            {isUploader && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            )}

            {/* ADMIN CONTROLS */}
            {isAdmin && (
              <div className="ml-auto flex items-center gap-2 border-l pl-4">
                {video.status !== "public" && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await updateVideoStatus(video.id, "public");
                        if (res?.success) {
                          setVideo(v => ({ ...v, status: "public" }));
                          success("Video approved");
                        } else {
                          error("Approval failed");
                        }
                      } catch {
                        error("Approval failed");
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg"
                  >
                    <ShieldCheck size={16} /> Approve
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-2 bg-red-700 text-white rounded-lg"
                >
                  Force Delete
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {video.description}
          </p>

          {/* Comments */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3">Comments</h2>
            <Comments videoId={video.id} />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Suggested Videos
          </h2>

          {suggested.map(v => (
            <div
              key={v.id}
              onClick={() => navigate(`/video/${v.id}`)}
              className="flex gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
            >
              <img
                src={v.thumbnailUrl || "/video-placeholder.png"}
                alt={v.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {v.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(v.description || "").slice(0, 60)}…
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
