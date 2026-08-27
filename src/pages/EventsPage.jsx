import { useState, useEffect } from 'react';
import { STATIC_EVENTS, eventCatColor } from '../data/events';
import { dbGet, dbSet } from '../services/storage';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

export default function EventsPage() {
  const [f, setF] = useState({ title: '', date: '', time: '', venue: '', desc: '', organiser: '', contact: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { (async () => { const d = await dbGet('events'); if (d && Array.isArray(d)) setEvents(d); })(); }, []);

  const submit = async () => {
    if (!f.title || !f.date || !f.venue) return;
    setBusy(true);
    const entry = { ...f, cat: 'community', status: 'upcoming', id: Date.now(), submitted: new Date().toLocaleDateString('en-NG'), approved: false };
    const updated = [...events, entry];
    setEvents(updated);
    await dbSet('events', updated);
    setDone(true); setBusy(false);
    setF({ title: '', date: '', time: '', venue: '', desc: '', organiser: '', contact: '' });
  };

  const all = [...STATIC_EVENTS, ...events];
  const upcoming = all.filter(e => e.status === 'upcoming');
  const past = all.filter(e => e.status === 'completed');

  return (
    <div>
      <SEO title="Events" description="Community events, festivals, and gatherings in Ogere Remo." />
      <Hero ey="What's On" ti="Events Calendar" sub="Festivals, ceremonies, community gatherings, and cultural events in Ogere Remo." />
      <AdireDivider />
      <Section bg="#1a0d06">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div><p className="sl">Upcoming Events</p><h2 className="st" style={{ margin: 0 }}>What's Coming</h2></div>
          <button className="btn-p" onClick={() => setShowForm(!showForm)}>+ Submit an Event</button>
        </div>

        {showForm && (
          <div style={{ background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.2)', padding: '2rem', marginBottom: '2.5rem', borderTop: '3px solid #C9963A' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✅</div>
                <div className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.15em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '.4rem' }}>Event Submitted</div>
                <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,.65)' }}>Your event has been submitted for review.</div>
                <button className="btn-o" style={{ marginTop: '1rem' }} onClick={() => { setDone(false); setShowForm(false); }}>Close</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1rem' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.32rem' }}>Event Title *</div>
                  <input className="inp" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Event name…" />
                </div>
                {[['Date *', 'date', 'date', ''], ['Time', 'time', 'time', ''], ['Venue *', 'text', 'venue', 'Location in Ogere Remo'], ['Organiser', 'text', 'organiser', 'Group/person organising'], ['Contact', 'text', 'contact', 'Phone or email']].map(([l, t, k, ph]) => (
                  <div key={k}>
                    <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.28rem' }}>{l}</div>
                    <input type={t} className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} />
                  </div>
                ))}
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.28rem' }}>Description</div>
                  <textarea className="inp" value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="Describe the event…" style={{ minHeight: 80, resize: 'vertical' }} />
                </div>
                <button className="btn-p" onClick={submit} disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {busy ? <><Spinner />Submitting…</> : 'Submit Event →'}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
          {upcoming.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', padding: '1.4rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.15)', borderLeft: `4px solid ${eventCatColor[ev.cat] || '#C9963A'}`, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '.2rem' }}>📅</div>
                <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.08em', color: '#C9963A', textTransform: 'uppercase' }}>{ev.date}</div>
                {ev.time && <div style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.5)', marginTop: '.15rem' }}>{ev.time}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.3rem' }}>
                  <span className="tag" style={{ background: eventCatColor[ev.cat] || '#8B6914', color: '#F5EDD8', margin: 0 }}>{ev.cat}</span>
                </div>
                <div className="playfair" style={{ fontSize: '1rem', color: '#F5EDD8', marginBottom: '.3rem', lineHeight: 1.3 }}>{ev.title}</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.5)', marginBottom: '.4rem' }}>📍 {ev.venue}</div>
                <div style={{ fontSize: '.82rem', lineHeight: 1.68, color: 'rgba(245,237,216,.62)' }}>{ev.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(201,150,58,.12)', paddingTop: '2.5rem' }}>
          <p className="sl">Archive</p>
          <h3 className="playfair" style={{ fontSize: '1.4rem', color: 'rgba(245,237,216,.6)', marginBottom: '1.5rem' }}>Past Events</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {past.map((ev, i) => (
              <div key={i} style={{ padding: '1.2rem', background: 'rgba(201,150,58,.03)', border: '1px solid rgba(201,150,58,.1)', opacity: 0.7 }}>
                <span className="tag" style={{ background: eventCatColor[ev.cat] || '#8B6914', color: '#F5EDD8' }}>{ev.cat}</span>
                <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.08em', color: 'rgba(201,150,58,.5)', textTransform: 'uppercase', marginBottom: '.2rem' }}>{ev.date}</div>
                <div className="playfair" style={{ fontSize: '.92rem', color: 'rgba(245,237,216,.7)', lineHeight: 1.3 }}>{ev.title}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
