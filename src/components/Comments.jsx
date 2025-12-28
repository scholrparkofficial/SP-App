import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { onSnapshot } from 'firebase/firestore';
import { getComments, addComment } from '../firebase';

export default function Comments({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    const q = getComments(videoId);
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(arr);
    }, (err) => {
      console.error('Comments snapshot error', err);
      setComments([]);
    });

    return () => unsub();
  }, [videoId]);

  const submit = async () => {
    if (!input.trim()) return;
    if (!user) { alert('Please sign in to comment'); return; }
    setSubmitting(true);
    try {
      await addComment(videoId, {
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || null,
        text: input.trim(),
      });
      setInput('');
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        <img src={user?.photoURL || '/avatar.png'} alt="me" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder={user ? 'Add a public comment...' : 'Sign in to comment'} disabled={!user} />
          <div className="flex justify-end mt-2">
            <button onClick={submit} disabled={!user || submitting || !input.trim()} className="btn-primary px-4 py-1 rounded">{submitting ? 'Posting...' : 'Comment'}</button>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {comments.length === 0 && <div className="text-gray-500">No comments yet</div>}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <img src={c.photoURL || '/avatar.png'} alt={c.displayName} className="w-10 h-10 rounded-full object-cover" />
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex-1">
              <div className="text-sm font-semibold">{c.displayName}</div>
              <div className="text-sm text-gray-700 dark:text-gray-200">{c.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
