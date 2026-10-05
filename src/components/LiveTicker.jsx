/**
 * LiveTicker ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â horizontally scrolling ticker strip for alerts/news/updates.
 * Props:
 *   items   ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ array of strings to display
 *   speed   ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ scroll speed (default 35s for full loop)
 *   color   ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ text color (default var(--gold))
 *   bg      ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ background color
 *   label   ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ prefix label e.g. "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ LIVE"
 */
export default function LiveTicker({
  items = [],
  speed = 35,
  color = 'var(--cream)',
  bg = 'rgba(122,46,14,0.85)',
  label = 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ LIVE',
}) {
  if (!items.length) return null;

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      aria-label="Live updates ticker"
      style={{
        background: bg,
        borderTop: '1px solid rgba(201,150,58,0.25)',
        borderBottom: '1px solid rgba(201,150,58,0.25)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        height: '36px',
      }}
    >
      {/* Fixed label */}
      <div
        className="cinzel"
        style={{
          flexShrink: 0,
          padding: '0 1rem',
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: 'var(--gold)',
          borderRight: '1px solid rgba(201,150,58,0.3)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>

      {/* Scrolling content */}
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            animation: `ticker ${speed}s linear infinite`,
            whiteSpace: 'nowrap',
            width: 'max-content',
          }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="baskerville"
              style={{ fontSize: '0.78rem', color, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ color: 'var(--gold)', opacity: 0.6 }}>ÃƒÂ¢Ã¢â‚¬â€Ã¢â‚¬Â </span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
