import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const t = { id, ...toast };
    setToasts((s) => [...s, t]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter(t => t.id !== id));
  }, []);

  const api = {
    toasts,
    show: (message, options = {}) => addToast({ message, type: options.type || 'default', timeout: options.timeout || 5000 }),
    success: (message, opts) => addToast({ message, type: 'success', timeout: opts?.timeout || 4000 }),
    error: (message, opts) => addToast({ message, type: 'error', timeout: opts?.timeout || 6000 }),
    info: (message, opts) => addToast({ message, type: 'info', timeout: opts?.timeout || 4000 }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
