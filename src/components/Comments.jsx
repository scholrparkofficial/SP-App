import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { onSnapshot } from 'firebase/firestore';
import { getComments, addComment, deleteComment, getUserDetails } from '../firebase';

export default function Comments({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);

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

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      if (!user) { setProfile(null); return; }
      try {
        const p = await getUserDetails(user.uid);
        if (mounted) setProfile(p);
      } catch (e) {
        console.error('Failed to fetch user profile', e);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, [user]);

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

  const handleDelete = async (commentId) => {
    if (!videoId || !commentId) return;
    if (!user) { alert('Please sign in'); return; }
    const ok = window.confirm('Delete this comment?');
    if (!ok) return;
    try {
      await deleteComment(videoId, commentId);
    } catch (err) {
      console.error('Failed to delete comment', err);
      alert('Failed to delete comment');
    }
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        <img src={user?.photoURL || '/avatar.svg'} alt="me" className="w-10 h-10 rounded-full object-cover" />
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
            <img src={c.photoURL || '/avatar.svg'} alt={c.displayName} className="w-10 h-10 rounded-full object-cover" />
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex-1">
              <div className="flex justify-between items-start">
                <div className="text-sm font-semibold">{c.displayName}</div>
                {(user && (user.uid === c.userId || profile?.isAdmin)) && (
                  <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                )}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200">{c.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
