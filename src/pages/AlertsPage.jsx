import { useState } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbInsert } from '../services/db';

/* ─── Alert Data ─── */
const alerts = [
  { id: 1, lv: 'critical', ti: 'Armed Robbery Attempt — Expressway Bypass', bo: 'Two suspects on a motorcycle attempted robbery near the Ogere bypass tollgate. Suspects fled northward. Avoid the bypass after 9 PM. Report any sighting to Ogere DPO immediately.', dt: 'June 15, 2026, 06:32 AM', loc: 'Expressway Bypass', reporter: 'Ogere Police Station', views: 241 },
  { id: 2, lv: 'high', ti: 'Increased Night Travel Vigilance', bo: 'Reports of suspicious activity near Ogere junction between 10 PM and 4 AM. Travel in groups. Call 112 immediately if you observe anything unusual.', dt: 'May 20, 2026', loc: 'Ogere Junction', reporter: 'OCDA Security Committee', views: 188 },
  { id: 3, lv: 'high', ti: 'Community Security Meeting', bo: 'Mandatory meeting for all household heads. Ogere Town Hall. Saturday 31 May 2026. Absence must be explained to compound heads.', dt: 'May 25, 2026', loc: 'Town Hall, Ogere', reporter: 'OCDA Secretariat', views: 156 },
  { id: 4, lv: 'medium', ti: 'Farm Land Encroachment — Northern Zone', bo: 'Boundary disputes reported near Ajura border. All affected farmers must document their borders with the Ogere Land Registry within 30 days to protect their claims.', dt: 'May 10, 2026', loc: 'Northern Zone / Ajura Border', reporter: 'Community Tip', views: 89 },
  { id: 5, lv: 'medium', ti: 'Flood Risk Advisory', bo: 'Heavy rainfall forecasted. Please clear drainage channels around your property. A community clean-up exercise is scheduled for June 7, 2026. All quarters should participate.', dt: 'May 1, 2026', loc: 'All Quarters', reporter: 'OCDA Team', views: 134 },
  { id: 6, lv: 'low', ti: 'Stray Livestock on Market Road', bo: 'Farmers are advised to secure all livestock, particularly on market days. The town council will impound unattended animals from July 1, 2026.', dt: 'April 28, 2026', loc: 'Market Road, Ogere', reporter: 'Community Report', views: 67 },
  { id: 7, lv: 'resolved', ti: 'Water Supply Disruption — Resolved', bo: 'The water supply disruption affecting Oke-Ogere and Idi-Iroko quarters has been fully resolved. Normal supply was restored on April 15, 2026. Thank you for your patience.', dt: 'Resolved: April 15, 2026', loc: 'Oke-Ogere / Idi-Iroko', reporter: 'OCDA Works', views: 203 },
];

