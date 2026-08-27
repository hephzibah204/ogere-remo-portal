import { useState, useEffect } from 'react';
import { dbGet, dbSet } from '../services/storage';
import { sendAnthropicMessage } from '../services/api';
import { getSession } from '../services/auth';
import { initializePayment } from '../services/paystack';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

const CATS = ['All', 'Food & Dining', 'Hospitality', 'Education', 'Trade', 'Transport', 'Services', 'Health', 'Agriculture', 'Technology', 'Faith', 'Infrastructure'];

const STATIC = [
  {
    id: 'biz1',
    name: 'Ogere Resort & International Convention Centre',
    cat: 'Hospitality',
    ic: '🏨',
    desc: 'Nigeria’s premier retreat destination with 140+ luxury chalets, swimming pools, tennis courts, and conference auditoriums.',
    phone: '+234 906 247 0474',
    website: 'https://ogereresort.com',
    address: 'KM 67, Lagos–Ibadan Expressway, Ogere 121107',
    rating: '4.4★ (558 reviews)',
    tier: 'Premium',
    image: '/images/Ogere%20Resort.png',
  },
  {
    id: 'biz2',
    name: 'Ositelu Memorial College (OMCOOSA)',
    cat: 'Education',
    ic: '🏫',
    desc: 'The iconic secondary school of Ogere Remo, providing high academic standard and technical foundations since establishment.',
    phone: '+234 806 215 8840',
    address: 'Awomosu Agbato Drive, Ogere 121107',
    rating: '4.8★',
    tier: 'Premium',
    image: '/images/Ositelu%20Memorial%20School%20Gate.jpg',
  },
  {
    id: 'biz3',
    name: 'Ogere Central Market Merchants Association',
    cat: 'Trade',
    ic: '🛖',
    desc: 'Centuries-old commercial market hosting hundreds of commodity traders, yam farmers, fabric sellers, and daily evening trade.',
    phone: '+234 704 957 0510',
    address: 'Market Road / Oja Ale, Ogere 121107',
    rating: '4.4★ (8 reviews)',
    tier: 'Standard',
    image: '/images/Ogere%20Central%20Market.webp',
  },
  {
    id: 'biz4',
    name: 'Ogere Palm Oil & Agro-Allied Producers Cooperative',
    cat: 'Agriculture',
    ic: '🌾',
    desc: 'Producers of 100% pure cold-pressed unadulterated red palm oil, cassava flakes, and fresh farm yam tubers.',
    phone: '+234 803 451 9088',
    address: 'Agbele Ridge Plantation Corridor, Ogere Remo',
    rating: '4.9★',
    tier: 'Premium',
  },
  {
    id: 'biz5',
    name: 'Ogere Specialist Medical & Maternity Centre',
    cat: 'Health',
    ic: '🏥',
    desc: 'Comprehensive community healthcare facility providing 24/7 maternity diagnostics, pediatric care, and surgical care.',
    phone: '+234 802 345 6789',
    address: 'Hospital Road, Oke-Ogere, Ogere Remo',
    rating: '4.6★',
    tier: 'Premium',
  },
  {
    id: 'biz6',
    name: 'The Church of the Lord (Aladura) Worldwide HQ',
    cat: 'Faith',
    ic: '⛪',
    desc: 'Global spiritual headquarters and pilgrimage center founded in Ogere Remo on July 27, 1930 by Prophet Josiah Olunowo Ositelu.',
    phone: '+234 805 123 4567',
    address: 'Lisa Compound, Ogere Remo',
    website: 'https://tclpfw.org',
    rating: '4.8★ (32 reviews)',
    tier: 'Premium',
    image: '/images/The%20Church%20Of%20The%20Lord%20Aladuara.jpg',
  },
  {
    id: 'biz7',
    name: 'Ogere Transport Logistics & Haulage Terminal',
    cat: 'Transport',
    ic: '🚛',
    desc: 'Interstate logistics management, vehicle diagnostics, cold chain storage, and transport corridor services along Lagos-Ibadan axis.',
    phone: '+234 912 413 0304',
    address: 'WJPM+JQP, Expressway Interchange Corridor, Ogere',
    rating: '4.2★',
    tier: 'Standard',
  },
  {
    id: 'biz8',
    name: 'Olipakala Adire & Heritage Textile Weavers',
    cat: 'Trade',
    ic: '🪡',
    desc: 'Authentic handmade indigo Adire Eleko, batik fabrics, and custom Yoruba traditional ceremonial attires for weddings and coronations.',
    phone: '+234 805 778 9911',
    address: '14 Isale-Ogere Road, Ogere Remo',
    rating: '5.0★ (42 reviews)',
    tier: 'Premium',
  },
  {
    id: 'biz9',
    name: 'Kankanbiina Solar & Electrical Engineering',
    cat: 'Technology',
    ic: '⚡',
    desc: 'Solar inverter installations, lithium battery setups, and commercial electrical wiring for homes and agricultural farms in Remo.',
    phone: '+234 803 998 7766',
    address: 'Palace Way, Oke-Ogere, Ogere Remo',
    rating: '4.7★',
    tier: 'Standard',
  },
  {
    id: 'biz10',
    name: 'Remo-North Concrete & Civil Building Supplies',
    cat: 'Infrastructure',
    ic: '🏗️',
    desc: 'Suppliers of certified 42.5R Dangote cement, sharp sand, machine-crushed gravel granite, and vibrated building blocks.',
    phone: '+234 802 887 6655',
    address: 'Plot 8 Idi-Iroko Sector, Ogere Remo',
    rating: '4.5★',
    tier: 'Standard',
  },
  {
    id: 'biz11',
    name: 'Oluwaseun Royal Buka & Catering Services',
    cat: 'Food & Dining',
    ic: '🍲',
    desc: 'Traditional Ogere pounded yam, fresh catfish pepper soup, bush meat, and outdoor event party catering across Ogun State.',
    phone: '+234 813 445 6677',
    address: 'Town Hall Commercial Arcade, Ogere Remo',
    rating: '4.6★',
    tier: 'Standard',
  },
  {
    id: 'biz12',
    name: 'Ogere Heritage Cyber Hub & Tech Training Centre',
    cat: 'Technology',
    ic: '💻',
    desc: 'High-speed internet workstations, computer repairs, graphic design, NIN/BVN services, and student programming bootcamps.',
    phone: '+234 809 112 3344',
    address: 'Express Bypass Junction, Ogere Remo',
    rating: '4.9★',
    tier: 'Standard',
  },
  {
    id: 'biz13',
    name: 'Idera Oluwa Community Pharmacy & Stores',
    cat: 'Health',
    ic: '💊',
    desc: 'Prescription dispensing, free blood pressure checks, diabetes screening, and authentic medical supplies for family health.',
    phone: '+234 803 223 4455',
    address: 'Station Road, Ogere Remo',
    rating: '4.7★',
    tier: 'Standard',
  },
  {
    id: 'biz14',
    name: 'Ogere Royal Stool Woodworks & Cabinetry',
    cat: 'Services',
    ic: '🪚',
    desc: 'Master woodcarvers producing handcrafted mahogany dining sets, royal traditional palace thrones, and durable roof trusses.',
    phone: '+234 807 665 4433',
    address: 'Idi-Iroko Workshop Strip, Ogere Remo',
    rating: '4.8★',
    tier: 'Standard',
  },
];

