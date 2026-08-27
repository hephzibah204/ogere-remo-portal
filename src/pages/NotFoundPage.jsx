import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <div>
      <SEO title="Page Not Found — 404" description="The requested page could not be found on the Ogere Remo Portal." />
      <Hero
        ey="Ancient Crossroads"
        ti="Page Not Found — 404"
        sub="You have reached an uncharted path in Ogereland. Let us guide you back to the town square."
        dark
      />
      <AdireDivider />

      <Section bg="#0d0704" py="5rem">
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
          <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '1rem' }}>
            Ọ̀pọ̀lọpọ̀ Ọ̀nà Wà (Many Paths Exist)
          </h2>
          <p style={{ color: 'rgba(245,237,216,0.65)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            The page or document you are looking for has been relocated, archived, or never existed in the palace archives.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {[
              { to: '/', l: 'Town Hall (Home)', ic: '🏠' },
              { to: '/monarchy', l: 'The Royal Seat', ic: '👑' },
              { to: '/id-card', l: 'Digital ID Card', ic: '🪪' },
              { to: '/marketplace', l: 'Marketplace', ic: '🛒' },
              { to: '/land-registry', l: 'Land Registry', ic: '📜' },
              { to: '/contact', l: 'Get in Touch', ic: '✉️' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="glass card"
                style={{
                  padding: '1.2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{item.ic}</div>
                <div className="cinzel" style={{ fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                  {item.l}
                </div>
              </Link>
            ))}
          </div>

          <Link to="/" className="btn-p" style={{ padding: '0.9rem 2.5rem', textDecoration: 'none' }}>
            Return to Homepage →
          </Link>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
