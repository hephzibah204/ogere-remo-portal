import { useState, useEffect, useMemo } from 'react';
import { STATIC_NEWS, newsCatColor } from '../data/news';
import { dbGet, dbSet } from '../services/storage';
import { sendAnthropicMessage } from '../services/api';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import SEO from '../components/SEO';

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'development', label: 'Development' },
  { id: 'royal', label: 'Royal & Heritage' },
  { id: 'education', label: 'Education & Youth' },
  { id: 'health', label: 'Health & Welfare' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'culture', label: 'Culture & Festivals' },
  { id: 'diaspora', label: 'Diaspora' },
  { id: 'community', label: 'Community' },
];

export default function NewsPage() {
  const [f, setF] = useState({ name: '', headline: '', body: '', category: 'development', date: '', contact: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [stored, setStored] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expand, setExpand] = useState(null);
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    (async () => {
      const d = await dbGet('news');
      if (d && Array.isArray(d)) setStored(d);
    })();
  }, []);

  const submit = async () => {
    if (!f.name || !f.headline || !f.body) return;
    setBusy(true);
    const msg = await sendAnthropicMessage(
      'You are the Ogere Remo news editor. A member submitted a story. Write a warm 3-sentence acknowledgement. End with a Yoruba blessing phrase.',
      `Name: ${f.name}, Headline: ${f.headline}`
    );
    setAiMsg(msg || 'Thank you for submitting your story to the Ogere Remo Community Record! Ẹ ṣéun púpọ̀.');
    const entry = {
      ...f,
      id: `user-${Date.now()}`,
      ic: '📰',
      cat: f.category || 'community',
      date: f.date || 'Recent Submission',
      status: 'pending',
      submitted: new Date().toLocaleDateString('en-NG'),
      readTime: '2 min read',
      author: f.name,
    };
    const updated = [entry, ...stored];
    setStored(updated);
    await dbSet('news', updated);
    setDone(true);
    setBusy(false);
    setF({ name: '', headline: '', body: '', category: 'development', date: '', contact: '' });
  };

  // Combine stored submissions first, followed by default static news
  const allNews = useMemo(() => {
    return [...stored, ...STATIC_NEWS];
  }, [stored]);

  // Filter and search
  const filteredNews = useMemo(() => {
    return allNews.filter((item) => {
      const matchesCat = selectedCat === 'all' || item.cat === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.headline.toLowerCase().includes(q) ||
        (item.body && item.body.toLowerCase().includes(q)) ||
        (item.cat && item.cat.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [allNews, selectedCat, searchQuery]);

  const featuredArticle = useMemo(() => {
    return allNews.find((n) => n.featured) || allNews[0];
  }, [allNews]);

  const handleShare = (e, item) => {
    e.stopPropagation();
    const textToCopy = `${item.headline} — Ogere Remo News Portal`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div style={{ background: 'var(--darker)', minHeight: '100vh' }}>
      <SEO title="News & Updates" description="Latest news, royal events, infrastructure developments, and community updates from Ogere Remo." />
      <Hero
        ey="Official Chronicle"
        ti="News & Community Updates"
        sub="The latest developments, royal milestones, youth empowerment, infrastructure projects, and community achievements."
      />
      <AdireDivider />

      <Section bg="#120804" py="4rem">
        {/* Featured Story Banner (Shown when no search/filter is actively restricting it) */}
        {selectedCat === 'all' && !searchQuery && featuredArticle && (
          <div style={{ marginBottom: '3.5rem' }}>
            <div className="cinzel" style={{ fontSize: '.7rem', letterSpacing: '.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.8rem' }}>
              🌟 Featured Community Highlight
            </div>
            <div
              className="glass"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(201,150,58,.3)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                background: 'linear-gradient(135deg, rgba(201,150,58,.08) 0%, rgba(13,7,4,.95) 100%)',
              }}
            >
              {featuredArticle.image && (
                <div
                  style={{
                    minHeight: '260px',
                    background: `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.6)), url(${featuredArticle.image}) center/cover no-repeat`,
                    borderRight: '1px solid rgba(201,150,58,.15)',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    <span
                      style={{
                        background: newsCatColor[featuredArticle.cat] || 'var(--gold)',
                        color: '#fff',
                        fontSize: '.65rem',
                        padding: '.3rem .8rem',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {featuredArticle.cat}
                    </span>
                  </div>
                </div>
              )}
              <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
                  <span className="cinzel" style={{ fontSize: '.65rem', color: 'var(--gold-light)' }}>
                    📅 {featuredArticle.date}
                  </span>
                  {featuredArticle.readTime && (
                    <span className="cinzel" style={{ fontSize: '.65rem', color: 'rgba(245,237,216,.5)' }}>
                      ⏱️ {featuredArticle.readTime}
                    </span>
                  )}
                  {featuredArticle.author && (
                    <span className="cinzel" style={{ fontSize: '.65rem', color: 'rgba(245,237,216,.5)' }}>
                      ✍️ {featuredArticle.author}
                    </span>
                  )}
                </div>
                <h2 className="playfair" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'var(--cream)', marginBottom: '1rem', lineHeight: 1.3 }}>
                  {featuredArticle.headline}
                </h2>
                <p className="baskerville" style={{ fontSize: '1rem', color: 'rgba(245,237,216,.8)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  {featuredArticle.body}
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn-p"
                    onClick={() => setExpand(expand === featuredArticle.id ? null : featuredArticle.id)}
                    style={{ fontSize: '.75rem', padding: '.6rem 1.4rem' }}
                  >
                    {expand === featuredArticle.id ? 'Collapse Full Article ▲' : 'Read Full Coverage →'}
                  </button>
                  <button
                    className="btn-o"
                    onClick={(e) => handleShare(e, featuredArticle)}
                    style={{ fontSize: '.75rem', padding: '.6rem 1.2rem' }}
                  >
                    {copiedId === featuredArticle.id ? '✓ Copied Headline' : '🔗 Share Story'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Header & Search & Categories */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <p className="sl" style={{ marginBottom: '.3rem' }}>Community Gazette</p>
            <h2 className="st" style={{ margin: 0 }}>Latest Dispatches & Archives</h2>
          </div>
          <button className="btn-p" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {showForm ? '✕ Close Submission Panel' : '+ Submit a Story'}
          </button>
        </div>

        {/* Search Input and Category Pills */}
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: '10px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.4rem' }}>
                Search All Dispatches
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="inp"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type keyword, headline, author, or topic..."
                  style={{ paddingRight: '2.5rem' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
              <div className="cinzel" style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.6)' }}>
                Showing <strong style={{ color: 'var(--gold)' }}>{filteredNews.length}</strong> {filteredNews.length === 1 ? 'story' : 'stories'}
                {selectedCat !== 'all' && ` in "${CATEGORIES.find((c) => c.id === selectedCat)?.label}"`}
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => {
              const count = c.id === 'all' ? allNews.length : allNews.filter((n) => n.cat === c.id).length;
              const isActive = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  style={{
                    background: isActive ? (newsCatColor[c.id] || 'var(--gold)') : 'rgba(255,255,255,.05)',
                    color: isActive ? '#fff' : 'rgba(245,237,216,.75)',
                    border: `1px solid ${isActive ? 'transparent' : 'rgba(201,150,58,.2)'}`,
                    borderRadius: '20px',
                    padding: '.35rem .85rem',
                    fontSize: '.65rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{ opacity: 0.7, fontSize: '.6rem' }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Story Submission Form */}
        {showForm && (
          <div
            style={{
              background: 'rgba(201,150,58,.06)',
              border: '1px solid rgba(201,150,58,.3)',
              borderRadius: '10px',
              padding: '2rem',
              marginBottom: '3rem',
              borderTop: '4px solid var(--gold)',
              animation: 'fadeUp 0.3s ease',
            }}
          >
            <div className="cinzel" style={{ fontSize: '.75rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.2rem', fontWeight: 700 }}>
              ✍️ Submit a Community News Story
            </div>
            <p className="baskerville" style={{ color: 'rgba(245,237,216,.7)', fontSize: '.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Share local events, developmental milestones, achievements, or reports from your quarter or diaspora group for review and publication in the official portal.
            </p>

            {done ? (
              <div style={{ background: 'rgba(45,74,34,.2)', border: '1px solid rgba(45,74,34,.4)', borderLeft: '4px solid #4ade80', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.6rem' }}>🎉</div>
                <div className="cinzel" style={{ fontSize: '.75rem', letterSpacing: '.15em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '.8rem', fontWeight: 700 }}>
                  Story Submitted Successfully
                </div>
                <div style={{ fontSize: '.95rem', lineHeight: 1.8, color: 'rgba(245,237,216,.9)', fontStyle: 'italic', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                  &ldquo;{aiMsg}&rdquo;
                </div>
                <button
                  className="btn-p"
                  onClick={() => {
                    setDone(false);
                    setShowForm(false);
                  }}
                >
                  Return to News Feed
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.2rem' }}>
                <div>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Your Name / Title *</div>
                  <input type="text" className="inp" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Chief Adekunle Solarin" />
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Category</div>
                  <select className="inp" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} style={{ background: '#1a0d06', color: '#F5EDD8' }}>
                    <option value="development">Development</option>
                    <option value="royal">Royal & Heritage</option>
                    <option value="education">Education & Youth</option>
                    <option value="health">Health & Welfare</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="culture">Culture & Festivals</option>
                    <option value="diaspora">Diaspora</option>
                    <option value="community">Community</option>
                  </select>
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Date of Event</div>
                  <input type="text" className="inp" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="e.g. August 2026" />
                </div>
                <div>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Contact Info (Phone/Email)</div>
                  <input type="text" className="inp" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} placeholder="For verification" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Headline *</div>
                  <input className="inp" value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} placeholder="A concise, descriptive headline" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.35rem' }}>Full Story Details *</div>
                  <textarea className="inp" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="Provide full details, background context, key participants, and impact..." style={{ minHeight: 120, resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn-o" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="btn-p" onClick={submit} disabled={busy || !f.name || !f.headline || !f.body} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {busy ? <><Spinner /> Submitting to Editorial Team…</> : 'Submit Story →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stories List */}
        {filteredNews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(201,150,58,.02)', border: '1px dashed rgba(201,150,58,.2)', borderRadius: '10px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 className="playfair" style={{ color: 'var(--cream)', marginBottom: '.5rem' }}>No Dispatches Found</h3>
            <p className="baskerville" style={{ color: 'rgba(245,237,216,.6)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              We could not find any stories matching your current filter or search criteria.
            </p>
            <button className="btn-p" onClick={() => { setSelectedCat('all'); setSearchQuery(''); }}>
              Reset Filters & View All
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredNews.map((n, i) => {
              const isExpanded = expand === n.id;
              const catColor = newsCatColor[n.cat] || '#8B6914';

              return (
                <article
                  key={n.id || i}
                  style={{
                    background: 'rgba(201,150,58,.04)',
                    border: `1px solid ${isExpanded ? 'rgba(201,150,58,.45)' : 'rgba(201,150,58,.14)'}`,
                    borderLeft: `5px solid ${catColor}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    boxShadow: isExpanded ? '0 8px 24px rgba(0,0,0,.4)' : 'none',
                  }}
                >
                  <div
                    style={{
                      padding: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                      display: 'flex',
                      gap: '1.2rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpand(isExpanded ? null : n.id)}
                  >
                    {/* Thumbnail or Icon */}
                    {n.image ? (
                      <div
                        style={{
                          width: 'clamp(90px, 14vw, 130px)',
                          height: 'clamp(90px, 14vw, 120px)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid rgba(201,150,58,.3)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}
                      >
                        <img
                          src={n.image}
                          alt={n.headline}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.3s ease',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '2rem',
                          flexShrink: 0,
                          width: '64px',
                          height: '64px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(201,150,58,.08)',
                          borderRadius: '8px',
                          border: '1px solid rgba(201,150,58,.15)',
                        }}
                      >
                        {n.ic || '📰'}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      {/* Meta Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.6rem', marginBottom: '.6rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span
                            style={{
                              background: catColor,
                              color: '#F5EDD8',
                              fontSize: '.6rem',
                              fontFamily: 'var(--font-display)',
                              letterSpacing: '.06em',
                              padding: '.2rem .6rem',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {n.cat || 'General'}
                          </span>
                          {n.status === 'pending' && (
                            <span className="tag tag-blue" style={{ margin: 0 }}>
                              Pending Editorial Review
                            </span>
                          )}
                          {n.author && (
                            <span className="cinzel" style={{ fontSize: '.58rem', color: 'rgba(245,237,216,.5)' }}>
                              By {n.author}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                          {n.readTime && (
                            <span className="cinzel" style={{ fontSize: '.55rem', color: 'rgba(201,150,58,.65)' }}>
                              ⏱️ {n.readTime}
                            </span>
                          )}
                          <span className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.08em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                            {n.date}
                          </span>
                        </div>
                      </div>

                      {/* Headline */}
                      <h3
                        className="playfair"
                        style={{
                          fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                          color: '#F5EDD8',
                          lineHeight: 1.35,
                          marginBottom: '.6rem',
                          fontWeight: 700,
                        }}
                      >
                        {n.headline}
                      </h3>

                      {/* Excerpt or Preview */}
                      {!isExpanded && (
                        <p className="baskerville" style={{ fontSize: '.92rem', color: 'rgba(245,237,216,.65)', lineHeight: 1.6, margin: 0 }}>
                          {(n.body || '').slice(0, 140)}…
                          <span style={{ color: 'var(--gold)', marginLeft: '.5rem', fontWeight: 600 }}>Read more →</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded Body Section */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: '1px solid rgba(201,150,58,.15)',
                        padding: 'clamp(1.2rem, 2.5vw, 2rem)',
                        background: 'rgba(13,7,4,.5)',
                      }}
                    >
                      {n.image && (
                        <div
                          style={{
                            maxHeight: '340px',
                            width: '100%',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(201,150,58,.2)',
                          }}
                        >
                          <img
                            src={n.image}
                            alt={n.headline}
                            style={{ width: '100%', height: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}
                      <div className="baskerville" style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'rgba(245,237,216,.88)', marginBottom: '1.8rem' }}>
                        {n.body}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(201,150,58,.1)', paddingTop: '1rem' }}>
                        <div className="cinzel" style={{ fontSize: '.6rem', color: 'rgba(245,237,216,.45)' }}>
                          DISPATCH ID: {n.id} • PUBLISHED BY OGERE REMO MEDIA BUREAU
                        </div>
                        <div style={{ display: 'flex', gap: '.8rem' }}>
                          <button
                            className="btn-o"
                            onClick={(e) => handleShare(e, n)}
                            style={{ fontSize: '.65rem', padding: '.4rem .9rem' }}
                          >
                            {copiedId === n.id ? '✓ Copied Headline' : '🔗 Copy Headline'}
                          </button>
                          <button
                            className="btn-p"
                            onClick={() => setExpand(null)}
                            style={{ fontSize: '.65rem', padding: '.4rem .9rem' }}
                          >
                            Collapse ▲
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Section>

      <AdireDivider />
    </div>
  );
}

