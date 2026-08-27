import { useState } from 'react';
import { MAP_LOCATIONS, CAT_COLORS } from '../data/mapLocations';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const toX = (lng) => Math.round(((lng - 3.580) / (3.646 - 3.580)) * 740 + 30);
const toY = (lat) => Math.round(((6.942 - lat) / (6.942 - 6.883)) * 360 + 30);

export default function MapPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const cats = ['All', ...Array.from(new Set(MAP_LOCATIONS.map(l => l.cat)))];
  const shown = MAP_LOCATIONS.filter(l => filter === 'All' || l.cat === filter);

  return (
    <div>
      <SEO title="Map" description="Interactive map of Ogere Remo showing landmarks, businesses, schools, emergency services, and points of interest." />
      <Hero ey="Find Your Way" ti="Ogere Remo Map" sub="Interactive map of verified landmarks, institutions, emergency services, and attractions." />
      <AdireDivider />
      <Section bg="#0d0704" py="2rem">
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {cats.map(c => (
            <button key={c} onClick={() => { setFilter(c); setSelected(null); }} style={{
              fontFamily: "'Cinzel',serif", fontSize: '.56rem', letterSpacing: '.1em', textTransform: 'uppercase',
              padding: '.3rem .85rem', cursor: 'pointer',
              border: `1px solid ${filter === c ? (CAT_COLORS[c] || '#C9963A') : 'rgba(201,150,58,.2)'}`,
              color: filter === c ? (CAT_COLORS[c] || '#C9963A') : 'rgba(245,237,216,.45)',
              background: filter === c ? 'rgba(201,150,58,.08)' : 'transparent',
            }}>{c}</button>
          ))}
        </div>
      </Section>
      <Section bg="#1a0d06" py="3rem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <div style={{ background: 'rgba(13,7,4,.8)', border: '1px solid rgba(201,150,58,.25)', borderTop: '3px solid #C9963A', overflow: 'hidden' }}>
              <div style={{ padding: '.8rem 1.2rem', borderBottom: '1px solid rgba(201,150,58,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.15em', color: '#C9963A', textTransform: 'uppercase' }}>Ogere Remo — Ikenne LGA · 6°47′N, 3°34′E</div>
                <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,.4)' }}>Click a pin</div>
              </div>
              <svg viewBox="0 0 800 420" style={{ width: '100%', display: 'block', cursor: 'default' }}>
                <defs>
                  <radialGradient id="terrain" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#1e2e15" stopOpacity=".9" />
                    <stop offset="100%" stopColor="#1a0d06" stopOpacity=".95" />
                  </radialGradient>
                </defs>
                <rect width="800" height="420" fill="url(#terrain)" />
                <path d="M 0,200 Q 200,195 400,200 Q 600,205 800,200" fill="none" stroke="rgba(255,200,80,.35)" strokeWidth="6" />
                <text x="60" y="192" fill="rgba(255,200,80,.5)" fontSize="9" fontFamily="'Cinzel',serif">LAGOS–IBADAN EXPRESSWAY</text>
                <path d="M 120,0 Q 125,200 120,420" fill="none" stroke="rgba(200,160,80,.22)" strokeWidth="4" strokeDasharray="8,4" />
                <ellipse cx="650" cy="120" rx="60" ry="35" fill="rgba(45,74,34,.3)" stroke="rgba(45,74,34,.5)" strokeWidth="1" />
                <text x="665" y="124" fill="rgba(168,216,142,.5)" fontSize="9" fontFamily="'Cinzel',serif" textAnchor="middle">THE HILLS</text>
                <g transform="translate(750,40)">
                  <circle r="18" fill="rgba(44,26,14,.8)" stroke="rgba(201,150,58,.4)" strokeWidth="1" />
                  <polygon points="0,-14 3,-4 -3,-4" fill="#C9963A" />
                  <text y="-16" textAnchor="middle" fill="#C9963A" fontSize="9" fontFamily="'Cinzel',serif" fontWeight="bold">N</text>
                </g>
                {shown.map(loc => {
                  const x = toX(loc.lng);
                  const y = toY(loc.lat);
                  const isSel = selected && selected.id === loc.id;
                  return (
                    <g key={loc.id} onClick={() => setSelected(loc)} style={{ cursor: 'pointer' }}>
                      {isSel && <circle cx={x} cy={y} r="22" fill="none" stroke={loc.color} strokeWidth="1.5" opacity=".5"><animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".6;0;.6" dur="2s" repeatCount="indefinite" /></circle>}
                      <ellipse cx={x + 2} cy={y + 18} rx="8" ry="3" fill="rgba(0,0,0,.4)" />
                      <path d={`M${x},${y - 2} C${x - 12},${y - 14} ${x - 12},${y - 26} ${x},${y - 28} C${x + 12},${y - 26} ${x + 12},${y - 14} ${x},${y - 2} Z`} fill={isSel ? loc.color : 'rgba(44,26,14,.9)'} stroke={loc.color} strokeWidth={isSel ? '2' : '1.5'} />
                      <text x={x} y={y - 12} textAnchor="middle" fontSize="11" style={{ pointerEvents: 'none' }}>{loc.icon}</text>
                      <rect x={x - 38} y={y + 4} width="76" height="13" rx="2" fill="rgba(13,7,4,.85)" stroke={isSel ? loc.color : 'rgba(201,150,58,.25)'} strokeWidth={isSel ? '1' : '0.5'} />
                      <text x={x} y={y + 14} textAnchor="middle" fill={isSel ? loc.color : 'rgba(245,237,216,.8)'} fontSize="8" fontFamily="'Cinzel',serif" style={{ pointerEvents: 'none' }}>{loc.name.length > 16 ? loc.name.slice(0, 15) + '…' : loc.name}</text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ padding: '.8rem 1.2rem', borderTop: '1px solid rgba(201,150,58,.1)', display: 'flex', flexWrap: 'wrap', gap: '.8rem' }}>
                {Object.entries(CAT_COLORS).map(([cat, col]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
                    <span style={{ fontSize: '.58rem', color: 'rgba(245,237,216,.5)', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem 1.2rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
              <div style={{ fontSize: '.8rem', color: 'rgba(245,237,216,.55)' }}>📍 View the full Google Maps version</div>
              <a href="https://maps.google.com/?q=Ogere+Remo,+Ogun+State,+Nigeria" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', textDecoration: 'none', border: '1px solid rgba(201,150,58,.35)', padding: '.4rem .9rem' }}>Open in Google Maps →</a>
            </div>
          </div>
          <div>
            {selected ? (
              <div style={{ background: 'rgba(44,26,14,.9)', border: `1px solid ${selected.color}60`, borderTop: `3px solid ${selected.color}`, padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.2rem' }}>{selected.icon}</div>
                  <button className="btn-o" style={{ fontSize: '.52rem', padding: '.3rem .7rem' }} onClick={() => setSelected(null)}>✕ Close</button>
                </div>
                <span className="tag" style={{ background: selected.color, color: '#F5EDD8', margin: 0 }}>{selected.cat}</span>
                <div className="playfair" style={{ fontSize: '1.1rem', color: '#F5EDD8', margin: '.6rem 0 .3rem', lineHeight: 1.3 }}>{selected.name}</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.45)', marginBottom: '1rem' }}>📍 {selected.address}</div>
                <div style={{ fontSize: '.83rem', lineHeight: 1.75, color: 'rgba(245,237,216,.7)', marginBottom: '1rem' }}>{selected.note}</div>
                <div style={{ borderTop: '1px solid rgba(201,150,58,.12)', paddingTop: '.8rem', display: 'grid', gap: '.5rem' }}>
                  {selected.rating && <div style={{ fontSize: '.8rem', color: '#F0D080' }}>⭐ {selected.rating}</div>}
                  {selected.phone && <div style={{ fontSize: '.8rem', color: 'rgba(245,237,216,.7)' }}>📞 {selected.phone}</div>}
                  {selected.hours && <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.6)' }}>🕐 {selected.hours}</div>}
                </div>
                <a href={selected.mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#F5EDD8', textDecoration: 'none', background: selected.color, padding: '.65rem 1rem' }}>Open in Google Maps →</a>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.15)', marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>👆</div>
                <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>Select a Location</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.45)' }}>Click any pin on the map to see details.</div>
              </div>
            )}
            <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.14em', color: 'rgba(201,150,58,.6)', textTransform: 'uppercase', marginBottom: '.7rem' }}>{shown.length} Location{shown.length !== 1 ? 's' : ''}</div>
            <div style={{ display: 'grid', gap: '.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
              {shown.map(loc => (
                <div key={loc.id} onClick={() => setSelected(loc)}
                  style={{ display: 'flex', gap: '.8rem', padding: '.85rem 1rem', background: selected?.id === loc.id ? 'rgba(201,150,58,.12)' : 'rgba(201,150,58,.04)', border: `1px solid ${selected?.id === loc.id ? 'rgba(201,150,58,.45)' : 'rgba(201,150,58,.12)'}`, borderLeft: `3px solid ${loc.color}`, cursor: 'pointer', transition: 'all .2s', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '.1rem' }}>{loc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.83rem', color: '#F5EDD8', lineHeight: 1.3, marginBottom: '.2rem' }}>{loc.name}</div>
                    <div style={{ fontSize: '.55rem', fontFamily: "'Cinzel',serif", letterSpacing: '.08em', color: loc.color, textTransform: 'uppercase' }}>{loc.cat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