const catColor = { Hospitality: '#B5451B', Education: '#1a2e5e', Trade: '#8B6914', Transport: '#2D4A22', Services: '#7A2E0E', Health: '#5a1010', Agriculture: '#2D4A22', Technology: '#1a2e5e', Faith: '#8B6914', Infrastructure: '#2c2c0e', 'Food & Dining': '#8B3014' };

export default function BusinessPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [tab, setTab] = useState('directory');
  const [f, setF] = useState({ name: '', category: '', tier: 'Standard', image: '', address: '', phone: '', email: '', desc: '', owner: '', hours: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [stored, setStored] = useState([]);

  useEffect(() => { (async () => { const d = await dbGet('biz'); if (d && Array.isArray(d)) setStored(d); })(); }, []);

  const register = async () => {
    if (!f.name || !f.category) return;
    setBusy(true);

    if (f.tier === 'Premium') {
      try {
        await initializePayment({
          email: f.email || 'business@ogereremo.ng',
          amount: 15000,
          title: `Premium Listing: ${f.name}`,
          purpose: 'Ogere Remo Business Directory — Pro Plan Listing',
          metadata: { businessName: f.name, category: f.category },
        });
      } catch (err) {
        console.error('Payment error:', err);
      }
    }

    const msg = await sendAnthropicMessage(
      'You are the Ogere Remo business directory assistant. A business just registered. Write a warm 3-sentence welcome. End with a Yoruba phrase.',
      `Business: ${f.name}, Category: ${f.category}, Tier: ${f.tier}`
    );
    setAiMsg(msg || 'Welcome to the Ogere Remo Business Directory! Ẹ ṣéun!');
    const session = await getSession();
    const entry = { ...f, id: Date.now(), status: 'pending', submitted: new Date().toLocaleDateString('en-NG'), ic: '🏪', userId: session?.id || '' };
    const updated = [...stored, entry];
    setStored(updated);
    await dbSet('biz', updated);
    setDone(true); setBusy(false);
    setF({ name: '', category: '', tier: 'Standard', image: '', address: '', phone: '', email: '', desc: '', owner: '', hours: '', website: '' });
  };

  const all = [...STATIC, ...stored];
  const shown = all.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || (b.name + b.desc + b.cat).toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || (b.cat === catFilter || b.category === catFilter);
    return matchQ && matchCat;
  });

  return (
    <div style={{ background: 'var(--darker)' }}>
      <SEO title="Business Directory" description="Business directory for Ogere Remo — find local businesses, services, and enterprises in the community." />
      <Hero ey="Commerce & Enterprise" ti="Ogere Business Directory" sub="Find businesses in Ogere Remo — or register yours to reach the global diaspora." />
      <AdireDivider />
      
      <Section py="2rem">
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['directory', '🏪 Browse Directory'], ['register', '+ Register Business']].map(([id, l]) => (
            <button key={id} className={tab === id ? 'btn-p' : 'btn-o'} onClick={() => setTab(id)}>{l}</button>
          ))}
        </div>
      </Section>

      {tab === 'directory' && (
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 'min(280px, 100%)' }}>
              <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.2em', fontSize: '0.65rem', marginBottom: '0.5rem' }}>COMMUNITY HUB</p>
              <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Local Directory</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', maxWidth: '500px' }}>
              <div style={{ flex: 1, minWidth: 'min(140px, 100%)' }}>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Filter Category</label>
                <select className="inp" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: '100%' }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 'min(180px, 100%)' }}>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Search Keywords</label>
                <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Type to search..." style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            {shown.map((b, i) => {
              const isPremium = b.tier === 'Premium' || b.rating; // Static ones have ratings, consider them premium for UI
              return (
                <div 
                  key={b.id || i} 
                  className="glass reveal active"
                  style={{ 
                    padding: '0', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: isPremium ? 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' : '1fr',
                    borderLeft: `4px solid ${isPremium ? 'var(--gold)' : 'rgba(201, 150, 58, 0.2)'}`,
                    transition: 'var(--transition)'
                  }}
                >
                  {isPremium && (b.image || STATIC.find(s => s.id === b.id)?.src || '/images/Ogere%20Central%20Market.webp') && (
                    <div style={{ height: '100%', minHeight: '200px', background: `url(${b.image || '/images/Ogere%20Central%20Market.webp'}) center/cover` }}>
                       {isPremium && <div className="glass cinzel" style={{ display: 'inline-block', margin: '1rem', padding: '0.3rem 0.8rem', fontSize: '0.6rem', color: 'var(--gold)', background: 'var(--dark-glass)' }}>PREMIUM LISTING</div>}
                    </div>
                  )}
                  <div style={{ padding: 'clamp(1.2rem, 3vw, 2rem)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="tag" style={{ background: catColor[b.cat || b.category] || 'var(--gold)', color: 'var(--cream)', margin: 0 }}>{b.cat || b.category}</span>
                      {b.rating && <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{b.rating}</span>}
                    </div>
                    <h3 className="playfair" style={{ fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>{b.name}</h3>
                    <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.7)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>{b.desc}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: '1rem' }}>
                      {b.phone && (
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(245, 237, 216, 0.5)' }}>📞 {b.phone}</span>
                          <a
                            href={`https://wa.me/${b.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(b.name)},%20I%20found%20your%20business%20on%20the%20Ogere%20Remo%20Directory.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.72rem', color: '#25D366', textDecoration: 'none', fontWeight: 'bold' }}
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      )}
                      {b.address && <div style={{ fontSize: '0.8rem', color: 'rgba(245, 237, 216, 0.5)' }}>📍 {b.address}</div>}
                      {b.website && <div style={{ fontSize: '0.8rem', color: 'rgba(245, 237, 216, 0.5)' }}>🌐 <a href={b.website.startsWith('http') ? b.website : `https://${b.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>{b.website}</a></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {tab === 'register' && (
        <Section mw={800}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
             <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '0.5rem' }}>GROW WITH US</p>
             <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Register Business</h2>
             <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.6)', maxWidth: '600px', margin: '0 auto' }}>Select a plan and join the official community directory. Premium listings get featured images and priority placement.</p>
          </div>

          {done ? (
            <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 4rem)', textAlign: 'center', borderRadius: '12px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
              <h3 className="playfair" style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '1rem' }}>Application Submitted</h3>
              <p className="baskerville" style={{ color: 'var(--cream)', fontStyle: 'italic', marginBottom: '2.5rem' }}>"{aiMsg}"</p>
              <button className="btn-p" onClick={() => { setDone(false); setTab('directory'); }}>Back to Directory →</button>
            </div>
          ) : (
            <div className="glass" style={{ padding: 'clamp(1.2rem, 4vw, 3rem)', borderRadius: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Standard Plan */}
                <div 
                  onClick={() => setF({...f, tier: 'Standard'})}
                  style={{ 
                    padding: '2rem', borderRadius: '8px', cursor: 'pointer',
                    background: f.tier === 'Standard' ? 'rgba(201, 150, 58, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: f.tier === 'Standard' ? '2px solid var(--gold)' : '2px solid transparent',
                    transition: 'var(--transition)'
                  }}
                >
                   <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>BASE PLAN</div>
                   <h4 className="playfair" style={{ fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '1rem' }}>Standard Listing</h4>
                   <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'rgba(245, 237, 216, 0.6)', lineHeight: 1.8 }}>
                      <li>Contact Information</li>
                      <li>Basic Description</li>
                      <li>Category Search</li>
                   </ul>
                   <div className="cinzel" style={{ fontSize: '1.2rem', color: 'var(--gold)', marginTop: '1.5rem' }}>FREE</div>
                </div>

                {/* Premium Plan */}
                <div 
                  onClick={() => setF({...f, tier: 'Premium'})}
                  style={{ 
                    padding: '2rem', borderRadius: '8px', cursor: 'pointer',
                    background: f.tier === 'Premium' ? 'rgba(201, 150, 58, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: f.tier === 'Premium' ? '2px solid var(--gold)' : '2px solid transparent',
                    transition: 'var(--transition)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                   <div style={{ position: 'absolute', top: '10px', right: '-30px', background: 'var(--red)', color: 'white', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.5rem', fontWeight: 700 }}>RECOMMENDED</div>
                   <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>PRO PLAN</div>
                   <h4 className="playfair" style={{ fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '1rem' }}>Premium Listing</h4>
                   <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'rgba(245, 237, 216, 0.6)', lineHeight: 1.8 }}>
                      <li><strong>Featured Images</strong></li>
                      <li>Website Links</li>
                      <li>Priority Placement</li>
                      <li>Extended Description</li>
                   </ul>
                   <div className="cinzel" style={{ fontSize: '1.2rem', color: 'var(--gold)', marginTop: '1.5rem' }}>PARTNERSHIP</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {[['Business Name *', 'text', 'name'], ['Category *', 'text', 'category'], ['Phone', 'tel', 'phone'], ['Email', 'email', 'email'], ['Address', 'text', 'address'], ['Website', 'url', 'website']].map(([l, t, k]) => (
                  <div key={k}>
                    <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>{l}</label>
                    <input className="inp" type={t} value={f[k]} onChange={e => setF({...f, [k]: e.target.value})} placeholder={l.replace(' *', '')} />
                  </div>
                ))}
              </div>

              {f.tier === 'Premium' && (
                <div style={{ marginTop: '1.5rem', animation: 'fadeUp 0.3s ease' }}>
                  <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>Featured Business Image (URL)</label>
                  <input className="inp" value={f.image} onChange={e => setF({...f, image: e.target.value})} placeholder="https://example.com/image.jpg" />
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>Business Description *</label>
                <textarea className="inp" value={f.desc} onChange={e => setF({...f, desc: e.target.value})} placeholder="Describe your services, history, and values..." style={{ minHeight: '120px', resize: 'vertical' }} />
              </div>

              <button className="btn-p" onClick={register} disabled={busy} style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                {busy ? <><Spinner /> Registering...</> : 'Complete Registration →'}
              </button>
            </div>
          )}
        </Section>
      )}
      <AdireDivider />
    </div>
  );
}
