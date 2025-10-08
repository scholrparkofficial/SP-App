import React from "react";
import { useParams } from "react-router-dom";

export default function BatchPage() {
  const { id } = useParams();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Batch ID: {id}</h1>
        <p className="text-gray-600 dark:text-gray-300">Details for this batch will go here.</p>
      </div>
    </div>
  );
}
