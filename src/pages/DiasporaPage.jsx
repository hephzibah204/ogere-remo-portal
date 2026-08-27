import { useState, useEffect } from 'react';
import { notable, regions, diasporaGroups } from '../data/diaspora';
import { dbGet, dbSet } from '../services/storage';
import { sendAnthropicMessage } from '../services/api';
import { initializePayment } from '../services/paystack';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

const CIVIC_PROJECTS = [
  {
    id: 'civic_centre',
    title: 'Ogere Civic Hall & Town Hall Modernisation',
    goal: 10000000,
    raised: 6850000,
    desc: 'Roofing renovation, solar installation, and digital acoustics for community gatherings and chieftaincy ceremonies.',
    icon: '🏛️',
    organizer: 'OCDA Central Infrastructure Committee',
  },
  {
    id: 'ict_hub',
    title: 'Ogere Youth ICT & Solar Tech Hub',
    goal: 5000000,
    raised: 3400000,
    desc: 'High-speed internet workstations, coding bootcamps, and digital skills empowerment for Ogere youth.',
    icon: '💻',
    organizer: 'Ogere Diaspora STEM Alumni',
  },
  {
    id: 'lipakala_jubilee',
    title: '50th Lipakala Day Golden Jubilee Cultural Fund',
    goal: 8000000,
    raised: 5100000,
    desc: 'Grand cultural showcase, documentary filming of royal antiquities, and diaspora home-coming festivities.',
    icon: '👑',
    organizer: 'Lipakala Golden Jubilee Committee',
  },
  {
    id: 'maternity_clinic',
    title: 'Ogere Maternity Ward & Emergency Clinic Upgrade',
    goal: 6500000,
    raised: 4200000,
    desc: 'Procurement of delivery beds, solar blood refrigerators, and emergency diagnostic equipment for mothers and newborns.',
    icon: '🏥',
    organizer: 'Ogere Health Development Council',
  },
];