const EM = [
  {
    cat: '🚔 Nigeria Police Force', col: '#1a2e6e', bdr: 'rgba(100,140,255,.4)',
    list: [
      { n: 'DPO — Ogere Station', p: '08081762371', v: true, note: 'Direct line to Ogere DPO' },
      { n: 'O/C Trailer Park Ogere', p: '08035864696', v: true, note: 'Expressway/trailer park' },
      { n: 'DPO — Ikenne', p: '08037159221', v: true, note: 'LGA Headquarters' },
      { n: 'DPO — Sagamu Area Command', p: '08038122121', v: true, note: 'Area Command, Ogun State' },
      { n: 'Police Emergency', p: '112', v: true, note: 'Free · 24 hours · National' },
    ],
  },
  {
    cat: '🚦 FRSC — Road Safety', col: '#1a4a1a', bdr: 'rgba(100,200,100,.4)',
    list: [
      { n: 'FRSC Ogere Unit', p: '—', v: false, note: 'New office April 2026 — awaiting number' },
      { n: 'FRSC National', p: '122', v: true, note: 'Free · nationwide' },
      { n: 'TRACE — Road Accidents', p: '07066942555', v: true, note: 'Ogun State Traffic Command' },
    ],
  },
  {
    cat: '🛡️ So-Safe Corps', col: '#4a2000', bdr: 'rgba(200,100,50,.4)',
    list: [
      { n: 'So-Safe Emergency 1', p: '08034681687', v: true, note: 'State Commander Line' },
      { n: 'So-Safe Emergency 2', p: '09009069392064', v: true, note: 'Alternative Line' },
      { n: 'So-Safe Emergency 3', p: '08035479930', v: true, note: 'Third Emergency Line' },
    ],
  },
  {
    cat: '🚑 Ambulance & Medical', col: '#5a1010', bdr: 'rgba(220,80,80,.4)',
    list: [
      { n: 'National Emergency', p: '112', v: true, note: 'Free · 24 hours · Police/Ambulance/Fire' },
      { n: 'Ogun State Ambulance', p: '08112000033', v: true, note: 'Dedicated ambulance line' },
    ],
  },
  {
    cat: '🔥 Fire Service', col: '#7a1500', bdr: 'rgba(255,100,30,.4)',
    list: [
      { n: 'Ogun State Fire Service', p: '08134680660', v: true, note: 'Sagamu station' },
      { n: 'National Emergency', p: '112', v: true, note: 'Free · 24 hours' },
    ],
  },
];

const SEVERITY = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.07)', label: 'CRITICAL', dot: '#ef4444' },
  high:     { color: '#dc2626', bg: 'rgba(220,38,38,0.06)',  label: 'HIGH',     dot: '#dc2626' },
  medium:   { color: '#d97706', bg: 'rgba(217,119,6,0.06)',  label: 'MEDIUM',   dot: '#d97706' },
  low:      { color: '#16a34a', bg: 'rgba(22,163,74,0.05)',  label: 'LOW',      dot: '#16a34a' },
  resolved: { color: 'rgba(255,255,255,.3)', bg: 'rgba(255,255,255,.02)', label: 'RESOLVED', dot: 'rgba(255,255,255,.3)' },
};

