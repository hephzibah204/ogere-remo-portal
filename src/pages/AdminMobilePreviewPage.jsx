import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const SEED_OFFICERS = [
  {
    role: 'security_officer',
    name: 'Insp. Kayode Adeleke',
    badge: 'NPF-OG-4891',
    agency: 'Nigeria Police Force — Ogere Divisional HQ',
    email: 'police@ogereremo.org',
    passkey: 'OGERE-SEC-2026',
    title: 'Tactical Security & Rapid Intercept',
    themeColor: '#ef4444',
    badgeColor: '#dc2626',
    icon: '🛡️',
  },
  {
    role: 'palace_protocol',
    name: 'Prince Olawale Babatunde',
    badge: 'PAL-PRO-002',
    agency: 'Aafin Ologere Palace Protocol Office',
    email: 'protocol@ogereremo.org',
    passkey: 'AAFIN-PROTO-2026',
    title: 'Palace Protocol & Royal Audience Secretariat',
    themeColor: '#C9963A',
    badgeColor: '#d97706',
    icon: '👑',
  },
  {
    role: 'ocda_admin',
    name: 'Engr. Folake Sobukonla',
    badge: 'OCDA-ADM-101',
    agency: 'Ogere Community Development Association (OCDA)',
    email: 'admin@ogereremo.org',
    passkey: 'OCDA-HQ-2026',
    title: 'OCDA Civic Central Command & ID Certification',
    themeColor: '#10b981',
    badgeColor: '#059669',
    icon: '🏛️',
  },
];

const CHAMBERS = [
  'Inner Royal Council Chamber',
  'Throne Room (High Royal Audience)',
  'Agbole Palace Courtyard (Delegations)',
  'Oba Council Secretariat Wing',
];

