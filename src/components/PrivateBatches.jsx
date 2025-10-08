import React from "react";
import { useNavigate } from "react-router-dom";

// Example batches with teacher-uploaded images
const batches = [
  {
    id: 1,
    title: "Math Mastery",
    teacher: "Mr. Sharma",
    description: "Advanced math concepts for competitive exams.",
    image: "/batches/math.jpg",
  },
  {
    id: 2,
    title: "Physics Essentials",
    teacher: "Dr. Iyer",
    description: "Covers mechanics, optics, and modern physics.",
    image: "/batches/physics.jpg",
  },
  {
    id: 3,
    title: "Chemistry Lab",
    teacher: "Ms. Gupta",
    description: "Practical and theoretical chemistry sessions.",
    image: "/batches/chemistry.jpg",
  },
  {
    id: 4,
    title: "Coding Club",
    teacher: "Ritabrata Das",
    description: "Learn app building and Python programming.",
    image: "/batches/coding.jpg",
  },
  {
    id: 5,
    title: "Financial Literacy",
    teacher: "Mr. Verma",
    description: "Learn budgeting, investing, and financial planning.",
    image: "/batches/finance.jpg",
  },
];

export default function PrivateBatches() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Your Private Batches</h1>

        {/* Batch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg dark:hover:shadow-gray-700 transition-shadow p-4 flex flex-col justify-between"
            >
              {/* Batch image */}
              <img
                src={batch.image}
                alt={batch.title}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />

              {/* Batch details */}
              <div>
                <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">{batch.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-1">
                  <span className="font-medium">Teacher:</span> {batch.teacher}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{batch.description}</p>
              </div>

              {/* View Batch Button */}
              <button
                className="mt-4 bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                onClick={() => navigate(`/batch/${batch.id}`)}
              >
                View Batch
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
