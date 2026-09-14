import { useEffect, useRef, useState } from 'react';

/**
 * StatCounter
 * Animates a number from 0 to `value` when it enters the viewport.
 *
 * Props:
 *   value      – target number
 *   prefix     – string before number (e.g. "₦")
 *   suffix     – string after number (e.g. "+", "k")
 *   label      – descriptive text below the number
 *   duration   – animation duration in ms (default 1200)
 *   color      – number color (default var(--gold))
 */
export default function StatCounter({
  value = 0,
  prefix = '',
  suffix = '',
  label = '',
  duration = 1200,
  color = 'var(--gold)',
  fontSize = '2.4rem',
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const rafRef = useRef(null);

  // IntersectionObserver – start animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, value, duration]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        className="cinzel"
        style={{
          fontSize,
          fontWeight: 900,
          color,
          lineHeight: 1.1,
          textShadow: `0 0 20px ${color}55`,
          animation: started ? 'countUp 0.4s ease both' : 'none',
        }}
      >
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      {label && (
        <div
          className="baskerville"
          style={{ fontSize: '0.82rem', color: 'var(--cream-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
