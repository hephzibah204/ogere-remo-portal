import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbInsert } from '../services/db';

const SCHOLARSHIPS = [
  { id: 1, title: 'Kankanbina University Bursary', sponsor: 'HRH The Ologere', level: 'Undergraduate', amount: '₦100,000', deadline: 'Aug 30, 2026', desc: 'Annual bursary for Ogere indigenes in any Federal University in Nigeria. Must maintain a 3.5 CGPA.' },
  { id: 2, title: 'OCDA UK Diaspora Tech Grant', sponsor: 'Ogere Diaspora (UK)', level: 'Vocational / Tech', amount: 'Laptop + ₦50k', deadline: 'Jul 15, 2026', desc: 'Providing laptops and data grants to young people in Ogere learning programming or digital skills.' },
  { id: 3, title: 'Ogere Market Women Guild Fund', sponsor: 'Market Women Association', level: 'Secondary School', amount: 'Full Tuition', deadline: 'Sep 05, 2026', desc: 'For children of active Ogere market women attending Remo Secondary School or similar public schools.' },
  { id: 4, title: 'Afolabi Medical Scholarship', sponsor: 'Dr. Tunde Afolabi', level: 'Medical Students', amount: '₦250,000', deadline: 'Oct 01, 2026', desc: 'Exclusive to Ogere indigenes studying Medicine, Nursing, or Pharmacy at any accredited Nigerian institution.' },
];

const PAST_RECIPIENTS = [
  { name: 'Ogunlesi Tobi', award: 'OCDA Tech Grant 2025', bio: 'Now working as a junior web developer.' },
  { name: 'Adebayo Funmilayo', award: 'Kankanbina Bursary 2024', bio: 'Graduated First Class in Accounting, OAU.' },
  { name: 'Kazeem Olayemi', award: 'Market Guild Fund 2023', bio: 'Currently in SS3, Head Boy of Remo Sec. Sch.' },
];

export default function ScholarshipsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSchol, setSelectedSchol] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', compound: '', institution: '', email: '', phone: '', statement: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newApp = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      programTitle: selectedSchol,
      applicantName: form.fullName,
      compound: form.compound,
      institution: form.institution,
      email: form.email,
      phone: form.phone,
      statement: form.statement,
      status: 'pending',
      score: 0,
      createdAt: new Date().toISOString(),
    };
    await dbInsert('scholarships', newApp);
    setSubmitted(true);
    setLoading(false);
    setForm({ fullName: '', compound: '', institution: '', email: '', phone: '', statement: '' });
    setTimeout(() => { setShowForm(false); setSubmitted(false); }, 4000);
  };

  return (
    <div>
      <SEO title="Scholarships & Empowerment" description="Educational scholarships, grants, and empowerment programs for Ogere Remo indigenes." />
      <Hero ey="Education & Future" ti="Empowerment Portal" sub="Funding the future of Ogereland through educational scholarships, tech grants, and vocational support." dark />

      <Section bg="#0d0704" py="4rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>CURRENT OPPORTUNITIES</p>
          <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Available Grants & Scholarships</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {SCHOLARSHIPS.map(s => (
            <div key={s.id} className="glass card" style={{ borderRadius: '12px', padding: '2rem', borderTop: '3px solid var(--gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.6rem', background: 'rgba(201,150,58,0.1)', color: 'var(--gold)', padding: '4px 10px', borderRadius: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.level}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#16a34a' }}>{s.amount}</span>
              </div>
              <h3 className="playfair" style={{ fontSize: '1.3rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.5)', marginBottom: '1rem' }}>Sponsored by: {s.sponsor}</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{s.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#dc2626' }}>Deadline: {s.deadline}</div>
                <button className="btn-p" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }} onClick={() => { setSelectedSchol(s.title); setShowForm(true); window.scrollTo(0, document.body.scrollHeight); }}>Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />

      <Section bg="#1a0d06" py="4rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="playfair" style={{ fontSize: '2rem', color: 'var(--cream)' }}>Past Beneficiaries</h2>
          <p style={{ color: 'rgba(245,237,216,0.5)', fontSize: '0.9rem' }}>Celebrating the success of our empowered youth.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {PAST_RECIPIENTS.map(r => (
            <div key={r.name} style={{ background: 'rgba(201,150,58,0.03)', border: '1px solid rgba(201,150,58,0.1)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
              <h4 className="cinzel" style={{ fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.3rem' }}>{r.name}</h4>
              <p style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.5)', marginBottom: '1rem' }}>{r.award}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(245,237,216,0.8)', fontStyle: 'italic' }}>"{r.bio}"</p>
            </div>
          ))}
        </div>
      </Section>

      {showForm && !submitted && (
        <Section bg="var(--dark)" py="4rem">
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '12px', borderTop: '3px solid var(--gold)' }}>
              <h3 className="playfair" style={{ fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '1rem', textAlign: 'center' }}>Scholarship Application</h3>
              <p style={{ textAlign: 'center', color: 'rgba(245,237,216,0.6)', marginBottom: '2rem', fontSize: '0.85rem' }}>Applying for: <strong style={{ color: 'var(--gold)' }}>{selectedSchol}</strong></p>
              
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                <div><label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Full Name</label><input required className="inp" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Full legal name" /></div>
                <div><label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Ogere Compound / Family</label><input required className="inp" value={form.compound} onChange={e => set('compound', e.target.value)} placeholder="E.g. Kankanbina, Agbejoye" /></div>
                <div><label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Current Institution & Level</label><input required className="inp" value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="E.g. OOU, 300 Level" /></div>
                <div><label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Email Address</label><input required type="email" className="inp" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@example.com" /></div>
                <div><label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Phone Number</label><input required type="tel" className="inp" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234..." /></div>
                <div><label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Why do you deserve this award? (Brief)</label><textarea required className="inp" rows="4" value={form.statement} onChange={e => set('statement', e.target.value)} placeholder="Tell us about your academic journey and how this award will help you..."></textarea></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button type="button" className="btn-o" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-p" disabled={loading}>{loading ? 'Submitting…' : 'Submit Application →'}</button>
              </div>
            </div>
          </form>
        </Section>
      )}

      {submitted && (
        <Section bg="var(--dark)" py="4rem">
          <div style={{ textAlign: 'center', padding: '3rem', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <div className="playfair" style={{ fontSize: '1.5rem', color: 'var(--cream)' }}>Application Received</div>
            <p style={{ color: 'rgba(245,237,216,0.6)', marginTop: '0.5rem' }}>The Education Committee will review your application and contact you if shortlisted.</p>
          </div>
        </Section>
      )}

    </div>
  );
}
