import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import { signUp } from '../services/auth';

export default function SignUpPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();
    const cleanPhone = form.phone.trim();
    const cleanUsername = form.username.trim();
    const password = form.password;

    if (!cleanName || !cleanEmail || !cleanUsername || !password) {
      setError('Please fill in all required fields (Name, Email, Username, Password).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signUp({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      username: cleanUsername,
      password,
    });
    setLoading(false);

    if (result.ok) {
      nav('/dashboard');
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div>
      <SEO title="Create Account" description="Join the Ogere Remo community — sign up for a free account to participate in the forum, submit business listings, and more." />
      <Hero ey="Community" ti="Create Account" sub="Join the Ogere Remo online community." />
      <AdireDivider />
      <Section bg="#1a0d06" mw={460}>
        {error && <div style={{ padding: '.6rem', background: 'rgba(220,38,38,.12)', border: '1px solid rgba(220,38,38,.25)', borderRadius: 4, marginBottom: '1rem', color: '#f87171', fontSize: '.82rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.8rem' }}>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Full Name *</label>
            <input className="inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Adewale Babatunde Ogunleke" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
            <div>
              <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Email *</label>
              <input type="email" className="inp" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Phone (Optional)</label>
              <input type="tel" className="inp" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08034512345" />
            </div>
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Username *</label>
            <input className="inp" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Choose a username (e.g. adewale)" autoCapitalize="none" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
            <div>
              <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Password *</label>
              <input type="password" className="inp" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 chars" required />
            </div>
            <div>
              <label className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', display: 'block', marginBottom: '.25rem' }}>Confirm Password *</label>
              <input type="password" className="inp" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" required />
            </div>
          </div>
          <button type="submit" className="btn-p" disabled={loading} style={{ marginTop: '.5rem' }}>{loading ? 'Creating account...' : 'Create Account →'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.78rem', color: 'rgba(245,237,216,.55)' }}>
          Already have an account? <Link to="/signin" style={{ color: '#C9963A', fontWeight: 700 }}>Sign in</Link>
        </p>
      </Section>
      <AdireDivider />
    </div>
  );
}
