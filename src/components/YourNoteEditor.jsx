// src/components/YourNoteEditor.jsx
import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function YourNoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [title, setTitle] = useState("Untitled Note");
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen | highlighter | eraser | strokeEraser
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  // Load note
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    if (noteId !== "new") {
      const note = savedNotes.find((n) => n.id === Number(noteId));
      if (note) {
        setTitle(note.title);
        setStrokes(note.strokes || []);
        if (note.content) {
          const img = new Image();
          img.src = note.content;
          img.onload = () => {
            ctxRef.current.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
          };
        }
      } else {
        navigate("/your-notes");
      }
    }
  }, [noteId]);

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    redraw();
  }, [strokes]);

  const redraw = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    strokes.forEach((stroke) => {
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((p) => ctx.lineTo(p.x, p.y));

      if (stroke.tool === "highlighter") {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth * 3;
        ctx.globalAlpha = 0.3;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.globalAlpha = 1;
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "strokeEraser") {
      // check hit stroke
      const hitIndex = strokes.findIndex((s) =>
        s.points.some((p) => Math.abs(p.x - offsetX) < 10 && Math.abs(p.y - offsetY) < 10)
      );
      if (hitIndex !== -1) {
        const updated = strokes.filter((_, i) => i !== hitIndex);
        setStrokes(updated);
      }
      return;
    }

    if (tool === "eraser") {
      ctxRef.current.globalCompositeOperation = "destination-out";
      ctxRef.current.lineWidth = lineWidth * 2;
    } else {
      ctxRef.current.globalCompositeOperation = "source-over";
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
      ctxRef.current.globalAlpha = tool === "highlighter" ? 0.3 : 1;
    }

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setCurrentStroke([{ x: offsetX, y: offsetY }]);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || tool === "strokeEraser") return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    setCurrentStroke((prev) => [...prev, { x: offsetX, y: offsetY }]);
  };

  const stopDrawing = () => {
    if (isDrawing && tool !== "eraser") {
      setStrokes((prev) => [
        ...prev,
        { tool, color, lineWidth, points: currentStroke },
      ]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const saveNote = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");

    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");

    if (noteId === "new") {
      const newNote = { id: Date.now(), title, content: dataURL, strokes };
      savedNotes.push(newNote);
    } else {
      const updated = savedNotes.map((n) =>
        n.id === Number(noteId) ? { ...n, title, content: dataURL, strokes } : n
      );
      localStorage.setItem("notes", JSON.stringify(updated));
      alert("Note updated!");
      return;
    }

    localStorage.setItem("notes", JSON.stringify(savedNotes));
    alert("Note saved!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-b border-gray-300 dark:border-gray-600 focus:outline-none text-gray-900 dark:text-gray-100 bg-transparent"
          />
          <div className="flex gap-2">
            <button
              className="bg-gray-700 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-500"
              onClick={() => navigate("/your-notes")}
            >
              Back
            </button>
            <button
              className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 dark:hover:bg-green-600"
              onClick={saveNote}
            >
              Save
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-4 items-center bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-md">
          {["pen", "highlighter", "eraser", "strokeEraser"].map((t) => (
            <button
              key={t}
              className={`px-3 py-2 rounded-lg ${
                tool === t ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => setTool(t)}
            >
              {t === "strokeEraser" ? "Stroke Eraser" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          {tool !== "eraser" && tool !== "strokeEraser" && (
            <>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                Color:
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>

              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                Size:
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="accent-blue-500 dark:accent-blue-400"
                />
              </label>
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-2xl shadow-md bg-white dark:bg-gray-800">
          <canvas
            ref={canvasRef}
            className="w-full h-[600px] touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
}
