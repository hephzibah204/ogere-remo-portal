import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const families = [
  { id: 'agbato', ic: '🏡', name: 'The Agbato Family', compound: 'Awomosu Compound', ward: 'Itajiren Ward', tag: 'Community Patriarchs · Education', tagClass: 'tag-green', accent: '#2D4A22', summary: 'A venerated landed family whose name is permanently inscribed in Ogere\'s geography — Awomosu Agbato Drive, home of the town\'s flagship secondary school.', desc: 'One of Ogere Remo\'s most deeply rooted landed families, the Agbato family is based in the Awomosu quarter of the Itajiren ward. Their most enduring legacy is geographical: the principal road connecting Ogere\'s residential and educational zones — Awomosu Agbato Drive — bears the family name.', members: [{ n: 'Awomosu Agbato Drive', r: 'Road named in family honour — principal axis of Ogere\'s educational zone' }, { n: 'Ositelu Memorial College', r: 'Located on Awomosu Agbato Drive; Ogere\'s premier secondary school' }], img: '/images/Dr AGBATO.jpg' },
  { id: 'babington', ic: '👑', name: 'The Babington-Ashaye Family', compound: 'Legunsen Royal House', ward: 'Royal Lineage', tag: 'Royal · Political · Diaspora', tagClass: 'tag-gold', accent: '#8B6914', summary: 'The most politically prominent dynasty in documented Ogere history.', desc: 'The Babington-Ashaye family stands as the most extensively documented royal dynasty in Ogere Remo\'s recorded history. Oba Alfred Obafuwa Babington-Ashaye (Legunsen III) reigned from c.1945 to December 4, 1982.', members: [{ n: 'Oba Alfred Obafuwa Babington-Ashaye', r: 'Legunsen III · r. c.1945 – December 4, 1982' }, { n: 'Prince Olumuyiwa Adewunmi Babington-Ashaye', r: 'Firstborn son · Founder of Ashaye Far East Line (AFEL)' }, { n: 'Dr. Shola Mos-Shogbamimu', r: 'Granddaughter · PhD (Birkbeck) · LLM (LSE) · Author & political commentator' }], img: '/images/Oba-BabingtonAshaye.jpg' },
  { id: 'ositelu', ic: '⛪', name: 'The Ositelu Family', compound: 'Lisa Chieftaincy House', ward: 'Lisa Compound', tag: 'Spiritual · Global Church Founders', tagClass: 'tag-blue', accent: '#1a2e5e', summary: 'Founders of one of Africa\'s most globally significant Pentecostal churches.', desc: 'Prophet Josiah Olunowo Ositelu was born on 15 May 1900 at Ogere Remo. On July 27, 1930 he formally inaugurated the Church of the Lord (Aladura) Worldwide at the Lisa Compound.', members: [{ n: 'Prophet Josiah Olunowo Ositelu', r: 'Founder, Church of the Lord (Aladura) Worldwide · Born 15 May 1900' }, { n: 'Archbishop Dr. Rufus Okikiola Olubiyi Ositelu', r: 'Current Primate · Leads the worldwide church' }], img: '/images/Josiah Ositelu.jpg' },
  { id: 'ogunbade', ic: '🏺', name: 'The Ogunbade Family', compound: 'Gbenlokun Compound', ward: 'Agbejoye / Fadagbuwa Ruling House', tag: 'Royal · 38-Year Reign', tagClass: 'tag-terra', accent: '#7A2E0E', summary: 'Producers of Ogere Remo\'s longest-serving modern monarch — Oba Oladele Ogunbade.', desc: 'Oba Oladele Ogunbade reigned for over 38 years — the longest modern reign in Ogere\'s recorded history — until his passing on April 10, 2022, at age 85.', members: [{ n: 'Oba Oladele Moshood Ogunbade', r: 'Agbejoye II · r. December 3, 1983 – April 10, 2022' }, { n: 'Palace Archives (2008)', r: 'Primary historical source on Ogere Remo\'s ancient history' }], img: '/images/OLOGERE-OF-OGERE-OBA OGUNBADE.jpg' },
];

