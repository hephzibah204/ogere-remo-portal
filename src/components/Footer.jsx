import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    heading: 'About',
    links: [
      { to: '/history', l: 'History' },
      { to: '/monarchy', l: 'Monarchy' },
      { to: '/families', l: 'Families' },
      { to: '/faith', l: 'Faith & Culture' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { to: '/associations', l: 'Associations' },
      { to: '/education', l: 'Education' },
      { to: '/diaspora', l: 'Diaspora' },
      { to: '/forum', l: 'Forum' },
    ],
  },
  {
    heading: 'Media',
    links: [
      { to: '/gallery', l: 'Gallery' },
      { to: '/news', l: 'News' },
      { to: '/blog', l: 'Blog' },
      { to: '/events', l: 'Events' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { to: '/tourism', l: 'Tourism' },
      { to: '/business', l: 'Directory' },
      { to: '/map', l: '🗺 Map' },
      { to: '/alerts', l: '⚠ Alerts' },
    ],
  },
  {
    heading: 'More',
    links: [
      { to: '/miss-olipakala', l: '👑 Miss Olipakala' },
      { to: '/contact', l: 'Contact' },
      { to: '/signin', l: '🔑 Sign In' },
      { to: '/admin', l: '⚙ Admin' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0d0704',
        borderTop: '1px solid rgba(201,150,58,.18)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          className="cinzel"
          style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#C9963A',
            letterSpacing: '.1em',
          }}
        >
          OGERE REMO
        </div>
        <div
          className="playfair"
          style={{
            fontStyle: 'italic',
            fontSize: '.82rem',
            color: 'rgba(245,237,216,.3)',
            margin: '.3rem 0 1.5rem',
          }}
        >
          &ldquo;A town upon the hills — Ancient, Proud, Enduring.&rdquo;
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '1.3rem',
            textAlign: 'left',
          }}
        >
          {SECTIONS.map((sec) => (
            <div key={sec.heading}>
              <div
                className="cinzel"
                style={{
                  fontSize: '.55rem',
                  fontWeight: 700,
                  color: '#C9963A',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  marginBottom: '.35rem',
                }}
              >
                {sec.heading}
              </div>
              {sec.links.map((lnk) => (
                <Link
                  key={lnk.to}
                  to={lnk.to}
                  style={{
                    display: 'block',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Cinzel',serif",
                    fontSize: '.5rem',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,237,216,.3)',
                    textDecoration: 'none',
                    transition: 'color .2s',
                    padding: '.08rem 0',
                    lineHeight: 1.6,
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = '#C9963A')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = 'rgba(245,237,216,.3)')
                  }
                >
                  {lnk.l}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Community Sponsorship & Donation Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(201,150,58,0.12) 0%, rgba(122,46,14,0.25) 100%)',
            border: '1px solid rgba(201,150,58,0.35)',
            borderLeft: '4px solid var(--gold)',
            borderRadius: '12px',
            padding: '1.5rem 1.8rem',
            margin: '1.5rem auto 2rem',
            textAlign: 'left',
            maxWidth: '920px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.2rem' }}>
            <div style={{ flex: 1, minWidth: 'min(280px, 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.4rem' }}>💛</span>
                <span className="cinzel" style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Support & Fund This Project
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: 'rgba(245,237,216,0.8)', margin: '0 0 0.6rem 0' }}>
                This portal requires substantial funding to keep running — supporting <strong>developers, designers, project managers, cloud hosting, domain web hosting, and continuous system maintenance</strong>.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.9)' }}>
                🏦 <strong>Opay:</strong> <span style={{ color: 'var(--gold)', fontWeight: 700 }}>6101307590</span> · <em>Hephtech Multimedia & Innovations</em>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-donate-modal'))}
                className="btn-p"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.6rem 1.2rem',
                  letterSpacing: '0.08em',
                  boxShadow: '0 4px 15px rgba(201,150,58,0.25)',
                }}
              >
                💛 Donate Now
              </button>
              <a
                href="https://wa.me/2349077780156?text=Hello%20Hephtech%20Multimedia%2C%20I%20would%20like%20to%20support/donate%20to%20the%20Ogere%20Remo%20Community%20Portal."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-o"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.6rem 1rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                💬 09077780156
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: 'rgba(201,150,58,.1)',
            margin: '0 0 1rem',
          }}
        />
        <div
          style={{
            fontSize: '.68rem',
            color: 'rgba(245,237,216,.25)',
          }}
        >
          © 2026 Ogere Remo Community Portal · Built & Maintained by Hephtech Multimedia & Innovations · Est. circa 1401 A.D.
        </div>
      </div>
    </footer>
  );
}
