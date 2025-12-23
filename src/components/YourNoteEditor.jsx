// src/components/YourNoteEditor.jsx
import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Undo, CornerDownRight, Download, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

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
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [scale, setScale] = useState(1);
  const activePointerRef = useRef(null);
  const lastPointerTypeRef = useRef(null); // for palm rejection
  const [backgroundImage, setBackgroundImage] = useState(null);
  const toast = useToast();

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
            setBackgroundImage(img);
            redraw();
          };
        } else {
          setBackgroundImage(null);
        }
      } else {
        navigate("/your-notes");
      }
    }
  }, [noteId]);

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    // Use devicePixelRatio for crisper drawing on HiDPI screens
    const DPR = window.devicePixelRatio || 1;
    const w = 1000;
    const h = 600;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    redraw();
  }, []);

  // Redraw when strokes, scale or background change
  useEffect(() => {
    redraw();
  }, [strokes, scale, backgroundImage]);

  const redraw = () => {
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;

    const cssW = canvasRef.current.clientWidth;
    const cssH = canvasRef.current.clientHeight;
    ctx.clearRect(0, 0, cssW, cssH);

    // Draw background image if any
    if (backgroundImage) {
      try {
        ctx.drawImage(backgroundImage, 0, 0, cssW, cssH);
      } catch (e) {}
    }

    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Draw with smoothing and per-point width
      for (let i = 1; i < stroke.points.length; i++) {
        const p0 = stroke.points[i - 1];
        const p1 = stroke.points[i];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.lineWidth = (stroke.lineWidth || 3) * (p1.pressure ? (0.5 + p1.pressure) : 1) * (stroke.tool === 'highlighter' ? 3 : 1) * scale;
        ctx.strokeStyle = stroke.color || '#000';
        ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.3 : 1;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  };

  const startDrawing = (e) => {
    const ev = e.nativeEvent;
    // Palm rejection: if last pointer was a pen, ignore touch that occurs shortly afterwards
    if (ev.pointerType === 'touch' && lastPointerTypeRef.current === 'pen') {
      return;
    }

    lastPointerTypeRef.current = ev.pointerType;
    activePointerRef.current = ev.pointerId;
    e.target.setPointerCapture && e.target.setPointerCapture(ev.pointerId);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / scale;
    const y = (ev.clientY - rect.top) / scale;

    if (tool === "strokeEraser") {
      // check hit stroke
      const hitIndex = strokes.findIndex((s) =>
        s.points.some((p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10)
      );
      if (hitIndex !== -1) {
        pushUndo();
        const updated = strokes.filter((_, i) => i !== hitIndex);
        setStrokes(updated);
      }
      return;
    }

    pushUndo(); // snapshot before drawing

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
    ctxRef.current.moveTo(x, y);
    setCurrentStroke([{ x, y, pressure: ev.pressure || 0.5 }]);
    setIsDrawing(true);
  };

  const draw = (e) => {
    const ev = e.nativeEvent;
    if (!isDrawing || tool === "strokeEraser") return;
    if (activePointerRef.current != null && ev.pointerId !== activePointerRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / scale;
    const y = (ev.clientY - rect.top) / scale;
    const pressure = ev.pressure || 0.5;

    // Width mapping: base * (0.5 + pressure) * user scale
    const width = Math.max(1, lineWidth * Math.max(0.2, (0.5 + pressure)) * scale);
    ctxRef.current.lineWidth = width;

    // Smooth using quadratic curve
    const prev = currentStroke[currentStroke.length - 1];
    if (prev) {
      const midX = (prev.x + x) / 2;
      const midY = (prev.y + y) / 2;
      ctxRef.current.quadraticCurveTo(prev.x, prev.y, midX, midY);
      ctxRef.current.stroke();
    } else {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    }

    setCurrentStroke((prevArr) => [...prevArr, { x, y, pressure }]);
  };

  const stopDrawing = (e) => {
    const ev = e && e.nativeEvent;
    if (ev && ev.pointerId && activePointerRef.current === ev.pointerId) {
      try { e.target.releasePointerCapture(ev.pointerId); } catch (e) {}
    }

    if (isDrawing) {
      if (tool !== "eraser") {
        setStrokes((prev) => [
          ...prev,
          { tool, color, lineWidth, points: currentStroke },
        ]);
      }
      setIsDrawing(false);
      setCurrentStroke([]);
      setRedoStack([]); // clear redo on new action
    }
    activePointerRef.current = null;
  };

  const pushUndo = () => {
    setUndoStack((u) => [...u, JSON.stringify(strokes)]);
    // limit stack
    setUndoStack((u) => u.slice(-50));
  };

  const undo = () => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const last = u[u.length - 1];
      setRedoStack((r) => [...r, JSON.stringify(strokes)]);
      setStrokes(JSON.parse(last));
      return u.slice(0, -1);
    });
  };

  const redo = () => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const last = r[r.length - 1];
      setUndoStack((u) => [...u, JSON.stringify(strokes)]);
      setStrokes(JSON.parse(last));
      return r.slice(0, -1);
    });
  };

  // exportPNG is defined later (avoids duplicate declaration)

  const clearNote = () => {
    if (!confirm('Clear the canvas? This cannot be undone.')) return;
    pushUndo();
    setStrokes([]);
    const ctx = ctxRef.current;
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    toast.info('Canvas cleared');
  };

  const deleteNote = () => {
    if (!confirm('Delete this note? This action cannot be undone.')) return;
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const filtered = savedNotes.filter(n => n.id !== Number(noteId));
    localStorage.setItem('notes', JSON.stringify(filtered));
    toast.success('Note deleted');
    navigate('/your-notes');
  };

  const exportPNG = () => {
    const dataURL = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${title.replace(/\s+/g, '_') || 'note'}.png`;
    a.click();
    toast.success('Export started');
  };


  const saveNote = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");

    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");

    if (noteId === "new") {
      const newNote = { id: Date.now(), title, content: dataURL, strokes, updatedAt: Date.now() };
      savedNotes.push(newNote);
    } else {
      const updated = savedNotes.map((n) =>
        n.id === Number(noteId) ? { ...n, title, content: dataURL, strokes, updatedAt: Date.now() } : n
      );
      localStorage.setItem("notes", JSON.stringify(updated));
      toast.success("Note updated");
      return;
    }

    localStorage.setItem("notes", JSON.stringify(savedNotes));
    toast.success("Note saved");
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
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={undo}
              title="Undo"
            >
              <Undo size={16} /> Undo
            </button>

            <button
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={redo}
              title="Redo"
            >
              <CornerDownRight size={16} /> Redo
            </button>

            <button
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              onClick={() => clearNote()}
              title="Clear"
            >
              <Trash2 size={16} /> Clear
            </button>

            {noteId !== 'new' && (
              <button
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center gap-2"
                onClick={deleteNote}
                title="Delete note"
              >
                Delete Note
              </button>
            )}
            <button
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2"
              onClick={() => exportPNG()}
            >
              <Download size={16} /> Export PNG
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
        <div className="flex flex-wrap gap-3 mb-2 items-center bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-md">
          {['pen', 'highlighter', 'eraser', 'strokeEraser'].map((t) => (
            <button
              key={t}
              className={`px-3 py-2 rounded-lg ${
                tool === t ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onClick={() => setTool(t)}
            >
              {t === 'strokeEraser' ? 'Stroke Eraser' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          {tool !== 'eraser' && tool !== 'strokeEraser' && (
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
                  max="25"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="accent-blue-500 dark:accent-blue-400"
                />
              </label>

              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                Pressure:
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="accent-blue-500 dark:accent-blue-400"
                />
              </label>
            </>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Tip: Stylus/pen input supported — pressure and palm-rejection are handled. Use the <strong>Pressure</strong> slider to adjust sensitivity.</div>

        {/* Canvas */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-2xl shadow-md bg-white dark:bg-gray-800">
          <canvas
            ref={canvasRef}
            className="w-full h-[600px] touch-none"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
}
