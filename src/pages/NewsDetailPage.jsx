import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { STATIC_NEWS, newsCatColor } from '../data/news';
import Section from '../components/Section';
import AdireDivider from '../components/AdireDivider';
import SEO from '../components/SEO';

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Find article by id or slug
  const article = STATIC_NEWS.find(
    (n) => n.id === id || n.slug === id || (n.id && n.id.toLowerCase() === (id || '').toLowerCase())
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) {
    return (
      <div style={{ minHeight: '80vh', background: '#0D0704', color: '#F5EDD8' }}>
        <SEO title="Article Not Found" description="The requested news article could not be found on the Ogere Remo Portal." />
        <Section bg="#0D0704" py="5rem">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📰</div>
            <h1 className="playfair" style={{ fontSize: '2rem', color: '#F5EDD8', marginBottom: '1rem' }}>
              Dispatch Not Found
            </h1>
            <p className="baskerville" style={{ color: 'rgba(245,237,216,0.7)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              We could not find the community dispatch you were looking for. It may have been relocated or updated in our editorial archives.
            </p>
            <Link to="/news" className="btn-p" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
              ← Return to News Dispatches
            </Link>
          </div>
        </Section>
        <AdireDivider />
      </div>
    );
  }

  const catColor = newsCatColor[article.cat] || '#C9963A';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://ogereremo.vercel.app/news/${article.id}`;
  const shareText = `${article.headline} — Ogere Remo Kingdom News`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  // Related articles (excluding current)
  const relatedArticles = STATIC_NEWS.filter((n) => n.id !== article.id).slice(0, 3);

  return (
    <div style={{ background: '#0D0704', color: '#F5EDD8' }}>
      <SEO
        title={article.headline}
        description={article.summary || (article.body ? article.body.slice(0, 160) : 'Ogere Remo Community News')}
        image={article.image ? (article.image.startsWith('http') ? article.image : `https://ogereremo.vercel.app${article.image}`) : undefined}
        type="article"
      />

      {/* Header & Breadcrumbs */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(20,10,5,0.95) 0%, rgba(13,7,4,1) 100%)',
          padding: 'clamp(2rem, 4vw, 3.5rem) 1.5rem 1.5rem',
          borderBottom: '1px solid rgba(201,150,58,0.15)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Back button & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/news"
              className="cinzel"
              style={{
                fontSize: '.7rem',
                letterSpacing: '.12em',
                color: 'var(--gold)',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                textDecoration: 'none',
                padding: '.35rem .8rem',
                background: 'rgba(201,150,58,0.08)',
                border: '1px solid rgba(201,150,58,0.25)',
                borderRadius: '4px',
                transition: 'all .2s ease',
              }}
            >
              ← All Dispatches
            </Link>
            <span style={{ color: 'rgba(245,237,216,0.3)' }}>/</span>
            <span
              style={{
                background: catColor,
                color: '#F5EDD8',
                fontSize: '.62rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '.08em',
                padding: '.25rem .7rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {article.cat || 'News'}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="playfair"
            style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.6rem)',
              color: '#F5EDD8',
              lineHeight: 1.28,
              marginBottom: '1.2rem',
              fontWeight: 700,
            }}
          >
            {article.headline}
          </h1>

          {/* Lead Summary */}
          {article.summary && (
            <p
              className="baskerville"
              style={{
                fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
                lineHeight: 1.7,
                color: 'rgba(245,237,216,0.85)',
                marginBottom: '1.5rem',
                fontStyle: 'italic',
                borderLeft: `3px solid ${catColor}`,
                paddingLeft: '1rem',
              }}
            >
              {article.summary}
            </p>
          )}

          {/* Metadata Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(201,150,58,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
              {article.author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <span style={{ fontSize: '1rem' }}>✍️</span>
                  <span className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.06em', color: 'var(--gold)' }}>
                    {article.author}
                  </span>
                </div>
              )}
              {article.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <span style={{ fontSize: '.9rem' }}>📍</span>
                  <span className="cinzel" style={{ fontSize: '.65rem', color: 'rgba(245,237,216,0.6)' }}>
                    {article.location}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {article.readTime && (
                <span className="cinzel" style={{ fontSize: '.62rem', color: 'rgba(201,150,58,0.7)' }}>
                  ⏱️ {article.readTime}
                </span>
              )}
              <span className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.08em', color: 'var(--cream)', fontWeight: 600 }}>
                🗓️ {article.date}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Body Section */}
      <Section bg="#0D0704" py="2.5rem">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Main Hero Photograph */}
          {article.image && (
            <div
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(201,150,58,0.3)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                marginBottom: '2.5rem',
                background: '#140A05',
              }}
            >
              <img
                src={article.image}
                alt={article.headline}
                style={{
                  width: '100%',
                  maxHeight: '480px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {article.imageCaption && (
                <div
                  style={{
                    padding: '.8rem 1.2rem',
                    background: 'rgba(20,10,5,0.95)',
                    borderTop: '1px solid rgba(201,150,58,0.15)',
                    fontSize: '.82rem',
                    color: 'rgba(245,237,216,0.7)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  📸 {article.imageCaption}
                </div>
              )}
            </div>
          )}

          {/* Social Share Bar Top */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '.9rem 1.2rem',
              background: 'rgba(201,150,58,0.05)',
              border: '1px solid rgba(201,150,58,0.18)',
              borderRadius: '8px',
              marginBottom: '2.5rem',
            }}
          >
            <div className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              Share this Story:
            </div>
            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleShareWhatsApp}
                style={{
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  padding: '.4rem .9rem',
                  borderRadius: '4px',
                  fontSize: '.72rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.4rem',
                }}
              >
                💬 WhatsApp
              </button>
              <button
                onClick={handleShareTwitter}
                style={{
                  background: '#1DA1F2',
                  color: '#fff',
                  border: 'none',
                  padding: '.4rem .9rem',
                  borderRadius: '4px',
                  fontSize: '.72rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.4rem',
                }}
              >
                𝕏 Post
              </button>
              <button
                onClick={handleShareFacebook}
                style={{
                  background: '#1877F2',
                  color: '#fff',
                  border: 'none',
                  padding: '.4rem .9rem',
                  borderRadius: '4px',
                  fontSize: '.72rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.4rem',
                }}
              >
                📘 Facebook
              </button>
              <button
                onClick={handleCopyLink}
                className="btn-o"
                style={{ fontSize: '.68rem', padding: '.35rem .8rem' }}
              >
                {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
              </button>
            </div>
          </div>

          {/* Article Text Content */}
          <div className="article-body" style={{ marginBottom: '3rem' }}>
            {article.paragraphs && article.paragraphs.length > 0 ? (
              article.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className="baskerville"
                  style={{
                    fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)',
                    lineHeight: 1.95,
                    color: 'rgba(245,237,216,0.92)',
                    marginBottom: '1.8rem',
                  }}
                >
                  {p}
                </p>
              ))
            ) : (
              <div
                className="baskerville"
                style={{
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)',
                  lineHeight: 1.95,
                  color: 'rgba(245,237,216,0.92)',
                  whiteSpace: 'pre-line',
                  marginBottom: '1.8rem',
                }}
              >
                {article.body}
              </div>
            )}
          </div>

          {/* Featured Quote Callout */}
          {article.quote && (
            <div
              style={{
                background: 'rgba(201,150,58,0.08)',
                borderLeft: '4px solid var(--gold)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                borderRadius: '0 8px 8px 0',
                marginBottom: '3rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: '2.5rem', color: 'var(--gold)', lineHeight: 1, marginBottom: '.5rem' }}>“</div>
              <p
                className="playfair"
                style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
                  fontStyle: 'italic',
                  color: '#F5EDD8',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                }}
              >
                {article.quote.text}
              </p>
              <div className="cinzel" style={{ fontSize: '.72rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                — {article.quote.author}
              </div>
            </div>
          )}

          {/* Key Highlights / Bulleted Box */}
          {article.highlights && article.highlights.length > 0 && (
            <div
              style={{
                background: 'rgba(45,74,34,0.15)',
                border: '1px solid rgba(45,74,34,0.4)',
                borderLeft: '4px solid #4ade80',
                borderRadius: '8px',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                marginBottom: '3rem',
              }}
            >
              <div className="cinzel" style={{ fontSize: '.75rem', letterSpacing: '.12em', color: '#a8d88e', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>
                📌 Key Takeaways & Impact
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '.8rem' }}>
                {article.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="baskerville"
                    style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(245,237,216,0.9)' }}
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Editorial Footer & Official Authority Badge */}
          <div
            style={{
              padding: '1.5rem',
              background: 'rgba(20,10,5,0.7)',
              border: '1px solid rgba(201,150,58,0.15)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '3.5rem',
            }}
          >
            <div>
              <div className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.3rem', fontWeight: 700 }}>
                Official Kingdom Press Release
              </div>
              <div style={{ fontSize: '.82rem', color: 'rgba(245,237,216,0.65)' }}>
                Dispatch ID: <strong style={{ color: '#F5EDD8' }}>{article.id}</strong> • Published by Ogere Remo Media & Communications Bureau
              </div>
            </div>
            <button
              onClick={() => {
                const ev = new CustomEvent('open-donate-modal');
                window.dispatchEvent(ev);
              }}
              className="btn-p"
              style={{ fontSize: '.72rem', padding: '.45rem 1rem' }}
            >
              💛 Support Kingdom Media
            </button>
          </div>

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                <h3 className="playfair" style={{ fontSize: '1.5rem', color: '#F5EDD8', margin: 0 }}>
                  More News from Ogere Remo
                </h3>
                <Link to="/news" className="cinzel" style={{ fontSize: '.68rem', color: 'var(--gold)', textDecoration: 'none' }}>
                  View All News Feed →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
                {relatedArticles.map((rel) => {
                  const relCatColor = newsCatColor[rel.cat] || '#C9963A';
                  return (
                    <Link
                      key={rel.id}
                      to={`/news/${rel.id}`}
                      style={{
                        background: 'rgba(201,150,58,0.04)',
                        border: '1px solid rgba(201,150,58,0.15)',
                        borderTop: `3px solid ${relCatColor}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform .2s ease, border-color .2s ease',
                      }}
                    >
                      {rel.image && (
                        <div style={{ height: '140px', width: '100%', overflow: 'hidden' }}>
                          <img
                            src={rel.image}
                            alt={rel.headline}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                            <span
                              style={{
                                background: relCatColor,
                                color: '#F5EDD8',
                                fontSize: '.55rem',
                                padding: '.15rem .5rem',
                                borderRadius: '3px',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                              }}
                            >
                              {rel.cat}
                            </span>
                            <span className="cinzel" style={{ fontSize: '.58rem', color: 'rgba(245,237,216,0.5)' }}>
                              {rel.date}
                            </span>
                          </div>
                          <h4
                            className="playfair"
                            style={{
                              fontSize: '1rem',
                              color: '#F5EDD8',
                              lineHeight: 1.35,
                              marginBottom: '.5rem',
                              fontWeight: 600,
                            }}
                          >
                            {rel.headline}
                          </h4>
                        </div>
                        <span className="cinzel" style={{ fontSize: '.62rem', color: 'var(--gold)', fontWeight: 600, marginTop: '.8rem' }}>
                          Read Dispatch →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