export default function AdminMobilePreviewPage() {
  // Simulator State
  const [deviceFrame, setDeviceFrame] = useState('iphone'); // 'iphone', 'android', 'none'
  const [activeScreen, setActiveScreen] = useState('dashboard'); // 'login', 'register', 'dashboard', 'audiences', 'idCards'
  const [currentRole, setCurrentRole] = useState('palace_protocol'); // 'security_officer', 'palace_protocol', 'ocda_admin'
  const [currentOfficer, setCurrentOfficer] = useState(SEED_OFFICERS[1]);

  // Command metrics
  const [stats, setStats] = useState({
    incidents: { total: 14, code_red: 1, open_count: 3, dispatched_count: 2 },
    audiences: { total: 28, pending: 4, confirmed: 19, postponed: 3 },
    idCards: { total: 142, pending: 8, approved: 129 },
  });

  // Data states
  const [audiences, setAudiences] = useState([
    {
      id: 'AUD-2026-9481',
      fullName: 'Chief Adebayo Olanrewaju',
      purpose: 'Community Electrification Project Presentation',
      phone: '08033221144',
      email: 'adebayo.remoland@gmail.com',
      address: '14 Palace Way, Oke-Ogere',
      groupSize: '3 delegates',
      bookingDate: '2026-09-22',
      timeSlot: '11:00 AM',
      status: 'pending',
      message: 'Seeking royal blessing and land allocation review for substation expansion.',
    },
    {
      id: 'AUD-2026-8712',
      fullName: 'Dr. Folashade Adeyemi',
      purpose: 'Annual Free Medical Outreach at Ogere Town Hall',
      phone: '08022998877',
      email: 'folashade@diasporaremo.org',
      address: 'London, UK / 5 Agbole Ijana, Ogere',
      groupSize: '5 medical team members',
      bookingDate: '2026-09-28',
      timeSlot: '10:00 AM',
      status: 'pending',
      message: 'Diaspora medical team returning home to provide free cataract surgeries and hypertensive screenings.',
    },
    {
      id: 'AUD-2026-6209',
      fullName: 'Engr. Babatunde Sowemimo',
      purpose: 'Interstate Logistics Hub Planning Review',
      phone: '08155443322',
      email: 'babatunde@ogerecorridor.ng',
      address: 'Lagos-Ibadan Expressway Commercial Zone, Ogere',
      groupSize: '2 persons',
      bookingDate: '2026-09-18',
      timeSlot: '02:00 PM',
      status: 'confirmed',
      chamber: 'Throne Room (High Royal Audience)',
      message: 'Coordination with palace security for truck terminal perimeter fencing.',
    },
  ]);

  const [idCards, setIdCards] = useState([
    {
      id: 'OGR-IND-2026-081',
      fullName: 'Oluwaseun Adedayo Adeleke',
      citizenType: 'indigene',
      quarter: 'Oke-Ogere',
      compound: 'Ile Ologere (Royal Clan)',
      phone: '08023456789',
      nin: '78291048572',
      status: 'pending',
    },
    {
      id: 'OGR-NON-2026-114',
      fullName: 'Ibrahim Chukwuma Danjuma',
      citizenType: 'non-indigene',
      quarter: 'Ijana',
      compound: 'Expressway Commercial Corridor',
      phone: '08098765432',
      nin: '44556677889',
      status: 'pending',
    },
    {
      id: 'OGR-INT-2026-042',
      fullName: 'Victoria Omotola Sowemimo',
      citizenType: 'indigene',
      quarter: 'Agbole',
      compound: 'Ile Jagun',
      phone: '+44 7700 900123',
      nin: '11223344556',
      status: 'approved',
    },
  ]);

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2026-001',
      category: '🚨 Armed Robbery / Banditry',
      description: 'Suspicious armed suspects sighted along KM 67 boundary.',
      location: 'KM 67 Tollgate Expressway, Ogere',
      severity: 'Critical',
      status: 'DISPATCHED',
      officer: 'Insp. Kayode Adeleke (Unit 4)',
      time: '12 mins ago',
    },
    {
      id: 'INC-2026-002',
      category: '🔥 Tanker Fire Precaution',
      description: 'Diesel truck overheating at truck parking depot.',
      location: 'Ogere Trailer Park South Gate',
      severity: 'High',
      status: 'INVESTIGATING',
      officer: 'So-Safe Patrol Team B',
      time: '28 mins ago',
    },
  ]);

  // Decision Modal State
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [audienceAction, setAudienceAction] = useState('confirmed');
  const [chamberSelect, setChamberSelect] = useState(CHAMBERS[0]);
  const [audienceDate, setAudienceDate] = useState('2026-09-25');
  const [audienceTime, setAudienceTime] = useState('11:00 AM');
  const [palaceNotes, setPalaceNotes] = useState('Granted. Traditional attire required; arrive 20 mins early.');
  const [toastMsg, setToastMsg] = useState(null);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    agency: 'Nigeria Police Force (NPF)',
    badgeNumber: '',
    role: 'security_officer',
    accessKey: '',
  });

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRoleSwitch = (roleKey) => {
    const found = SEED_OFFICERS.find((o) => o.role === roleKey) || SEED_OFFICERS[0];
    setCurrentRole(roleKey);
    setCurrentOfficer(found);
    setActiveScreen('dashboard');
    showToast(`Switched terminal context to: ${found.title}`);
  };

  const handleConfirmAudience = (e) => {
    e.preventDefault();
    if (!selectedAudience) return;

    setAudiences((prev) =>
      prev.map((a) =>
        a.id === selectedAudience.id
          ? {
              ...a,
              status: audienceAction,
              chamber: chamberSelect,
              bookingDate: audienceDate,
              timeSlot: audienceTime,
              palaceNotes,
            }
          : a
      )
    );

    showToast(
      `✓ Audience #${selectedAudience.id} marked ${audienceAction.toUpperCase()}. Automated royal letterhead email dispatched to ${selectedAudience.email}!`
    );
    setSelectedAudience(null);
  };

  const handleProcessIdCard = (cardId, decision) => {
    setIdCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: decision } : c))
    );
    showToast(`🪪 Digital ID ${cardId} has been marked as ${decision.toUpperCase()}.`);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regForm.accessKey.toUpperCase().includes('OGERE') && !regForm.accessKey.toUpperCase().includes('2026')) {
      showToast('⚠️ Invalid Agency Authorization Key. Must match authorized agency security pass.');
      return;
    }
    const newOfficer = {
      role: regForm.role,
      name: regForm.fullName || 'Officer In Charge',
      badge: regForm.badgeNumber || 'OFF-2026-99',
      agency: regForm.agency,
      email: regForm.email,
      passkey: regForm.accessKey,
      title: regForm.agency,
      themeColor: regForm.role === 'security_officer' ? '#ef4444' : regForm.role === 'palace_protocol' ? '#C9963A' : '#10b981',
      badgeColor: '#059669',
      icon: regForm.role === 'security_officer' ? '🛡️' : regForm.role === 'palace_protocol' ? '👑' : '🏛️',
    };
    setCurrentRole(newOfficer.role);
    setCurrentOfficer(newOfficer);
    setActiveScreen('dashboard');
    showToast(`🎉 Registration approved! Welcome Officer ${newOfficer.name}.`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090503', color: '#F5EDD8', padding: '1.5rem 1rem 4rem' }}>
      <SEO
        title="Field Officer & Palace Protocol Terminal | Ogere Remo Civic Portal"
        description="Dedicated mobile application environment for security patrol officers, palace protocol secretariats, and OCDA administrators."
      />

      {/* Top Banner Bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto 1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#F5EDD8', fontFamily: "'Cinzel', serif" }}>
                Field Officer & Palace Protocol Mobile App
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: '.78rem', color: '#C9963A' }}>
                Dedicated Multi-Role Terminal: Security Patrol · Royal Protocol Secretariat · OCDA Admin Desk
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links & Switchers */}
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            to="/mobile-preview"
            style={{
              padding: '.4rem .8rem',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#F5EDD8',
              fontSize: '.75rem',
              textDecoration: 'none',
            }}
          >
            📱 Citizen App Preview
          </Link>
          <Link
            to="/admin"
            style={{
              padding: '.4rem .8rem',
              borderRadius: 6,
              background: 'rgba(201,150,58,0.15)',
              border: '1px solid #C9963A',
              color: '#C9963A',
              fontSize: '.75rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏛️ Web CMS Dashboard
          </Link>
        </div>
      </div>

      {/* Control Strip */}
      <div style={{ maxWidth: 1200, margin: '0 auto 1.5rem', background: '#120804', border: '1px solid rgba(201,150,58,0.25)', borderRadius: 10, padding: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        {/* Role Switcher Pills */}
        <div>
          <div style={{ fontSize: '.68rem', color: '#C9963A', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '.4rem' }}>
            SELECT ACTIVE OFFICER TERMINAL CONTEXT:
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {SEED_OFFICERS.map((off) => (
              <button
                key={off.role}
                onClick={() => handleRoleSwitch(off.role)}
                style={{
                  padding: '.5rem .9rem',
                  borderRadius: 20,
                  border: currentRole === off.role ? `2px solid ${off.themeColor}` : '1px solid rgba(255,255,255,0.15)',
                  background: currentRole === off.role ? 'rgba(201,150,58,0.2)' : 'rgba(255,255,255,0.04)',
                  color: currentRole === off.role ? '#ffffff' : 'rgba(245,237,216,0.6)',
                  fontWeight: currentRole === off.role ? 800 : 500,
                  fontSize: '.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.4rem',
                }}
              >
                <span>{off.icon}</span>
                <span>{off.role === 'security_officer' ? 'Security Patrol' : off.role === 'palace_protocol' ? 'Palace Protocol' : 'OCDA Admin'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Device Frame Switcher */}
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '.72rem', color: 'rgba(245,237,216,0.5)' }}>Device Chassis:</span>
          {['iphone', 'android', 'none'].map((f) => (
            <button
              key={f}
              onClick={() => setDeviceFrame(f)}
              style={{
                padding: '.3rem .6rem',
                borderRadius: 4,
                border: deviceFrame === f ? '1px solid #C9963A' : '1px solid rgba(255,255,255,0.1)',
                background: deviceFrame === f ? '#C9963A' : 'transparent',
                color: deviceFrame === f ? '#000' : '#fff',
                fontSize: '.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f === 'none' ? 'Frameless' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: '#166534', color: '#dcfce7', border: '1px solid #22c55e', padding: '.8rem 1.2rem', borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxWidth: 360, fontSize: '.8rem', lineHeight: 1.4 }}>
          {toastMsg}
        </div>
      )}

      {/* Main Interactive Stage */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Device Container */}
        <div
          style={{
            width: deviceFrame === 'none' ? 440 : 390,
            height: deviceFrame === 'none' ? 820 : 790,
            background: '#0c0604',
            borderRadius: deviceFrame === 'iphone' ? 44 : deviceFrame === 'android' ? 24 : 12,
            border: deviceFrame === 'iphone' ? '12px solid #262626' : deviceFrame === 'android' ? '10px solid #1f2937' : '1px solid rgba(201,150,58,0.3)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 20px rgba(201,150,58,0.15)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Notch / Status Bar */}
          <div style={{ height: 38, background: '#140a05', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#F5EDD8' }}>09:41</span>
            {deviceFrame === 'iphone' && (
              <div style={{ width: 110, height: 18, background: '#000', borderRadius: 10, margin: '0 auto' }} />
            )}
            <div style={{ display: 'flex', gap: '.3rem', fontSize: '.68rem', color: '#86efac' }}>
              <span>📶 5G</span>
              <span>🔋 98%</span>
            </div>
          </div>

          {/* Officer Identity Sub-header Bar */}
          <div style={{ background: '#190d07', borderBottom: '1px solid rgba(201,150,58,0.2)', padding: '.45rem .8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{currentOfficer.icon}</span>
              <div>
                <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#ffffff' }}>{currentOfficer.name}</div>
                <div style={{ fontSize: '.58rem', color: '#C9963A', fontFamily: 'monospace' }}>{currentOfficer.badge}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.3rem' }}>
              <button
                onClick={() => setActiveScreen('dashboard')}
                style={{
                  background: activeScreen === 'dashboard' ? '#C9963A' : 'rgba(255,255,255,0.05)',
                  color: activeScreen === 'dashboard' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '.58rem',
                  padding: '.2rem .4rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                HUD
              </button>
              <button
                onClick={() => setActiveScreen('login')}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 4,
                  fontSize: '.58rem',
                  padding: '.2rem .4rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Log Off
              </button>
            </div>
          </div>

          {/* Scrollable Mobile App Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '.8rem', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            
            {/* ════════════ SCREEN 1: LOGIN ════════════ */}
            {activeScreen === 'login' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem', padding: '.4rem 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem' }}>🛡️</div>
                  <h3 style={{ margin: '4px 0', fontSize: '1.1rem', color: '#F5EDD8', fontFamily: "'Cinzel', serif" }}>
                    Officer & Protocol Terminal
                  </h3>
                  <p style={{ margin: 0, fontSize: '.68rem', color: '#C9963A' }}>
                    Kingdom of Ogere Remo Official Command App
                  </p>
                </div>

                <div style={{ background: '#150a05', border: '1px solid rgba(201,150,58,0.25)', borderRadius: 8, padding: '.8rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  <div style={{ fontSize: '.65rem', color: '#C9963A', fontWeight: 800, textTransform: 'uppercase' }}>
                    Quick-Access Duty Profiles
                  </div>
                  {SEED_OFFICERS.map((off) => (
                    <button
                      key={off.role}
                      onClick={() => {
                        setCurrentRole(off.role);
                        setCurrentOfficer(off);
                        setActiveScreen('dashboard');
                        showToast(`Logged in as ${off.name}`);
                      }}
                      style={{
                        padding: '.6rem .7rem',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{off.icon}</span>
                        <div>
                          <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#fff' }}>{off.name}</div>
                          <div style={{ fontSize: '.6rem', color: 'rgba(245,237,216,0.6)' }}>{off.badge} · {off.agency}</div>
                        </div>
                      </div>
                      <span style={{ color: '#C9963A', fontSize: '.75rem' }}>➔</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveScreen('register')}
                  style={{
                    background: 'transparent',
                    border: '1px dashed #C9963A',
                    color: '#C9963A',
                    borderRadius: 6,
                    padding: '.6rem',
                    fontSize: '.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Register New Field Officer or Protocol Unit
                </button>
              </div>
            )}

            {/* ════════════ SCREEN 2: REGISTRATION ════════════ */}
            {activeScreen === 'register' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveScreen('login')}
                    style={{ background: 'none', border: 'none', color: '#C9963A', cursor: 'pointer', fontSize: '.8rem' }}
                  >
                    ‹ Back
                  </button>
                  <h4 style={{ margin: 0, fontSize: '.9rem', color: '#fff' }}>Register Field Officer</h4>
                </div>

                <div>
                  <label style={{ fontSize: '.62rem', color: 'rgba(245,237,216,0.7)', display: 'block', marginBottom: 2 }}>Officer Full Name</label>
                  <input
                    required
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    placeholder="e.g. Sgt. Olawale Adeyemi"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '.62rem', color: 'rgba(245,237,216,0.7)', display: 'block', marginBottom: 2 }}>Operational Agency</label>
                  <select
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: '#160a05', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    value={regForm.agency}
                    onChange={(e) => setRegForm({ ...regForm, agency: e.target.value })}
                  >
                    <option>Nigeria Police Force (NPF) — Ogere Station</option>
                    <option>Ogun State So-Safe Corps (Armed Unit)</option>
                    <option>FRSC Corridor Highway Patrol</option>
                    <option>Aafin Ologere Palace Protocol Office</option>
                    <option>Ogere Community Development Association (OCDA)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '.62rem', color: 'rgba(245,237,216,0.7)', display: 'block', marginBottom: 2 }}>Badge / Service ID Number</label>
                  <input
                    required
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    placeholder="e.g. NPF-OG-9021"
                    value={regForm.badgeNumber}
                    onChange={(e) => setRegForm({ ...regForm, badgeNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '.62rem', color: 'rgba(245,237,216,0.7)', display: 'block', marginBottom: 2 }}>Terminal Duty Role</label>
                  <select
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: '#160a05', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                  >
                    <option value="security_officer">Security Officer (Dispatch & Radar)</option>
                    <option value="palace_protocol">Palace Protocol Officer (Royal Audiences)</option>
                    <option value="ocda_admin">OCDA Administrator (ID Approvals & Registry)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '.62rem', color: '#f87171', display: 'block', marginBottom: 2, fontWeight: 700 }}>Agency Security Authorization Passkey</label>
                  <input
                    required
                    type="password"
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid #ef4444', color: '#fff', fontSize: '.75rem' }}
                    placeholder="e.g. OGERE-SEC-2026 or AAFIN-PROTO-2026"
                    value={regForm.accessKey}
                    onChange={(e) => setRegForm({ ...regForm, accessKey: e.target.value })}
                  />
                  <div style={{ fontSize: '.55rem', color: 'rgba(245,237,216,0.5)', marginTop: 2 }}>
                    Authorized demo passkey: <code style={{ color: '#C9963A' }}>OGERE2026</code> or <code style={{ color: '#C9963A' }}>OGERE-SEC-2026</code>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '.4rem',
                    background: '#C9963A',
                    color: '#000',
                    border: 'none',
                    borderRadius: 6,
                    padding: '.6rem',
                    fontSize: '.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Verify & Activate Officer Terminal ➔
                </button>
              </form>
            )}

            {/* ════════════ SCREEN 3: DASHBOARD HUD ════════════ */}
            {activeScreen === 'dashboard' && (
              <>
                {/* CODE RED Banner */}
                {stats.incidents.code_red > 0 && (
                  <div style={{ background: 'linear-gradient(90deg, #7f1d1d 0%, #450a0a 100%)', border: '1px solid #ef4444', borderRadius: 8, padding: '.6rem .8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🚨</span>
                      <div>
                        <div style={{ fontSize: '.7rem', fontWeight: 900, color: '#fca5a5', letterSpacing: '0.5px' }}>
                          CODE RED ACTIVE INCIDENT
                        </div>
                        <div style={{ fontSize: '.6rem', color: '#fff' }}>
                          Armed robbery response along KM 67 axis
                        </div>
                      </div>
                    </div>
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '.58rem', fontWeight: 800, padding: '.2rem .5rem', borderRadius: 10 }}>
                      PATROL RESPONDING
                    </span>
                  </div>
                )}

                {/* Live Stats Counters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.4rem' }}>
                  <div style={{ background: '#170b06', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '3px solid #ef4444', borderRadius: 6, padding: '.5rem' }}>
                    <div style={{ fontSize: '.55rem', color: 'rgba(245,237,216,0.6)', fontWeight: 700 }}>INCIDENTS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f87171' }}>{stats.incidents.open_count}</div>
                    <div style={{ fontSize: '.52rem', color: '#fca5a5' }}>{stats.incidents.dispatched_count} active</div>
                  </div>

                  <div
                    onClick={() => setActiveScreen('audiences')}
                    style={{ background: '#170b06', border: '1px solid rgba(201,150,58,0.3)', borderLeft: '3px solid #C9963A', borderRadius: 6, padding: '.5rem', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '.55rem', color: 'rgba(245,237,216,0.6)', fontWeight: 700 }}>AUDIENCES</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#C9963A' }}>{stats.audiences.pending}</div>
                    <div style={{ fontSize: '.52rem', color: '#fef08a' }}>{stats.audiences.confirmed} confirmed</div>
                  </div>

                  <div
                    onClick={() => setActiveScreen('idCards')}
                    style={{ background: '#170b06', border: '1px solid rgba(16,185,129,0.3)', borderLeft: '3px solid #10b981', borderRadius: 6, padding: '.5rem', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '.55rem', color: 'rgba(245,237,216,0.6)', fontWeight: 700 }}>ID CARDS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>{stats.idCards.pending}</div>
                    <div style={{ fontSize: '.52rem', color: '#86efac' }}>{stats.idCards.approved} certified</div>
                  </div>
                </div>

                {/* ── ROLE CONSOLE: 1. SECURITY PATROL ── */}
                {currentRole === 'security_officer' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.5px' }}>
                      🛡️ TACTICAL SECURITY FEED & RADAR
                    </div>

                    {/* Quick Tools */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.4rem' }}>
                      <button
                        onClick={() => showToast('📍 Geofenced Check-In: Aafin Gatehouse Outpost (6.9368°N, 3.6330°E) logged.')}
                        style={{ padding: '.6rem', background: '#1a0b06', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>📍</div>
                        <div style={{ fontSize: '.7rem', fontWeight: 800 }}>Patrol Check-In</div>
                        <div style={{ fontSize: '.55rem', color: 'rgba(245,237,216,0.6)' }}>Log GPS checkpoint</div>
                      </button>

                      <button
                        onClick={() => setActiveScreen('idCards')}
                        style={{ padding: '.6rem', background: '#1a0b06', border: '1px solid rgba(201,150,58,0.3)', borderRadius: 6, color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>🪪</div>
                        <div style={{ fontSize: '.7rem', fontWeight: 800 }}>Gate Pass Scanner</div>
                        <div style={{ fontSize: '.55rem', color: 'rgba(245,237,216,0.6)' }}>Validate visitor IDs</div>
                      </button>
                    </div>

                    {/* Incident Alerts */}
                    <div style={{ background: '#160a05', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '.6rem' }}>
                      <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#C9963A', marginBottom: '.4rem' }}>
                        Priority Incidents Awaiting Units
                      </div>
                      {incidents.map((inc) => (
                        <div key={inc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '.4rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#fff' }}>{inc.category}</div>
                            <div style={{ fontSize: '.6rem', color: 'rgba(245,237,216,0.6)' }}>📍 {inc.location}</div>
                            <div style={{ fontSize: '.55rem', color: '#f87171' }}>{inc.status} · {inc.time}</div>
                          </div>
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=6.9368,3.6330`, '_blank')}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '.3rem .6rem', fontSize: '.62rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            GPS Nav
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── ROLE CONSOLE: 2. PALACE PROTOCOL ── */}
                {currentRole === 'palace_protocol' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#C9963A' }}>
                        👑 PALACE AUDIENCE APPOINTMENT QUEUE
                      </span>
                      <button
                        onClick={() => setActiveScreen('audiences')}
                        style={{ background: 'none', border: 'none', color: '#fef08a', fontSize: '.62rem', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Open Full Queue ({audiences.length}) ➔
                      </button>
                    </div>

                    {audiences.slice(0, 2).map((aud) => (
                      <div
                        key={aud.id}
                        style={{
                          background: '#180d07',
                          border: '1px solid rgba(201,150,58,0.25)',
                          borderRadius: 8,
                          padding: '.6rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '.4rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '.55rem', fontFamily: 'monospace', color: '#C9963A', fontWeight: 800 }}>{aud.id}</span>
                            <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#fff' }}>{aud.fullName}</div>
                          </div>
                          <span style={{ fontSize: '.55rem', fontWeight: 800, padding: '.15rem .45rem', borderRadius: 10, background: aud.status === 'confirmed' ? '#065f46' : '#854d0e', color: '#fff' }}>
                            {aud.status.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ fontSize: '.65rem', color: 'rgba(245,237,216,0.7)', background: 'rgba(201,150,58,0.06)', padding: '.35rem', borderRadius: 4 }}>
                          Purpose: <strong>{aud.purpose}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.58rem', color: 'rgba(245,237,216,0.5)' }}>
                          <span>📅 {aud.bookingDate} at {aud.timeSlot}</span>
                          <span>👥 {aud.groupSize}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '.4rem', marginTop: '.2rem' }}>
                          <button
                            onClick={() => {
                              setSelectedAudience(aud);
                              setAudienceAction('confirmed');
                            }}
                            style={{ flex: 1, background: '#C9963A', color: '#000', border: 'none', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            👑 Confirm & Chamber
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAudience(aud);
                              setAudienceAction('postponed');
                            }}
                            style={{ flex: 1, background: 'rgba(217,119,6,0.2)', border: '1px solid #d97706', color: '#fef08a', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ⏳ Reschedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── ROLE CONSOLE: 3. OCDA ADMIN ── */}
                {currentRole === 'ocda_admin' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#34d399' }}>
                        🏛️ OCDA CIVIC ID VERIFICATION DESK
                      </span>
                      <button
                        onClick={() => setActiveScreen('idCards')}
                        style={{ background: 'none', border: 'none', color: '#86efac', fontSize: '.62rem', cursor: 'pointer', fontWeight: 700 }}
                      >
                        All Applications ➔
                      </button>
                    </div>

                    {idCards.map((card) => (
                      <div
                        key={card.id}
                        style={{
                          background: '#0a1e16',
                          border: '1px solid rgba(16,185,129,0.25)',
                          borderRadius: 8,
                          padding: '.6rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '.3rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '.55rem', fontFamily: 'monospace', color: '#34d399', fontWeight: 800 }}>{card.id}</span>
                            <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#fff' }}>{card.fullName}</div>
                          </div>
                          <span style={{ fontSize: '.55rem', fontWeight: 800, padding: '.15rem .45rem', borderRadius: 10, background: card.status === 'approved' ? '#065f46' : '#854d0e', color: '#fff' }}>
                            {card.status.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ fontSize: '.62rem', color: 'rgba(245,237,216,0.6)' }}>
                          Quarter: {card.quarter} · Compound: {card.compound}
                        </div>

                        {card.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '.4rem', marginTop: '.2rem' }}>
                            <button
                              onClick={() => handleProcessIdCard(card.id, 'approved')}
                              style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                              ✓ Approve Card
                            </button>
                            <button
                              onClick={() => handleProcessIdCard(card.id, 'rejected')}
                              style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              ✕ Flag
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════════════ SCREEN 4: AUDIENCES MANAGER ════════════ */}
            {activeScreen === 'audiences' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    style={{ background: 'none', border: 'none', color: '#C9963A', cursor: 'pointer', fontSize: '.8rem' }}
                  >
                    ‹ HUD
                  </button>
                  <span style={{ fontSize: '.8rem', fontWeight: 800, color: '#fff' }}>Palace Audiences ({audiences.length})</span>
                  <div style={{ width: 24 }} />
                </div>

                {audiences.map((aud) => (
                  <div
                    key={aud.id}
                    style={{
                      background: '#170b06',
                      border: '1px solid rgba(201,150,58,0.3)',
                      borderRadius: 8,
                      padding: '.7rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '.58rem', color: '#C9963A', fontFamily: 'monospace', fontWeight: 800 }}>{aud.id}</span>
                        <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#fff' }}>{aud.fullName}</div>
                      </div>
                      <span style={{ fontSize: '.55rem', fontWeight: 800, padding: '.15rem .5rem', borderRadius: 10, background: aud.status === 'confirmed' ? '#065f46' : '#854d0e', color: '#fff' }}>
                        {aud.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '.65rem', color: '#fff', background: 'rgba(201,150,58,0.08)', padding: '.4rem', borderRadius: 4, borderLeft: '3px solid #C9963A' }}>
                      {aud.purpose}
                    </div>

                    <div style={{ fontSize: '.58rem', color: 'rgba(245,237,216,0.6)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div>✉️ {aud.email}</div>
                      <div>📞 {aud.phone}</div>
                      <div>📍 {aud.address}</div>
                    </div>

                    {aud.chamber && (
                      <div style={{ fontSize: '.62rem', color: '#86efac', background: 'rgba(6,95,70,0.3)', padding: '.35rem', borderRadius: 4 }}>
                        Chamber: <strong>{aud.chamber}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '.4rem', marginTop: '.3rem' }}>
                      <button
                        onClick={() => {
                          setSelectedAudience(aud);
                          setAudienceAction('confirmed');
                        }}
                        style={{ flex: 1, background: '#C9963A', color: '#000', border: 'none', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        👑 Confirm
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAudience(aud);
                          setAudienceAction('postponed');
                        }}
                        style={{ flex: 1, background: 'rgba(217,119,6,0.2)', border: '1px solid #d97706', color: '#fef08a', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ⏳ Reschedule
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAudience(aud);
                          setAudienceAction('declined');
                        }}
                        style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 4, padding: '.35rem', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ════════════ SCREEN 5: ID APPROVALS ════════════ */}
            {activeScreen === 'idCards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '.8rem' }}
                  >
                    ‹ HUD
                  </button>
                  <span style={{ fontSize: '.8rem', fontWeight: 800, color: '#fff' }}>Digital ID Queue ({idCards.length})</span>
                  <div style={{ width: 24 }} />
                </div>

                {idCards.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      background: '#091c14',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: 8,
                      padding: '.7rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '.58rem', fontFamily: 'monospace', color: '#34d399', fontWeight: 800 }}>{card.id}</span>
                        <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#fff' }}>{card.fullName}</div>
                      </div>
                      <span style={{ fontSize: '.55rem', fontWeight: 800, padding: '.15rem .5rem', borderRadius: 10, background: card.status === 'approved' ? '#065f46' : '#854d0e', color: '#fff' }}>
                        {card.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.4rem', fontSize: '.62rem', color: 'rgba(245,237,216,0.7)' }}>
                      <div>Quarter: <strong>{card.quarter}</strong></div>
                      <div>Compound: <strong>{card.compound}</strong></div>
                      <div>Type: <strong>{card.citizenType.toUpperCase()}</strong></div>
                      <div>NIN: <strong>{card.nin}</strong></div>
                    </div>

                    {card.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '.4rem', marginTop: '.3rem' }}>
                        <button
                          onClick={() => handleProcessIdCard(card.id, 'approved')}
                          style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', borderRadius: 4, padding: '.4rem', fontSize: '.68rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          ✓ Approve & Issue ID
                        </button>
                        <button
                          onClick={() => handleProcessIdCard(card.id, 'rejected')}
                          style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 4, padding: '.4rem', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Native Navigation Bar */}
          <div style={{ height: 54, background: '#120804', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => setActiveScreen('dashboard')}
              style={{ background: 'none', border: 'none', color: activeScreen === 'dashboard' ? '#C9963A' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <span style={{ fontSize: '1rem' }}>🏛️</span>
              <span style={{ fontSize: '.58rem', fontWeight: 700 }}>Command</span>
            </button>
            <button
              onClick={() => setActiveScreen('audiences')}
              style={{ background: 'none', border: 'none', color: activeScreen === 'audiences' ? '#C9963A' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <span style={{ fontSize: '1rem' }}>👑</span>
              <span style={{ fontSize: '.58rem', fontWeight: 700 }}>Audiences</span>
            </button>
            <button
              onClick={() => setActiveScreen('idCards')}
              style={{ background: 'none', border: 'none', color: activeScreen === 'idCards' ? '#34d399' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <span style={{ fontSize: '1rem' }}>🪪</span>
              <span style={{ fontSize: '.58rem', fontWeight: 700 }}>ID Desk</span>
            </button>
            <button
              onClick={() => setActiveScreen('register')}
              style={{ background: 'none', border: 'none', color: activeScreen === 'register' ? '#f87171' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <span style={{ fontSize: '1rem' }}>⚙️</span>
              <span style={{ fontSize: '.58rem', fontWeight: 700 }}>Admin</span>
            </button>
          </div>
        </div>

        {/* Right Information & Feature Guide Panel */}
        <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#120804', border: '1px solid rgba(201,150,58,0.3)', borderRadius: 10, padding: '1.2rem', gap: '.8rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#F5EDD8', fontFamily: "'Cinzel', serif" }}>
              ⚡ Field Officer App Capabilities
            </h3>

            <div style={{ fontSize: '.78rem', color: 'rgba(245,237,216,0.7)', lineHeight: 1.6 }}>
              This specialized mobile terminal provides real-time field operations for verified personnel in Ogere Remo:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '.6rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#f87171' }}>1. Security Officers (Police, So-Safe, FRSC)</div>
                <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,0.7)', marginTop: 2 }}>
                  Live intercept feed for panic alarms along the Lagos-Ibadan expressway, GPS turn-by-turn routing, anonymous informant whistleblower decryptor, and GPS patrol post check-in.
                </div>
              </div>

              <div style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.3)', borderRadius: 6, padding: '.6rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#C9963A' }}>2. Palace Protocol Officers</div>
                <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,0.7)', marginTop: 2 }}>
                  Audience manifest review, chamber designation (Throne Room, Inner Council, Courtyard), decision dispatch with automated royal letterhead emails, and VIP entry pass verification.
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, padding: '.6rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#34d399' }}>3. OCDA Administrators</div>
                <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,0.7)', marginTop: 2 }}>
                  Digital Indigene ID Card certification, lineage & quarter approval, emergency town broadcast dispatch, and civic compliance review.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#120804', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '1rem' }}>
            <h4 style={{ margin: '0 0 .5rem', fontSize: '.85rem', color: '#fff' }}>Demo Access Passkeys</h4>
            <div style={{ fontSize: '.7rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.6 }}>
              • Police / Security: <code style={{ color: '#f87171' }}>OGERE-SEC-2026</code><br />
              • Palace Protocol: <code style={{ color: '#C9963A' }}>AAFIN-PROTO-2026</code><br />
              • OCDA Admin Desk: <code style={{ color: '#34d399' }}>OCDA-HQ-2026</code><br />
              • Universal Bypass: <code style={{ color: '#fff' }}>OGERE2026</code>
            </div>
          </div>
        </div>

      </div>

      {/* Royal Decision Modal */}
      {selectedAudience && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleConfirmAudience} style={{ background: '#170b06', border: '2px solid #C9963A', borderRadius: 12, padding: '1.5rem', maxWidth: 440, width: '100%', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            <div style={{ borderBottom: '1px solid rgba(201,150,58,0.2)', paddingBottom: '.6rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#C9963A', fontFamily: "'Cinzel', serif" }}>
                {audienceAction === 'confirmed' ? '👑 Grant Royal Audience' : audienceAction === 'postponed' ? '⏳ Reschedule Appointment' : 'Palace Regret Notice'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '.72rem', color: '#fff' }}>
                Applicant: {selectedAudience.fullName} ({selectedAudience.id})
              </p>
            </div>

            {audienceAction !== 'declined' && (
              <>
                <div>
                  <label style={{ fontSize: '.68rem', color: '#C9963A', fontWeight: 700, display: 'block', marginBottom: 2 }}>Confirmed Date</label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    value={audienceDate}
                    onChange={(e) => setAudienceDate(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '.68rem', color: '#C9963A', fontWeight: 700, display: 'block', marginBottom: 2 }}>Designated Time</label>
                  <input
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    value={audienceTime}
                    onChange={(e) => setAudienceTime(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '.68rem', color: '#C9963A', fontWeight: 700, display: 'block', marginBottom: 2 }}>Allocated Palace Chamber</label>
                  <select
                    style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: '#1c0e07', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                    value={chamberSelect}
                    onChange={(e) => setChamberSelect(e.target.value)}
                  >
                    {CHAMBERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '.68rem', color: '#C9963A', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                {audienceAction === 'declined' ? 'Secretariat Reason' : 'Protocol Instructions & Dress Code Notes'}
              </label>
              <textarea
                rows={3}
                style={{ width: '100%', padding: '.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,150,58,0.3)', color: '#fff', fontSize: '.75rem' }}
                value={palaceNotes}
                onChange={(e) => setPalaceNotes(e.target.value)}
              />
            </div>

            <div style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid #0284c7', borderRadius: 6, padding: '.6rem', fontSize: '.65rem', color: '#bae6fd' }}>
              📧 Submitting will automatically send an official royal letterhead email bearing the palace seal to: <strong>{selectedAudience.email}</strong>.
            </div>

            <div style={{ display: 'flex', gap: '.6rem', marginTop: '.4rem' }}>
              <button
                type="button"
                onClick={() => setSelectedAudience(null)}
                style={{ flex: 1, padding: '.6rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 6, fontSize: '.75rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1.5, padding: '.6rem', background: '#C9963A', color: '#000', border: 'none', borderRadius: 6, fontSize: '.75rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Dispatch Royal Decision ➔
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
