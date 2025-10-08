import React from "react";
import { useNavigate } from "react-router-dom";

const videos = [
  { id: "KMoMIWtYXKw", title: "Video 1", description: "This is the description for video 1. It explains the content briefly." },
  { id: "dQw4w9WgXcQ", title: "Video 2", description: "Description for video 2 goes here. It highlights key points." },
  { id: "3JZ_D3ELwOQ", title: "Video 3", description: "An overview of video 3 content and what you can learn." },
  { id: "tAGnKpE4NCI", title: "Video 4", description: "Summary of video 4 describing the main topics covered." },
  { id: "M7lc1UVf-VE", title: "Video 5", description: "Brief description for video 5 to give context to viewers." },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-green-50 dark:bg-gray-900 min-h-screen">
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {videos.map(({ id, title, description }) => (
          <div
            key={id}
            className="flex flex-col md:flex-row bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-gray-600 transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/video/${id}`)}
          >
            <iframe
              width="100%"
              height="285"
              className="md:w-96 md:h-56 w-full pointer-events-none"
              src={`https://www.youtube-nocookie.com/embed/${id}?si=w_Fqz3ClqkWqfkYR&theme=dark`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>

            <div className="p-6 flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
