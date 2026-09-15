import { Link, useLocation } from 'react-router-dom';
import AiSearch from './AiSearch';
import DonateModal from './DonateModal';
import SosHeaderModal from './SosHeaderModal';
import { useState, useEffect } from 'react';
import { getSaasConfig } from '../services/saasConfig';

const MENU_GROUPS = [
  {
    id: 'about',
    label: 'About',
    items: [
      { id: 'history', label: 'History' },
      { id: 'monarchy', label: 'The Monarchy' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'families', label: 'Families & Compounds' },
      { id: 'associations', label: 'Associations' },
      { id: 'gallery', label: 'Media Gallery' },
      { id: 'live', label: '🎥 Live TV' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      { id: 'education', label: 'Education' },
      { id: 'scholarships', label: '🎓 Scholarships' },
      { id: 'health', label: '🏥 Health & Blood Bank' },
      { id: 'faith', label: 'Faith & Religion' },
      { id: 'events', label: 'Events' },
      { id: 'news', label: 'News' },
      { id: 'messages', label: '💬 Town Chat (WhatsApp)' },
      { id: 'forum', label: 'Forum' },
      { id: 'diaspora', label: 'Diaspora' },
      { id: 'miss-olipakala', label: 'Miss Olipakala' },
    ],
  },
  {
    id: 'explore',
    label: 'Explore',
    items: [
      { id: 'marketplace', label: '🛒 Marketplace' },
      { id: 'tourism', label: 'Tourism' },
      { id: 'business', label: 'Directory' },
      { id: 'map', label: '🗺 Map' },
      { id: 'alerts', label: '⚠ Alerts' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'governance', label: '📊 Dashboard' },
      { id: 'security-dashboard', label: '🚨 Security Command' },
      { id: 'admin-mobile', label: '🛡️ Officer Terminal' },
      { id: 'land-registry', label: '📋 Land Registry' },
      { id: 'royal-audience', label: '👑 Book Royal Audience' },
      { id: 'id-card', label: '🪪 Digital ID Card' },
      { id: 'verify-id', label: '🔍 Verify Digital ID' },
      { id: 'contact', label: '📬 Contact OCDA' },
    ],
  },
];

const STANDALONE_PAGES = [
  { id: 'mobile-preview', label: '📱 Mobile App' },
  { id: 'quiz', label: '🧠 Heritage Quiz' },
  { id: 'miss-olipakala', label: '👑 Miss Olipakala' },
  { id: 'contact', label: 'Contact' },
  { id: 'signin', label: '🔑 Sign In' },
  { id: 'admin', label: '⚙ Admin' },
];

export default function Nav() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const currentPage = location.pathname.replace('/', '') || 'home';

  useEffect(() => {
    const handleOpenDonate = () => setIsDonateOpen(true);
    const handleOpenSos = () => setIsSosOpen(true);
    window.addEventListener('open-donate-modal', handleOpenDonate);
    window.addEventListener('open-sos-modal', handleOpenSos);
    return () => {
      window.removeEventListener('open-donate-modal', handleOpenDonate);
      window.removeEventListener('open-sos-modal', handleOpenSos);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const [saasConfig, setSaasConfig] = useState(getSaasConfig());

  useEffect(() => {
    const handleUpdate = () => setSaasConfig(getSaasConfig());
    window.addEventListener('saas-config-updated', handleUpdate);
    window.addEventListener('ogere-broadcast-updated', handleUpdate);
    return () => {
      window.removeEventListener('saas-config-updated', handleUpdate);
      window.removeEventListener('ogere-broadcast-updated', handleUpdate);
    };
  }, []);

  const isActive = (id) => currentPage === id;
  const isGroupActive = (group) => group.items.some(item => item.id === currentPage);

  const broadcast = saasConfig.broadcast;

  return (
    <>
      {broadcast && broadcast.enabled && broadcast.message && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1001,
            padding: '0.35rem 1rem',
            fontSize: '0.72rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            background:
              broadcast.type === 'royal' ? 'linear-gradient(90deg, #1a0d06, #2c1a0e, #1a0d06)' :
              broadcast.type === 'festival' ? 'linear-gradient(90deg, #14301a, #1b4324, #14301a)' :
              broadcast.type === 'alert' ? 'linear-gradient(90deg, #3b0d0c, #5c1412, #3b0d0c)' :
              'linear-gradient(90deg, #0d1b2a, #1b263b, #0d1b2a)',
            borderBottom: `1px solid ${
              broadcast.type === 'royal' ? 'var(--gold)' :
              broadcast.type === 'festival' ? '#4ade80' :
              broadcast.type === 'alert' ? '#f87171' : '#60a5fa'
            }`,
            color: '#F5EDD8',
          }}
        >
          <span>{broadcast.type === 'royal' ? '👑' : broadcast.type === 'festival' ? '🎉' : broadcast.type === 'alert' ? '🚨' : 'ℹ️'}</span>
          <span>{broadcast.message}</span>
          {broadcast.ctaLabel && broadcast.ctaLink && (
            <Link
              to={broadcast.ctaLink}
              style={{
                color: 'var(--gold)',
                fontWeight: 700,
                textDecoration: 'underline',
                marginLeft: '0.4rem',
                fontSize: '0.7rem',
              }}
            >
              {broadcast.ctaLabel} →
            </Link>
          )}
        </div>
      )}

      <nav
        className="glass"
        style={{
          position: 'fixed',
          top: broadcast && broadcast.enabled && broadcast.message ? '28px' : 'var(--demo-offset, 0px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 'var(--nav-height)',
          display: 'flex',
          alignItems: 'center',
          transition: 'var(--transition)',
          background: isScrolled ? 'var(--dark-glass)' : 'rgba(26, 13, 6, 0.4)',
          borderBottom: isScrolled ? '1px solid var(--gold)' : '1px solid transparent',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="cinzel" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em' }}>OGERE REMO</span>
            <span className="cinzel" style={{ fontSize: '0.5rem', color: 'rgba(245, 237, 216, 0.5)', letterSpacing: '0.2em' }}>EST. 1401 · OGUN STATE</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'none', lg: 'flex', gap: '1rem', alignItems: 'center' }} className="desktop-nav">
            <style>{`
              @media (min-width: 1024px) {
                .desktop-nav { display: flex !important; }
                .mobile-toggle { display: none !important; }
              }
            `}</style>
            
            <Link to="/" className="nav-link" style={{ 
              color: isActive('home') ? 'var(--gold)' : 'var(--cream)',
              borderBottom: isActive('home') ? '2px solid var(--gold)' : '2px solid transparent'
            }}>Home</Link>

            {MENU_GROUPS.map((group) => (
              <div 
                key={group.id} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setOpenGroup(group.id)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button className="nav-link" style={{ 
                  color: isGroupActive(group) ? 'var(--gold)' : 'var(--cream)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {group.label} <span style={{ fontSize: '0.6rem' }}>▼</span>
                </button>

                {openGroup === group.id && (
                  <div className="glass" style={{
                    position: 'absolute', top: '100%', left: 0, minWidth: '200px',
                    padding: '0.5rem 0', borderRadius: '4px', marginTop: '4px'
                  }}>
                    {group.items.map(item => (
                      <Link key={item.id} to={`/${item.id}`} className="dropdown-item" style={{
                        display: 'block', padding: '0.6rem 1.2rem', fontSize: '0.8rem',
                        color: isActive(item.id) ? 'var(--gold)' : 'var(--cream)',
                        background: isActive(item.id) ? 'var(--gold-muted)' : 'transparent'
                      }}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {STANDALONE_PAGES.map(page => (
              <Link key={page.id} to={`/${page.id}`} className="nav-link" style={{
                color: isActive(page.id) ? 'var(--gold)' : 'var(--cream)',
                padding: page.id === 'quiz' ? '0.4rem 0.8rem' : '0.5rem',
                border: page.id === 'quiz' ? '1px solid var(--gold)' : 'none',
                borderRadius: '4px'
              }}>
                {page.label}
              </Link>
            ))}
            
            <button
              onClick={() => setIsSosOpen(true)}
              className="btn-sos-nav"
              title="Immediate Emergency Rescue & Security Forces"
              style={{
                fontSize: '0.68rem',
                padding: '0.42rem 0.85rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: '1px solid #f87171',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
                boxShadow: '0 2px 10px rgba(220, 38, 38, 0.45)',
                animation: 'pulseGlow 2.5s infinite',
              }}
            >
              <span>🚨</span>
              <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', fontWeight: 900 }}>SOS Emergency</span>
            </button>

            <button
              onClick={() => setIsDonateOpen(true)}
              className="btn-p"
              style={{
                fontSize: '0.68rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'linear-gradient(135deg, #C9963A, #B5451B)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(201,150,58,0.3)',
              }}
            >
              <span>💛</span>
              <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}>Donate</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
              className="abtn abtn-o"
              title="Search Portal (Ctrl+K)"
              style={{
                fontSize: '0.65rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid rgba(201,150,58,0.3)',
                color: 'var(--gold-light)',
              }}
            >
              <span>🔍</span>
              <span className="cinzel" style={{ fontSize: '0.52rem' }}>Search (Ctrl+K)</span>
            </button>

            <AiSearch />
          </div>

          {/* Mobile Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: 'var(--gold)', fontSize: '1.5rem' }}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="glass" style={{
          position: 'fixed', inset: 0, zIndex: 999, paddingTop: 'var(--nav-height)',
          overflowY: 'auto', display: 'flex', flexDirection: 'column'
        }}>
          <div className="container" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSosOpen(true);
                  }}
                  className="btn-p"
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    fontSize: '0.8rem',
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    border: '1px solid #f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  <span>🚨</span>
                  <span className="cinzel" style={{ letterSpacing: '0.1em', fontWeight: 900 }}>SOS Emergency</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsDonateOpen(true);
                  }}
                  className="btn-p"
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    fontSize: '0.8rem',
                    background: 'linear-gradient(135deg, #C9963A, #B5451B)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>💛</span>
                  <span className="cinzel" style={{ letterSpacing: '0.1em' }}>Donate</span>
                </button>
              </div>
             <AiSearch />
             <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Link to="/" className="cinzel" style={{ fontSize: '1.2rem', color: isActive('home') ? 'var(--gold)' : 'var(--cream)' }}>Home</Link>
                
                {MENU_GROUPS.map(group => (
                  <div key={group.id}>
                    <div className="cinzel" style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>{group.label}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      {group.items.map(item => (
                        <Link key={item.id} to={`/${item.id}`} style={{ fontSize: '0.9rem', color: isActive(item.id) ? 'var(--gold)' : 'rgba(245, 237, 216, 0.7)' }}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ height: '1px', background: 'rgba(201, 150, 58, 0.2)', margin: '1rem 0' }} />

                {STANDALONE_PAGES.map(page => (
                  <Link key={page.id} to={`/${page.id}`} className="cinzel" style={{ fontSize: '1.1rem', color: isActive(page.id) ? 'var(--gold)' : 'var(--cream)' }}>
                    {page.label}
                  </Link>
                ))}
             </div>
          </div>
        </div>
      )}

      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
      <SosHeaderModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />

      <style>{`
        .nav-link {
          font-family: var(--font-display);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.5rem;
          transition: var(--transition);
        }
        .nav-link:hover { color: var(--gold) !important; }
        .dropdown-item:hover { background: var(--gold-muted) !important; color: var(--gold) !important; }
      `}</style>
    </>
  );
}
