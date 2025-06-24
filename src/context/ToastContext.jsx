// src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [nextId, setNextId] = useState(0);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = nextId;
      setNextId(prevId => prevId + 1);
      setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    },
    [nextId],
  );

  const removeToast = useCallback(idToRemove => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== idToRemove));
  }, []);

  const value = {
    success: message => showToast(message, 'success'),
    error: message => showToast(message, 'error'),
    info: message => showToast(message, 'info'),
    warning: message => showToast(message, 'warning'),
    show: showToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Posisi tengah atas: left-1/2 -translate-x-1/2 */}
      <div className='fixed top-4 left-1/2 -translate-x-1/2 space-y-2 z-50'>
        {toasts.map(toast => (
          <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