export default function DiasporaPage() {
  const [tab, setTab] = useState('network');
  const [f, setF] = useState({ name: '', email: '', phone: '', location: '', country: '', profession: '', bio: '', contrib: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [members, setMembers] = useState([]);

  // Giving state
  const [donationModal, setDonationModal] = useState(null);
  const [donationAmount, setDonationAmount] = useState('25000');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donationPaid, setDonationPaid] = useState(false);
  const [donationBusy, setDonationBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await dbGet('diaspora');
      if (d && Array.isArray(d)) setMembers(d);
    })();
  }, []);

  const register = async () => {
    if (!f.name || !f.email || !f.location) return;
    setBusy(true);
    const msg = await sendAnthropicMessage(
      'You are the Ogere Remo community website assistant. A diaspora member just registered. Write a warm 3-4 sentence welcome mentioning their name and location. End with a warm Yoruba phrase.',
      `Name: ${f.name}, Location: ${f.location}, ${f.country}, Profession: ${f.profession}`
    );
    setAiMsg(msg || 'Welcome to the Ogere Remo Diaspora Network! Ẹ káàbọ̀ sí ilẹ̀ wa!');
    const entry = { ...f, date: new Date().toLocaleDateString('en-NG') };
    const updated = [...members, entry];
    setMembers(updated);
    await dbSet('diaspora', updated);
    setDone(true);
    setBusy(false);
    setF({ name: '', email: '', phone: '', location: '', country: '', profession: '', bio: '', contrib: '' });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donationModal || !donationAmount) return;
    setDonationBusy(true);

    try {
      await initializePayment({
        email: donorEmail || 'diaspora.donor@gmail.com',
        amount: Number(donationAmount),
        title: `Donation: ${donationModal.title}`,
        purpose: donationModal.title,
        metadata: { donorName: donorName || 'Anonymous Diaspora Member', projectId: donationModal.id },
      });
      setDonationPaid(true);
      setDonationBusy(false);
      setTimeout(() => {
        setDonationModal(null);
        setDonationPaid(false);
      }, 3500);
    } catch (err) {
      console.error('Donation error:', err);
      setDonationBusy(false);
    }
  };

  const inputFields = [
    ['Full Name *', 'text', 'name', 'Your full name'],
    ['Email Address *', 'email', 'email', 'your@email.com'],
    ['Phone', 'tel', 'phone', '+44 / +1 / +234...'],
    ['City / State of Residence *', 'text', 'location', 'e.g. London, Houston, Lagos'],
    ['Country *', 'text', 'country', 'e.g. United Kingdom, USA, Nigeria'],
    ['Profession / Field', 'text', 'profession', 'e.g. Lawyer, Engineer, Doctor'],
  ];

  return (
    <div>
      <SEO title="Diaspora Network & Giving" description="The Ogere Remo diaspora community — notable members, regional groups, and global project funding." />
      <Hero
        ey="Sons & Daughters Abroad"
        ti="Diaspora Network & Giving"
        sub="Connecting Ogere Remo's global family — register in our global directory, support civic projects, and stay connected to your roots."
        dark
      />
      <AdireDivider />

      <Section bg="#1a0d06" py="2.5rem">
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['network', '🌍 Diaspora Network'],
            ['giving', '🎁 Civic Projects & Giving'],
            ['register', '+ Join the Network'],
            ['notable', '🌟 Notable Diasporans'],
          ].map(([id, l]) => (
            <button key={id} className={tab === id ? 'btn-p' : 'btn-o'} onClick={() => setTab(id)}>
              {l}
            </button>
          ))}
        </div>
      </Section>

      {tab === 'giving' && (
        <Section bg="#1a0d06" py="3.5rem">
          <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.65rem', marginBottom: '0.8rem' }}>
              COMMUNITY ENDOWMENT
            </p>
            <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '1rem' }}>
              Support Ogere Community Development
            </h2>
            <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              Directly sponsor vital educational, health, and cultural projects in our homeland. 100% of donations are tracked and reported transparently to the community council.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {CIVIC_PROJECTS.map(proj => {
              const pct = Math.min(100, Math.round((proj.raised / proj.goal) * 100));
              return (
                <div
                  key={proj.id}
                  className="glass card"
                  style={{
                    padding: '2rem',
                    borderRadius: '16px',
                    borderTop: '4px solid var(--gold)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{proj.icon}</div>
                    <h3 className="playfair" style={{ fontSize: '1.35rem', color: 'var(--cream)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.65)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                      {proj.desc}
                    </p>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>₦{proj.raised.toLocaleString()}</span>
                        <span style={{ color: 'rgba(245,237,216,0.5)' }}>Goal: ₦{proj.goal.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(201,150,58,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), #22c55e)', borderRadius: '4px' }}></div>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#86efac', marginTop: '0.3rem', textAlign: 'right' }}>
                        {pct}% Funded
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.45)', marginBottom: '1rem' }}>
                      Overseen by: {proj.organizer}
                    </div>
                    <button
                      className="btn-p"
                      style={{ width: '100%', padding: '0.8rem', fontSize: '0.75rem' }}
                      onClick={() => setDonationModal(proj)}
                    >
                      💳 Contribute via Paystack →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {tab === 'network' && (
        <Section bg="#1a0d06">
          <p className="sl">Our Global Family</p>
          <h2 className="st">Ogere Remo Around the World</h2>
          <p className="si" style={{ marginBottom: '2.5rem' }}>Ogere sons and daughters have carried the spirit of the ancient town to all corners of the world.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {regions.map(r => (
              <div key={r.c} style={{ textAlign: 'center', padding: '1.4rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.14)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{r.ic}</div>
                <div className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>{r.c}</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.5)' }}>{r.d}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(201,150,58,.07)', border: '1px solid rgba(201,150,58,.2)', padding: '2rem', borderTop: '3px solid #C9963A' }}>
            <p className="sl">Diaspora Groups</p>
            <h3 className="playfair" style={{ fontSize: '1.3rem', color: '#F5EDD8', marginBottom: '1.5rem' }}>Key Diaspora & Community Organisations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1rem' }}>
              {diasporaGroups.map((g, i) => (
                <div key={i} style={{ padding: '1.2rem', background: 'rgba(44,26,14,.5)', border: '1px solid rgba(201,150,58,.14)', borderLeft: '3px solid #C9963A' }}>
                  <div className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.35rem' }}>{g.n}</div>
                  <div style={{ fontSize: '.8rem', lineHeight: 1.68, color: 'rgba(245,237,216,.6)', marginBottom: '.4rem' }}>{g.d}</div>
                  <div style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.38)' }}>{g.ct}</div>
                </div>
              ))}
            </div>
          </div>
          {members.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.15em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '1rem' }}>Recently Joined ({members.length} members)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '.8rem' }}>
                {members.slice(-6).map((m, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.12)' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '.3rem' }}>👤</div>
                    <div style={{ fontSize: '.88rem', color: '#F5EDD8', marginBottom: '.2rem' }}>{m.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.5)' }}>{m.location}, {m.country}</div>
                    {m.profession && <div style={{ fontSize: '.72rem', color: 'rgba(201,150,58,.6)', marginTop: '.2rem' }}>{m.profession}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {tab === 'register' && (
        <Section bg="#1a0d06" mw={680}>
          <p className="sl">Join the Network</p>
          <h2 className="st">Diaspora Registration</h2>
          <p className="si" style={{ marginBottom: '2rem' }}>Connect with your Ogere roots. Free registration.</p>
          {done ? (
            <div style={{ background: 'rgba(45,74,34,.15)', border: '1px solid rgba(45,74,34,.4)', borderLeft: '4px solid #2D4A22', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.8rem' }}>🌍</div>
              <div className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.18em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '.8rem' }}>Welcome to the Network</div>
              <div style={{ fontSize: '.88rem', lineHeight: 1.85, color: 'rgba(245,237,216,.72)', fontStyle: 'italic', marginBottom: '1.5rem' }}>{aiMsg}</div>
              <button className="btn-o" onClick={() => { setDone(false); setTab('network'); }}>View Network →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              {inputFields.map(([l, t, k, ph]) => (
                <div key={k}>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>{l}</div>
                  <input className="inp" type={t} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} />
                </div>
              ))}
              <button className="btn-p" onClick={register} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginTop: '1rem' }}>
                {busy ? <><Spinner />Connecting…</> : 'Register in Diaspora Network →'}
              </button>
            </div>
          )}
        </Section>
      )}

      {tab === 'notable' && (
        <Section bg="#1a0d06">
          <p className="sl">Ogere Ambassadors</p>
          <h2 className="st">Notable Ogere Diasporans</h2>
          <p className="si" style={{ marginBottom: '2.5rem' }}>Ogere sons and daughters who have achieved distinction internationally.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1.5rem' }}>
            {notable.map(n => (
              <div key={n.n} style={{ padding: '1.5rem', background: 'rgba(201,150,58,.05)', border: '1px solid rgba(201,150,58,.14)', borderTop: '3px solid #C9963A' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.6rem' }}>🌟</div>
                <div className="playfair" style={{ fontSize: '1.1rem', color: '#F5EDD8', marginBottom: '.2rem' }}>{n.n}</div>
                <div className="cinzel" style={{ fontSize: '.56rem', color: '#C9963A', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.3rem' }}>{n.r}</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(201,150,58,.7)', marginBottom: '.6rem' }}>📍 {n.l}</div>
                <div style={{ fontSize: '.8rem', lineHeight: 1.68, color: 'rgba(245,237,216,.6)' }}>{n.d}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Paystack Giving Modal */}
      {donationModal && (
        <div
          onClick={() => setDonationModal(null)}
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
              borderRadius: '16px',
              borderTop: '4px solid var(--gold)',
              padding: '2rem',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            {donationPaid ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🎉</div>
                <h3 className="playfair" style={{ fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '0.4rem' }}>
                  Ẹ Ṣéun Púpọ̀! (Thank You!)
                </h3>
                <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '0.85rem' }}>
                  Your contribution of <strong>₦{Number(donationAmount).toLocaleString()}</strong> to <em>{donationModal.title}</em> has been processed. A receipt has been issued.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDonate}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 className="playfair" style={{ fontSize: '1.4rem', color: 'var(--cream)' }}>
                    🎁 Project Donation
                  </h3>
                  <button type="button" onClick={() => setDonationModal(null)} style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.6)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: '0.8rem', background: 'rgba(201,150,58,0.08)', borderRadius: '8px', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 'bold' }}>{donationModal.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: '0.2rem' }}>{donationModal.organizer}</div>
                </div>

                {/* Amount presets */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>Select Contribution Amount (₦)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    {['10000', '25000', '50000', '100000'].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonationAmount(amt)}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '6px',
                          border: donationAmount === amt ? '1px solid var(--gold)' : '1px solid rgba(201,150,58,0.2)',
                          background: donationAmount === amt ? 'var(--gold)' : 'rgba(201,150,58,0.06)',
                          color: donationAmount === amt ? '#000' : 'var(--cream)',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        ₦{Number(amt).toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    required
                    type="number"
                    className="inp"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    placeholder="Custom amount in Naira..."
                  />
                </div>

                <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.2rem' }}>Your Name</label>
                    <input className="inp" value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Full name (or leave for Anonymous)" />
                  </div>
                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.2rem' }}>Email for Receipt *</label>
                    <input required type="email" className="inp" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} placeholder="donor@gmail.com" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-o" onClick={() => setDonationModal(null)}>Cancel</button>
                  <button type="submit" className="btn-p" disabled={donationBusy}>
                    {donationBusy ? 'Processing…' : `Pay ₦${Number(donationAmount || 0).toLocaleString()} with Paystack`}
                  </button>
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
