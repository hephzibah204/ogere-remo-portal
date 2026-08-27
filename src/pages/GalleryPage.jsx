import { useState } from 'react';
import { photos, galleryCategories } from '../data/gallery';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

export default function GalleryPage() {
  const [cat, setCat] = useState('all');
  const [modal, setModal] = useState(null);
  const filtered = photos.filter(p => cat === 'all' || p.cat === cat);

  return (
    <div>
      <SEO title="Gallery" description="Photo gallery showcasing the heritage, monarchy, culture, and development of Ogere Remo." />
      <Hero ey="Visual History" ti="Photo Gallery" sub="Documented moments from Ogere Remo — coronations, festivals, development, and cultural heritage." />
      <AdireDivider />
      <Section bg="#1a0d06">
        <p style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.45)', marginBottom: '1.5rem', padding: '.8rem 1rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.12)', borderLeft: '3px solid rgba(201,150,58,.4)' }}>
          📸 Gallery sourced from verified news outlets, Wikipedia, YouTube, and community archives. Illustrations represent documented events.
        </p>
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {galleryCategories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ fontFamily: "'Cinzel',serif", fontSize: '.56rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '.28rem .75rem', border: `1px solid ${cat === c ? '#C9963A' : 'rgba(201,150,58,.2)'}`, color: cat === c ? '#C9963A' : 'rgba(245,237,216,.45)', background: cat === c ? 'rgba(201,150,58,.1)' : 'transparent', cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.2rem' }}>
          {filtered.map((p, i) => (
            <div key={i} onClick={() => setModal(p)} style={{ cursor: 'pointer', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', overflow: 'hidden', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,150,58,.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,150,58,.15)'; e.currentTarget.style.transform = ''; }}>
              <div style={{ height: 170, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <img src={p.src} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                <span className="tag tag-gold" style={{ position: 'absolute', top: '.7rem', right: '.7rem', margin: 0 }}>{p.cat}</span>
              </div>
              <div style={{ padding: '1.2rem' }}>
                <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.1em', color: 'rgba(201,150,58,.6)', textTransform: 'uppercase', marginBottom: '.25rem' }}>{p.date}</div>
                <div className="playfair" style={{ fontSize: '.95rem', color: '#F5EDD8', marginBottom: '.4rem', lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: '.78rem', lineHeight: 1.65, color: 'rgba(245,237,216,.55)' }}>{p.desc.slice(0, 100)}…</div>
                <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,.3)', marginTop: '.5rem' }}>📷 {p.credit}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ height: 220, background: modal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>
              <img src={modal.src} alt={modal.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
            </div>
            <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.14em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>{modal.date} · {modal.cat}</div>
            <div className="playfair" style={{ fontSize: '1.2rem', color: '#F5EDD8', marginBottom: '.8rem', lineHeight: 1.3 }}>{modal.title}</div>
            <div style={{ fontSize: '.88rem', lineHeight: 1.8, color: 'rgba(245,237,216,.7)', marginBottom: '1rem' }}>{modal.desc}</div>
            <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.4)', marginBottom: '1.5rem', padding: '.6rem .8rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.15)' }}>📷 Source: {modal.credit}</div>
            <button className="btn-o" onClick={() => setModal(null)}>Close ✕</button>
          </div>
        </div>
      )}
      <AdireDivider />
    </div>
  );
}
