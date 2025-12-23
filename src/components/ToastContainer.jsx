import React, { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  useEffect(() => {
    // setup timers for auto-dismiss
    const timers = [];
    toasts.forEach(t => {
      if (t.timeout && t.id) {
        const timer = setTimeout(() => remove(t.id), t.timeout);
        timers.push(timer);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm w-full rounded-lg px-4 py-3 shadow-md border ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-900'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-sm break-words">{t.message}</div>
            <button onClick={() => remove(t.id)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
