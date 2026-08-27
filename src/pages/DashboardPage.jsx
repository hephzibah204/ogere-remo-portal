import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import { getSession, signOut, getUserSubmissions, updateProfile } from '../services/auth';

export default function DashboardPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', location: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getSession();
      if (!u) { nav('/signin'); return; }
      setUser(u);
      setProfile({ name: u.name || '', email: u.email || '', bio: u.bio || '', location: u.location || '' });
      const data = await getUserSubmissions(u.id);
      setSubs(data);
      setLoading(false);
    })();
  }, [nav]);

  const handleLogout = async () => {
    await signOut();
    nav('/');
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(user.id, profile);
    if (result.ok) { setUser(result.user); setEditing(false); setMsg('Profile updated.'); setTimeout(() => setMsg(''), 3000); }
    else setMsg(result.error);
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;

  const statCards = [
    { ic: '🪪', label: 'Digital ID Cards', count: subs?.idCards?.length || 0, link: '/id-card' },
    { ic: '👑', label: 'Royal Audiences', count: subs?.audiences?.length || 0, link: '/royal-audience' },
    { ic: '🎓', label: 'Scholarships', count: subs?.scholarships?.length || 0, link: '/scholarships' },
    { ic: '🛒', label: 'Marketplace', count: subs?.marketplace?.length || 0, link: '/marketplace' },
    { ic: '🗣️', label: 'Forum Posts', count: subs?.forum?.length || 0, link: '/forum' },
    { ic: '🏪', label: 'Businesses', count: subs?.business?.length || 0, link: '/business' },
    { ic: '📋', label: 'Associations', count: subs?.associations?.length || 0, link: '/associations' },
    { ic: '✉️', label: 'Messages', count: subs?.messages?.length || 0, link: '/contact' },
  ];

  return (
    <div>
      <SEO title="My Dashboard" description="Your Ogere Remo community dashboard — manage your profile and view your activity." />
      <Hero ey="Community" ti={`Welcome, ${user.name || user.username}`} sub="Manage your profile and view your community activity." />
      <AdireDivider />
      <Section bg="#1a0d06">
        {msg && <div style={{ padding: '.5rem 1rem', marginBottom: '1rem', background: 'rgba(45,74,34,.2)', border: '1px solid rgba(45,74,34,.3)', borderRadius: 4, color: '#a8d88e', fontSize: '.8rem' }}>{msg}</div>}

        <div className="astats" style={{ marginBottom: '2rem' }}>
          {statCards.map(s => (
            <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
              <div className="astat-card" style={{ cursor: 'pointer' }}>
                <div className="astat-num">{s.count}</div>
                <div className="astat-label">{s.ic} {s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
          <div className="asection">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
              <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>👤 My Profile</h3>
              <button className="abtn abtn-o" onClick={() => setEditing(!editing)} style={{ fontSize: '.5rem', padding: '.2rem .5rem' }}>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editing ? (
              <div style={{ display: 'grid', gap: '.5rem' }}>
                <input className="ainp" placeholder="Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ fontSize: '.72rem' }} />
                <input className="ainp" placeholder="Email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} style={{ fontSize: '.72rem' }} />
                <input className="ainp" placeholder="Location" value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} style={{ fontSize: '.72rem' }} />
                <textarea className="ainp" rows={3} placeholder="Bio" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} style={{ fontSize: '.72rem' }} />
                <button className="abtn abtn-p" onClick={handleSaveProfile} style={{ fontSize: '.55rem' }}>Save Profile</button>
              </div>
            ) : (
              <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.65)', display: 'grid', gap: '.3rem' }}>
                <div><span style={{ color: 'rgba(201,150,58,.6)' }}>Name:</span> {user.name}</div>
                <div><span style={{ color: 'rgba(201,150,58,.6)' }}>Email:</span> {user.email}</div>
                <div><span style={{ color: 'rgba(201,150,58,.6)' }}>Username:</span> @{user.username}</div>
                <div><span style={{ color: 'rgba(201,150,58,.6)' }}>Location:</span> {user.location || '—'}</div>
                <div><span style={{ color: 'rgba(201,150,58,.6)' }}>Bio:</span> {user.bio || '—'}</div>
                <div><span style={{ color: 'rgba(201,150,58,.6)' }}>Joined:</span> {new Date(user.created).toLocaleDateString('en-NG')}</div>
              </div>
            )}
          </div>

          <div className="asection">
            <h3 style={{ color: '#C9963A', fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.8rem' }}>📋 Recent Civic Activity</h3>
            {(!subs || Object.values(subs).every(a => !a || a.length === 0)) ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(245,237,216,.3)', fontSize: '.78rem' }}>
                No activity yet. Explore the community!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '.4rem' }}>
                {(subs.idCards || []).slice(-2).reverse().map((c, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.06)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>🪪 ID Card:</span>{' '}
                      <span style={{ color: '#F5EDD8' }}>{c.id || c.fullName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                      <span className={`atag ${c.status === 'approved' ? 'atag-green' : 'atag-gold'}`} style={{ fontSize: '.45rem' }}>{c.status || 'pending'}</span>
                      <Link to={`/verify-id/${c.id}`} style={{ color: 'var(--gold)', fontSize: '.6rem', textDecoration: 'none' }}>Verify →</Link>
                    </div>
                  </div>
                ))}
                {(subs.audiences || []).slice(-2).reverse().map((a, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.06)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>👑 Palace Audience:</span>{' '}
                      <span style={{ color: '#F5EDD8' }}>{a.purpose}</span>
                    </div>
                    <span className={`atag ${a.status === 'confirmed' ? 'atag-green' : 'atag-gold'}`} style={{ fontSize: '.45rem' }}>{a.status || 'pending'}</span>
                  </div>
                ))}
                {(subs.scholarships || []).slice(-2).reverse().map((s, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.06)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>🎓 Scholarship:</span>{' '}
                      <span style={{ color: '#F5EDD8' }}>{s.programTitle}</span>
                    </div>
                    <span className={`atag ${s.status === 'approved' ? 'atag-green' : 'atag-gold'}`} style={{ fontSize: '.45rem' }}>{s.status || 'pending'}</span>
                  </div>
                ))}
                {(subs.marketplace || []).slice(-2).reverse().map((m, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.06)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>🛒 Listing:</span>{' '}
                      <span style={{ color: '#F5EDD8' }}>{m.title}</span>
                    </div>
                    <span className="atag atag-green" style={{ fontSize: '.45rem' }}>{m.price}</span>
                  </div>
                ))}
                {(subs.forum || []).slice(-2).reverse().map((p, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.04)', borderRadius: 4 }}>
                    <span style={{ color: 'rgba(201,150,58,.6)' }}>💬 Forum:</span>{' '}
                    <span style={{ color: '#F5EDD8' }}>{p.topic}</span>
                    <span style={{ color: 'rgba(245,237,216,.3)', fontSize: '.6rem', marginLeft: '.3rem' }}>{p.date}</span>
                  </div>
                ))}
                {(subs.business || []).slice(-2).reverse().map((b, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.04)', borderRadius: 4 }}>
                    <span style={{ color: 'rgba(201,150,58,.6)' }}>🏪 Business:</span>{' '}
                    <span style={{ color: '#F5EDD8' }}>{b.name}</span>
                    <span className="atag atag-gold" style={{ fontSize: '.4rem', marginLeft: '.3rem' }}>{b.status || 'pending'}</span>
                  </div>
                ))}
                {(subs.associations || []).slice(-2).reverse().map((a, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.04)', borderRadius: 4 }}>
                    <span style={{ color: 'rgba(201,150,58,.6)' }}>📋 Association:</span>{' '}
                    <span style={{ color: '#F5EDD8' }}>{a.name}</span>
                    <span className="atag atag-gold" style={{ fontSize: '.4rem', marginLeft: '.3rem' }}>{a.status || 'pending'}</span>
                  </div>
                ))}
                {(subs.messages || []).slice(-2).reverse().map((m, i) => (
                  <div key={i} style={{ fontSize: '.72rem', padding: '.4rem .5rem', background: 'rgba(201,150,58,.04)', borderRadius: 4 }}>
                    <span style={{ color: 'rgba(201,150,58,.6)' }}>✉️ Message:</span>{' '}
                    <span style={{ color: '#F5EDD8' }}>{m.subject}</span>
                    <span style={{ color: 'rgba(245,237,216,.3)', fontSize: '.6rem', marginLeft: '.3rem' }}>{m.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="abtn abtn-d" onClick={handleLogout} style={{ fontSize: '.55rem' }}>🚪 Sign Out</button>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
