import { useState, useEffect } from 'react';
import { dbGet, dbSet } from '../services/storage';
import { sendAnthropicMessage } from '../services/api';
import { getSession } from '../services/auth';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

const orgs = [
  { name: 'OCDA', full: 'Ogere Community Development Association', tag: 'Apex Body', tagClass: 'tag-gold', ic: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬ÂºÃƒÂ¯Ã‚Â¸Ã‚Â', est: 'Founded ~1977 Ãƒâ€šÃ‚Â· Renamed from OCDC in 2023', desc: 'The apex community body of Ogere Remo, responsible for civic development, cultural preservation, and liaison with government. Organises the annual Lipakala Day.', contact: 'info@ogereremo.ng', venue: 'OCDA HQ, Ogere Town Hall', bullets: ['Organiser of Lipakala Day', 'Formally renamed from OCDC in 2023', 'Coordinates empowerment programmes and government partnerships'], img: '/images/Cross-section-of-attendance-at-the-Ologere-Empowerment-Programme.jpg' },
  { name: 'OYDA', full: 'Ogere Youth Development Association', tag: 'Youth', tagClass: 'tag-green', ic: 'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â±', est: 'Active ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Town Hall, Oja Ale', desc: 'The youth wing of Ogere Remo\'s civic infrastructure. Coordinates youth-focused development, skills training, and community engagement.', contact: 'oydaogere@gmail.com', venue: 'Town Hall, Oja Ale', bullets: ['Active social media presence', 'Regular youth empowerment programmes', 'Works closely with OCDA'], img: '/images/Olipakala Ogere Indigines.jpg' },
  { name: 'Lagos Forum', full: 'Lagos Forum of Ogere Indigenes', tag: 'Diaspora', tagClass: 'tag-blue', ic: 'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â', est: 'Active ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Lagos', desc: 'The principal diaspora group for Ogere indigenes based in Lagos. Organises the \'Evening with the Ologere\' at Ikeja Business Club.', contact: 'info@ogereremo.ng', venue: 'Lagos', bullets: ['Organised \'Evening with the Ologere\'', 'Fundraising for community infrastructure', 'Bridge between Lagos diaspora and Ogere'], img: '/images/From-Left-Princess-Omolara-Solarin-HRH-Oba-Oladele-Ogunbade-Ologere-of-Ogere-the-awardee-Omooba-Sunday-Solarin-and-Princess-Temitope-Solarin.jpeg' },
  { name: 'OMCOOSA', full: 'Ositelu Memorial College Old Students Association', tag: 'Alumni', tagClass: 'tag-terra', ic: 'ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Å“', est: '40th Anniversary (2025)', desc: 'The alumni body of Ositelu Memorial College, connecting generations of graduates. Organises reunions and school development.', contact: 'awobajoolakunle@gmail.com Ãƒâ€šÃ‚Â· 08037136954', venue: 'Ositelu Memorial College', bullets: ['President: Arc. Kunle Awobajo', 'Annual dues: ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦5,000 per member', '40th Anniversary Chair: Prince Yomi Ogunsowo'], img: '/images/Omcoosa.jpg' },
];

const trad = [
  { n: 'Osugbo / Ogboni Society', d: 'The most senior traditional governance society. Deliberates on matters of justice, land, and community welfare.', ic: 'ÃƒÂ¢Ã…Â¡Ã¢â‚¬â€œÃƒÂ¯Ã‚Â¸Ã‚Â' },
  { n: 'Olopere (Balogun\'s Corps)', d: 'The traditional military society, historically the Balogun\'s fighting corps.', ic: 'ÃƒÂ¢Ã…Â¡Ã¢â‚¬ÂÃƒÂ¯Ã‚Â¸Ã‚Â' },
  { n: 'Pampa Society', d: 'A respected masquerade and ceremony society integral to festival calendar.', ic: 'ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â­' },
  { n: 'Oro Society', d: 'Patriarchal society governing the annual Oro Festival. Women and non-initiates observe movement restrictions.', ic: 'ÃƒÂ°Ã…Â¸Ã…â€™Ã¢â€žÂ¢' },
  { n: 'Eluku Society', d: 'Traditional society with ceremonial and spiritual functions.', ic: 'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¿' },
  { n: 'Egbe Age Groups', d: 'The age-grade system binding residents in mutual responsibility and civic identity.', ic: 'ÃƒÂ°Ã…Â¸Ã‚Â¤Ã‚Â' },
];

export default function AssociationsPage() {
  const [tab, setTab] = useState('orgs');
  const [f, setF] = useState({ name: '', type: '', contact: '', email: '', phone: '', desc: '', leader: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [regs, setRegs] = useState([]);

  useEffect(() => { (async () => { const d = await dbGet('assoc'); if (d && Array.isArray(d)) setRegs(d); })(); }, []);

  const register = async () => {
    if (!f.name || !f.email) return;
    setBusy(true);
    const msg = await sendAnthropicMessage(
      'You are the Ogere Remo portal assistant. An association just registered. Write a warm 3-4 sentence welcome. End with a Yoruba phrase.',
      `Association: ${f.name}, Type: ${f.type}`
    );
    setAiMsg(msg || 'Welcome! Your association has been registered. ÃƒÂ¡Ã‚ÂºÃ‚Â¸ kÃƒÆ’Ã‚Â¡ÃƒÆ’Ã‚Â bÃƒÂ¡Ã‚Â»Ã‚ÂÃƒÅ’Ã¢â€šÂ¬ sÃƒÆ’Ã‚Â­ ilÃƒÂ¡Ã‚ÂºÃ‚Â¹ÃƒÅ’Ã¢â€šÂ¬ wa!');
    const session = await getSession();
    const entry = { ...f, date: new Date().toLocaleDateString('en-NG'), status: 'pending', userId: session?.id || '' };
    const updated = [...regs, entry];
    setRegs(updated);
    await dbSet('assoc', updated);
    setDone(true); setBusy(false);
    setF({ name: '', type: '', contact: '', email: '', phone: '', desc: '', leader: '' });
  };

  return (
    <div>
      <SEO title="Associations" description="Community associations, traditional societies, and civic organizations of Ogere Remo." />
      <Hero ey="Community Life" ti="Associations & Societies" sub="The civic heartbeat of Ogere Remo ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â from apex bodies to traditional fraternities." />
      <AdireDivider />
      <Section bg="#1a0d06" py="2rem">
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['orgs', 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬ÂºÃƒÂ¯Ã‚Â¸Ã‚Â Civic Associations'], ['trad', 'ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â­ Traditional Societies'], ['register', '+ Register Your Association']].map(([id, l]) => (
            <button key={id} className={tab === id ? 'btn-p' : 'btn-o'} onClick={() => setTab(id)}>{l}</button>
          ))}
        </div>
      </Section>

      {tab === 'orgs' && (
        <Section bg="#1a0d06">
          <p className="sl">Civic & Community Organisations</p>
          <h2 className="st" style={{ marginBottom: '2.5rem' }}>Official Associations of Ogere Remo</h2>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {orgs.map((o, i) => (
              <div key={i} style={{ padding: '2rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.18)', borderLeft: '4px solid #C9963A', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>{o.ic}</div>
                    <div>
                      <span className={`tag ${o.tagClass}`}>{o.tag}</span>
                      <div className="playfair" style={{ fontSize: '1.25rem', color: '#F5EDD8' }}>{o.name}</div>
                      <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: 'rgba(245,237,216,.5)', textTransform: 'uppercase' }}>{o.full}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '.88rem', lineHeight: 1.85, color: 'rgba(245,237,216,.7)', marginBottom: '1.2rem' }}>{o.desc}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '.5rem', marginBottom: '1.2rem' }}>
                    {o.bullets.map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', gap: '.5rem', fontSize: '.8rem', color: 'rgba(245,237,216,.62)' }}>
                        <span style={{ color: '#C9963A', flexShrink: 0 }}>ÃƒÂ¢Ã¢â€šÂ¬Ã‚Âº</span><span>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(201,150,58,.12)', paddingTop: '.8rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.45)' }}>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â§ {o.contact}</div>
                    <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.45)' }}>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â {o.venue}</div>
                  </div>
                </div>
                {o.img && (
                  <div style={{ width: '100%', maxWidth: '240px', height: '180px', flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <img src={o.img} alt={o.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === 'trad' && (
        <Section bg="#1a0d06">
          <p className="sl">Traditional Institutions</p>
          <h2 className="st" style={{ marginBottom: '.6rem' }}>Sacred Societies & Age-Grades</h2>
          <p className="si" style={{ marginBottom: '2.5rem' }}>Ogere's traditional societies form the invisible architecture of community life ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â governing rites of passage, ancestral ceremonies, and collective identity.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1.2rem' }}>
            {trad.map((t, i) => (
              <div key={i} style={{ padding: '1.8rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.16)', borderTop: '3px solid #7A2E0E' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.7rem' }}>{t.ic}</div>
                <div className="playfair" style={{ fontSize: '1rem', color: '#F5EDD8', marginBottom: '.5rem' }}>{t.n}</div>
                <div style={{ fontSize: '.82rem', lineHeight: 1.75, color: 'rgba(245,237,216,.62)' }}>{t.d}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === 'register' && (
        <Section bg="#1a0d06" mw={680}>
          <p className="sl">Association Registry</p>
          <h2 className="st">Register Your Association</h2>
          <p className="si" style={{ marginBottom: '2rem' }}>Register free to be added to the official Ogere Remo directory.</p>
          {done ? (
            <div style={{ background: 'rgba(45,74,34,.15)', border: '1px solid rgba(45,74,34,.4)', borderLeft: '4px solid #2D4A22', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.8rem' }}>ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦</div>
              <div className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.18em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '.8rem' }}>Registration Received</div>
              <div style={{ fontSize: '.88rem', lineHeight: 1.85, color: 'rgba(245,237,216,.72)', fontStyle: 'italic', marginBottom: '1.5rem' }}>{aiMsg}</div>
              <button className="btn-o" onClick={() => { setDone(false); setTab('orgs'); }}>View Associations ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              {[['Association Name *', 'text', 'name', 'e.g. Ogere Women Cooperative'], ['Type / Category', 'text', 'type', 'e.g. Women\'s Group, Trade Union, Alumni'], ['Leader / Contact Person', 'text', 'leader', 'Chairman, president or convener'], ['Email Address *', 'email', 'email', 'Official contact email'], ['Phone Number', 'tel', 'phone', '+234...']].map(([l, t, k, ph]) => (
                <div key={k}>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>{l}</div>
                  <input type={t} className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} />
                </div>
              ))}
              <div>
                <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#C9963A', marginBottom: '.32rem' }}>Brief Description</div>
                <textarea className="inp" value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="What does your association do?" style={{ minHeight: 90, resize: 'vertical' }} />
              </div>
              <button className="btn-p" onClick={register} disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                {busy ? <><Spinner />RegisteringÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</> : 'Register Association ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢'}
              </button>
            </div>
          )}
        </Section>
      )}
      <AdireDivider />
    </div>
  );
}
