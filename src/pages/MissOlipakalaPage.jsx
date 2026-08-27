import { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';
import { dbInsert } from '../services/db';
import { sendAnthropicMessage } from '../services/api';
import { getSession } from '../services/auth';

const WINNERS = [
  { year: '2025', title: 'Miss Olipakala 2025', name: 'Oluwakemisola Adeola', note: 'Crowned at the 49th Lipakala Day Festival.', img: '/images/Oluwakemisola Adeola Miss Lipakal 2025.jpg' },
  { year: '2024', title: 'Miss Olipakala 2024', name: 'Queen Oshoko Rachael Oluwapelumi', note: 'Winner of the 2024 edition.', img: '/images/Miss Lipakala 2024 Queen Oshoko Rachael Oluwapelumi.jpg' },
  { year: '2023', title: 'Miss Olipakala 2023', name: 'Idowu Precious Oluwatomiwa', note: 'Winner of the revived pageant.', img: '/images/IDOWU PRECIOUS OLUWATOMIWA Miss Lipakala 2023.jpg' },
  { year: '2022', title: 'Miss Olipakala 2022', name: 'Oluwapelumi', note: 'Previous edition winner.', img: '/images/OLUWAPELUMI. Miss Lipakala 2022.jpg' },
  { year: '2021', title: 'Miss Olipakala 2021', name: '', note: 'Previous edition winner.', img: '/images/Miss Lipakala 2021.jpg' },
];

const ROUNDS = [
  { title: 'Traditional Attire', desc: 'Contestants showcase elegant Yoruba traditional wear, honouring the cultural heritage of Ogere Remo.', ic: '👘' },
  { title: 'Evening Wear', desc: 'Grace and poise on display in the evening gown segment.', ic: '👗' },
  { title: 'Talent & Oratory', desc: 'Contestants demonstrate their talents and speak on community development.', ic: '🎤' },
  { title: 'Intelligence & Culture', desc: 'Questions on Ogere history, Yoruba traditions, and current affairs.', ic: '📚' },
  { title: 'Crowning', desc: 'The winner is crowned Miss Olipakala at the grand finale.', ic: '👑' },
];

export default function MissOlipakalaPage() {
  const [tab, setTab] = useState('about');
  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    address: '',
    occupation: '',
    reason: '',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [aiMsg, setAiMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!f.name || !f.phone) return;
    setBusy(true);

    const session = await getSession();
    const entry = {
      id: `PGN-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: f.name,
      email: f.email,
      phone: f.phone,
      age: Number(f.age) || null,
      height: f.height,
      address: f.address,
      occupation: f.occupation,
      reason: f.reason,
      status: 'pending',
      userId: session?.id || '',
      submittedAt: new Date().toISOString(),
    };

    await dbInsert('pageant_registrations', entry);

    const msg = await sendAnthropicMessage(
      'You are the Miss Olipakala Pageant Committee Coordinator. A young woman has registered for the Miss Olipakala pageant. Write a warm 2-3 sentence encouragement celebrating her courage and cultural pride. End with a Yoruba blessing phrase.',
      `Name: ${f.name}`
    );
    setAiMsg(msg || 'Thank you for your application! The Pageant Committee will review your submission and contact you regarding audition dates. Ẹ ṣéun púpọ̀!');

    setDone(true);
    setBusy(false);
    setF({
      name: '',
      email: '',
      phone: '',
      age: '',
      height: '',
      address: '',
      occupation: '',
      reason: '',
    });
  };

  return (
    <div>
      <SEO title="Miss Olipakala" description="Miss Olipakala Beauty Pageant — part of the annual Lipakala Day Festival celebrating the grace, intelligence, and cultural pride of Ogere Remo women." />
      <Hero ey="Beauty · Culture · Grace" ti="Miss Olipakala" sub="The annual beauty pageant honouring Olipakala — celebrating Ogere Remo's women, their talent, and their heritage." />
      <AdireDivider />
      <Section bg="#1a0d06" py="2.5rem">
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['about', '👑 About the Pageant'], ['winners', '🏆 Past Winners'], ['register', '📝 Register'], ['gallery', '📸 Pageant Gallery']].map(([id, l]) => (
            <button key={id} className={tab === id ? 'btn-p' : 'btn-o'} onClick={() => { setTab(id); setDone(false); }}>{l}</button>
          ))}
        </div>
      </Section>

      {tab === 'about' && (
        <Section bg="#1a0d06">
          <p className="sl">The Pageant</p>
          <h2 className="st">About Miss Olipakala</h2>
          <p className="si" style={{ marginBottom: '2rem' }}>A celebration of grace, intelligence, and Ogere Remo's cultural heritage.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2rem', alignItems: 'start' }}>
            <div>
              <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg,#7A2E0E,#2C1A0E)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/images/Miss Lipaka Hero.jpg" alt="Miss Olipakala Pageant" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: '.88rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.2rem' }}>
                The Miss Olipakala Beauty Pageant is an annual highlight of the Lipakala Day Festival — the flagship community festival of Ogere Remo honouring the town's founding ancestor, Olipakala.
              </p>
              <p style={{ fontSize: '.88rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.2rem' }}>
                Young women from Ogere Remo and its diaspora compete in categories including traditional attire, evening wear, talent, and cultural knowledge. The pageant celebrates the grace, intelligence, and pride of Ogere women.
              </p>
              <p style={{ fontSize: '.88rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)' }}>
                The winner is crowned Miss Olipakala and serves as a cultural ambassador for the town, representing Ogere at events throughout the year.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <p className="sl" style={{ marginBottom: '1rem' }}>Pageant Rounds</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem' }}>
              {ROUNDS.map((r, i) => (
                <div key={i} style={{ padding: '1.5rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.14)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{r.ic}</div>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.4rem' }}>{r.title}</div>
                  <div style={{ fontSize: '.75rem', lineHeight: 1.65, color: 'rgba(245,237,216,.55)' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '2rem', background: 'rgba(201,150,58,.07)', border: '1px solid rgba(201,150,58,.2)', padding: '2rem', borderLeft: '4px solid #C9963A' }}>
            <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.5rem' }}>Part of Lipakala Day Festival</div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.7, color: 'rgba(245,237,216,.65)' }}>
              The Miss Olipakala pageant is a key event within the annual Lipakala Day Festival organised by the Ogere Community Development Association (OCDA). The 50th edition — the Golden Jubilee — is scheduled for October/November 2026. <Link to="/events" style={{ color: '#C9963A' }}>View events →</Link>
            </p>
          </div>
        </Section>
      )}

      {tab === 'winners' && (
        <Section bg="#1a0d06">
          <p className="sl">Hall of Fame</p>
          <h2 className="st">Past Winners</h2>
          <p className="si" style={{ marginBottom: '2rem' }}>Celebrating the women who have worn the crown.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.5rem' }}>
            {WINNERS.map((w, i) => (
              <div key={i} style={{ padding: '1.5rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.15)', textAlign: 'center' }}>
                <div style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg,#C9963A,#7A2E0E)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                </div>
                <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.14em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.25rem' }}>{w.year}</div>
                <div className="playfair" style={{ fontSize: '1rem', color: '#F5EDD8', marginBottom: '.3rem' }}>{w.title}</div>
                <div className="playfair" style={{ fontSize: '.85rem', color: 'rgba(240,208,128,.7)', marginBottom: '.4rem' }}>{w.name}</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.55)' }}>{w.note}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === 'register' && (
        <Section bg="#1a0d06" mw={680}>
          <p className="sl">Join the Pageant</p>
          <h2 className="st">Contestant Registration</h2>
          <p className="si" style={{ marginBottom: '2rem' }}>Express your interest for the 50th Golden Jubilee Edition of Miss Olipakala.</p>

          {done ? (
            <div style={{ background: 'rgba(45,74,34,.2)', border: '1px solid rgba(45,74,34,.4)', borderLeft: '4px solid #4ade80', padding: '2.5rem', textAlign: 'center', borderRadius: 8 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.8rem' }}>👑</div>
              <div className="cinzel" style={{ fontSize: '.75rem', letterSpacing: '.15em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '.8rem', fontWeight: 700 }}>Application Submitted Successfully</div>
              <div style={{ fontSize: '.92rem', lineHeight: 1.8, color: 'rgba(245,237,216,.9)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                &ldquo;{aiMsg}&rdquo;
              </div>
              <button className="btn-p" onClick={() => setDone(false)}>Register Another Contestant</button>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.1rem' }}>
              <div>
                <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Full Name *</div>
                <input required className="inp" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Your full legal name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1rem' }}>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Email Address *</div>
                  <input required type="email" className="inp" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="your@email.com" />
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Phone Number *</div>
                  <input required type="tel" className="inp" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="+234..." />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '1rem' }}>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Age *</div>
                  <input required type="number" min="18" max="35" className="inp" value={f.age} onChange={e => setF({ ...f, age: e.target.value })} placeholder="18-35" />
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Height</div>
                  <input className="inp" value={f.height} onChange={e => setF({ ...f, height: e.target.value })} placeholder="e.g. 5'7&quot;" />
                </div>
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Address / Quarter (Ogere or Diaspora)</div>
                <input className="inp" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} placeholder="e.g. Isale-Ogere or London, UK" />
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Occupation / School</div>
                <input className="inp" value={f.occupation} onChange={e => setF({ ...f, occupation: e.target.value })} placeholder="e.g. Student, Entrepreneur, Model" />
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Why do you want to be Miss Olipakala?</div>
                <textarea className="inp" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} placeholder="Tell us about yourself and why you'd make a great cultural ambassador…" style={{ minHeight: 120, resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn-p" disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                {busy ? <><Spinner /> Submitting to Pageant Committee…</> : 'Submit Application →'}
              </button>
              <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.35)', textAlign: 'center' }}>Registration for the 50th Lipakala Day · Golden Jubilee Edition</p>
            </form>
          )}
        </Section>
      )}

      {tab === 'gallery' && (
        <Section bg="#1a0d06">
          <p className="sl">Pageant Moments</p>
          <h2 className="st">Photo Gallery</h2>
          <p className="si" style={{ marginBottom: '2rem' }}>Highlights from past Miss Olipakala pageants and Lipakala Day celebrations. <Link to="/gallery" style={{ color: '#C9963A' }}>View full gallery →</Link></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1rem' }}>
            {[
              '/images/Miss Lipaka Hero.jpg',
              '/images/Miss Lipakala 2024 Queen Oshoko Rachael Oluwapelumi.jpg',
              '/images/IDOWU PRECIOUS OLUWATOMIWA Miss Lipakala 2023.jpg',
              '/images/Oluwakemisola Adeola Miss Lipakal 2025.jpg',
              '/images/Miss Lipakala 2024.jpg',
              '/images/49th Olipakala Day.jpg',
              '/images/Lipakal MIss.jpg',
            ].map((src, i) => (
              <div key={i} style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg,#C9963A,#2C1A0E)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={src} alt={`Miss Olipakala gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              </div>
            ))}
          </div>
        </Section>
      )}
      <AdireDivider />
    </div>
  );
}