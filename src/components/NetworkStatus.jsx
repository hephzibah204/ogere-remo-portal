import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast && isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 200000,
        background: isOnline ? 'rgba(22,163,74,0.95)' : 'rgba(220,38,38,0.95)',
        color: '#fff',
        padding: '0.65rem 1.2rem',
        borderRadius: '30px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.78rem',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.05em',
        animation: 'fadeUp 0.3s ease both',
        backdropFilter: 'blur(6px)',
        border: `1px solid ${isOnline ? '#4ade80' : '#f87171'}`,
      }}
    >
      <span>{isOnline ? '🟢' : '📡'}</span>
      <span>
        {isOnline
          ? 'Network Restored — Connected to Ogere Portal'
          : 'Offline Mode — Saved community data remains accessible'}
      </span>
      {!isOnline && (
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.65rem',
            cursor: 'pointer',
            marginLeft: '0.4rem',
          }}
        >
          Retry ↻
        </button>
      )}
    </div>
  );
}
