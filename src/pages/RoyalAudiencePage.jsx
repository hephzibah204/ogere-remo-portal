import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

import { dbInsert } from '../services/db';

const APPOINTMENT_TYPES = [
  { id: 'community', icon: '👥', label: 'Community / Family Matter', desc: 'Family disputes, community concerns, or representation requests', duration: '30 min', color: '#C9963A' },
  { id: 'development', icon: '🏗️', label: 'Development Project', desc: 'Present a development proposal or infrastructure project for Ogere', duration: '45 min', color: '#4A90D9' },
  { id: 'land', icon: '📜', label: 'Land & Boundary Matter', desc: 'Land registration, boundary disputes, or property verification', duration: '45 min', color: '#e87400' },
  { id: 'chieftaincy', icon: '🎖️', label: 'Chieftaincy / Royal Recognition', desc: 'Requests for title, recognition, or royal endorsement', duration: '60 min', color: '#9B59B6' },
  { id: 'business', icon: '💼', label: 'Business & Investment Proposal', desc: 'Present investment opportunities or business partnerships', duration: '45 min', color: '#22c55e' },
  { id: 'diaspora', icon: '🌍', label: 'Diaspora Delegation Visit', desc: 'Formal visit from Ogere diaspora groups or associations', duration: '60 min', color: '#06b6d4' },
  { id: 'media', icon: '📸', label: 'Media / Photography Request', desc: 'Interviews, documentary, or official photography sessions', duration: '30 min', color: '#f43f5e' },
  { id: 'other', icon: '📋', label: 'Other Matters', desc: 'Other matters requiring royal audience or guidance', duration: '30 min', color: '#78716c' },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

// Get the next 30 weekdays excluding Sundays
function getAvailableDates() {
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 3); // Minimum 3 days notice
  while (dates.length < 20) {
    if (d.getDay() !== 0) { // exclude Sundays
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const AVAILABLE_DATES = getAvailableDates();

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RoyalAudiencePage() {
  const [viewMode, setViewMode] = useState('book'); // 'book' or 'track'
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState(() => `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  // Tracking state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedBooking, setTrackedBooking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', address: '',
    groupSize: '1', message: '', idCard: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const apt = APPOINTMENT_TYPES.find(a => a.id === selectedType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email || !form.address) {
      alert('Please fill in all required fields (Full Name, Phone, Email, and Residential Address).');
      return;
    }

    setLoading(true);
    const newBooking = {
      id: bookingRef,
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      purpose: apt?.label || 'General Royal Consultation',
      date: selectedDate,
      time: selectedTime,
      groupSize: form.groupSize,
      idCard: form.idCard,
      message: form.message,
      status: 'pending',
      notes: 'Submitted online via community portal',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/royal-audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.id) setBookingRef(data.data.id);
      }
    } catch (err) {
      console.warn('API submission failed, persisting locally:', err);
    }

    await dbInsert('royal_audiences', newBooking);
    setSubmitted(true);
    setLoading(false);
    setStep(4);
  };

  const handleTrackLookup = async (e) => {
    if (e) e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackingLoading(true);
    setTrackingError('');
    setTrackedBooking(null);

    try {
      const res = await fetch(`/api/royal-audiences?action=track&code=${encodeURIComponent(trackQuery.trim())}`);
      const json = await res.json();
      if (res.ok && json.booking) {
        setTrackedBooking(json.booking);
      } else {
        setTrackingError(json.error || 'No appointment found with this reference code or email.');
      }
    } catch {
      setTrackingError('Network error checking appointment status. Please try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const steps = [
    { n: '1', l: 'Purpose' },
    { n: '2', l: 'Date & Time' },
    { n: '3', l: 'Your Details' },
    { n: '4', l: 'Confirmation' },
  ];

  return (
    <div>
      <SEO title="Royal Audience — Book Appointment" description="Book a formal appointment with HRH Oba James Obafemi Saliu, the Ologere of Ogere Remo, through the official Ogere Community Portal." />
      <Hero
        ey="Royal Palace"
        ti="Book a Royal Audience"
        sub="Request a formal appointment with HRH Oba James Obafemi Saliu — Kankanbiina II, the Ologere of Ogere Remo."
        dark
      />

      {/* Royal announcement banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a0d06, #2c1500)', padding: '1rem 2rem', borderBottom: '1px solid rgba(201,150,58,0.3)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <img
            src="/images/Ologere-Oba-James-Obafemi1.jpg"
            alt="HRH Oba James Obafemi Saliu"
            style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div>
            <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Receiving Audiences</div>
            <div className="playfair" style={{ fontSize: '1rem', color: 'var(--cream)' }}>HRH Oba James Obafemi Saliu — Kankanbiina II · Ologere of Ogere Remo</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.5)' }}>Palace Hours</div>
            <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>Mon – Sat · 9AM – 5PM</div>
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div style={{ background: '#090503', borderBottom: '1px solid rgba(201,150,58,0.2)', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('book')}
            style={{
              padding: '0.65rem 1.6rem',
              borderRadius: '999px',
              border: viewMode === 'book' ? '2px solid var(--gold)' : '1px solid rgba(201,150,58,0.3)',
              background: viewMode === 'book' ? 'linear-gradient(135deg, rgba(201,150,58,0.25), rgba(181,69,27,0.3))' : 'rgba(255,255,255,0.02)',
              color: viewMode === 'book' ? 'var(--gold)' : 'rgba(245,237,216,0.7)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>👑</span> Request Royal Audience
          </button>
          <button
            onClick={() => setViewMode('track')}
            style={{
              padding: '0.65rem 1.6rem',
              borderRadius: '999px',
              border: viewMode === 'track' ? '2px solid var(--gold)' : '1px solid rgba(201,150,58,0.3)',
              background: viewMode === 'track' ? 'linear-gradient(135deg, rgba(201,150,58,0.25), rgba(181,69,27,0.3))' : 'rgba(255,255,255,0.02)',
              color: viewMode === 'track' ? 'var(--gold)' : 'rgba(245,237,216,0.7)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🔍</span> Track Appointment Status
          </button>
        </div>
      </div>

      <Section bg="#0d0704" py="3rem">
        {viewMode === 'track' ? (
          <div style={{ maxWidth: '750px', margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '0.8rem' }}>PALACE SECRETARIAT TRACKER</p>
              <h2 className="playfair" style={{ fontSize: '2.4rem', color: 'var(--cream)', marginBottom: '0.8rem' }}>Track Your Audience Status</h2>
              <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.88rem' }}>
                Enter your booking reference number (e.g. <code>AUD-2026-XXXX</code>) or registered email address to check royal scheduling decisions and gate passes.
              </p>
            </div>

            <form onSubmit={handleTrackLookup} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <input
                required
                className="inp"
                value={trackQuery}
                onChange={e => setTrackQuery(e.target.value)}
                placeholder="Enter Reference (e.g. AUD-2026-8794) or your Email"
                style={{ flex: '1 1 300px', fontSize: '0.9rem', padding: '0.9rem 1.2rem' }}
              />
              <button
                type="submit"
                className="btn-p"
                disabled={trackingLoading}
                style={{ padding: '0.9rem 2rem', opacity: trackingLoading ? 0.7 : 1 }}
              >
                {trackingLoading ? 'Searching...' : '🔍 Check Status'}
              </button>
            </form>

            {trackingError && (
              <div style={{ padding: '1rem 1.2rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '2rem', textAlign: 'center' }}>
                {trackingError}
              </div>
            )}

            {trackedBooking && (
              <div className="glass" style={{ padding: '2rem', borderRadius: '14px', border: '1px solid rgba(201,150,58,0.35)', animation: 'fadeUp 0.3s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(201,150,58,0.15)', paddingBottom: '1rem' }}>
                  <div>
                    <span className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Royal Reference</span>
                    <h3 className="cinzel" style={{ fontSize: '1.3rem', color: 'var(--cream)', marginTop: '0.2rem' }}>{trackedBooking.reference_number || trackedBooking.reference}</h3>
                  </div>
                  <div>
                    {trackedBooking.status === 'confirmed' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#86efac', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        ● Audience Confirmed
                      </span>
                    )}
                    {trackedBooking.status === 'postponed' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', color: '#fcd34d', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        ● Rescheduled / Postponed
                      </span>
                    )}
                    {trackedBooking.status === 'declined' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        ● Respectfully Declined
                      </span>
                    )}
                    {(!trackedBooking.status || trackedBooking.status === 'pending') && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,150,58,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        ⏳ Under Palace Review
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.5rem', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase' }}>Applicant</div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: 600 }}>{trackedBooking.full_name || trackedBooking.applicant}</div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.5rem', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase' }}>Purpose</div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{trackedBooking.purpose}</div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.5rem', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase' }}>Confirmed / Scheduled Date</div>
                    <div style={{ color: 'var(--gold)', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: 600 }}>
                      {trackedBooking.confirmed_date || trackedBooking.scheduled_date || 'Pending Final Confirmation'}
                    </div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.5rem', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase' }}>Palace Chamber</div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      {trackedBooking.palace_chamber || 'To Be Assigned Upon Arrival'}
                    </div>
                  </div>
                </div>

                {trackedBooking.status === 'confirmed' && (
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
                    <div className="cinzel" style={{ fontSize: '0.58rem', color: '#86efac', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>👑 Palace Official Instructions</div>
                    <p style={{ color: 'rgba(245,237,216,0.85)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      {trackedBooking.notes || 'Please arrive 15 minutes ahead of scheduled time in formal traditional Yoruba attire. Present this digital screen or your confirmation reference at the Inner Palace Gate.'}
                    </p>
                  </div>
                )}

                {trackedBooking.status === 'postponed' && (
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
                    <div className="cinzel" style={{ fontSize: '0.58rem', color: '#fcd34d', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>⚠️ Rescheduling Notice</div>
                    <p style={{ color: 'rgba(245,237,216,0.85)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      {trackedBooking.postponed_reason || 'Due to urgent traditional state matters, your audience has been shifted to the revised date above.'}
                    </p>
                  </div>
                )}

                {trackedBooking.status === 'declined' && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
                    <div className="cinzel" style={{ fontSize: '0.58rem', color: '#fca5a5', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Palace Secretariat Response</div>
                    <p style={{ color: 'rgba(245,237,216,0.85)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      {trackedBooking.decline_reason || 'The Palace expresses its warm royal regards. However, due to royal calendar constraints, this audience cannot be accommodated at this time.'}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => window.print()} className="btn-o" style={{ fontSize: '0.75rem', padding: '0.5rem 1.2rem' }}>
                    🖨️ Print Pass
                  </button>
                  <button onClick={() => setViewMode('book')} className="btn-p" style={{ fontSize: '0.75rem', padding: '0.5rem 1.2rem' }}>
                    Book Another Audience
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Step bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '3.5rem' }}>
              {steps.map(({ n, l }, i) => {
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
                        margin: '0 auto 0.4rem', fontSize: '0.9rem',
                        fontFamily: 'var(--font-display)', color: done || active ? '#fff' : 'rgba(245,237,216,0.4)',
                        fontWeight: 700, transition: 'all 0.3s ease',
                      }}>
                        {done ? '✓' : n}
                      </div>
                      <div className="cinzel" style={{ fontSize: '0.5rem', letterSpacing: '0.12em', color: active ? 'var(--gold)' : 'rgba(245,237,216,0.4)', textTransform: 'uppercase' }}>{l}</div>
                    </div>
                    {i < steps.length - 1 && <div style={{ width: 'clamp(15px, 4vw, 60px)', height: '1px', background: done ? 'var(--gold)' : 'rgba(201,150,58,0.2)', margin: '0 0.5rem 1.4rem' }} />}
                  </div>
                );
              })}
            </div>

            {/* STEP 1 — Select purpose */}
            {step === 1 && (
              <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
                <p className="cinzel" style={{ textAlign: 'center', color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>STEP 1 OF 3</p>
                <h2 className="playfair" style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '0.8rem' }}>Nature of Your Request</h2>
                <p style={{ textAlign: 'center', color: 'rgba(245,237,216,0.5)', fontSize: '0.9rem', marginBottom: '3rem' }}>
                  Select the category that best describes your reason for requesting a royal audience.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                  {APPOINTMENT_TYPES.map(apt => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedType(apt.id)}
                      className="glass"
                      style={{
                        padding: '1.5rem', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                        border: selectedType === apt.id ? `2px solid ${apt.color}` : '1px solid rgba(201,150,58,0.15)',
                        background: selectedType === apt.id ? `${apt.color}15` : 'var(--glass-bg)',
                        transform: selectedType === apt.id ? 'translateY(-3px)' : 'none',
                        boxShadow: selectedType === apt.id ? `0 8px 25px ${apt.color}25` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{apt.icon}</div>
                      <div className="cinzel" style={{ fontSize: '0.6rem', fontWeight: 700, color: apt.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        {apt.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.5)', lineHeight: 1.6, marginBottom: '0.8rem' }}>{apt.desc}</div>
                      <div className="cinzel" style={{ fontSize: '0.48rem', color: 'rgba(201,150,58,0.5)', letterSpacing: '0.1em' }}>⏱ {apt.duration}</div>
                      {selectedType === apt.id && (
                        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: apt.color }} />
                          <span className="cinzel" style={{ fontSize: '0.45rem', color: apt.color, letterSpacing: '0.15em' }}>SELECTED</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button
                    className="btn-p"
                    disabled={!selectedType}
                    onClick={() => setStep(2)}
                    style={{ opacity: selectedType ? 1 : 0.4, fontSize: '0.75rem', padding: '1rem 3rem' }}
                  >
                    Choose Date & Time →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Date & Time */}
            {step === 2 && (
              <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
                <p className="cinzel" style={{ textAlign: 'center', color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>STEP 2 OF 3</p>
                <h2 className="playfair" style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '2.5rem' }}>Select Date & Time</h2>

                {apt && (
                  <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: `4px solid ${apt.color}` }}>
                    <span style={{ fontSize: '1.5rem' }}>{apt.icon}</span>
                    <div>
                      <div className="cinzel" style={{ fontSize: '0.6rem', color: apt.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Selected Purpose</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>{apt.label}</div>
                    </div>
                    <button className="btn-o" onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '0.4rem 1rem' }}>Change</button>
                  </div>
                )}

                <div className="glass" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    Available Dates (Minimum 3 days advance notice required)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem', marginBottom: '2rem' }}>
                    {AVAILABLE_DATES.slice(0, 12).map((d, i) => {
                      const iso = d.toISOString().split('T')[0];
                      const sel = selectedDate === iso;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(iso)}
                          style={{
                            padding: '0.8rem', borderRadius: '6px', cursor: 'pointer',
                            border: sel ? '2px solid var(--gold)' : '1px solid rgba(201,150,58,0.2)',
                            background: sel ? 'rgba(201,150,58,0.15)' : 'rgba(201,150,58,0.03)',
                            textAlign: 'center', transition: 'all 0.2s ease',
                          }}
                        >
                          <div className="cinzel" style={{ fontSize: '0.5rem', color: sel ? 'var(--gold)' : 'rgba(245,237,216,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                            {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: sel ? 'var(--gold)' : 'var(--cream)' }}>
                            {d.getDate()}
                          </div>
                          <div className="cinzel" style={{ fontSize: '0.45rem', color: sel ? 'var(--gold)' : 'rgba(245,237,216,0.35)', letterSpacing: '0.08em' }}>
                            {d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Available Time Slots</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
                    {TIME_SLOTS.map(t => {
                      const sel = selectedTime === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          style={{
                            padding: '0.8rem', borderRadius: '6px', cursor: 'pointer',
                            border: sel ? '2px solid var(--gold)' : '1px solid rgba(201,150,58,0.2)',
                            background: sel ? 'rgba(201,150,58,0.15)' : 'rgba(201,150,58,0.03)',
                            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
                            color: sel ? 'var(--gold)' : 'var(--cream)', transition: 'all 0.2s ease',
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-o" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn-p"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(3)}
                    style={{ opacity: (selectedDate && selectedTime) ? 1 : 0.4 }}
                  >
                    Enter Your Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Personal details */}
            {step === 3 && (
              <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
                <p className="cinzel" style={{ textAlign: 'center', color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>STEP 3 OF 3</p>
                <h2 className="playfair" style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '2.5rem' }}>Your Information</h2>

                {/* Booking summary */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', borderLeft: '4px solid var(--gold)' }}>
                  <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>Booking Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                    {[
                      ['Purpose', apt?.label || '—'],
                      ['Date', selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
                      ['Time', selectedTime || '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="cinzel" style={{ fontSize: '0.45rem', color: 'rgba(201,150,58,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--cream)', marginTop: '3px' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="glass" style={{ padding: 'clamp(1.2rem, 4vw, 2.5rem)', borderRadius: '12px', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.2rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name *</label>
                        <input required className="inp" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full legal name" />
                      </div>
                      <div>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number *</label>
                        <input required className="inp" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234..." />
                      </div>
                      <div>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address * (For Royal Confirmation Pass)</label>
                        <input required className="inp" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="applicant@example.com" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Residential / Diaspora Address *</label>
                        <input required className="inp" value={form.address} onChange={e => set('address', e.target.value)} placeholder="House number, Street name, City, State / Country" />
                      </div>
                      <div>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Number in Group</label>
                        <select className="inp" value={form.groupSize} onChange={e => set('groupSize', e.target.value)} style={{ background: 'rgba(201,150,58,0.05)' }}>
                          {['1','2','3','4','5','6+'].map(n => <option key={n} value={n}>{n} {n === '1' ? 'person' : 'people'}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ogere ID Card Number</label>
                        <input className="inp" value={form.idCard} onChange={e => set('idCard', e.target.value)} placeholder="OGR-XXXXXX (if you have one)" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Purpose of Visit & Matters for the Oba *</label>
                        <textarea
                          required className="inp"
                          value={form.message} onChange={e => set('message', e.target.value)}
                          placeholder="Please describe the purpose of your visit and key matters to discuss with HRH (max 300 words)..."
                          rows={5}
                          maxLength={1500}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '1.2rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', background: 'rgba(181,69,27,0.08)', borderColor: 'rgba(181,69,27,0.3)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.8 }}>
                      <strong style={{ color: 'var(--gold)' }}>Palace Protocol:</strong> Please arrive 15 minutes before your scheduled time. Dress respectfully — traditional attire is encouraged. Official confirmation or rescheduling updates will be sent directly to your email address and accessible via the Palace Tracker above.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn-o" onClick={() => setStep(2)}>← Back</button>
                    <button type="submit" className="btn-p" disabled={loading} style={{ minWidth: 'min(220px, 100%)', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Submitting Request…' : '👑 Submit Booking Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4 — Confirmation */}
            {step === 4 && (
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👑</div>
                <div style={{ display: 'inline-block', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '50px', padding: '0.5rem 1.5rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#86efac' }}>✅ REQUEST SUBMITTED TO PALACE SECRETARIAT</span>
                </div>
                <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '1rem' }}>Request Received</h2>
                <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  Your royal audience dossier has been forwarded to the Palace Secretariat. An official acknowledgement has been sent to <strong style={{ color: 'var(--gold)' }}>{form.email}</strong>. Keep your reference number safe.
                </p>

                <div className="glass" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left', borderLeft: '4px solid var(--gold)' }}>
                  <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Royal Booking Reference</div>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {[
                      ['Reference Number', refNum],
                      ['Applicant', form.fullName],
                      ['Email', form.email],
                      ['Address', form.address],
                      ['Purpose', apt?.label || '—'],
                      ['Requested Date', selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                      ['Requested Time', selectedTime],
                      ['Status', '⏳ Pending Palace Review & Confirmation'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(201,150,58,0.1)' }}>
                        <span className="cinzel" style={{ fontSize: '0.55rem', color: 'rgba(245,237,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--cream)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-o" onClick={() => window.print()}>🖨️ Print Reference</button>
                  <button
                    className="btn-p"
                    onClick={() => {
                      setStep(1);
                      setSelectedType(null);
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setForm({ fullName:'',phone:'',email:'',address:'',groupSize:'1',message:'',idCard:'' });
                      setViewMode('track');
                      setTrackQuery(refNum);
                    }}
                  >
                    Track This Appointment →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Section>

      <AdireDivider />

      <Section bg="var(--dark)" py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>PALACE INFORMATION</p>
          <h2 className="playfair" style={{ fontSize: '3rem', color: 'var(--cream)' }}>Before You Visit the Palace</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            ['👔', 'Dress Code', 'Traditional Yoruba attire is strongly encouraged and shows respect for the throne. Business formal is acceptable.'],
            ['⏰', 'Arrive Early', 'Please arrive at least 15 minutes before your appointment. Late arrivals may forfeit their slot.'],
            ['📵', 'Protocol', 'Phones must be silenced. Greet the Oba in the traditional Yoruba manner — men prostrate, women kneel.'],
            ['🎁', 'Kolanut Tradition', 'Bringing kolanut is a respected traditional gesture when seeking an audience with the Ologere.'],
            ['👥', 'Delegations', 'For group visits of 4 or more, please notify the secretariat in advance so arrangements can be made.'],
            ['📞', 'Contact Palace', 'For urgent matters, contact the OCDA team via the Contact page before submitting this form.'],
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
