import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbInsert } from '../services/db';

const ARCHIVE = [
  {
    id: 'v1',
    title: 'Coronation Anniversary & Royal Address',
    date: 'Dec 15, 2025',
    duration: '2h 15m',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    desc: 'Full coverage of the royal thanksgiving and chieftaincy conferment ceremony at the Aafin Ologere.',
  },
  {
    id: 'v2',
    title: 'Ogere Day / Lipakala Festival Cultural Highlights',
    date: 'Nov 02, 2025',
    duration: '45m',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    desc: 'Cultural dances, masquerade processions, and royal blessings from the 49th Lipakala Day Festival.',
  },
  {
    id: 'v3',
    title: 'Town Hall Meeting on Community Security & Youth Development',
    date: 'Sep 20, 2025',
    duration: '1h 30m',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    desc: 'Deliberations with security stakeholders, community leaders, and OCDA executives on kingdom welfare.',
  },
  {
    id: 'v4',
    title: 'Official Commissioning of the New Oja Ale Wing',
    date: 'Jul 10, 2025',
    duration: '35m',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    desc: 'Ribbon-cutting and market women empowerment initiative by community benefactors.',
  },
];

export default function LivePage() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ email: '', phone: '', name: '' });
  const [notifySaved, setNotifySaved] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    await dbInsert('live_subscribers', {
      name: notifyForm.name,
      email: notifyForm.email,
      phone: notifyForm.phone,
      events: ['Lipakala Day', 'Palace Broadcasts'],
      subscribedAt: new Date().toISOString(),
    });
    setNotifySaved(true);
    setTimeout(() => {
      setShowNotifyModal(false);
      setNotifySaved(false);
      setNotifyForm({ email: '', phone: '', name: '' });
    }, 2500);
  };

  return (
    <div>
      <SEO title="Live & Video Archive" description="Watch live Ogere community events, festivals, and royal broadcasts." />
      <Hero
        ey="Palace Media"
        ti="Ogere TV & Live Events"
        sub="Connect with the homeland from anywhere in the world. Watch live streams of major events and browse our video archive."
        dark
      />

      {/* Live Stream Section */}
      <Section bg="#000000" py="4rem">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
            <span className="cinzel" style={{ color: '#ef4444', letterSpacing: '0.15em', fontWeight: 'bold' }}>UPCOMING LIVE STREAM</span>
          </div>
          
          <div
            style={{
              background: 'linear-gradient(135deg, #111, #1a0d06)',
              aspectRatio: '16/9',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(201,150,58,0.2)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>📡</div>
            <h3 className="playfair" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>
              Annual Ogere Thanksgiving & Lipakala Broadcast
            </h3>
            <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Live broadcast from Aafin Ologere Palace · Streaming begins in: <strong style={{ color: 'var(--gold)' }}>14 Days, 6 Hours</strong>
            </p>
            <button className="btn-p" onClick={() => setShowNotifyModal(true)} style={{ fontSize: '0.8rem', padding: '0.8rem 2rem' }}>
              🔔 Get Broadcast Alert (SMS & Email)
            </button>
          </div>
        </div>
      </Section>

      <AdireDivider />

      {/* Video Archive */}
      <Section bg="#0d0704" py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '0.5rem' }}>PALACE ARCHIVES</p>
          <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Video Archive</h2>
          <p style={{ color: 'rgba(245,237,216,0.6)' }}>Missed an event? Catch up on past community and royal highlights.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
          {ARCHIVE.map(v => (
            <div
              key={v.id}
              onClick={() => setActiveVideo(v)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(201,150,58,0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className="card glass"
            >
              <div style={{ aspectRatio: '16/9', background: '#1c1008', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                  <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid var(--gold)', marginLeft: '4px' }}></div>
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', color: '#fff', border: '1px solid rgba(201,150,58,0.3)' }}>
                  ⏱ {v.duration}
                </div>
              </div>
              <div style={{ padding: '1.4rem' }}>
                <h4 className="playfair" style={{ fontSize: '1.15rem', color: 'var(--cream)', marginBottom: '0.4rem', lineHeight: '1.3' }}>{v.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.6, marginBottom: '0.8rem' }}>{v.desc}</p>
                <div style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>📅 {v.date} · Click to Watch →</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          onClick={() => setActiveVideo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d0704',
              border: '2px solid var(--gold)',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>
              <div className="playfair" style={{ color: 'var(--cream)', fontSize: '1.1rem' }}>{activeVideo.title}</div>
              <button onClick={() => setActiveVideo(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ aspectRatio: '16/9', background: '#000' }}>
              <iframe
                src={activeVideo.videoUrl}
                title={activeVideo.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ padding: '1.2rem 1.5rem', background: 'rgba(201,150,58,0.05)' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.75)', lineHeight: 1.7, margin: 0 }}>{activeVideo.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Alert Capture Modal */}
      {showNotifyModal && (
        <div
          onClick={() => setShowNotifyModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2.5rem',
              borderRadius: '16px',
              borderTop: '4px solid var(--gold)',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            {notifySaved ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 className="playfair" style={{ fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>Subscribed to Broadcasts</h3>
                <p style={{ color: 'rgba(245,237,216,0.65)', fontSize: '0.85rem' }}>You will receive SMS and email notifications 30 minutes before every live palace broadcast.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔔</div>
                  <h3 className="playfair" style={{ fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '0.3rem' }}>Palace Broadcast Alerts</h3>
                  <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.8rem' }}>Never miss a royal address or community festival live stream.</p>
                </div>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Your Name</label>
                    <input required className="inp" value={notifyForm.name} onChange={e => setNotifyForm({ ...notifyForm, name: e.target.value })} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                    <input required type="email" className="inp" value={notifyForm.email} onChange={e => setNotifyForm({ ...notifyForm, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Phone Number (for SMS alert)</label>
                    <input required type="tel" className="inp" value={notifyForm.phone} onChange={e => setNotifyForm({ ...notifyForm, phone: e.target.value })} placeholder="+234..." />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button type="button" className="btn-o" onClick={() => setShowNotifyModal(false)}>Cancel</button>
                  <button type="submit" className="btn-p">Subscribe →</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <AdireDivider />
    </div>
  );
}
