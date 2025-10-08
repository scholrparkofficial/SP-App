// src/components/YourNotesLibrary.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function YourNotesLibrary() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(savedNotes);
  }, []);

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Untitled Note ${notes.length + 1}`,
      content: "",
      strokes: [],
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Notes</h1>

      <button
        onClick={createNote}
        className="mb-6 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
      >
        + Create New Note
      </button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <Link
              key={note.id}
              to={`/your-notes/editor/${note.id}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md dark:hover:shadow-gray-700"
            >
              <h2 className="font-semibold truncate text-gray-900 dark:text-gray-100">{note.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {note.strokes ? note.strokes.length : 0} strokes
              </p>
              {note.content && (
                <img
                  src={note.content}
                  alt="preview"
                  className="mt-2 rounded-md border border-gray-300 dark:border-gray-600 max-h-32 object-cover"
                />
              )}
            </Link>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No notes yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
