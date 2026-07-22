import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'var(--mint)',
    error: 'var(--danger)',
    info: 'var(--lilac)'
  };

  return (
    <div 
      className="panel flex items-center justify-between" 
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        minWidth: '250px',
        zIndex: 100,
        borderLeft: `4px solid ${colors[type]}`,
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <span>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
