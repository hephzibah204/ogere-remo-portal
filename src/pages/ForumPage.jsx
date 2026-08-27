import { useState, useEffect, useMemo } from 'react';
import { dbGet, dbSet } from '../services/storage';
import { sendAnthropicMessage } from '../services/api';
import { getSession } from '../services/auth';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

const SEED = [
  {
    id: 1,
    name: 'Ogere Son (Lagos)',
    cat: 'heritage',
    topic: 'The History of Olipakala — What We Know',
    body: "I've been reading about our founding ancestor Olipakala. Does anyone have more information about the oral traditions passed down in their compounds?",
    date: 'May 15, 2026',
    likes: 12,
    replies: [
      { name: 'Community Elder', body: "Olipakala's oriki is still recited by the Legunsen house during royal ceremonies.", date: 'May 16, 2026' }
    ]
  },
  {
    id: 2,
    name: 'UK Diasporan',
    cat: 'development',
    topic: 'How can we contribute to Ogere civic projects from abroad?',
    body: 'Living in London, I want to support our home development. Is there an official channel for diaspora project funding?',
    date: 'May 18, 2026',
    likes: 19,
    replies: [
      { name: 'OCDA Member', body: 'Yes! The Diaspora Network and Civic Project Endowment fund coordinates donations and project reporting.', date: 'May 18, 2026' }
    ]
  },
  {
    id: 3,
    name: 'Resident',
    cat: 'news',
    topic: 'Lipakala Day 50th Edition — Golden Jubilee Preparations',
    body: 'The 50th Lipakala Day is coming next year. What cultural and youth activities are planned for the golden jubilee?',
    date: 'May 20, 2026',
    likes: 8,
    replies: []
  },
];

