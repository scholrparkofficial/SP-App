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
      updatedAt: Date.now(),
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const deleteNote = (id) => {
    if (!confirm('Delete this note?')) return;
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
  };

  const importBackground = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      const newNote = { id: Date.now(), title: `Imported ${file.name}`, content: data, strokes: [], updatedAt: Date.now() };
      const updated = [...notes, newNote];
      setNotes(updated);
      localStorage.setItem('notes', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Notes</h1>

      <div className="flex gap-3 mb-4">
        <button
          onClick={createNote}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          + Create New Note
        </button>

        <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer">
          Import Image
          <input type="file" accept="image/*" onChange={(e) => importBackground(e.target.files?.[0])} className="hidden" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="relative block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md dark:hover:shadow-gray-700">
              <Link to={`/your-notes/editor/${note.id}`}>
                <h2 className="font-semibold truncate text-gray-900 dark:text-gray-100">{note.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {note.strokes ? note.strokes.length : 0} strokes
                </p>
                {note.updatedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Updated: {new Date(note.updatedAt).toLocaleString()}</p>
                )}
                {note.content && (
                  <img
                    src={note.content}
                    alt="preview"
                    className="mt-2 rounded-md border border-gray-300 dark:border-gray-600 max-h-32 object-cover"
                  />
                )}
              </Link>
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => deleteNote(note.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No notes yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
