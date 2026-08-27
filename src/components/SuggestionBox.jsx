import { useState } from 'react';
import { addItem } from '../services/cms';
import Spinner from './Spinner';

export default function SuggestionBox() {
  const [f, setF] = useState({ name: '', topic: 'Heritage', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.message.trim()) return;
    setBusy(true);
    await addItem('suggestions', {
      ...f,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-NG'),
      status: 'New'
    });
    setBusy(false);
    setDone(true);
    setF({ name: '', topic: 'Heritage', message: '' });
  };

  if (done) {
    return (
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
        <h3 className="playfair" style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>Thank You for Your Suggestion!</h3>
        <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.7)', marginBottom: '2rem' }}>
          Your feedback helps us build a better Ogere Remo portal. The community team will review your contribution shortly.
        </p>
        <button className="btn-o" onClick={() => setDone(false)}>Submit Another →</button>
      </div>
    );
  }

  return (
    <div className="glass" style={{ padding: 'clamp(1.2rem, 4vw, 2.5rem)', borderRadius: '12px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '0.5rem' }}>COMMUNITY VOICE</p>
        <h3 className="playfair" style={{ fontSize: '1.8rem', color: 'var(--cream)' }}>Suggestion Box</h3>
        <p className="baskerville" style={{ fontSize: '0.9rem', color: 'rgba(245, 237, 216, 0.5)' }}>Share your ideas to improve our town and portal.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.2rem' }}>
          <div>
            <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>Your Name (Optional)</label>
            <input 
              className="inp" 
              value={f.name} 
              onChange={e => setF({...f, name: e.target.value})} 
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>Topic</label>
            <select 
              className="inp" 
              value={f.topic} 
              onChange={e => setF({...f, topic: e.target.value})}
              style={{ cursor: 'pointer' }}
            >
              {['Heritage', 'Tourism', 'Business', 'Events', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', display: 'block', marginBottom: '0.4rem' }}>Your Suggestion *</label>
          <textarea 
            className="inp" 
            value={f.message} 
            onChange={e => setF({...f, message: e.target.value})} 
            placeholder="Tell us what's on your mind..."
            required
            style={{ minHeight: '120px', resize: 'vertical' }}
          />
        </div>

        <button className="btn-p" type="submit" disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
          {busy ? <><Spinner /> Sending...</> : 'Submit Suggestion →'}
        </button>
      </form>
    </div>
  );
}