const catColor = {
  heritage: '#8B6914',
  development: '#2D4A22',
  news: '#1a2e5e',
  general: '#7A2E0E',
  security: '#5a1010',
  diaspora: '#0891b2',
};

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [f, setF] = useState({ name: '', topic: '', body: '', cat: 'general' });
  const [busy, setBusy] = useState(false);
  const [expand, setExpand] = useState(null);
  const [replyInput, setReplyInput] = useState({ name: '', body: '' });
  const [replyBusy, setReplyBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await dbGet('forum');
      if (d && Array.isArray(d) && d.length > 0) {
        setPosts(d);
      } else {
        setPosts(SEED);
        await dbSet('forum', SEED);
      }
    })();
  }, []);

  const handleLike = async (postId, e) => {
    e.stopPropagation();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: (p.likes || 0) + 1 };
      }
      return p;
    });
    setPosts(updated);
    await dbSet('forum', updated);
  };

  const handleAddReply = async (postId) => {
    if (!replyInput.body.trim()) return;
    setReplyBusy(true);
    const newReply = {
      name: replyInput.name.trim() || 'Community Member',
      body: replyInput.body.trim(),
      date: new Date().toLocaleDateString('en-NG'),
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...(p.replies || []), newReply],
        };
      }
      return p;
    });

    setPosts(updated);
    await dbSet('forum', updated);
    setReplyInput({ name: '', body: '' });
    setReplyBusy(false);
  };

  const post = async () => {
    if (!f.name || !f.topic || !f.body) return;
    setBusy(true);
    const session = await getSession();
    const newPost = {
      id: Date.now(),
      name: f.name,
      cat: f.cat,
      topic: f.topic,
      body: f.body,
      date: new Date().toLocaleDateString('en-NG'),
      likes: 1,
      replies: [],
      userId: session?.id || '',
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    await dbSet('forum', updated);
    setBusy(false);
    setExpand(newPost.id);
    setF({ name: '', topic: '', body: '', cat: 'general' });
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (activeCat !== 'All' && p.cat !== activeCat.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (p.topic || '').toLowerCase().includes(q) ||
          (p.body || '').toLowerCase().includes(q) ||
          (p.name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, activeCat, search]);

  return (
    <div>
      <SEO title="Community Forum" description="Community forum for discussion, news, heritage, and development of Ogere Remo." />
      <Hero
        ey="Community Voice"
        ti="Community Forum"
        sub="Share news, ask questions, discuss Ogere Remo heritage and civic progress — for residents, diaspora and visitors."
        dark
      />
      <AdireDivider />

      <Section bg="#1a0d06" py="3.5rem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          <div>
            {/* Search & Filter Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <input
                  className="inp"
                  placeholder="Search discussions, topics, keywords..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '200px' }}
                />
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['All', 'Heritage', 'Development', 'News', 'Security', 'Diaspora', 'General'].map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontFamily: "'Cinzel', serif",
                      fontSize: '0.55rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      background: activeCat === c ? 'var(--gold)' : 'rgba(201,150,58,0.08)',
                      color: activeCat === c ? 'var(--darker)' : 'rgba(245,237,216,0.7)',
                      border: activeCat === c ? 'none' : '1px solid rgba(201,150,58,0.2)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Stream */}
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {filteredPosts.length === 0 ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,237,216,0.5)', borderRadius: '8px' }}>
                  No discussions found matching your filter. Start a new topic on the right!
                </div>
              ) : (
                filteredPosts.map((p) => {
                  const isExp = expand === p.id;
                  return (
                    <div
                      key={p.id}
                      className="glass"
                      style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: `1px solid ${isExp ? 'var(--gold)' : 'rgba(201,150,58,0.18)'}`,
                        borderLeft: `4px solid ${catColor[p.cat] || '#C9963A'}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{ padding: '1.2rem', cursor: 'pointer' }}
                        onClick={() => setExpand(isExp ? null : p.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.4rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              className="cinzel"
                              style={{
                                background: (catColor[p.cat] || '#8B6914') + '30',
                                color: catColor[p.cat] || 'var(--gold)',
                                border: `1px solid ${catColor[p.cat] || 'var(--gold)'}60`,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.52rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                display: 'inline-block',
                                marginBottom: '0.4rem',
                              }}
                            >
                              {p.cat}
                            </span>
                            <div className="playfair" style={{ fontSize: '1.1rem', color: 'var(--cream)', lineHeight: 1.35 }}>
                              {p.topic}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.08em', color: 'rgba(201,150,58,.65)', textTransform: 'uppercase' }}>
                              {p.date}
                            </div>
                            <div style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.55)', marginTop: '.15rem' }}>
                              by {p.name}
                            </div>
                          </div>
                        </div>

                        {/* Summary preview */}
                        {!isExp && (
                          <p style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.65)', marginTop: '0.6rem', marginBottom: '0.4rem', lineHeight: 1.6 }}>
                            {p.body?.length > 110 ? p.body.substring(0, 110) + '…' : p.body}
                          </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', borderTop: '1px solid rgba(201,150,58,0.08)', paddingTop: '0.6rem' }}>
                          <button
                            onClick={(e) => handleLike(p.id, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--gold)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            ❤️ <strong>{p.likes || 0}</strong> Upvotes
                          </button>

                          <span style={{ fontSize: '.7rem', color: 'var(--gold)' }}>
                            💬 {p.replies?.length || 0} {p.replies?.length === 1 ? 'reply' : 'replies'} · {isExp ? 'Collapse' : 'Read & Reply →'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded View with Full Thread & Reply Form */}
                      {isExp && (
                        <div style={{ borderTop: '1px solid rgba(201,150,58,.15)', padding: '1.2rem', background: 'rgba(0,0,0,0.25)' }}>
                          <div style={{ fontSize: '.9rem', lineHeight: 1.8, color: 'rgba(245,237,216,.85)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                            {p.body}
                          </div>

                          {/* Replies List */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div className="cinzel" style={{ fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                              Thread Responses ({p.replies?.length || 0})
                            </div>
                            {p.replies && p.replies.length > 0 ? (
                              p.replies.map((r, ri) => (
                                <div key={ri} style={{ background: 'rgba(201,150,58,.04)', borderLeft: '3px solid var(--gold)', padding: '.75rem 1rem', borderRadius: '4px', marginBottom: '.6rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                                    <span style={{ fontSize: '.78rem', color: 'var(--cream)', fontWeight: 'bold' }}>{r.name}</span>
                                    <span className="cinzel" style={{ fontSize: '.52rem', color: 'rgba(245,237,216,.4)', textTransform: 'uppercase' }}>{r.date}</span>
                                  </div>
                                  <div style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.75)', lineHeight: 1.68 }}>{r.body}</div>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.4)', fontStyle: 'italic' }}>
                                No replies yet. Be the first to share your perspective below.
                              </div>
                            )}
                          </div>

                          {/* Quick Reply Form */}
                          <div style={{ background: 'rgba(201,150,58,0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(201,150,58,0.15)' }}>
                            <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                              Post a Reply to this Thread
                            </div>
                            <div style={{ display: 'grid', gap: '0.6rem' }}>
                              <input
                                className="inp"
                                placeholder="Your name (e.g. Adebayo from Oke-Ogere)..."
                                value={replyInput.name}
                                onChange={e => setReplyInput({ ...replyInput, name: e.target.value })}
                                style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
                              />
                              <textarea
                                className="inp"
                                rows={2}
                                placeholder="Write your response respectfully..."
                                value={replyInput.body}
                                onChange={e => setReplyInput({ ...replyInput, body: e.target.value })}
                                style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem', resize: 'vertical' }}
                              />
                              <div style={{ textAlign: 'right' }}>
                                <button
                                  className="btn-p"
                                  onClick={() => handleAddReply(p.id)}
                                  disabled={replyBusy || !replyInput.body.trim()}
                                  style={{ fontSize: '0.65rem', padding: '0.5rem 1.2rem' }}
                                >
                                  {replyBusy ? 'Posting…' : 'Submit Reply →'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Start a New Discussion Sidebar */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="glass" style={{ padding: 'clamp(1.2rem, 3vw, 2rem)', borderRadius: '14px', borderTop: '3px solid var(--gold)' }}>
              <p className="sl">Your Voice</p>
              <h3 className="playfair" style={{ fontSize: '1.4rem', color: '#F5EDD8', marginBottom: '1.5rem' }}>Start a Discussion</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>Your Name *</div>
                  <input required className="inp" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Your name or family compound" />
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>Category</div>
                  <select className="inp" value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} style={{ cursor: 'pointer', background: '#120803' }}>
                    {['general', 'heritage', 'development', 'news', 'security', 'diaspora'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>Topic / Subject *</div>
                  <input required className="inp" value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })} placeholder="What would you like to discuss?" />
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.56rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>Your Message *</div>
                  <textarea required className="inp" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} placeholder="Share your thoughts, suggestions, or inquiry…" style={{ minHeight: 110, resize: 'vertical' }} />
                </div>
                <div style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.45)', background: 'rgba(201,150,58,.04)', padding: '.6rem .8rem', border: '1px solid rgba(201,150,58,.1)', borderRadius: '6px' }}>
                  👑 <em>Respectful dialogue builds our ancient kingdom. For security emergencies, call 112 immediately.</em>
                </div>
                <button className="btn-p" onClick={post} disabled={busy || !f.name || !f.topic || !f.body} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                  {busy ? <><Spinner />Posting…</> : 'Publish Discussion →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