const QUICK_DIAL = [
  { ic: '🚔', l: 'Police',     n: '112',          s: 'Free · National' },
  { ic: '🚑', l: 'Ambulance',  n: '08112000033',  s: 'Ogun State' },
  { ic: '🚦', l: 'Road Safety',n: '122',          s: 'FRSC' },
  { ic: '🛡️', l: 'So-Safe',   n: '08034681687',  s: 'Ogun State' },
  { ic: '🚗', l: 'Accidents',  n: '07066942555',  s: 'TRACE' },
  { ic: '👮', l: 'Ogere DPO',  n: '08081762371',  s: 'Ogere Station' },
  { ic: '🔥', l: 'Fire',       n: '08134680660',  s: 'Sagamu' },
  { ic: '💊', l: 'Emergency',  n: '112',          s: 'All Services' },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');
  const [showReport, setShowReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [report, setReport] = useState({ type: '', location: '', description: '', contact: '' });
  const setR = (k, v) => setReport(r => ({ ...r, [k]: v }));

  const activeAlerts = alerts.filter(a => a.lv !== 'resolved');
  const criticalCount = alerts.filter(a => a.lv === 'critical').length;
  const highCount = alerts.filter(a => a.lv === 'high').length;

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.lv === filter);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const newIncident = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: `${report.type}: ${report.location}`,
      category: report.type.toLowerCase(),
      location: report.location,
      severity: 'medium',
      description: report.description,
      reporterContact: report.contact || 'Anonymous',
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    await dbInsert('incident_reports', newIncident);
    setReportSubmitted(true);
    setTimeout(() => { setShowReport(false); setReportSubmitted(false); setReport({ type: '', location: '', description: '', contact: '' }); }, 3000);
  };

  return (
    <div>
      <SEO title="Security Alerts & Emergency" description="Real-time community security alerts, emergency contacts, and incident reporting for Ogere Remo." />
      <Hero ey="Community Safety" ti="Security Command Centre" sub="Real-time alerts, verified emergency contacts, and community incident reporting for Ogere Remo." dark />

      {/* Critical banner */}
      <div style={{
        background: criticalCount > 0 ? 'linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)' : 'linear-gradient(90deg, #7A2E0E, #B5451B, #7A2E0E)',
        backgroundSize: '200% 100%',
        animation: 'bannerScroll 3s linear infinite',
        padding: '0.75rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,100,50,0.3)',
      }}>
        <style>{`@keyframes bannerScroll { 0% { background-position: 0% 0%; } 100% { background-position: 200% 0%; } }`}</style>
        <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'white', textTransform: 'uppercase' }}>
          {criticalCount > 0 && <span style={{ background: '#ef4444', padding: '2px 8px', borderRadius: '3px', marginRight: '0.8rem' }}>🔴 {criticalCount} CRITICAL</span>}
          {highCount > 0 && <span style={{ marginRight: '0.8rem' }}>⚠ {highCount} HIGH PRIORITY</span>}
          DIAL 112 FOR ANY EMERGENCY · SAVE ALL NUMBERS BELOW
        </span>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#0d0704', borderBottom: '1px solid rgba(201,150,58,0.1)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          {[
            [criticalCount, 'Critical', '#ef4444'],
            [activeAlerts.filter(a => a.lv === 'high').length, 'High', '#dc2626'],
            [activeAlerts.filter(a => a.lv === 'medium').length, 'Medium', '#d97706'],
            [activeAlerts.filter(a => a.lv === 'low').length, 'Low', '#16a34a'],
            [alerts.filter(a => a.lv === 'resolved').length, 'Resolved', 'rgba(255,255,255,0.3)'],
          ].map(([n, l, c]) => (
            <div key={l}>
              <div className="cinzel" style={{ fontSize: '1.8rem', fontWeight: 900, color: c }}>{n}</div>
              <div className="cinzel" style={{ fontSize: '0.45rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Dial */}
      <Section bg="#0d0704">
        <p className="cinzel" style={{ textAlign: 'center', color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>QUICK DIAL</p>
        <h2 className="playfair" style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>Emergency Numbers</h2>
        <p style={{ textAlign: 'center', color: 'rgba(245,237,216,0.5)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Tap any number to call immediately</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.8rem', marginBottom: '3rem' }}>
          {QUICK_DIAL.map(({ ic, l, n, s }) => (
            <a
              key={l + n}
              href={`tel:${n.replace(/\s/g, '')}`}
              style={{
                display: 'block', background: 'rgba(181,69,27,0.1)',
                border: '1px solid rgba(181,69,27,0.35)', borderTop: '3px solid #B5451B',
                padding: '1.2rem', textAlign: 'center', borderRadius: '6px',
                transition: 'all 0.2s ease', cursor: 'pointer', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(181,69,27,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(181,69,27,0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{ic}</div>
              <div className="cinzel" style={{ fontSize: '0.48rem', letterSpacing: '0.1em', color: 'rgba(245,237,216,0.45)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{l}</div>
              <div className="cinzel" style={{ fontSize: n.length > 10 ? '0.75rem' : '1rem', fontWeight: 700, color: '#F5EDD8', marginBottom: '0.15rem', letterSpacing: '0.02em' }}>{n}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(245,237,216,0.35)' }}>{s}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.6rem', color: '#B5451B' }}>📞 TAP TO CALL</div>
            </a>
          ))}
        </div>

        {/* Detailed emergency sections */}
        <div style={{ display: 'grid', gap: '1.2rem' }}>
          {EM.map((cat, ci) => (
            <div key={ci} style={{ border: `1px solid ${cat.bdr}`, borderTop: `3px solid ${cat.bdr.replace('.4', '1')}`, borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: cat.col, padding: '0.8rem 1.5rem' }}>
                <div className="cinzel" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F5EDD8' }}>{cat.cat}</div>
              </div>
              {cat.list.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.85rem 1.5rem', borderBottom: i < cat.list.length - 1 ? '1px solid rgba(201,150,58,0.08)' : 'none',
                  flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(13,7,4,0.6)',
                }}>
                  <div style={{ flex: 1, minWidth: 'min(180px, 100%)' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.1rem' }}>
                      <span style={{ fontSize: '0.6rem', color: c.v ? '#86efac' : 'rgba(255,200,80,.6)' }}>{c.v ? '✅' : '⏳'}</span>
                      <span style={{ fontSize: '0.85rem', color: '#F5EDD8' }}>{c.n}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.35)', paddingLeft: '1.2rem' }}>{c.note}</div>
                  </div>
                  {c.v
                    ? <a href={`tel:${c.p}`} className="cinzel" style={{ fontSize: c.p.length > 14 ? '0.62rem' : '0.95rem', fontWeight: 700, color: '#F0D080', textDecoration: 'none', textAlign: 'right' }}>{c.p}</a>
                    : <div className="cinzel" style={{ fontSize: '0.72rem', color: 'rgba(245,237,216,0.25)', textAlign: 'right' }}>{c.p}</div>
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />

      {/* Active Alerts */}
      <Section bg="#1a0706">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="cinzel" style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Live Bulletins</p>
            <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Active Community Alerts</h2>
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['all', 'critical', 'high', 'medium', 'low', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '20px', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.5rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s ease',
                  background: filter === f ? (SEVERITY[f]?.color || 'var(--gold)') : 'rgba(201,150,58,0.08)',
                  color: filter === f ? '#fff' : 'rgba(245,237,216,0.5)',
                  border: filter === f ? 'none' : '1px solid rgba(201,150,58,0.2)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {filtered.map((a) => {
            const sv = SEVERITY[a.lv];
            const isExp = expandedAlert === a.id;
            return (
              <div
                key={a.id}
                style={{
                  border: `1px solid ${sv.color}40`, borderLeft: `4px solid ${sv.color}`,
                  background: sv.bg, padding: '1.3rem', borderRadius: '6px',
                  opacity: a.lv === 'resolved' ? 0.55 : 1, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setExpandedAlert(isExp ? null : a.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {a.lv === 'critical' && <span style={{ animation: 'pulse 1.2s infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: sv.dot }} />}
                    {a.lv !== 'critical' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: sv.dot }} />}
                    <div className="cinzel" style={{ fontSize: '0.52rem', letterSpacing: '0.12em', color: sv.color, textTransform: 'uppercase' }}>{sv.label}</div>
                  </div>
                  <div className="cinzel" style={{ fontSize: '0.48rem', color: 'rgba(245,237,216,0.3)' }}>👁 {a.views}</div>
                </div>
                <div className="playfair" style={{ fontSize: '0.97rem', color: '#F5EDD8', marginBottom: '0.4rem', lineHeight: 1.3 }}>{a.ti}</div>
                <div style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'rgba(245,237,216,0.62)', marginBottom: isExp ? '1rem' : '0.6rem' }}>
                  {isExp ? a.bo : a.bo.substring(0, 90) + (a.bo.length > 90 ? '…' : '')}
                </div>
                {isExp && (
                  <div style={{ borderTop: `1px solid ${sv.color}30`, paddingTop: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(120px, 100%), 1fr))', gap: '0.5rem' }}>
                    {[['📍 Location', a.loc], ['👤 Source', a.reporter], ['📅 Date', a.dt]].map(([k, v]) => (
                      <div key={k}>
                        <div className="cinzel" style={{ fontSize: '0.45rem', color: 'rgba(245,237,216,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(245,237,216,0.7)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                  <div className="cinzel" style={{ fontSize: '0.48rem', letterSpacing: '0.1em', color: 'rgba(245,237,216,0.28)', textTransform: 'uppercase' }}>{a.dt}</div>
                  <span className="cinzel" style={{ fontSize: '0.48rem', color: sv.color }}>{isExp ? '▲ Less' : '▼ Details'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency block */}
        <div style={{ background: 'rgba(181,69,27,0.1)', border: '1px solid rgba(181,69,27,0.3)', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
          <div className="cinzel" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#C9963A', textTransform: 'uppercase' }}>Emergency — Call Free, 24 Hours</div>
          <div className="cinzel" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#F5EDD8', letterSpacing: '0.1em', margin: '0.5rem 0' }}>112</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.5)' }}>Free · 24 Hours · Police · Ambulance · Fire · All Services</div>
          <a href="tel:112" className="btn-p" style={{ display: 'inline-block', marginTop: '1.5rem', fontSize: '0.75rem', padding: '0.8rem 3rem', textDecoration: 'none' }}>
            📞 Call 112 Now
          </a>
        </div>
      </Section>

      <AdireDivider />

      {/* Community Incident Reporting */}
      <Section bg="var(--dark)" py="5rem">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.65rem', marginBottom: '1rem' }}>COMMUNITY REPORTING</p>
            <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '1rem' }}>Report an Incident</h2>
            <p style={{ color: 'rgba(245,237,216,0.55)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              Seen something suspicious or experienced a security incident in Ogere? Report it here. All reports are reviewed by the OCDA security committee and forwarded to appropriate authorities.
            </p>
          </div>

          {!showReport && !reportSubmitted && (
            <div style={{ textAlign: 'center' }}>
              <button className="btn-p" onClick={() => setShowReport(true)} style={{ fontSize: '0.75rem', padding: '1rem 2.5rem' }}>
                🚨 Submit a Community Report
              </button>
              <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(245,237,216,0.35)' }}>
                For life-threatening emergencies, call <strong style={{ color: '#ef4444' }}>112</strong> immediately. Do not use this form.
              </p>
            </div>
          )}

          {showReport && !reportSubmitted && (
            <form onSubmit={handleReportSubmit} style={{ animation: 'fadeUp 0.4s ease both' }}>
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '12px', borderLeft: '4px solid #d97706' }}>
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Incident Type *</label>
                    <select required className="inp" value={report.type} onChange={e => setR('type', e.target.value)} style={{ background: 'rgba(201,150,58,0.05)' }}>
                      <option value="">Select type...</option>
                      {['Theft / Robbery', 'Suspicious Activity', 'Road Accident', 'Fire / Flooding', 'Land Dispute', 'Noise / Disturbance', 'Missing Person', 'Medical Emergency', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Location / Area *</label>
                    <input required className="inp" value={report.location} onChange={e => setR('location', e.target.value)} placeholder="E.g. Oke-Ogere, near the market, expressway bypass..." />
                  </div>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description *</label>
                    <textarea required className="inp" rows={5} value={report.description} onChange={e => setR('description', e.target.value)} placeholder="Describe what happened, when, and any details about the parties involved..." style={{ resize: 'vertical' }} />
                  </div>
                  <div>
                    <label className="cinzel" style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Your Contact (Optional — kept confidential)</label>
                    <input className="inp" value={report.contact} onChange={e => setR('contact', e.target.value)} placeholder="Phone or email — so we can follow up if needed" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button type="button" className="btn-o" onClick={() => setShowReport(false)}>Cancel</button>
                <button type="submit" className="btn-p">Submit Report →</button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.72rem', color: 'rgba(245,237,216,0.35)', lineHeight: 1.8 }}>
                Reports are reviewed within 2–4 hours. Your identity is kept confidential. False reports undermine community safety — please report honestly.
              </p>
            </form>
          )}

          {reportSubmitted && (
            <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <div className="playfair" style={{ fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>Report Received</div>
              <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.85rem' }}>Thank you. Your report has been submitted to the OCDA security committee and will be reviewed shortly.</p>
            </div>
          )}
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
