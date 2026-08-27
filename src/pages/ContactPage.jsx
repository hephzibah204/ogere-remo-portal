import { useState, useEffect } from 'react';
import { dbGet, dbSet } from '../services/storage';
import { sendAnthropicMessage } from '../services/api';
import { getSession } from '../services/auth';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

const SUBJECTS = ['General Enquiry', 'History & Heritage', 'Tourism', 'Business Registration', 'Association Registration', 'Security Report (Non-Emergency)', 'News Submission', 'Diaspora Network', 'OCDA', 'OYDA', 'Other'];

export default function ContactPage() {
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [aiMsg, setAiMsg] = useState('');

  const send = async () => {
    if (!f.name || !f.email || !f.message) return;
    setBusy(true);
    const secSubject = f.subject.toLowerCase().includes('security');
    const bizSubject = f.subject.toLowerCase().includes('business');
    let sysMsg = 'You are the Ogere Remo contact centre assistant. Write a warm 3-4 sentence auto-reply.';
    if (secSubject) sysMsg += ' Remind them to call 112 for emergencies.';
    if (bizSubject) sysMsg += ' Mention the free Business Directory page.';
    sysMsg += ' End with a Yoruba phrase. Plain text only.';

    const msg = await sendAnthropicMessage(sysMsg, `Name: ${f.name}, Subject: ${f.subject}, Message: ${f.message}`);
    setAiMsg(msg || 'Thank you for your message! We will respond within 2-3 working days. Ẹ ṣéun!');

    const session = await getSession();
    const entry = { ...f, date: new Date().toLocaleDateString('en-NG'), id: Date.now(), userId: session?.id || '' };
    const existing = await dbGet('msgs') || [];
    existing.push(entry);
    await dbSet('msgs', existing);
    setDone(true); setBusy(false);
    setF({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
  };

  return (
    <div>
      <SEO title="Contact" description="Contact information for Ogere Remo community — Ologere Palace, OCDA, emergency services, and community associations." />
      <Hero ey="Get in Touch" ti="Contact Ogere Remo" sub="Reach our community team, submit news, register your business or association, or ask us anything." />
      <AdireDivider />
      <div style={{ background: 'rgba(90,16,16,.25)', borderTop: '3px solid #dc2626', borderBottom: '1px solid rgba(220,38,38,.3)', padding: '1rem 2rem', textAlign: 'center' }}>
        <span className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.16em', color: '#f87171', textTransform: 'uppercase' }}>⚠ For emergencies — call 112 · Free · 24 hours · Do not use this form for emergencies</span>
      </div>
      <Section bg="#1a0d06">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2rem', alignItems: 'start' }}>
          <div>
            <p className="sl">Directory</p>
            <h2 className="st" style={{ marginBottom: '2rem', fontSize: '1.6rem' }}>Community Contacts</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { n: 'Ologere Palace', ic: '👑', desc: 'Seat of the Ologere of Ogere Remo', addr: 'Opposite Church of Lord Aladura, Ogere Remo', email: 'info@ogereremo.ng' },
                { n: 'OCDA Headquarters', ic: '🏛️', desc: 'Ogere Community Development Association', addr: 'Ogere Town Hall, Ogere Remo', email: 'info@ogereremo.ng' },
                { n: 'OYDA', ic: '🌱', desc: 'Ogere Youth Development Association', addr: 'Town Hall, Oja Ale', email: 'oydaogere@gmail.com' },
                { n: 'Security Alerts', ic: '⚠️', desc: 'Non-emergency security concerns only', addr: 'Ogere Remo Security Network', email: 'alerts@ogereremo.ng' },
                { n: 'OMCOOSA', ic: '🎓', desc: 'Ositelu Memorial College Old Students Assoc.', addr: 'Arc. Kunle Awobajo · 08037136954', email: 'awobajoolakunle@gmail.com' },
              ].map((c, i) => (
                <div key={i} style={{ padding: '1.3rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderLeft: '3px solid #C9963A' }}>
                  <div style={{ display: 'flex', gap: '.8rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{c.ic}</span>
                    <div>
                      <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.2rem' }}>{c.n}</div>
                      <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.5)', marginBottom: '.15rem' }}>{c.desc}</div>
                      <div style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)' }}>📍 {c.addr}</div>
                      <div style={{ fontSize: '.72rem', color: 'rgba(201,150,58,.65)' }}>📧 {c.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="sl">Send a Message</p>
            <h2 className="st" style={{ marginBottom: '.6rem', fontSize: '1.6rem' }}>Contact Form</h2>
            <p style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.45)', marginBottom: '1.8rem' }}>Please allow 2–3 working days for a response. For emergencies, call 112.</p>
            {done ? (
              <div style={{ background: 'rgba(45,74,34,.15)', border: '1px solid rgba(45,74,34,.4)', borderLeft: '4px solid #2D4A22', padding: '2.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.7rem' }}>✅</div>
                <div className="cinzel" style={{ fontSize: '.64rem', letterSpacing: '.18em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '.8rem' }}>Message Received</div>
                <div style={{ fontSize: '.87rem', lineHeight: 1.85, color: 'rgba(245,237,216,.72)', fontStyle: 'italic', marginBottom: '1.5rem' }}>{aiMsg}</div>
                <button className="btn-o" onClick={() => setDone(false)}>Send Another Message</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[['Full Name *', 'text', 'name', 'Your full name'], ['Email Address *', 'email', 'email', 'your@email.com'], ['Phone (optional)', 'tel', 'phone', '+234 or international']].map(([l, t, k, ph]) => (
                  <div key={k}>
                    <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.28rem' }}>{l}</div>
                    <input type={t} className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} />
                  </div>
                ))}
                <div>
                  <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.28rem' }}>Subject *</div>
                  <select className="inp" value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} style={{ cursor: 'pointer' }}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.28rem' }}>Message *</div>
                  <textarea className="inp" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} placeholder="Write your message here…" style={{ minHeight: 140, resize: 'vertical' }} />
                </div>
                <button className="btn-p" onClick={send} disabled={busy || !f.name || !f.email || !f.message} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {busy ? <><Spinner />Sending…</> : 'Send Message →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
