import { useState, useCallback, useRef, useEffect } from 'react';

/* ─── Toast types ─────────────────────────────────── */
// type: 'success' | 'error' | 'warning' | 'info'

const ICONS = {
  success: '✅',
  error:   '🚨',
  warning: '⚠️',
  info:    'ℹ️',
};

const COLORS = {
  success: { border: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
  error:   { border: '#ef4444', bg: 'rgba(239,68,68,0.10)'  },
  warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  info:    { border: 'var(--gold)', bg: 'rgba(201,150,58,0.10)' },
};

let _addToast = null;

/** Call anywhere: `toast.success('Done!')` etc. */
export const toast = {
  success: (msg, duration) => _addToast?.({ type: 'success', msg, duration }),
  error:   (msg, duration) => _addToast?.({ type: 'error',   msg, duration }),
  warning: (msg, duration) => _addToast?.({ type: 'warning', msg, duration }),
  info:    (msg, duration) => _addToast?.({ type: 'info',    msg, duration }),
};

/* ─── Single Toast Item ───────────────────────────── */
function ToastItem({ id, type = 'info', msg, onDismiss, duration = 4000 }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { border, bg } = COLORS[type] || COLORS.info;

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 350);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={dismiss}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
        background: bg,
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.1rem',
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        maxWidth: '360px',
        width: '100%',
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(24px)',
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>
        {ICONS[type]}
      </span>
      <p
        className="baskerville"
        style={{ margin: 0, fontSize: '0.87rem', color: 'var(--cream)', lineHeight: 1.5, flex: 1 }}
      >
        {msg}
      </p>
      <button
        aria-label="Dismiss notification"
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(245,237,216,0.5)',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

/* ─── Provider ────────────────────────────────────── */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback(({ type, msg, duration }) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-4), { id, type, msg, duration }]);
  }, []);

  // Wire the imperative API
  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <>
      {children}
      {/* Toast container */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </>
  );
}
