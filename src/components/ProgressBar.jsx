import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedProgressBar
 * Props:
 *   value        – current value (number)
 *   max          – maximum value (number, default 100)
 *   label        – optional text label above the bar
 *   showPercent  – show % text (default true)
 *   color        – bar fill color (default var(--gold))
 *   height       – bar height px (default 10)
 *   animated     – animate on mount (default true)
 *   showAmount   – show "₦X of ₦Y" text (optional formatter fn)
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  color = 'var(--gold)',
  height = 10,
  animated = true,
  showAmount,
  style = {},
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const [displayed, setDisplayed] = useState(animated ? 0 : pct);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!animated) { setDisplayed(pct); return; }
    // Animate from 0 → pct over ~900ms
    const start = performance.now();
    const duration = 900;
    const from = 0;
    const to = pct;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  return (
    <div style={{ width: '100%', ...style }}>
      {/* Label row */}
      {(label || showPercent) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.5rem',
        }}>
          {label && (
            <span className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--cream-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span className="cinzel" style={{ fontSize: '0.78rem', fontWeight: 700, color: color }}>
              {Math.round(displayed)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'rgba(201,150,58,0.12)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid rgba(201,150,58,0.15)',
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: '100%',
            width: `${displayed}%`,
            background: `linear-gradient(90deg, ${color}bb, ${color})`,
            borderRadius: 'var(--radius-full)',
            transition: animated ? 'none' : 'width 0.4s ease',
            boxShadow: `0 0 8px ${color}66`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer overlay on fill */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
            animation: 'shimmer 2s infinite linear',
            backgroundSize: '200% 100%',
          }} />
        </div>
      </div>

      {/* Amount text */}
      {showAmount && (
        <div className="baskerville" style={{ fontSize: '0.82rem', color: 'var(--cream-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
          {showAmount}
        </div>
      )}
    </div>
  );
}
