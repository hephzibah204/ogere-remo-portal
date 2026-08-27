import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const festivals = [
  { n: 'Lipakala Day', ic: '🎊', period: 'October–November (Annual)', origin: 'Initiated ~1977 by OCDA', desc: 'The flagship festival of Ogere Remo, held annually at the Wesley School Playground. The 49th edition was celebrated in October 2025.', sacred: false, img: '/images/Olipakala 2025.jpg' },
  { n: 'Oro Festival (Isemo)', ic: '🌙', period: 'July (Annual, Nocturnal)', origin: 'Pre-colonial ancestral institution', desc: 'Ogere\'s most sacred ancestral festival, observed nocturnally by the Oro Society. Movement restrictions apply for women and non-initiates.', sacred: true },
  { n: 'Obalufon Festival', ic: '🌿', period: 'October (Annual)', origin: 'Honours Yemogun — guardian mother of Ogere', desc: 'Annual festival honouring Yemogun — the deified companion of Olipakala. Ceremonies are held at Yemogun Grove (Igbo Yeye).', sacred: true },
  { n: 'Coronation Anniversary', ic: '👑', period: 'April 25 (Annual)', origin: 'Est. 2023', desc: 'Annual celebration of the installation of Oba James Obafemi Saliu on April 25, 2023.', sacred: false, img: '/images/ologere-coronation.jpg' },
  { n: 'Masquerade Processions', ic: '🎭', period: 'Seasonal', origin: 'Deep Yoruba tradition', desc: 'Masquerade processions mark major festivals and rites of passage, performed by traditional societies including Pampa.', sacred: false, img: '/images/Miss Lipaka Hero.jpg' },
];

export default function FaithPage() {
  const [tab, setTab] = useState('faith');

  return (
    <div>
      <SEO title="Faith & Culture" description="The faith, festivals, and cultural traditions of Ogere Remo including Lipakala Day, Oro Festival, and Obalufon Festival." />
      <Hero ey="Spirituality & Heritage" ti="Faith & Culture" sub="From the birthplace of a global church to sacred groves and festival drums — the soul of Ogere Remo." />
      <AdireDivider />
      <Section bg="#1a0d06" py="2rem">
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['faith', '⛪ Houses of Faith'], ['festivals', '🎊 Festivals & Ceremonies']].map(([id, l]) => (
            <button key={id} className={tab === id ? 'btn-p' : 'btn-o'} onClick={() => setTab(id)}>{l}</button>
          ))}
        </div>
      </Section>

      {tab === 'faith' && (
        <Section bg="#1a0d06">
          <p className="sl">Houses of Worship</p>
          <h2 className="st" style={{ marginBottom: '2.5rem' }}>Faith in Ogere Remo</h2>
          <div style={{ padding: '2rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.28)', borderTop: '4px solid #C9963A', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '3rem', flexShrink: 0 }}>⛪</div>
                <div>
                  <span className="tag tag-gold">World Headquarters — Founded Here</span>
                  <div className="playfair" style={{ fontSize: '1.3rem', color: '#F5EDD8', lineHeight: 1.2 }}>Church of the Lord (Aladura) Worldwide</div>
                  <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.1em', color: 'rgba(245,237,216,.5)', textTransform: 'uppercase', marginTop: '.2rem' }}>Lisa Compound, Ogere Remo · Est. July 27, 1930</div>
                </div>
              </div>
              <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.72)' }}>One of Africa's most significant Pentecostal churches was born here — in Ogere Remo — when Prophet Josiah Olunowo Ositelu founded the Church of the Lord (Aladura) Worldwide at the Lisa Compound on July 27, 1930. The church now has international branches across Nigeria, Ghana, Sierra Leone, and Liberia.</p>
            </div>
            <div style={{ width: '100%', maxWidth: '300px', height: '200px', flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <img src="/images/The Church Of The Lord Aladuara.jpg" alt="Church of the Lord Aladura World Headquarters" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderTop: '3px solid #7A2E0E', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px' }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '.6rem' }}>⛪</div>
                <span className="tag tag-terra">Historic Mission Church</span>
                <div className="playfair" style={{ fontSize: '1.05rem', color: '#F5EDD8', marginBottom: '.5rem' }}>Christ Church Anglican</div>
                <div style={{ fontSize: '.82rem', lineHeight: 1.75, color: 'rgba(245,237,216,.6)', marginBottom: '1rem' }}>The historic Anglican mission church of Ogere Remo and home of the oldest school in the town.</div>
              </div>
              <div style={{ width: '100%', height: '140px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.15)', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}>
                <img src="/images/Church Of The LOrd Aldura.jpg" alt="Christ Church Anglican" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderTop: '3px solid #7A2E0E', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px' }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '.6rem' }}>🕌</div>
                <span className="tag tag-terra">Multi-Faith Community</span>
                <div className="playfair" style={{ fontSize: '1.05rem', color: '#F5EDD8', marginBottom: '.5rem' }}>Islam & Other Faiths</div>
                <div style={{ fontSize: '.82rem', lineHeight: 1.75, color: 'rgba(245,237,216,.6)', marginBottom: '1rem' }}>Ogere Remo is a multi-faith community. Muslim residents worship at mosques within the town, embracing all ethnic communities.</div>
              </div>
              <div style={{ width: '100%', height: '140px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.15)', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}>
                <img src="/images/ogere-community-gathering.jpg" alt="Multi-Faith Community Gathering" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {tab === 'festivals' && (
        <Section bg="#1a0d06">
          <p className="sl">Annual Celebrations</p>
          <h2 className="st" style={{ marginBottom: '2.5rem' }}>Festivals & Traditional Ceremonies</h2>
          <div style={{ display: 'grid', gap: '1.3rem' }}>
            {festivals.map((f, i) => (
              <div key={i} style={{ padding: '1.8rem', background: 'rgba(201,150,58,.04)', border: `1px solid ${f.sacred ? 'rgba(122,46,14,.4)' : 'rgba(201,150,58,.18)'}`, borderLeft: `4px solid ${f.sacred ? '#7A2E0E' : '#C9963A'}`, display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.8rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.8rem' }}>{f.ic}</span>
                      <div>
                        <div className="playfair" style={{ fontSize: '1.05rem', color: '#F5EDD8', lineHeight: 1.2 }}>{f.n}</div>
                        <div style={{ fontSize: '.72rem', color: 'rgba(201,150,58,.65)', fontStyle: 'italic', marginTop: '.2rem' }}>{f.origin}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`tag ${f.sacred ? 'tag-terra' : 'tag-gold'}`}>{f.period}</span>
                      {f.sacred && <div style={{ fontSize: '.62rem', color: '#f5a4a4', marginTop: '.3rem' }}>⚠ Sacred — observe advisories</div>}
                    </div>
                  </div>
                  <p style={{ fontSize: '.85rem', lineHeight: 1.82, color: 'rgba(245,237,216,.65)', margin: 0 }}>{f.desc}</p>
                </div>
                {f.img && (
                  <div style={{ width: '100%', maxWidth: '200px', height: '130px', flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <img src={f.img} alt={f.n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
      <AdireDivider />
    </div>
  );
}
