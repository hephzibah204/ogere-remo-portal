import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import { signUp } from '../services/auth';

export default function SignUpPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.username || !form.password) { setError('All fields required.'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const result = await signUp({ name: form.name, email: form.email, username: form.username, password: form.password });
    setLoading(false);
    if (result.ok) nav('/dashboard');
    else setError(result.error);
  };

  return (
    <div>
      <SEO title="Create Account" description="Join the Ogere Remo community — sign up for a free account to participate in the forum, submit business listings, and more." />
      <Hero ey="Community" ti="Create Account" sub="Join the Ogere Remo online community." />
      <AdireDivider />
      <Section bg="#1a0d06" mw={440}>
        {error && <div style={{ padding: '.6rem', background: 'rgba(220,38,38,.12)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 4, marginBottom: '1rem', color: '#f87171', fontSize: '.82rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.8rem' }}>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Full Name</label>
            <input className="inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Email</label>
            <input type="email" className="inp" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Username</label>
            <input className="inp" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Choose a username" />
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Password</label>
            <input type="password" className="inp" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 4 characters" />
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Confirm Password</label>
            <input type="password" className="inp" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn-p" disabled={loading} style={{ marginTop: '.5rem' }}>{loading ? 'Creating account...' : 'Create Account →'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.78rem', color: 'rgba(245,237,216,.45)' }}>
          Already have an account? <Link to="/signin" style={{ color: '#C9963A' }}>Sign in</Link>
        </p>
      </Section>
      <AdireDivider />
    </div>
  );
}