export default function FamiliesPage() {
  const [active, setActive] = useState(null);

  return (
    <div>
      <SEO title="Notable Families" description="The founding and notable families of Ogere Remo including the Agbato, Babington-Ashaye, Ositelu, and Ogunbade families." />
      <Hero ey="Lineage & Legacy" ti="Notable Families of Ogere Remo" sub="The great houses — royal, spiritual, civic — whose names are woven into the very streets, institutions, and soul of Ogereland." />
      <AdireDivider />
      <Section bg="#1a0d06" py="3rem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
          {families.map(f => (
            <button key={f.id} onClick={() => setActive(active === f.id ? null : f.id)}
              style={{ background: active === f.id ? 'rgba(201,150,58,.12)' : 'rgba(201,150,58,.04)', border: `1px solid ${active === f.id ? 'rgba(201,150,58,.55)' : 'rgba(201,150,58,.15)'}`, borderTop: `3px solid ${f.accent}`, padding: '1.4rem', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{f.ic}</div>
              <div className="playfair" style={{ fontSize: '1rem', color: '#F5EDD8', lineHeight: 1.2, marginBottom: '.3rem' }}>{f.name}</div>
              <div className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.09em', color: 'rgba(201,150,58,.55)', textTransform: 'uppercase', marginBottom: '.6rem' }}>{f.compound}</div>
              <span className={`tag ${f.tagClass}`} style={{ fontSize: '.46rem' }}>{f.tag}</span>
            </button>
          ))}
        </div>
      </Section>

      {families.map(f => active === f.id && (
        <Section key={f.id} bg="#2c1a0e">
          <div style={{ borderTop: `4px solid ${f.accent}`, background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.2)', padding: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                <div style={{ fontSize: '3rem', flexShrink: 0 }}>{f.ic}</div>
                <div style={{ flex: 1 }}>
                  <span className={`tag ${f.tagClass}`} style={{ marginBottom: '.5rem', display: 'inline-block' }}>{f.tag}</span>
                  <div className="playfair" style={{ fontSize: '1.6rem', color: '#F5EDD8', lineHeight: 1.15, marginBottom: '.25rem' }}>{f.name}</div>
                  <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.12em', color: 'rgba(201,150,58,.6)', textTransform: 'uppercase' }}>{f.compound} · {f.ward}</div>
                </div>
              </div>
              {f.img && (
                <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #C9963A', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                  <img src={f.img} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div style={{ background: 'rgba(201,150,58,.08)', borderLeft: '4px solid #C9963A', padding: '1rem 1.4rem', marginBottom: '1.8rem', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '1rem', color: '#F0D080', lineHeight: 1.7 }}>{f.summary}</div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.92, color: 'rgba(245,237,216,.72)', marginBottom: '2rem' }}>{f.desc}</p>
            <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.18em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '1rem' }}>Key Members & Legacy</div>
            <div style={{ display: 'grid', gap: '.7rem' }}>
              {f.members.map((m, mi) => (
                <div key={mi} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.2rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.12)', borderLeft: `3px solid ${f.accent}`, alignItems: 'flex-start' }}>
                  <span style={{ color: f.accent, fontSize: '1rem', flexShrink: 0, marginTop: '.1rem' }}>›</span>
                  <div>
                    <div style={{ fontSize: '.88rem', color: '#F5EDD8', marginBottom: '.2rem' }}>{m.n}</div>
                    <div style={{ fontSize: '.76rem', color: 'rgba(245,237,216,.48)', lineHeight: 1.6 }}>{m.r}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn-o" onClick={() => setActive(null)}>Close ✕</button>
            </div>
          </div>
        </Section>
      ))}
      <AdireDivider />
    </div>
  );
}
