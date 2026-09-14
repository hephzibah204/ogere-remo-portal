import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import ProgressBar from '../components/ProgressBar';

const VALID_PINS = ['ogere2026', '1401', '2026', 'ogere', 'admin'];

/* ── Constants ─────────────────────────────────── */
const FUNDRAISING_TARGET = 10_000_000; // ₦10,000,000
const LAUNCH_DATE = new Date('2026-11-04T00:00:00'); // November 4th 2026

/* ── Helpers ───────────────────────────────────── */
function formatNaira(n) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function getCountdown() {
  const now = new Date();
  const diff = LAUNCH_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

export default function ComingSoonPage({ onUnlock }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [selectedTier, setSelectedTier] = useState('gold');

  // ── Countdown ──────────────────────────────────
  const [countdown, setCountdown] = useState(getCountdown());
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Real-time donor/fundraising stats from Neon ─
  const [stats, setStats] = useState({ raised: 0, donors: 0, loading: true });
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/donations?stats=true');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStats({ raised: data.total_raised || 0, donors: data.donor_count || 0, loading: false });
    } catch {
      // Fallback: show ₦0 raised, 0 donors (prototype state)
      setStats({ raised: 0, donors: 0, loading: false });
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStats();
    // Re-fetch every 60 seconds for real-time feel
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    if (VALID_PINS.includes(cleanPin)) {
      setError('');
      setUnlockSuccess(true);
      setTimeout(() => {
        if (onUnlock) {
          onUnlock();
        } else {
          localStorage.setItem('ogere_preview_unlocked', 'true');
          sessionStorage.setItem('ogere_preview_unlocked', 'true');
          window.location.reload();
        }
      }, 1000);
    } else {
      setError('Invalid Access PIN. Please contact the project administrator for authorized access.');
    }
  };

  const copyAccountNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('6101307590');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const whatsappUrl =
    'https://wa.me/2349077780156?text=Hello%20Hephtech%20Multimedia%2C%20I%20would%20like%20to%20support%20and%20donate%20to%20the%20Ogere%20Remo%20Community%20Portal%20project.';

  const DONATION_TIERS = [
    {
      id: 'platinum',
      icon: '👑',
      name: 'Platinum Founding Visionary',
      amount: '₦1,000,000+ / $1,000+',
      desc: 'For businesses, diaspora patrons, and visionary investors.',
      perks: [
        '🌐 FREE 5-Page Custom Website / Online Store built by Hephtech Multimedia (Free 1-Yr Domain & Hosting setup included)',
        '📢 1-Year FREE Premium Top-Banner Advertisement across all pages of the Ogere Portal',
        '🏛️ Permanent Top-Tier Feature on the Portal "Founding Benefactors & Wall of Heroes"',
        '📰 Dedicated Spotlight Article & Business Showcase published on the portal news desk',
      ],
      color: '#E5C158',
      bg: 'rgba(229,193,88,0.12)',
      border: 'rgba(229,193,88,0.5)',
    },
    {
      id: 'gold',
      icon: '🥇',
      name: 'Gold Civic Partner',
      amount: '₦250,000 – ₦999,999 / $250+',
      popular: true,
      desc: 'For local enterprises, diaspora professionals, and family compounds.',
      perks: [
        '🌐 FREE Professional 1-Page Business Website / Portfolio built by Hephtech Multimedia',
        '📢 6-Months FREE Featured Business Advertising in the Ogere Yellow Pages & Marketplace',
        '🏛️ Permanent listing in the "Founding Donors Hall of Honor" on the portal',
        '🎖️ Official Founding Patron Digital Certificate from Hephtech Multimedia & Innovations',
      ],
      color: '#C9963A',
      bg: 'rgba(201,150,58,0.15)',
      border: 'var(--gold)',
    },
    {
      id: 'silver',
      icon: '🥈',
      name: 'Silver Heritage Supporter',
      amount: '₦50,000 – ₦249,999 / $50+',
      desc: 'For indigenes, artisans, traders, and youth professionals.',
      perks: [
        '📢 3-Months FREE Featured Business Listing in the Ogere Directory',
        '🏛️ Name & Business permanently listed on the Portal Benefactors Honor Roll',
        '🎖️ Official Digital Supporter Certificate from Hephtech Multimedia',
        '💬 Verified Contributor Badge across all portal community forums',
      ],
      color: '#E0E0E0',
      bg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.3)',
    },
    {
      id: 'patriot',
      icon: '🤝',
      name: 'Community Backer',
      amount: '₦5,000 – ₦49,999 / $5+',
      desc: 'Every single naira directly pays our developers and covers server infrastructure.',
      perks: [
        '🏛️ Name listed on the Community Supporters Honor Roll on the website',
        '💬 Verified Community Supporter status on the platform',
        '📱 Instant official WhatsApp donation receipt & public acknowledgment',
      ],
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.08)',
      border: 'rgba(74,222,128,0.35)',
    },
  ];

  const FEATURES = [
    {
      icon: '🚨',
      title: 'Emergency SOS Radar & Blood Donors Bank',
      tag: 'Security & Rapid Response',
      desc: '24/7 one-tap emergency panic dispatch linked to Ogere Police, FRSC Highway Patrol, So-Safe Corps, and instant life-saving blood donor matching registry.',
    },
    {
      icon: '🪪',
      title: 'Digital Citizen & Diaspora ID Cards',
      tag: 'Identity & Civic',
      desc: 'Smart, QR-verifiable digital identity cards for native indigenes, town residents, and global diaspora members.',
    },
    {
      icon: '👑',
      title: 'Royal Heritage & Monarchical History',
      tag: 'Heritage',
      desc: 'Documenting the recorded history, lineage, and 600+ year reign of the Ologere ruling dynasty since 1401 A.D.',
    },
    {
      icon: '🗺️',
      title: 'Google Maps Street & Landmark Digitization',
      tag: 'GIS & Mapping',
      desc: 'Surveying and mapping every unlisted street, ancestral compound lane, shop, and landmark in Ogere Remo directly onto Google Maps with exact GPS coordinates.',
    },
    {
      icon: '📜',
      title: 'Digital Land Registry & Verification',
      tag: 'Governance',
      desc: 'Transparent digital land boundary tracking, title verification, and survey documentation to eliminate property disputes.',
    },
    {
      icon: '🛍️',
      title: 'Marketplace & Yellow Pages Directory',
      tag: 'Commerce',
      desc: 'Connecting Ogere yam farmers, Adire craftsmen, local caterers, and corporate businesses directly to buyers in Lagos, Ibadan, and the diaspora.',
    },
    {
      icon: '🎓',
      title: 'Schools & Educational Directory',
      tag: 'Education',
      desc: 'Centralized directory of historic community schools, academic resources, alumni networks, and educational bursary announcements.',
    },
    {
      icon: '👸',
      title: 'Miss Olipakala Pageant Registration',
      tag: 'Culture',
      desc: 'Official registration portal for the annual cultural ambassador competition celebrating the beauty and heritage of Ogere daughters.',
    },
    {
      icon: '🕊️',
      title: 'Mount Tabieorar & Faith Heritage',
      tag: 'Faith & History',
      desc: 'Digital historical archives commemorating the birthplace of The Church of the Lord (Aladura) Worldwide and annual spiritual convocation.',
    },
    {
      icon: '💛',
      title: 'Diaspora Projects & Capital Tracker',
      tag: 'Development',
      desc: 'Real-time transparent public tracking for community capital projects, street paving, solar lighting, and voluntary diaspora contributions.',
    },
    {
      icon: '📰',
      title: 'Kingdom News & Gazette Dispatches',
      tag: 'Media',
      desc: 'Dedicated news dispatches, cultural events coverage, and community achievements published by the Ogere Remo Media Bureau.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0D0704', color: '#F5EDD8', overflowX: 'hidden' }}>
      <SEO
        title="Coming Soon — Ogere Remo: Nigeria's 1st Digital Town"
        description="Support Hephtech Multimedia in building Nigeria's first digital town platform for Ogere Remo. Donors receive free business promotion and free custom websites."
        image="/images/Ogere Town.jpg"
      />

      {/* ── Top Announcement Banner ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #7A2E0E 0%, #C9963A 50%, #7A2E0E 100%)',
          color: '#1a0d06',
          padding: '.55rem 1rem',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 'clamp(.72rem, 1.6vw, .85rem)',
          letterSpacing: '.08em',
        }}
        className="cinzel"
      >
        🌟 PIONEERING NIGERIA'S 1ST DIGITAL TOWN • DONATE &amp; GET FREE BUSINESS ADVERTISING OR A FREE WEBSITE!
      </div>

      {/* ── Hero Section ── */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(3.5rem, 8vw, 6.5rem) 1.5rem 3.5rem',
          background: 'radial-gradient(circle at 50% 20%, rgba(201,150,58,0.22) 0%, rgba(13,7,4,0.98) 75%), url("/images/Ogere Town.jpg") center/cover no-repeat',
          borderBottom: '1px solid rgba(201,150,58,0.3)',
          textAlign: 'center',
        }}
      >
        {/* Subtle grid overlay */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,150,58,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,150,58,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

          {/* Royal Crest */}
          <div className="anim-scale-in" style={{ fontSize: '3.8rem', marginBottom: '1rem', filter: 'drop-shadow(0 6px 16px rgba(201,150,58,0.5))' }}>
            👑
          </div>

          {/* EST. badge */}
          <div className="anim-fade-in-down delay-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(201,150,58,0.18)', border: '1px solid var(--gold)', borderRadius: '25px', padding: '.45rem 1.4rem', marginBottom: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
            <span style={{ color: 'var(--gold)', fontSize: '.78rem', fontWeight: 700 }} className="cinzel">
              EST. 1401 A.D. • OGERE REMO CIVIC TECHNOLOGY INITIATIVE
            </span>
          </div>

          {/* 🏗️ PROTOTYPE badge */}
          <div className="anim-fade-in delay-2" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
            <span className="cinzel" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.5)',
              borderRadius: '6px', padding: '0.3rem 0.9rem',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
              color: '#f59e0b', textTransform: 'uppercase',
            }}>
              🏗️ PROTOTYPE IN ACTIVE DEVELOPMENT — SEEKING FOUNDING DONORS
            </span>
          </div>

          {/* Main title */}
          <h1 className="playfair anim-fade-in-up delay-2" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', color: '#F5EDD8', lineHeight: 1.15, marginBottom: '1.4rem', fontWeight: 800 }}>
            Pioneering Ogere as <br />
            <span style={{ color: 'var(--gold)', textShadow: '0 0 25px rgba(201,150,58,0.4)' }}>
              Nigeria's First Digital Town
            </span>
          </h1>

          <p className="baskerville anim-fade-in-up delay-3" style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.4rem)', lineHeight: 1.8, color: 'rgba(245,237,216,0.92)', maxWidth: '780px', margin: '0 auto 2rem' }}>
            An independent civic-tech initiative by <strong>Hephtech Multimedia &amp; Innovations</strong> to digitize our 625-year-old heritage, empower local businesses, verify land records, issue digital identity cards, and connect our worldwide diaspora.
          </p>

          {/* ── FUNDRAISING PROGRESS ── */}
          <div className="anim-fade-in-up delay-3" style={{
            background: 'linear-gradient(135deg, rgba(13,7,4,0.9) 0%, rgba(26,13,6,0.95) 100%)',
            border: '1px solid rgba(201,150,58,0.35)',
            borderRadius: '16px',
            padding: '1.6rem 2rem',
            maxWidth: '740px',
            margin: '0 auto 1.8rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.2rem', textAlign: 'center' }}>
              <div>
                <div className="cinzel" style={{ fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 900, color: 'var(--gold)' }}>
                  {stats.loading ? '—' : formatNaira(stats.raised)}
                </div>
                <div className="baskerville" style={{ fontSize: '0.72rem', color: 'var(--cream-muted)', marginTop: '0.2rem' }}>raised so far</div>
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 900, color: '#fff' }}>
                  {stats.loading ? '—' : stats.donors.toLocaleString()}
                </div>
                <div className="baskerville" style={{ fontSize: '0.72rem', color: 'var(--cream-muted)', marginTop: '0.2rem' }}>founding donors</div>
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 900, color: 'var(--gold)' }}>
                  ₦10M
                </div>
                <div className="baskerville" style={{ fontSize: '0.72rem', color: 'var(--cream-muted)', marginTop: '0.2rem' }}>funding target</div>
              </div>
            </div>

            <ProgressBar
              value={stats.raised}
              max={FUNDRAISING_TARGET}
              label="Fundraising Progress"
              showAmount={`${formatNaira(stats.raised)} raised of ₦10,000,000 target`}
              height={12}
            />
          </div>

          {/* ── COUNTDOWN TO NOVEMBER 4th ── */}
          <div className="anim-fade-in-up delay-4" style={{ marginBottom: '2rem' }}>
            <div className="cinzel" style={{ fontSize: '0.68rem', letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.8rem', opacity: 0.8 }}>
              🚀 Target Launch Date — November 4th, 2026
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { val: countdown.days,    label: 'Days' },
                { val: countdown.hours,   label: 'Hours' },
                { val: countdown.minutes, label: 'Minutes' },
                { val: countdown.seconds, label: 'Seconds' },
              ].map(({ val, label }) => (
                <div key={label} style={{
                  background: 'rgba(201,150,58,0.08)',
                  border: '1px solid rgba(201,150,58,0.25)',
                  borderRadius: '12px',
                  padding: '0.8rem 1.1rem',
                  minWidth: '70px',
                  textAlign: 'center',
                }}>
                  <div className="cinzel" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {String(val).padStart(2, '0')}
                  </div>
                  <div className="cinzel" style={{ fontSize: '0.58rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DONOR PROMISE ── */}
          <div className="anim-fade-in-up delay-4" style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.15) 0%, rgba(122,46,14,0.25) 100%)', border: '1px solid var(--gold)', borderRadius: '14px', padding: '1.4rem 1.8rem', maxWidth: '740px', margin: '0 auto 2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '.4rem' }} className="cinzel">
              🎁 Our Promise to You as a Donor:
            </div>
            <p className="baskerville" style={{ fontSize: '1.02rem', color: '#F5EDD8', margin: 0, lineHeight: 1.7 }}>
              Your name and photo will be permanently placed on the <strong>Wall of Heroes</strong> on our website, your business will be <strong>advertised for free</strong> across the portal, and major donors receive a <strong>FREE custom website built by Hephtech Multimedia</strong>!
            </p>
          </div>

          {/* ── CTAs ── */}
          <div className="anim-fade-in-up delay-5" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.8rem' }}>
            <a href="#donate-section" className="btn-p" style={{ fontSize: 'clamp(.88rem,2vw,1.05rem)', padding: '1rem 2.2rem', display: 'inline-flex', alignItems: 'center', gap: '.6rem', boxShadow: '0 6px 25px rgba(201,150,58,0.5)', textDecoration: 'none', fontWeight: 700 }}>
              💛 Donate Now &amp; Get Rewarded
            </a>
            <button onClick={() => setPinModalOpen(true)} className="btn-o" style={{ fontSize: 'clamp(.88rem,2vw,1.05rem)', padding: '1rem 1.8rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(201,150,58,0.12)' }}>
              🔑 Enter PIN for Live Demo
            </button>
          </div>

          {/* ── SOCIAL SHARE ── */}
          <div className="anim-fade-in delay-6" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="cinzel" style={{ fontSize: '0.62rem', color: 'var(--cream-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Share:</span>
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent('🌟 Help build Nigeria\'s first Digital Town — Ogere Remo! Donate and get FREE business advertising or a FREE website. See the project: https://ogereremo.vercel.app')}`}
              target="_blank" rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.4)', borderRadius: '8px', padding: '0.45rem 0.9rem', color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'var(--transition)' }}
            >
              💬 WhatsApp
            </a>
            {/* Twitter/X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('🌟 Nigeria\'s first Digital Town is being built — Ogere Remo! Donate and get FREE business promo. #OgereRemo #NigeriaDigital')}&url=${encodeURIComponent('https://ogereremo.vercel.app')}`}
              target="_blank" rel="noopener noreferrer"
              aria-label="Share on X / Twitter"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.45rem 0.9rem', color: '#fff', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'var(--transition)' }}
            >
              𝕏 Share
            </a>
            {/* Copy link */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText('https://ogereremo.vercel.app');
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 3000);
              }}
              aria-label="Copy link to clipboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '8px', padding: '0.45rem 0.9rem', color: 'var(--gold)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
            >
              {linkCopied ? '✅ Copied!' : '🔗 Copy Link'}
            </button>
          </div>

        </div>
      </section>

      <AdireDivider />

      {/* 1. IMPORTANT FEATURES SHOWCASE (FIRST) */}
      <Section id="features-section" bg="#0D0704" py="5rem">
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(201,150,58,0.15)',
                border: '1px solid var(--gold)',
                borderRadius: '20px',
                padding: '.35rem 1.2rem',
                marginBottom: '.8rem',
              }}
            >
              <span className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.15em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                Core Platform Architecture
              </span>
            </div>
            <h2 className="st" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: '0 0 .8rem 0' }}>
              The 10 Core Municipal & Cultural Systems
            </h2>
            <p className="baskerville" style={{ color: 'rgba(245,237,216,0.75)', fontSize: '1.05rem', margin: '0 auto', maxWidth: '750px' }}>
              Explore the digital systems transforming Ogere Remo into Nigeria's smartest historic town.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(201,150,58,0.04)',
                  border: '1px solid rgba(201,150,58,0.18)',
                  borderTop: '3px solid var(--gold)',
                  borderRadius: '10px',
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s ease, border-color 0.25s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.2rem' }}>{feat.icon}</span>
                    <span
                      style={{
                        background: 'rgba(201,150,58,0.12)',
                        color: 'var(--gold)',
                        fontSize: '.58rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '.08em',
                        padding: '.2rem .6rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      {feat.tag}
                    </span>
                  </div>
                  <h3
                    className="playfair"
                    style={{
                      fontSize: '1.25rem',
                      color: '#F5EDD8',
                      marginBottom: '.6rem',
                      fontWeight: 700,
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="baskerville"
                    style={{
                      fontSize: '.92rem',
                      lineHeight: 1.7,
                      color: 'rgba(245,237,216,0.72)',
                      margin: 0,
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>

                <div style={{ marginTop: '1.2rem', paddingTop: '.8rem', borderTop: '1px solid rgba(201,150,58,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="cinzel" style={{ fontSize: '.6rem', color: 'rgba(245,237,216,0.45)' }}>
                    STATUS: ACTIVE PREVIEW
                  </span>
                  <button
                    onClick={() => setPinModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      fontSize: '.68rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: 0,
                    }}
                    className="cinzel"
                  >
                    Demo Preview →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <AdireDivider />

      {/* 2. BUDGET FOCUS SECTION (BEFORE WHAT YOU RECEIVE) */}
      <Section id="budget-section" bg="#120803" py="5rem">
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(201,150,58,0.15)',
                border: '1px solid var(--gold)',
                borderRadius: '20px',
                padding: '.35rem 1.2rem',
                marginBottom: '.8rem',
              }}
            >
              <span className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.15em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                Direct Expense Transparency
              </span>
            </div>
            <h2 className="st" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: '0 0 1rem 0' }}>
              Project Budget Focus & Fund Allocation
            </h2>
            <p
              className="baskerville"
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: 'rgba(245,237,216,0.85)',
                maxWidth: '750px',
                margin: '0 auto',
              }}
            >
              Every donation received directly finances software engineering, cloud compute, digital identity systems, security, and town-wide Google Maps street surveying.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(201,150,58,0.04)',
              border: '1px solid rgba(201,150,58,0.2)',
              borderRadius: '16px',
              padding: 'clamp(1.8rem, 4vw, 2.8rem)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.8rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem' }}>💻</span>
                <div>
                  <strong style={{ color: '#F5EDD8', fontSize: '1.02rem' }}>Software Engineering & UI/UX Design</strong>
                  <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,0.72)', lineHeight: 1.65, marginTop: '.3rem' }}>
                    Remunerating fullstack engineers, UI/UX designers, and database architects developing all 14 database tables and 30+ civic modules.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem' }}>☁️</span>
                <div>
                  <strong style={{ color: '#F5EDD8', fontSize: '1.02rem' }}>Cloud Infrastructure & Managed PostgreSQL</strong>
                  <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,0.72)', lineHeight: 1.65, marginTop: '.3rem' }}>
                    Financing ultra-fast cloud servers, Neon PostgreSQL database clusters, domain registrations, SSL, and global CDN caching.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem' }}>🗺️</span>
                <div>
                  <strong style={{ color: '#F5EDD8', fontSize: '1.02rem' }}>Town-Wide Google Maps & Street Mapping</strong>
                  <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,0.72)', lineHeight: 1.65, marginTop: '.3rem' }}>
                    Conducting ground GIS surveys to map every unlisted street, compound road, business shop, and landmark in Ogere Remo onto Google Maps for easy GPS delivery and emergency navigation.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem' }}>🪪</span>
                <div>
                  <strong style={{ color: '#F5EDD8', fontSize: '1.02rem' }}>Digital ID Verification & QR Architecture</strong>
                  <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,0.72)', lineHeight: 1.65, marginTop: '.3rem' }}>
                    Building cryptographic QR verification APIs, secure citizen digital ID card generators, and biometric credential registries.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem' }}>🔒</span>
                <div>
                  <strong style={{ color: '#F5EDD8', fontSize: '1.02rem' }}>Data Security & 24/7 Automated Backups</strong>
                  <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,0.72)', lineHeight: 1.65, marginTop: '.3rem' }}>
                    End-to-end encryption for marketplace transactions, verified land records, emergency alerts, and strict citizen privacy protection.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <AdireDivider />

      {/* 3. WHAT YOU RECEIVE FOR YOUR SUPPORT & DONATION (COMES LAST) */}
      <Section bg="#0D0704" py="5.5rem">
        <div id="donate-section" style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(201,150,58,0.15)',
                border: '1px solid var(--gold)',
                borderRadius: '20px',
                padding: '.35rem 1.2rem',
                marginBottom: '.8rem',
              }}
            >
              <span className="cinzel" style={{ fontSize: '.68rem', letterSpacing: '.15em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                Grassroots Crowdfunding & Direct Value
              </span>
            </div>
            <h2 className="st" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 1.2rem 0' }}>
              Support the Vision & Promote Your Business
            </h2>
            <p
              className="baskerville"
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.85,
                color: 'rgba(245,237,216,0.88)',
                maxWidth: '780px',
                margin: '0 auto',
              }}
            >
              Because this is an independent technology initiative, we do not make empty political promises. Instead, we offer <strong>tangible tech services, free digital advertising, and custom web development</strong> directly to our supporters.
            </p>
          </div>

          {/* DONOR RECOGNITION & REWARD TIERS */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p className="sl" style={{ color: 'var(--gold)', marginBottom: '.3rem' }}>
                Tangible Rewards & Recognition
              </p>
              <h3 className="playfair" style={{ fontSize: '1.8rem', color: '#F5EDD8', margin: 0 }}>
                What You Receive for Your Support
              </h3>
              <p className="baskerville" style={{ fontSize: '.95rem', color: 'rgba(245,237,216,0.7)', marginTop: '.5rem' }}>
                Select a tier to see the specific business promotion and web services you will receive.
              </p>
            </div>

            <style>{`
              .tiers-grid-4col {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                gap: 1.2rem;
              }
              @media (min-width: 600px) {
                .tiers-grid-4col {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
              @media (min-width: 1024px) {
                .tiers-grid-4col {
                  grid-template-columns: repeat(4, 1fr) !important;
                }
              }
            `}</style>

            <div className="tiers-grid-4col">
              {DONATION_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    style={{
                      background: tier.bg,
                      border: `2px solid ${isSelected ? tier.color : tier.border}`,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all .25s ease',
                      boxShadow: isSelected ? `0 8px 30px ${tier.color}33` : 'none',
                    }}
                  >
                    {tier.popular && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '15px',
                          background: 'var(--gold)',
                          color: '#1a0d06',
                          fontSize: '.55rem',
                          fontWeight: 800,
                          padding: '.25rem .7rem',
                          borderRadius: '12px',
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                        }}
                        className="cinzel"
                      >
                        ★ Most Popular
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{tier.icon}</div>
                      <h4 className="playfair" style={{ fontSize: '1.2rem', color: tier.color, marginBottom: '.3rem' }}>
                        {tier.name}
                      </h4>
                      <div className="cinzel" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F5EDD8', marginBottom: '.6rem' }}>
                        {tier.amount}
                      </div>
                      <p className="baskerville" style={{ fontSize: '.82rem', color: 'rgba(245,237,216,0.75)', lineHeight: 1.5, marginBottom: '1rem' }}>
                        {tier.desc}
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '.5rem', fontSize: '.78rem', color: 'rgba(245,237,216,0.92)' }}>
                        {tier.perks.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ marginTop: '1.2rem', paddingTop: '.8rem', borderTop: '1px solid rgba(201,150,58,0.15)', textAlign: 'center' }}>
                      <span className="cinzel" style={{ fontSize: '.65rem', color: tier.color, fontWeight: 700 }}>
                        {isSelected ? '✓ ACTIVE SELECTION' : '👉 Click to Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Selected Tier Action Box */}
            {(() => {
              const active = DONATION_TIERS.find((t) => t.id === selectedTier) || DONATION_TIERS[1];
              const tierWhatsappUrl = `https://wa.me/2349077780156?text=${encodeURIComponent(
                `Hello Hephtech Multimedia, I would like to support the Ogere Remo Portal project as a "${active.name}" (${active.amount}) and claim my free tech/advertising perks.`
              )}`;

              return (
                <div
                  style={{
                    marginTop: '2rem',
                    background: active.bg,
                    border: `2px solid ${active.color}`,
                    borderRadius: '14px',
                    padding: 'clamp(1.2rem, 3vw, 1.8rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.2rem',
                    boxShadow: `0 8px 30px ${active.color}22`,
                  }}
                >
                  <div style={{ flex: '1 1 320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{active.icon}</span>
                      <span className="cinzel" style={{ fontSize: '.75rem', letterSpacing: '.1em', color: active.color, fontWeight: 700, textTransform: 'uppercase' }}>
                        Selected: {active.name} ({active.amount})
                      </span>
                    </div>
                    <div className="baskerville" style={{ fontSize: '.95rem', color: '#F5EDD8', lineHeight: 1.6 }}>
                      {active.id === 'platinum' && 'Includes: FREE 5-Page Custom Website / Store + 1-Year Banner Ads + Top Wall of Heroes placement!'}
                      {active.id === 'gold' && 'Includes: FREE 1-Page Business Website + 6-Months Featured Ads in Directory + Donors Hall of Honor!'}
                      {active.id === 'silver' && 'Includes: 3-Months Verified Business Directory Listing + Benefactors Honor Roll + Digital Certificate!'}
                      {active.id === 'patriot' && 'Includes: Permanent Supporter status on Website + WhatsApp Confirmation Receipt!'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap' }}>
                    <a
                      href="#bank-transfer-box"
                      className="btn-p"
                      style={{
                        fontSize: '.82rem',
                        padding: '.75rem 1.4rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.4rem',
                        fontWeight: 700,
                      }}
                    >
                      💳 View Bank Details
                    </a>
                    <a
                      href={tierWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-o"
                      style={{
                        fontSize: '.82rem',
                        padding: '.75rem 1.4rem',
                        background: 'rgba(37,211,102,0.18)',
                        borderColor: '#25D366',
                        color: '#4ade80',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.4rem',
                        fontWeight: 700,
                      }}
                    >
                      💬 Claim on WhatsApp →
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* OFFICIAL DONATION ACCOUNT DETAILS */}
          <div
            id="bank-transfer-box"
            style={{
              background: 'linear-gradient(135deg, rgba(201,150,58,0.18) 0%, rgba(122,46,14,0.3) 100%)',
              border: '2px solid var(--gold)',
              borderRadius: '20px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              textAlign: 'center',
              boxShadow: '0 15px 50px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #7A2E0E 0%, #C9963A 50%, #7A2E0E 100%)',
              }}
            />

            <div className="cinzel" style={{ fontSize: '.75rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.8rem', fontWeight: 700 }}>
              Official Project Donation Account (Nigeria)
            </div>

            <div style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 900, color: '#F5EDD8', letterSpacing: '.1em', marginBottom: '.4rem' }} className="cinzel">
              6101307590
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '.3rem' }}>
              Opay
            </div>
            <div className="cinzel" style={{ fontSize: '.95rem', color: 'rgba(245,237,216,0.9)', letterSpacing: '.06em', marginBottom: '1.8rem', fontWeight: 600 }}>
              Hephtech Multimedia & Innovations
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.8rem' }}>
              <button
                onClick={copyAccountNumber}
                className="btn-p"
                style={{
                  fontSize: '.92rem',
                  padding: '.9rem 2.2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.6rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(201,150,58,0.4)',
                }}
              >
                {copied ? '✓ Opay Account Number Copied!' : '📋 Copy Opay Account (6101307590)'}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-o"
                style={{
                  fontSize: '.92rem',
                  padding: '.9rem 2rem',
                  background: 'rgba(37,211,102,0.18)',
                  borderColor: '#25D366',
                  color: '#4ade80',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.6rem',
                  fontWeight: 700,
                }}
              >
                💬 Claim Free Website / Send Transfer Receipt
              </a>
              <a
                href="tel:09077780156"
                className="btn-o"
                style={{
                  fontSize: '.92rem',
                  padding: '.9rem 1.8rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.5rem',
                }}
              >
                📞 Call 09077780156
              </a>
            </div>

            {/* Diaspora Remittance Note */}
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(201,150,58,0.2)',
                borderRadius: '10px',
                padding: '1rem',
                maxWidth: '650px',
                margin: '0 auto',
                fontSize: '.85rem',
                color: 'rgba(245,237,216,0.85)',
                lineHeight: 1.6,
              }}
              className="baskerville"
            >
              🌍 <strong>Diaspora Donors (UK, USA, Canada, Europe):</strong><br />
              For international wire, Remitly, WorldRemit, Zelle, or PayPal options, please contact Hephtech Multimedia directly on WhatsApp at <strong style={{ color: 'var(--gold)' }}>+2349077780156</strong>.
            </div>
          </div>
        </div>
      </Section>

      <AdireDivider />

      {/* LIVE DEMO PIN UNLOCK SECTION */}
      <Section bg="#140A05" py="4.5rem">
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '.8rem' }}>🔑</div>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(201,150,58,0.15)',
              border: '1px solid var(--gold)',
              borderRadius: '20px',
              padding: '.35rem 1.2rem',
              marginBottom: '1rem',
            }}
          >
            <span className="cinzel" style={{ fontSize: '.65rem', letterSpacing: '.15em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
              Stakeholder & Tester VIP Access
            </span>
          </div>

          <h2 className="playfair" style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', color: '#F5EDD8', marginBottom: '1rem' }}>
            Preview the Full Live Demo
          </h2>

          <p className="baskerville" style={{ fontSize: '1.02rem', lineHeight: 1.75, color: 'rgba(245,237,216,0.8)', marginBottom: '2rem' }}>
            Are you a community stakeholder, reviewer, or developer? Insert your authorized project access PIN below to unlock and explore the full live portal.
          </p>

          <form
            onSubmit={handleUnlock}
            style={{
              background: 'rgba(201,150,58,0.06)',
              border: '1px solid rgba(201,150,58,0.25)',
              borderRadius: '14px',
              padding: 'clamp(1.5rem, 3vw, 2.2rem)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ marginBottom: '1.2rem' }}>
              <input
                type="password"
                className="inp"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter Authorized Access PIN"
                style={{
                  textAlign: 'center',
                  fontSize: '1.15rem',
                  letterSpacing: '.15em',
                  padding: '.95rem 1.2rem',
                  background: '#0D0704',
                  borderColor: error ? '#f87171' : 'rgba(201,150,58,0.4)',
                }}
                autoComplete="off"
              />
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: '.84rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                ⚠️ {error}
              </div>
            )}

            {unlockSuccess && (
              <div style={{ color: '#4ade80', fontSize: '.92rem', marginBottom: '1rem', fontWeight: 600 }}>
                🎉 Access Granted! Launching Live Demo Portal…
              </div>
            )}

            <button
              type="submit"
              className="btn-p"
              disabled={!pin || unlockSuccess}
              style={{
                width: '100%',
                padding: '.95rem',
                fontSize: '.88rem',
                letterSpacing: '.1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
                fontWeight: 700,
              }}
            >
              {unlockSuccess ? 'Unlocking Demo Portal…' : 'Unlock Live Portal Demo →'}
            </button>
          </form>
        </div>
      </Section>

      {/* PIN Unlock Modal */}
      {pinModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(10, 5, 2, 0.88)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPinModalOpen(false);
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1c0d05 0%, #120803 100%)',
              border: '2px solid var(--gold)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              padding: '2.2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setPinModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(201,150,58,0.1)',
                border: '1px solid rgba(201,150,58,0.3)',
                color: 'var(--gold)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🔑</div>
            <h3 className="playfair" style={{ fontSize: '1.6rem', color: '#F5EDD8', marginBottom: '.5rem' }}>
              Enter Live Demo PIN
            </h3>
            <p className="baskerville" style={{ fontSize: '.92rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1.5rem' }}>
              Please enter your authorized access PIN to explore the full portal.
            </p>

            <form onSubmit={handleUnlock}>
              <input
                type="password"
                className="inp"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter Authorized Access PIN"
                style={{
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  letterSpacing: '.12em',
                  padding: '.85rem',
                  marginBottom: '1rem',
                }}
                autoFocus
              />

              {error && (
                <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                  ⚠️ {error}
                </div>
              )}

              {unlockSuccess && (
                <div style={{ color: '#4ade80', fontSize: '.9rem', marginBottom: '1rem', fontWeight: 600 }}>
                  🎉 Verified! Opening demo…
                </div>
              )}

              <button
                type="submit"
                className="btn-p"
                disabled={!pin || unlockSuccess}
                style={{ width: '100%', padding: '.85rem', fontWeight: 700 }}
              >
                {unlockSuccess ? 'Unlocking…' : 'Access Live Demo →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          background: '#080402',
          borderTop: '1px solid rgba(201,150,58,0.15)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="cinzel" style={{ fontSize: '.85rem', color: 'var(--gold)', letterSpacing: '.12em', marginBottom: '.6rem', fontWeight: 700 }}>
            OGERE REMO CIVIC TECHNOLOGY PROJECT • EST. 1401 A.D.
          </div>
          <div style={{ fontSize: '.84rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.8, marginBottom: '1.2rem' }}>
            Powered & Developed by Hephtech Multimedia & Innovations.<br />
            An independent digital platform project dedicated to the modern development and cultural preservation of Ogere Remo.
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="tel:09077780156" style={{ color: 'var(--gold)', fontSize: '.78rem', textDecoration: 'none', fontWeight: 600 }}>
              📞 09077780156
            </a>
            <span style={{ color: 'rgba(201,150,58,0.3)' }}>•</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontSize: '.78rem', textDecoration: 'none', fontWeight: 600 }}>
              💬 WhatsApp Us
            </a>
            <span style={{ color: 'rgba(201,150,58,0.3)' }}>•</span>
            <button
              onClick={() => setPinModalOpen(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.6)', fontSize: '.78rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              🔑 Stakeholder PIN Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
