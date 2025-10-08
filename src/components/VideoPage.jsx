import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2, UserPlus } from "lucide-react";

const videos = [
  { id: "KMoMIWtYXKw", title: "Video 1", description: "This is the description for video 1." },
  { id: "dQw4w9WgXcQ", title: "Video 2", description: "Description for video 2 goes here." },
  { id: "3JZ_D3ELwOQ", title: "Video 3", description: "An overview of video 3 content." },
  { id: "tAGnKpE4NCI", title: "Video 4", description: "Summary of video 4 topics." },
  { id: "M7lc1UVf-VE", title: "Video 5", description: "Brief description for video 5." },
  { id: "eX2qFMC8cFo", title: "Video 6", description: "Deep dive into advanced topics." },
  { id: "kJQP7kiw5Fk", title: "Video 7", description: "Learn tips and tricks for productivity." },
  { id: "fJ9rUzIMcZQ", title: "Video 8", description: "Special tutorial on practical applications." },
];

export default function VideoPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const video = videos.find(v => v.id === videoId);

  const [likes, setLikes] = useState(124);
  const [followers, setFollowers] = useState(500);

  if (!video) return <p>Video not found</p>;

  const handleShare = () => {
    const shareData = {
      title: video.title,
      text: video.description,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4">
          <iframe
            width="100%"
            height="500"
            className="rounded-2xl shadow-lg"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?si=w_Fqz3ClqkWqfkYR`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>

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
          {videos.filter(v => v.id !== video.id).map(v => (
            <div
              key={v.id}
              className="flex gap-3 cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-2 rounded-lg shadow-sm transition-all duration-200"
              onClick={() => navigate(`/video/${v.id}`)}
            >
              <img
                src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                alt={v.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div className="flex flex-col justify-center">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{v.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{v.description.slice(0, 60)}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
