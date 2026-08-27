import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbInsert } from '../services/db';

const CARD_TYPES = [
  {
    id: 'indigene',
    label: 'Full Indigene',
    color: '#C9963A',
    bg: 'linear-gradient(135deg, #1a0d06 0%, #2c1500 50%, #1a0d06 100%)',
    badge: '🟡 INDIGENE',
    border: '#C9963A',
    desc: 'Born to Ogere parents with registered compound',
    icon: '👑',
  },
  {
    id: 'resident',
    label: 'Non-Indigene Resident',
    color: '#4A90D9',
    bg: 'linear-gradient(135deg, #0a1929 0%, #0d2240 50%, #0a1929 100%)',
    badge: '🔵 RESIDENT',
    border: '#4A90D9',
    desc: 'Resident in Ogere, contributing community member',
    icon: '🏘️',
  },
  {
    id: 'diaspora',
    label: 'Diaspora Member',
    color: '#22c55e',
    bg: 'linear-gradient(135deg, #071a0e 0%, #0d2e1a 50%, #071a0e 100%)',
    badge: '🟢 DIASPORA',
    border: '#22c55e',
    desc: 'Ogere son/daughter living outside Nigeria',
    icon: '🌍',
  },
  {
    id: 'honorary',
    label: 'Honorary Citizen',
    color: '#e879f9',
    bg: 'linear-gradient(135deg, #1a071a 0%, #2e0d2e 50%, #1a071a 100%)',
    badge: '🔴 HONORARY',
    border: '#e879f9',
    desc: 'Granted by royal approval — distinguished friend of Ogere',
    icon: '⭐',
  },
];

const QUARTERS = ['Oke-Ogere', 'Isale-Ogere', 'Idi-Iroko', 'Ago-Ogere', 'Ajura', 'Remo-North', 'Other'];
const COMPOUNDS = ['Kankanbina', 'Ejigboye', 'Agbejoye', 'Legunsen', 'Orowa', 'Olu-Iwa', 'Other'];

