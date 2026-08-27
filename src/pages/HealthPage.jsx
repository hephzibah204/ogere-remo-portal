import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbInsert } from '../services/db';

const FACILITIES = [
  { name: 'Ogere Primary Health Centre', type: 'Public Clinic', address: 'Health Centre Road, Ogere', phone: '08023456789', hours: '24 Hours', services: 'Maternity, Immunization, Outpatient' },
  { name: 'Alafia Private Hospital', type: 'Private Hospital', address: 'Market Road, Ogere', phone: '08034567890', hours: '24 Hours', services: 'Surgery, Diagnostics, Ward' },
  { name: 'Oluwa-Loni Pharmacy', type: 'Pharmacy', address: 'Expressway Bypass', phone: '08045678901', hours: '8am - 10pm', services: 'Prescriptions, OTC Meds' },
];

export default function HealthPage() {
  const [showBloodForm, setShowBloodForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', bloodGroup: '', phone: '', location: 'Oke-Ogere' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleBloodSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newDonor = {
      id: `BLD-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      bloodGroup: form.bloodGroup,
      phone: form.phone,
      location: form.location,
      available: true,
      registeredAt: new Date().toISOString(),
    };
    await dbInsert('blood_donors', newDonor);
    setSubmitted(true);
    setLoading(false);
    setForm({ name: '', bloodGroup: '', phone: '', location: 'Oke-Ogere' });
    setTimeout(() => { setSubmitted(false); setShowBloodForm(false); }, 4000);
  };

  return (
    <div>
      <SEO title="Community Health Directory" description="Ogere Remo medical facilities, healthcare directory, and emergency blood donor registry." />
      <Hero ey="Health & Wellness" ti="Community Health" sub="Access medical facilities in Ogere and join the life-saving community blood donor registry." dark />

      <Section bg="#0d0704" py="4rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>MEDICAL FACILITIES</p>
          <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Healthcare Directory</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
          {FACILITIES.map(f => (
            <div key={f.name} className="glass card" style={{ padding: 'clamp(1.2rem, 3vw, 2rem)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 className="playfair" style={{ fontSize: '1.3rem', color: 'var(--cream)' }}>{f.name}</h3>
                <span style={{ fontSize: '0.6rem', background: 'rgba(201,150,58,0.1)', color: 'var(--gold)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{f.type}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(245,237,216,0.6)', marginBottom: '0.5rem' }}>📍 {f.address}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(245,237,216,0.6)', marginBottom: '0.5rem' }}>⏰ {f.hours}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(245,237,216,0.6)', marginBottom: '1.5rem' }}>🩺 {f.services}</p>
              <a href={`tel:${f.phone}`} className="btn-o" style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', textDecoration: 'none' }}>📞 {f.phone}</a>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />

      <Section bg="#1a0d06" py="4rem">
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩸</div>
          <h2 className="playfair" style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }}>Blood Donor Registry</h2>
          <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            In emergencies, access to blood can be the difference between life and death. 
            Join the Ogere Community Blood Donor Registry. Your information is kept strictly confidential and you will only be contacted in life-threatening emergencies at local hospitals.
          </p>

          {!showBloodForm && !submitted && (
            <button className="btn-p" onClick={() => setShowBloodForm(true)} style={{ background: '#dc2626', borderColor: '#ef4444', color: 'white' }}>
              Register as a Donor
            </button>
          )}

          {showBloodForm && !submitted && (
            <form onSubmit={handleBloodSubmit} style={{ animation: 'fadeUp 0.4s ease both', textAlign: 'left' }}>
              <div className="glass" style={{ padding: 'clamp(1.2rem, 4vw, 2rem)', borderRadius: '12px', borderTop: '3px solid #dc2626' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Full Name</label>
                    <input required className="inp" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full legal name" />
                  </div>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Blood Group</label>
                    <select required className="inp" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} style={{ background: 'rgba(201,150,58,0.05)' }}>
                      <option value="">Select...</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'I don\'t know'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Phone Number</label>
                    <input required type="tel" className="inp" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234..." />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Quarter / Area</label>
                    <input className="inp" value={form.location} onChange={e => set('location', e.target.value)} placeholder="E.g. Oke-Ogere, Isale-Ogere" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                  <button type="button" className="btn-o" onClick={() => setShowBloodForm(false)}>Cancel</button>
                  <button type="submit" className="btn-p" disabled={loading} style={{ background: '#dc2626', borderColor: '#ef4444', color: 'white' }}>
                    {loading ? 'Registering…' : 'Register'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {submitted && (
            <div style={{ padding: '2rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
              <h3 className="playfair" style={{ color: '#86efac', fontSize: '1.5rem' }}>Thank You, Hero.</h3>
              <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '0.9rem', marginTop: '0.5rem' }}>You have been added to the confidential donor registry.</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
