import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const spots = [
  { n: 'Ogere Resort & Convention Centre', tag: 'FEATURED · Premier Resort', tagClass: 'tag-gold', ic: '🏨', color: '#B5451B', desc: 'Nigeria\'s premier expressway resort at KM 67. 140+ rooms, convention centre, pools.', rating: '4.4★', reviews: '558 Google reviews', phone: '+234 906 247 0474', website: 'ogereresort.com', hours: 'Daily 8AM–8PM', address: 'KM 67, Lagos–Ibadan Expressway', distance: '~65 km from Lagos', quotes: ['Very nice and well kept resort', 'gives off an Afrocentric vibe'], features: ['140+ rooms', 'Convention Centre', 'Swimming Pool', 'Dining & Bar'], img: '/images/Ogere Resort.png' },
  { n: 'Aafin Ologere (Palace)', tag: 'Royal Heritage', tagClass: 'tag-terra', ic: '🏛️', color: '#C9963A', desc: 'The permanent palace of the Ologere, commissioned April 26, 2025.', address: 'Opposite Church of Lord Aladura', features: ['Official seat of the Ologere', 'Commissioned April 26, 2025'], img: '/images/palace/1.jpg' },
  { n: 'Lipakala Cultural Centre', tag: 'Cultural Heritage', tagClass: 'tag-green', ic: '🎭', color: '#2D4A22', desc: 'Named after founding ancestor Olipakala. Permanent home for cultural heritage.', address: 'Ogere Remo', features: ['Opened April 26, 2025', 'Venue for Lipakala Day Festival'], img: '/images/lipakala-cultural-centre.jpg' },
  { n: 'The Hills of Ogere', tag: 'Natural Heritage', tagClass: 'tag-green', ic: '🏔️', color: '#2D4A22', desc: 'The defining geographical feature — "a town upon the hills."', address: 'Ogere Remo', features: ['Defining feature since 1401 AD', 'Referenced in the Ogere Anthem'], img: '/images/ogere-townscape.jpg' },
  { n: 'Ogere Central Market', tag: 'Commerce & Culture', tagClass: 'tag-gold', ic: '🛖', color: '#8B6914', desc: 'Centuries-old market, multi-lingual community hub.', rating: '4.4★', phone: '+234 704 957 0510', address: 'WJPM+5G6, Ogere 121107', features: ['Centuries-old trading site', 'Multi-lingual market'], img: '/images/Ogere Central MArket.webp' },
  { n: 'Lisa Compound — Aladura Church', tag: 'World Heritage Site', tagClass: 'tag-blue', ic: '⛪', color: '#1a2e5e', desc: 'Where the Church of the Lord (Aladura) was founded July 27, 1930.', address: 'Lisa Compound, Ogere Remo', features: ['Founded July 27, 1930', 'Pilgrimage destination worldwide'], img: '/images/Church Of The LOrd Aldura.jpg' },
];

export default function TourismPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <SEO title="Tourism" description="Tourist attractions in Ogere Remo including the Ogere Resort, Aafin Ologere Palace, Lipakala Cultural Centre, and historic sites." />
      <Hero ey="Visit Ogere Remo" ti="Tourism & Attractions" sub="From a world-class resort to sacred groves and a cultural centre — Ogere Remo offers a uniquely authentic Nigerian experience." />
      <AdireDivider />
      <Section bg="#2c1a0e" py="3rem">
        <div style={{ background: 'rgba(201,150,58,.07)', border: '1px solid rgba(201,150,58,.28)', borderTop: '4px solid #C9963A', padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '3.5rem', flexShrink: 0 }}>🏨</div>
            <div style={{ flex: 1 }}>
              <span className="tag tag-gold">⭐ Featured — Most Visited Destination</span>
              <div className="playfair" style={{ fontSize: '1.4rem', color: '#F5EDD8', margin: '.2rem 0' }}>Ogere Resort & Convention Centre</div>
              <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.1em', color: 'rgba(245,237,216,.45)', textTransform: 'uppercase', marginBottom: '.8rem' }}>KM 67, Lagos–Ibadan Expressway · 4.4★ (558 reviews)</div>
              <p style={{ fontSize: '.88rem', lineHeight: 1.85, color: 'rgba(245,237,216,.68)', marginBottom: '1rem' }}>Nigeria's premier expressway resort — 140+ rooms, convention centre, pools, dining. ~65km from Lagos and ~60km from Ibadan.</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="https://ogereresort.com" target="_blank" rel="noopener noreferrer" className="btn-p" style={{ textDecoration: 'none', fontSize: '.65rem' }}>Visit Website →</a>
                <a href="tel:+2349062470474" className="btn-o" style={{ textDecoration: 'none', fontSize: '.65rem' }}>📞 +234 906 247 0474</a>
              </div>
            </div>
          </div>
        </div>
      </Section>
      <Section bg="#1a0d06">
        <p className="sl">Discover Ogere Remo</p>
        <h2 className="st" style={{ marginBottom: '2.5rem' }}>Attractions & Points of Interest</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px, 100%),1fr))', gap: '1.5rem' }}>
          {spots.map((s, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer', background: selected === i ? 'rgba(201,150,58,.09)' : 'rgba(201,150,58,.03)', borderLeft: `4px solid ${s.color}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.25s' }}
              onClick={() => setSelected(selected === i ? null : i)}>
              {s.img && (
                <div style={{ height: '160px', width: '100%', overflow: 'hidden', borderBottom: '1px solid rgba(201,150,58,0.15)', position: 'relative' }}>
                  <img src={s.img} alt={s.n} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                  <span className={`tag ${s.tagClass}`} style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', zIndex: 10, margin: 0 }}>{s.tag}</span>
                </div>
              )}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {!s.img && <span className={`tag ${s.tagClass}`}>{s.tag}</span>}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{s.ic}</span>
                    <div className="playfair" style={{ fontSize: '1.05rem', color: '#F5EDD8', fontWeight: 600 }}>{s.n}</div>
                  </div>
                  <div style={{ fontSize: '.82rem', lineHeight: 1.7, color: 'rgba(245,237,216,.6)', marginBottom: '0.5rem' }}>{s.desc.slice(0, 110)}…</div>
                </div>
                {selected === i && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(201,150,58,.15)', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '.84rem', lineHeight: 1.82, color: 'rgba(245,237,216,.7)', marginBottom: '.8rem' }}>{s.desc}</p>
                    {s.features && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.3rem', marginBottom: '.8rem' }}>
                        {s.features.map((f, fi) => (
                          <div key={fi} style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.55)', display: 'flex', gap: '.4rem' }}>
                            <span style={{ color: '#C9963A' }}>›</span><span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {s.website && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.5)', marginBottom: '.25rem' }}>🌐 <a href={`https://${s.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C9963A', textDecoration: 'none' }}>{s.website}</a></div>}
                    {s.phone && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.5)', marginBottom: '.25rem' }}>📞 {s.phone}</div>}
                    {s.address && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.5)' }}>📍 {s.address}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
