/**
 * PageHero — reusable full-width hero banner.
 * Props:
 *   title      – main headline (string or JSX)
 *   subtitle   – paragraph below title
 *   tag        – small label above title
 *   cta        – array of {label, href, onClick, primary} button descriptors
 *   bg         – CSS background (gradient or image URL)
 *   icon       – emoji or JSX icon
 *   breadcrumb – array of {label, href} for breadcrumb nav
 *   children   – extra content below CTAs
 *   minHeight  – default '420px'
 */
export default function PageHero({
  title,
  subtitle,
  tag,
  cta = [],
  bg,
  icon,
  breadcrumb = [],
  children,
  minHeight = '420px',
  textAlign = 'center',
}) {
  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(3.5rem, 8vw, 6rem) 1.5rem 3.5rem',
        background: bg || 'radial-gradient(circle at 50% 20%, rgba(201,150,58,0.18) 0%, rgba(13,7,4,0.98) 70%)',
        borderBottom: '1px solid rgba(201,150,58,0.2)',
        textAlign,
        minHeight,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(201,150,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,150,58,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: textAlign === 'center' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {i > 0 && <span style={{ color: 'rgba(201,150,58,0.4)', fontSize: '0.75rem' }}>›</span>}
                {crumb.href
                  ? <a href={crumb.href} className="cinzel" style={{ fontSize: '0.65rem', color: i === breadcrumb.length - 1 ? 'var(--gold)' : 'var(--cream-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{crumb.label}</a>
                  : <span className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{crumb.label}</span>
                }
              </span>
            ))}
          </nav>
        )}

        {/* Icon */}
        {icon && (
          <div
            className="anim-scale-in"
            style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'drop-shadow(0 6px 16px rgba(201,150,58,0.5))' }}
          >
            {icon}
          </div>
        )}

        {/* Tag pill */}
        {tag && (
          <div
            className="anim-fade-in-down delay-1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(201,150,58,0.15)',
              border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 1.2rem',
              marginBottom: '1.2rem',
            }}
          >
            <span className="cinzel" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
              {tag}
            </span>
          </div>
        )}

        {/* Title */}
        {title && (
          <h1
            className="playfair anim-fade-in-up delay-2"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.6rem)',
              color: 'var(--cream)',
              lineHeight: 1.15,
              marginBottom: subtitle ? '1.2rem' : '2rem',
              fontWeight: 800,
            }}
          >
            {title}
          </h1>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p
            className="baskerville anim-fade-in-up delay-3"
            style={{
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'rgba(245,237,216,0.85)',
              maxWidth: '700px',
              margin: cta.length ? '0 auto 2rem' : '0 auto',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* CTAs */}
        {cta.length > 0 && (
          <div className="anim-fade-in-up delay-4" style={{ display: 'flex', gap: '1rem', justifyContent: textAlign === 'center' ? 'center' : 'flex-start', flexWrap: 'wrap', alignItems: 'center' }}>
            {cta.map((btn, i) =>
              btn.href ? (
                <a
                  key={i}
                  href={btn.href}
                  className={btn.primary ? 'btn-p' : 'btn-o'}
                  style={{ textDecoration: 'none', fontSize: '0.95rem', padding: '0.85rem 2rem', fontWeight: 700, ...(btn.style || {}) }}
                >
                  {btn.label}
                </a>
              ) : (
                <button
                  key={i}
                  onClick={btn.onClick}
                  className={btn.primary ? 'btn-p' : 'btn-o'}
                  style={{ fontSize: '0.95rem', padding: '0.85rem 2rem', fontWeight: 700, ...(btn.style || {}) }}
                >
                  {btn.label}
                </button>
              )
            )}
          </div>
        )}

        {children && <div className="anim-fade-in delay-5" style={{ marginTop: '2rem' }}>{children}</div>}
      </div>
    </section>
  );
}
