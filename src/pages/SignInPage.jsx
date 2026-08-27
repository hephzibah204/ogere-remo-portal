import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import { signIn, getSession } from '../services/auth';

export default function SignInPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSession().then(user => { if (user) nav('/dashboard'); });
  }, [nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await signIn(form.username, form.password);
    setLoading(false);
    if (result.ok) nav('/dashboard');
    else setError(result.error);
  };

  return (
    <div>
      <SEO title="Sign In" description="Sign in to your Ogere Remo community account." />
      <Hero ey="Welcome Back" ti="Sign In" sub="Access your community dashboard." />
      <AdireDivider />
      <Section bg="#1a0d06" mw={400}>
        {error && <div style={{ padding: '.6rem', background: 'rgba(220,38,38,.12)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 4, marginBottom: '1rem', color: '#f87171', fontSize: '.82rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.8rem' }}>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Username</label>
            <input className="inp" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Your username" autoFocus />
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Password</label>
            <input type="password" className="inp" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Your password" />
          </div>
          <button type="submit" className="btn-p" disabled={loading} style={{ marginTop: '.5rem' }}>{loading ? 'Signing in...' : 'Sign In →'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.78rem', color: 'rgba(245,237,216,.45)' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#C9963A' }}>Create one</Link>
        </p>
      </Section>
      <AdireDivider />
    </div>
  );
}
