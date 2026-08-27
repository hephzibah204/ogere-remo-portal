import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOpenRouterMessage } from '../services/openrouter';

const PAGES = [
  { path: '/history', label: 'History & Heritage', keywords: 'history founded olipakala yemogun ilagere agbele timeline 1401 remo' },
  { path: '/monarchy', label: 'Monarchy & Kings', keywords: 'king oba ologere ruling houses crown coronation james obafemi saliu palace kankanbiina' },
  { path: '/timeline', label: 'Historical Timeline', keywords: 'timeline 1401 600 years chronicles milestones events' },
  { path: '/oriki', label: 'Oriki Praise Poetry', keywords: 'oriki praise poetry royal poems yoruba chants kankanbiina lipakala' },
  { path: '/families', label: 'Notable Families', keywords: 'families agbato babington ashaye ositelu ogunbade compounds lineage' },
  { path: '/associations', label: 'Associations & Societies', keywords: 'associations ocda oyda lagos forum omcoosa osugbo oro pampa societies' },
  { path: '/education', label: 'Education & Schools', keywords: 'schools college ositelu memorial christ church academy education teachers' },
  { path: '/scholarships', label: 'Scholarships & Grants', keywords: 'scholarships grants bursary education financial aid student apply kankanbina tech grant' },
  { path: '/health', label: 'Health & Blood Bank', keywords: 'health medical clinic hospital pharmacy blood donor emergency primary care' },
  { path: '/faith', label: 'Faith & Culture', keywords: 'church aladura faith festivals lipakala obalufon festival culture mosques' },
  { path: '/gallery', label: 'Photo Gallery', keywords: 'gallery photos coronation palace development heritage pictures' },
  { path: '/live', label: 'Live Broadcasts & TV', keywords: 'live tv video stream broadcast coronation lipakala festival events' },
  { path: '/news', label: 'News & Updates', keywords: 'news headlines community updates development dispatches gazette' },
  { path: '/blog', label: 'Community Blog', keywords: 'blog articles stories perspectives news opinions' },
  { path: '/tourism', label: 'Tourism & Landmarks', keywords: 'tourism resort hills palace cultural centre attractions landmarks hospitality' },
  { path: '/business', label: 'Business Directory', keywords: 'business directory register shop market commerce enterprise artisan' },
  { path: '/marketplace', label: 'Marketplace', keywords: 'marketplace buy sell shop yam adire crafts services farm produce oja ale' },
  { path: '/land-registry', label: 'Land Registry', keywords: 'land registry plots property ownership survey dispute verification deed' },
  { path: '/royal-audience', label: 'Book Royal Audience', keywords: 'royal audience palace appointment oba king meeting consultation booking' },
  { path: '/id-card', label: 'Digital ID Card', keywords: 'id card digital identity indigene resident diaspora citizen verification apply' },
  { path: '/verify-id', label: 'Verify Digital ID', keywords: 'verify id card check status authentic identity validation' },
  { path: '/governance', label: 'Governance Dashboard', keywords: 'governance dashboard projects tracker transparency administration ocda' },
  { path: '/diaspora', label: 'Diaspora Network', keywords: 'diaspora global network notable sons daughters abroad uk usa' },
  { path: '/events', label: 'Events Calendar', keywords: 'events calendar festival ceremonies lipakala day meetings schedule' },
  { path: '/forum', label: 'Community Forum', keywords: 'forum discussion community board talk topics conversation' },
  { path: '/miss-olipakala', label: 'Miss Olipakala Pageant', keywords: 'miss olipakala pageant beauty queen lipakala contest register' },
  { path: '/quiz', label: 'Heritage Quiz', keywords: 'quiz trivia test knowledge yoruba ogere culture questions' },
  { path: '/map', label: 'Interactive Map', keywords: 'map landmarks directions emergency services location gps places' },
  { path: '/alerts', label: 'Security Alerts & Emergency', keywords: 'alerts security police emergency frsc safety 112 hotline report' },
  { path: '/contact', label: 'Contact OCDA', keywords: 'contact reach community directory palace email phone' },
  { path: '/dashboard', label: 'User Dashboard', keywords: 'dashboard profile my submissions id status activity account' },
];

export default function AiSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const inpRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (open) inpRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    if (q.length < 3) {
      const fuzzy = PAGES.filter(p =>
        p.label.toLowerCase().includes(q.toLowerCase()) ||
        p.keywords.toLowerCase().includes(q.toLowerCase())
      );
      setResults(fuzzy.map(p => ({ label: p.label, path: p.path, score: 1 })));
      return;
    }
    setBusy(true);
    const pageList = PAGES.map(p => `${p.label}: ${p.keywords}`).join('\n');
    const msg = await sendOpenRouterMessage(
      `You are a search assistant for the Ogere Remo website. Given a user query and a list of pages with keywords, return the 1-3 most relevant page paths as a JSON array of objects with keys "path" and "label". Only respond with valid JSON, nothing else. Pages available:\n${pageList}`,
      `User query: "${q}". Return the most relevant pages as JSON.`
    );
    if (msg) {
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed)) {
          setResults(parsed.map(r => ({ label: r.label, path: r.path, score: 2 })));
          setBusy(false);
          return;
        }
      } catch {}
    }
    const fuzzy = PAGES.filter(p =>
      p.label.toLowerCase().includes(q.toLowerCase()) ||
      p.keywords.toLowerCase().includes(q.toLowerCase())
    );
    setResults(fuzzy.map(p => ({ label: p.label, path: p.path, score: 1 })));
    setBusy(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '.2rem .3rem', color: 'rgba(245,237,216,.6)', transition: 'color .2s' }}
        aria-label="Search"
      >
        🔍
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 9998, marginTop: 8,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: '#1a0d06', border: '1px solid rgba(201,150,58,.3)', borderTop: '3px solid #C9963A',
          borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,.6)',
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,150,58,.12)' }}>
            <input
              ref={inpRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search(); if (e.key === 'Escape') setOpen(false); }}
              placeholder="Search Ogere Remo..."
              style={{ flex: 1, padding: '.65rem .8rem', fontSize: '.8rem', background: 'rgba(44,26,14,.4)', border: 'none', color: '#F5EDD8', outline: 'none' }}
            />
            <button onClick={search} disabled={busy} style={{ padding: '.65rem .9rem', background: '#C9963A', border: 'none', color: '#1a0d06', fontSize: '.7rem', cursor: 'pointer', fontWeight: 600 }}>{busy ? '...' : 'Go'}</button>
          </div>
          {results && (
            <div style={{ padding: '.5rem' }}>
              {results.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '.75rem', color: 'rgba(245,237,216,.4)' }}>No results found</div>
              ) : (
                results.map((r, i) => (
                  <div key={i} onClick={() => { navigate(r.path); setOpen(false); setResults(null); setQuery(''); }}
                    style={{ padding: '.6rem .7rem', cursor: 'pointer', borderRadius: 4, transition: 'background .15s', display: 'flex', alignItems: 'center', gap: '.5rem' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,150,58,.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '.8rem', color: '#C9963A' }}>📄</span>
                    <div>
                      <div style={{ fontSize: '.8rem', color: '#F5EDD8' }}>{r.label}</div>
                      <div style={{ fontSize: '.6rem', color: 'rgba(245,237,216,.35)' }}>{r.path}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {!results && query.length > 0 && (
            <div style={{ padding: '.8rem', textAlign: 'center', fontSize: '.72rem', color: 'rgba(245,237,216,.35)' }}>Press Enter or click Go to search</div>
          )}
        </div>
      )}
    </div>
  );
}