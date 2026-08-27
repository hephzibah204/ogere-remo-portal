import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const schools = [
  { name: 'Ositelu Memorial College', tag: 'Secondary School', tagClass: 'tag-blue', ic: '🏫', founded: 'Named after Prophet Josiah Olunowo Ositelu (born 1902, Ogere Remo)', desc: 'Ogere Remo\'s flagship secondary school. The college has produced generations of distinguished Nigerians.', motto: '"We Shall Be Giant, and Therefore We Shall Work, and Work, and Work"', alumni: 'OMCOOSA — President: Arc. Kunle Awobajo · 08037136954', address: 'Awomosu Agbato Drive, Ogere 121107', facts: ['OMCOOSA celebrated 40th Anniversary in 2025', 'Annual dues: ₦5,000 per member'], img: '/images/ositelu-memorial-college-building.jpg' },
  { name: 'Christ Church School', tag: 'Primary School · Est. 1913+', tagClass: 'tag-terra', ic: '⛪', founded: 'Oldest school in Ogere Remo — attended by Josiah Ositelu 1913–1919', desc: 'The oldest educational institution in Ogere Remo. Recently rehabilitated by Ogun State Government in 2025.', motto: 'Building foundations for over a century', alumni: 'Includes the late Prophet Josiah Olunowo Ositelu', address: 'Ogere Remo, Ogun State', facts: ['Over 100 years of history', 'Rehabilitated by Ogun State Government in 2025'], img: '/images/church-of-the-lord-aladura.jpg' },
  { name: 'Emmanuel Narrow-Way Academy (ENAWAC)', tag: 'Nursery & Primary', tagClass: 'tag-green', ic: '🌱', founded: 'Proprietor: Rev\'d Emmanuel Ola Shofuyi', desc: 'A leading nursery and primary institution in Ogere Remo, known for its annual Philanthropy Awards.', motto: 'Narrow is the way — wide is the excellence', alumni: 'ENAWAC Philanthropy Awards Alumni Network', address: 'Ogere Remo, Ogun State', facts: ['Hosts annual Philanthropy Awards at Ogere Town Hall', 'Growing nursery and primary enrolment'], img: '/images/EmmanuelNarroway Academy.jpg' },
];

const notable = [
  { n: 'Prophet Josiah Olunowo Ositelu', y: '1902 – 1966', tag: 'Spiritual Founder · Global Legacy', ic: '✝️', desc: 'Born in Ogere Remo in 1902, he attended Christ Church School before founding the Church of the Lord (Aladura) Worldwide on July 27, 1930.', img: '/images/Josiah Ositelu.jpg' },
  { n: 'Oba Oladele Moshood Ogunbade', y: 'c.1937 – April 10, 2022', tag: 'Agbejoye II · Ologere 1983–2022', ic: '👑', desc: 'Reigned for over 38 years. His palace archives (2008) remain the primary historical source for Ogere Remo.', img: '/images/OLOGERE-OF-OGERE-OBA OGUNBADE.jpg' },
  { n: 'Dr. Shola Mos-Shogbamimu', y: 'Contemporary', tag: 'Lawyer · Author · Political Commentator', ic: '🌟', desc: 'Granddaughter of Oba Alfred Babington-Ashaye. PhD (Birkbeck), LLM (LSE), Exec MBA (Cambridge). New York Attorney.' },
];

export default function EducationPage() {
  const [tab, setTab] = useState('schools');

  return (
    <div>
      <SEO title="Education" description="Educational institutions in Ogere Remo including Ositelu Memorial College, Christ Church School, and Emmanuel Narrow-Way Academy." />
      <Hero ey="Knowledge & Legacy" ti="Education in Ogere Remo" sub="From the oldest mission school to Ositelu Memorial College — the institutions that built Ogere's brilliant minds." />
      <AdireDivider />
      <Section bg="#1a0d06" py="2rem">
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['schools', '🏫 Schools'], ['notable', '🌟 Notable People']].map(([id, l]) => (
            <button key={id} className={tab === id ? 'btn-p' : 'btn-o'} onClick={() => setTab(id)}>{l}</button>
          ))}
        </div>
      </Section>

      {tab === 'schools' && (
        <Section bg="#1a0d06">
          <p className="sl">Educational Institutions</p>
          <h2 className="st" style={{ marginBottom: '2.5rem' }}>Schools of Ogere Remo</h2>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {schools.map((s, i) => (
              <div key={i} style={{ padding: '2rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.18)', borderLeft: '4px solid #C9963A', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>{s.ic}</div>
                    <div>
                      <span className={`tag ${s.tagClass}`}>{s.tag}</span>
                      <div className="playfair" style={{ fontSize: '1.25rem', color: '#F5EDD8' }}>{s.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'rgba(201,150,58,.6)', fontStyle: 'italic' }}>{s.founded}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '.88rem', lineHeight: 1.85, color: 'rgba(245,237,216,.7)', marginBottom: '1.1rem' }}>{s.desc}</p>
                  <div style={{ background: 'rgba(201,150,58,.07)', border: '1px solid rgba(201,150,58,.15)', padding: '.8rem 1.1rem', marginBottom: '1rem', borderLeft: '3px solid #C9963A' }}>
                    <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.1em', color: 'rgba(201,150,58,.7)', textTransform: 'uppercase', marginBottom: '.3rem' }}>School Motto</div>
                    <div className="playfair" style={{ fontStyle: 'italic', fontSize: '.9rem', color: '#F0D080' }}>{s.motto}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '.5rem', marginBottom: '1rem' }}>
                    {s.facts.map((fact, fi) => (
                      <div key={fi} style={{ display: 'flex', gap: '.5rem', fontSize: '.78rem', color: 'rgba(245,237,216,.6)' }}>
                        <span style={{ color: '#C9963A', flexShrink: 0 }}>›</span><span>{fact}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(201,150,58,.1)', paddingTop: '.8rem' }}>
                    <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.4)' }}>🎓 {s.alumni}</div>
                    <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.4)', marginTop: '.25rem' }}>📍 {s.address}</div>
                  </div>
                </div>
                {s.img && (
                  <div style={{ width: '100%', maxWidth: '260px', height: '190px', flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === 'notable' && (
        <Section bg="#1a0d06">
          <p className="sl">Distinguished Alumni & Sons of the Soil</p>
          <h2 className="st" style={{ marginBottom: '2.5rem' }}>Notable People of Ogere Remo</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {notable.map((p, i) => (
              <div key={i} style={{ padding: '2rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.2)', borderLeft: '4px solid #C9963A', display: 'flex', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
                <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: '50%', border: '2px solid #C9963A', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,150,58,.1)', fontSize: '2.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  {p.img ? (
                    <img src={p.img} alt={p.n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    p.ic
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <span className="tag tag-gold" style={{ marginBottom: '.4rem', display: 'inline-block' }}>{p.tag}</span>
                  <div className="playfair" style={{ fontSize: '1.15rem', color: '#F5EDD8', marginBottom: '.15rem' }}>{p.n}</div>
                  <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.1em', color: 'rgba(240,208,128,.65)', textTransform: 'uppercase', marginBottom: '.7rem' }}>{p.y}</div>
                  <p style={{ fontSize: '.86rem', lineHeight: 1.85, color: 'rgba(245,237,216,.68)' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
      <AdireDivider />
    </div>
  );
}