function generateId(type) {
  const prefix = { indigene: 'OGR', resident: 'OGR-R', diaspora: 'OGR-D', honorary: 'OGR-H' };
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix[type]}-${num}`;
}

function IdCard({ data, cardType, idNumber, photoUrl }) {
  const ct = CARD_TYPES.find(c => c.id === cardType) || CARD_TYPES[0];
  const year = new Date().getFullYear();
  const expiry = year + 3;

  return (
    <div style={{
      width: '100%',
      maxWidth: '340px',
      minHeight: '210px',
      background: ct.bg,
      border: `2px solid ${ct.border}`,
      borderRadius: '12px',
      padding: '1.2rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 0 30px ${ct.color}40, 0 20px 60px rgba(0,0,0,0.6)`,
      fontFamily: "'Cinzel', serif",
      color: '#F5EDD8',
      flexShrink: 0,
      boxSizing: 'border-box',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(45deg, ${ct.color} 0, ${ct.color} 1px, transparent 0, transparent 50%)`,
        backgroundSize: '14px 14px',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: ct.color, textTransform: 'uppercase', marginBottom: '2px' }}>
            Kingdom of Ogereland
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1 }}>
            OGERE REMO
          </div>
          <div style={{ fontSize: '0.38rem', letterSpacing: '0.1em', color: 'rgba(245,237,216,0.5)', marginTop: '2px' }}>
            EST. 1401 A.D · OGUN STATE, NIGERIA
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '0.38rem', letterSpacing: '0.15em', color: ct.color,
            border: `1px solid ${ct.color}`, padding: '2px 6px', borderRadius: '2px'
          }}>
            {ct.badge}
          </div>
          <div style={{ fontSize: '1.2rem', marginTop: '4px' }}>{ct.icon}</div>
        </div>
      </div>

      <div style={{ height: '1px', background: `linear-gradient(to right, ${ct.color}, transparent)`, marginBottom: '0.8rem' }} />

      {/* Body */}
      <div style={{ display: 'flex', gap: '0.8rem', position: 'relative' }}>
        {/* Photo */}
        <div style={{
          width: '65px', height: '80px', flexShrink: 0,
          background: photoUrl ? `url(${photoUrl}) center/cover` : 'rgba(201,150,58,0.1)',
          border: `2px solid ${ct.border}`, borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
        }}>
          {!photoUrl && '👤'}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '3px', lineHeight: 1.2 }}>
            {data.fullName || 'FULL NAME'}
          </div>
          {data.compound && (
            <div style={{ fontSize: '0.42rem', color: ct.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {data.compound} Compound
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
            {[
              ['D.O.B', data.dob || '—'],
              ['Quarter', data.quarter || '—'],
              ['Issued', new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })],
              ['Expires', `${expiry}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '0.32rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: '0.52rem', letterSpacing: '0.03em' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ height: '1px', background: `linear-gradient(to right, ${ct.color}, transparent)`, margin: '0.7rem 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', color: ct.color }}>{idNumber}</div>
          <div style={{ fontSize: '0.34rem', color: 'rgba(245,237,216,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Official Community ID · Under Authority of the Ologere Throne
          </div>
        </div>
        {/* QR placeholder */}
        <div style={{
          width: '36px', height: '36px',
          background: `rgba(255,255,255,0.9)`,
          borderRadius: '3px',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', padding: '3px',
        }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ background: Math.random() > 0.5 ? '#000' : '#fff', borderRadius: '1px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IdCardPage() {
  const [step, setStep] = useState(1);
  const [cardType, setCardType] = useState('indigene');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [idNumber] = useState(() => generateId('indigene'));
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const cardRef = useRef();

  const [form, setForm] = useState({
    fullName: '', dob: '', compound: '', quarter: '',
    phone: '', email: '', address: '', occupation: '',
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoUrl(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newCard = {
      id: idNumber,
      idNumber,
      fullName: form.fullName,
      cardType,
      dob: form.dob,
      compound: form.compound,
      quarter: form.quarter,
      phone: form.phone,
      email: form.email,
      address: form.address,
      occupation: form.occupation,
      photoUrl,
      status: 'approved',
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: `${new Date().getFullYear() + 3}-01-01`,
      verifiedBy: 'HRH Ologere Palace Office',
      createdAt: new Date().toISOString(),
    };
    await dbInsert('id_cards', newCard);
    setSubmitted(true);
    setLoading(false);
    setStep(3);
  };

  const handlePrint = () => {
    const el = cardRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Ogere ID Card</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet">
      <style>body{margin:0;background:#0D0704;display:flex;justify-content:center;align-items:center;min-height:100vh;}
      @media print{body{background:#0D0704;}}</style>
      </head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  return (
    <div>
      <SEO title="Digital ID Card" description="Apply for your official Ogere Remo Digital Community Identity Card — for indigenes, residents, diaspora, and honorary citizens." />
      <Hero ey="Community Identity" ti="Ogere Digital ID Card" sub="Your official proof of belonging to the ancient Kingdom of Ogereland." dark />

      <div style={{ background: 'linear-gradient(135deg, #7A2E0E, #B5451B)', padding: '0.65rem 2rem', textAlign: 'center' }}>
        <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'white', textTransform: 'uppercase' }}>
          👑 ISSUED UNDER THE AUTHORITY OF HRH OBA JAMES OBAFEMI SALIU — KANKANBIINA II · OLOGERE OF OGERE REMO
        </span>
      </div>

      {/* Step indicator */}
      <Section bg="#0d0704" py="3rem">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '3rem' }}>
          {[['1', 'Card Type'], ['2', 'Your Details'], ['3', 'Your ID']].map(([n, l], i) => {
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: done ? 'var(--gold)' : active ? 'var(--red)' : 'rgba(201,150,58,0.1)',
                    border: `2px solid ${done || active ? 'var(--gold)' : 'rgba(201,150,58,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.4rem', fontSize: '0.9rem', fontWeight: 700,
                    fontFamily: 'var(--font-display)', color: done || active ? '#fff' : 'rgba(245,237,216,0.4)',
                    transition: 'all 0.3s ease',
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <div className="cinzel" style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: active ? 'var(--gold)' : 'rgba(245,237,216,0.4)', textTransform: 'uppercase' }}>
                    {l}
                  </div>
                </div>
                {i < 2 && <div style={{ width: '80px', height: '1px', background: done ? 'var(--gold)' : 'rgba(201,150,58,0.2)', margin: '0 0.5rem 1.4rem' }} />}
              </div>
            );
          })}
        </div>

        {/* STEP 1 — Card Type */}
        {step === 1 && (
          <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
            <p className="cinzel" style={{ textAlign: 'center', color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>SELECT YOUR STATUS</p>
            <h2 className="playfair" style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '3rem' }}>Choose Your Card Type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {CARD_TYPES.map(ct => (
                <button
                  key={ct.id}
                  onClick={() => setCardType(ct.id)}
                  className="glass card"
                  style={{
                    padding: '2rem 1.5rem', borderRadius: '12px', textAlign: 'left',
                    border: cardType === ct.id ? `2px solid ${ct.color}` : '1px solid rgba(201,150,58,0.15)',
                    background: cardType === ct.id ? `${ct.color}15` : 'var(--glass-bg)',
                    transform: cardType === ct.id ? 'translateY(-4px)' : 'none',
                    boxShadow: cardType === ct.id ? `0 10px 30px ${ct.color}30` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{ct.icon}</div>
                  <div className="cinzel" style={{ fontSize: '0.65rem', fontWeight: 700, color: ct.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    {ct.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.6 }}>{ct.desc}</div>
                  {cardType === ct.id && (
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ct.color }} />
                      <span className="cinzel" style={{ fontSize: '0.5rem', color: ct.color, letterSpacing: '0.15em' }}>SELECTED</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn-p" onClick={() => setStep(2)} style={{ fontSize: '0.75rem', padding: '1rem 3rem' }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Form */}
        {step === 2 && (
          <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
            <p className="cinzel" style={{ textAlign: 'center', color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>YOUR INFORMATION</p>
            <h2 className="playfair" style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '3rem' }}>Registration Details</h2>

            <form onSubmit={handleSubmit}>
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                {/* Photo upload */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  <div
                    onClick={() => fileRef.current.click()}
                    style={{
                      width: '120px', height: '140px', margin: '0 auto 1rem',
                      background: photoUrl ? `url(${photoUrl}) center/cover` : 'rgba(201,150,58,0.05)',
                      border: `2px dashed ${photoUrl ? 'var(--gold)' : 'rgba(201,150,58,0.3)'}`,
                      borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', transition: 'all 0.3s ease',
                    }}
                  >
                    {!photoUrl && (
                      <>
                        <span style={{ fontSize: '2.5rem' }}>📷</span>
                        <span className="cinzel" style={{ fontSize: '0.5rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.1em' }}>UPLOAD PHOTO</span>
                      </>
                    )}
                  </div>
                  {photoUrl && (
                    <button type="button" className="btn-o" onClick={() => fileRef.current.click()} style={{ fontSize: '0.6rem', padding: '0.4rem 1rem' }}>
                      Change Photo
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.2rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name *</label>
                    <input required className="inp" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="E.g. Adewale Ogunleke" />
                  </div>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date of Birth *</label>
                    <input required className="inp" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </div>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                    <input className="inp" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234..." />
                  </div>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Quarter / Area</label>
                    <select className="inp" value={form.quarter} onChange={e => set('quarter', e.target.value)} style={{ background: 'rgba(201,150,58,0.05)' }}>
                      <option value="">Select Quarter</option>
                      {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  {(cardType === 'indigene' || cardType === 'honorary') && (
                    <div>
                      <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Family Compound</label>
                      <select className="inp" value={form.compound} onChange={e => set('compound', e.target.value)} style={{ background: 'rgba(201,150,58,0.05)' }}>
                        <option value="">Select Compound</option>
                        {COMPOUNDS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                    <input className="inp" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Occupation</label>
                    <input className="inp" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="E.g. Teacher, Trader, Engineer..." />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn-o" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-p" disabled={loading} style={{ minWidth: 'min(180px, 100%)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Generating ID…' : 'Generate My ID Card →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3 — Card Preview */}
        {step === 3 && (
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ display: 'inline-block', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '50px', padding: '0.5rem 1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#86efac' }}>✅ APPLICATION SUBMITTED — PENDING ADMIN APPROVAL</span>
            </div>
            <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>YOUR DIGITAL ID CARD</p>
            <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '2rem' }}>Preview — Official Ogere ID</h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <div ref={cardRef}>
                <IdCard data={form} cardType={cardType} idNumber={idNumber} photoUrl={photoUrl} />
              </div>
            </div>

            <div className="glass" style={{ maxWidth: '500px', margin: '0 auto 2rem', padding: '1.5rem', borderRadius: '8px', textAlign: 'left' }}>
              <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '1rem' }}>WHAT HAPPENS NEXT</div>
              {[
                ['📋', 'Your application has been received by the OCDA admin team'],
                ['🔍', 'Your details will be verified within 5–7 working days'],
                ['📱', 'You will be contacted via phone or email when approved'],
                ['✅', 'Upon approval, your card becomes officially valid and can be downloaded'],
              ].map(([ic, t], i) => (
                <div key={i} style={{ display: 'flex', gap: '0.8rem', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid rgba(201,150,58,0.1)' : 'none' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ic}</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.7)', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/verify-id/${idNumber}`} className="btn-p" style={{ textDecoration: 'none' }}>
                🔍 Test Verify Online
              </Link>
              <button className="btn-o" onClick={handlePrint}>🖨️ Print / Save as PDF</button>
              <button className="btn-o" onClick={() => { setStep(1); setForm({ fullName:'',dob:'',compound:'',quarter:'',phone:'',email:'',address:'',occupation:'' }); setPhotoUrl(null); }}>
                Register Another
              </button>
            </div>
          </div>
        )}
      </Section>

      <AdireDivider />

      {/* Info Section */}
      <Section bg="var(--dark)" py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>IDENTITY & BELONGING</p>
          <h2 className="playfair" style={{ fontSize: '3rem', color: 'var(--cream)' }}>Why Get an Ogere Digital ID?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            ['🏫', 'Scholarship Applications', 'Valid proof of indigeneship for state and community scholarship applications'],
            ['👑', 'Royal Audience', 'Identification at palace events and royal audience appointments'],
            ['🗺️', 'Land & Property', 'Supporting document for land registration and boundary verification'],
            ['🌍', 'Diaspora Connection', 'Formal tie to Ogereland for sons and daughters living abroad'],
            ['🏪', 'Business Directory', 'Verified indigene or resident badge on the Ogere business directory'],
            ['🤝', 'Community Trust', 'Builds cohesion between indigenes and non-indigene residents'],
          ].map(([ic, t, d]) => (
            <div key={t} className="glass card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{ic}</div>
              <div className="cinzel" style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.5rem' }}>{t}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.7 }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
