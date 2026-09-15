import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const SEED_NEWS = [
  {
    id: '1',
    title: 'Ogere Day 2026 Celebrations & Royal Proclamation',
    category: 'ROYAL PALACE',
    date: '10 SEP 2026',
    author: 'Palace Communications',
    readTime: '3 min read',
    summary: 'HRH Oba James Obafemi Saliu issues royal decree welcoming diaspora indigenes for the 2026 Olipakala cultural festival.',
  },
  {
    id: '2',
    title: 'KM 66-68 Expressway Lighting Project Completed',
    category: 'INFRASTRUCTURE',
    date: '08 SEP 2026',
    author: 'OCDA Engineering Desk',
    readTime: '2 min read',
    summary: 'Solar street illuminators installed along the Ogere Tollgate Corridor to maximize night transit safety.',
  },
  {
    id: '3',
    title: 'Youth Agribusiness & Tech Bursary Applications Open',
    category: 'EDUCATION',
    date: '05 SEP 2026',
    author: 'OYDA Secretariat',
    readTime: '4 min read',
    summary: 'Ogere community endowment board releases ₦15M in agricultural grants and software apprenticeships for indigenes.',
  },
];

const EMERGENCY_LINES = [
  { name: 'Ogere Police Post', tel: '08033456789', desc: 'Ogun State Command', icon: '👮‍♂️' },
  { name: 'FRSC Expressway Rescue', tel: '122', desc: 'Corridor Crash Patrol', icon: '🚑' },
  { name: 'So-Safe Corps Ogere Area', tel: '08029994433', desc: 'Armed Rapid Response', icon: '🛡️' },
  { name: 'Aafin Ologere Vigilante', tel: '08145550192', desc: 'Palace Night Watch', icon: '👑' },
];

export default function MobilePreviewPage() {
  const [activeTab, setActiveTab] = useState('home'); // home, news, sos, heritage, services
  const [activeServiceScreen, setActiveServiceScreen] = useState(null); // null, 'walk', 'report', 'guardians', 'whistle', 'id', 'audience'
  const [deviceFrame, setDeviceFrame] = useState('iphone'); // 'iphone', 'android', 'none'
  const [isEscortActive, setIsEscortActive] = useState(false);
  const [escortSeconds, setEscortSeconds] = useState(1200); // 20 mins
  const [escortPin, setEscortPin] = useState('');
  const [duressTriggered, setDuressTriggered] = useState(false);
  const [whistleToken, setWhistleToken] = useState(null);

  // Royal Audience Simulator state
  const [audienceTab, setAudienceTab] = useState('book'); // 'book' or 'track'
  const [audFullName, setAudFullName] = useState('High Chief Olumide Sobukonla');
  const [audPhone, setAudPhone] = useState('08033123456');
  const [audEmail, setAudEmail] = useState('olumide.sobukonla@example.com');
  const [audAddress, setAudAddress] = useState('14 Palace Road, Agbele Quarter, Ogere Remo');
  const [audPurpose, setAudPurpose] = useState('Royal Homage & Courtesy Call');
  const [audDate, setAudDate] = useState('2026-10-15');
  const [audMessage, setAudMessage] = useState('Seeking Kabiyesi’s royal blessings and submitting proposed community development agenda.');
  const [audTrackingCode, setAudTrackingCode] = useState('');
  const [audTrackedData, setAudTrackedData] = useState(null);
  const [audTrackingLoading, setAudTrackingLoading] = useState(false);
  const [audTrackingError, setAudTrackingError] = useState('');
  const [audSubmittedRef, setAudSubmittedRef] = useState(null);

  // SOS & Incident Report Simulator state
  const [sosCategory, setSosCategory] = useState('🚨 Armed Robbery / Banditry');
  const [sosSeverity, setSosSeverity] = useState('Critical');
  const [sosLandmark, setSosLandmark] = useState('KM 66-68 Expressway Axis');
  const [sosLiveTracking, setSosLiveTracking] = useState(true);
  const [sosDetails, setSosDetails] = useState('');
  const [sosActiveBeacon, setSosActiveBeacon] = useState(null);
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);

  // Guardians screen state
  const [guardiansList, setGuardiansList] = useState([
    { id: '1', name: 'Alhaji Adeleke (Father)', phone: '08034567890', relationship: 'Parent', notifyOnSos: true },
    { id: '2', name: 'Funke Adeleke (Spouse)', phone: '08123456789', relationship: 'Spouse', notifyOnSos: true },
  ]);
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newGuardianRel, setNewGuardianRel] = useState('Sibling');

  const getLoggedInCitizen = () => {
    try {
      const savedUser = localStorage.getItem('ogere_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return {
          name: parsed.fullName || 'Verified Ogere Resident',
          phone: parsed.phone || '08081762371',
        };
      }
    } catch (_) {}
    return { name: 'Adebayo Ogunlesi (Mobile App)', phone: '08081762371' };
  };

  const handleTransmitSos = async () => {
    setIsSubmittingSos(true);
    const incId = 'OGR-SOS-' + Math.floor(1000 + Math.random() * 9000);
    const citizen = getLoggedInCitizen();
    const payload = {
      id: incId,
      category: sosCategory,
      severity: sosSeverity,
      threatLevel: 'CODE_RED',
      location: sosLandmark,
      description: `EMERGENCY SOS TRIGGERED from Mobile App by Citizen. Nearest Sector: ${sosLandmark}. Details: ${sosDetails || 'Rapid emergency armed intervention required.'}`,
      reporterName: citizen.name,
      reporterPhone: citizen.phone,
      assignedAgency: 'Police / So-Safe Area Command',
      isLiveTracking: sosLiveTracking,
    };

    try {
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (_) {}

    // Dispatch global window event so Security Dashboard alarms sound in live presentations
    window.dispatchEvent(new CustomEvent('ogere-sos-triggered', { detail: payload }));

    setIsSubmittingSos(false);
    setSosActiveBeacon({
      id: incId,
      category: sosCategory,
      severity: sosSeverity,
      landmark: sosLandmark,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'POLICE & VIGILANTE DISPATCHED',
    });
  };

  const handleAddGuardian = () => {
    if (!newGuardianName.trim() || !newGuardianPhone.trim()) {
      alert('Please enter both name and phone number.');
      return;
    }
    setGuardiansList(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newGuardianName.trim(),
        phone: newGuardianPhone.trim(),
        relationship: newGuardianRel,
        notifyOnSos: true,
      }
    ]);
    setNewGuardianName('');
    setNewGuardianPhone('');
    setShowAddGuardian(false);
  };

  const handleDeleteGuardian = (id) => {
    setGuardiansList(prev => prev.filter(g => g.id !== id));
  };

  // Escort countdown timer
  useEffect(() => {
    if (!isEscortActive || escortSeconds <= 0) return;
    const t = setInterval(() => setEscortSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isEscortActive, escortSeconds]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEscortCheckin = async () => {
    if (escortPin === '9999') {
      setDuressTriggered(true);
      setIsEscortActive(false);
      setEscortPin('');
      const citizen = getLoggedInCitizen();

      const duressPayload = {
        id: 'DURESS-' + Math.floor(1000 + Math.random() * 9000),
        category: 'Armed Hostage / Covert Duress (Walk With Me)',
        severity: 'Critical',
        threatLevel: 'CODE_RED',
        location: 'Agbele Farmlands Corridor',
        description: 'COVERT DURESS PIN ENTERED (9999). Citizen forced by assailants to cancel escort. Tactical silent response dispatched without sirens.',
        reporterName: citizen.name,
        reporterPhone: citizen.phone,
        assignedAgency: 'Police / SWAT Anti-Kidnapping Unit',
        status: 'CRITICAL_DISPATCH',
      };

      try {
        await fetch('/api/security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(duressPayload),
        });
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('ogere-sos-triggered', { detail: duressPayload }));

      alert('Safe arrival confirmed. Thank you for using Walk With Me. Your session has been safely concluded.');
    } else if (escortPin.length === 4) {
      setIsEscortActive(false);
      setEscortPin('');
      alert('Safe Arrival Confirmed! 🛡️ Virtual Escort session successfully concluded and logged with Palace Watch.');
    } else {
      alert('Please enter your 4-digit PIN');
    }
  };

  return (
    <div style={{ background: '#090403', minHeight: '100vh', color: '#f5edd8', padding: '5rem 1.5rem 4rem' }}>
      <SEO
        title="Mobile App Interactive Previewer — Ogere Remo Civic Portal"
        description="Preview and interact with the Ogere Remo Civic Mobile App directly inside your browser. Test Virtual Escort, Emergency Dispatch, and Heritage Archives."
      />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 800 }}>
            OGERE REMO CIVIC APP (REACT NATIVE / EXPO)
          </span>
          <h1 className="cinzel" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--cream)', margin: '0.4rem 0 0.8rem' }}>
            Interactive Mobile App Preview
          </h1>
          <p style={{ maxWidth: 680, margin: '0 auto', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Experience the offline-first civic mobile app designed for citizens, diaspora, and palace administration. Interact with the screen below or run it directly on your smartphone.
          </p>

          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(201,150,58,0.3)' }}>
              <button
                onClick={() => setDeviceFrame('iphone')}
                style={{
                  background: deviceFrame === 'iphone' ? 'var(--gold)' : 'transparent',
                  color: deviceFrame === 'iphone' ? '#000' : '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                📱 iPhone 15 Pro
              </button>
              <button
                onClick={() => setDeviceFrame('android')}
                style={{
                  background: deviceFrame === 'android' ? 'var(--gold)' : 'transparent',
                  color: deviceFrame === 'android' ? '#000' : '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🤖 Android Galaxy
              </button>
              <button
                onClick={() => setDeviceFrame('none')}
                style={{
                  background: deviceFrame === 'none' ? 'var(--gold)' : 'transparent',
                  color: deviceFrame === 'none' ? '#000' : '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🖥️ Frameless
              </button>
            </div>
          </div>
        </div>

        {/* Layout Grid: Phone Simulator & Instructions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '3rem', alignItems: 'start', justifyContent: 'center' }}>
          {/* ── LEFT: PHONE BEZEL SIMULATOR ── */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '380px',
                height: '760px',
                background: '#041d14',
                borderRadius: deviceFrame === 'iphone' ? '50px' : deviceFrame === 'android' ? '36px' : '14px',
                border: deviceFrame === 'none' ? '2px solid rgba(201,150,58,0.4)' : '10px solid #1e293b',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(6, 78, 59, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Dynamic Island / Notch */}
              {deviceFrame === 'iphone' && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '110px',
                  height: '26px',
                  background: '#000000',
                  borderRadius: '20px',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px',
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#047857' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e293b' }} />
                </div>
              )}

              {/* Status Bar */}
              <div style={{
                height: '42px',
                background: '#064e3b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                paddingTop: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#ffffff',
                zIndex: 10,
              }}>
                <span>12:35</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span>5G</span>
                  <span>100% 🔋</span>
                </div>
              </div>

              {/* App Royal Header */}
              <div style={{
                backgroundColor: '#064e3b',
                borderBottom: '2px solid #d97706',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeServiceScreen && (
                    <button
                      onClick={() => setActiveServiceScreen(null)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', paddingRight: '4px' }}
                    >
                      ←
                    </button>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '1rem' }}>👑</span>
                      <span className="cinzel" style={{ fontSize: '0.92rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em' }}>
                        OGERE REMO
                      </span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#a7f3d0' }}>
                      {activeServiceScreen ? activeServiceScreen.toUpperCase() : 'Community & Royal Portal'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('services');
                    setActiveServiceScreen('report');
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    border: '1px solid #fca5a5',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    animation: 'pulseGlow 2s infinite',
                  }}
                >
                  SOS 🚨
                </button>
              </div>

              {/* ── SCROLLABLE APP BODY ── */}
              <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', color: '#0f172a', padding: '14px' }}>
                
                {/* ── SCREEN 1: HOME TAB ── */}
                {activeTab === 'home' && !activeServiceScreen && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {/* Welcome Banner */}
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', borderLeft: '4px solid #d97706', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#064e3b', border: '1.5px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                          👑
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Ẹ káàbọ̀, Adebayo!</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '10px' }}>
                              ✓ CERTIFIED INDIGENE
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>· Agbele</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 24/7 Security Ribbon */}
                    <div
                      onClick={() => {
                        setActiveTab('services');
                        setActiveServiceScreen('report');
                      }}
                      style={{
                        background: '#7f1d1d',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)',
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>🚨</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 900 }}>24/7 Security & Police</span>
                          <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 900 }}>LIVE</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#fecaca', marginTop: '1px' }}>
                          Tap to dispatch emergency SOS beacon
                        </div>
                      </div>
                      <span style={{ background: '#ffffff', color: '#b91c1c', fontSize: '0.65rem', fontWeight: 900, padding: '4px 8px', borderRadius: '6px' }}>
                        REPORT
                      </span>
                    </div>

                    {/* 6-Card Quick Action Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {[
                        { icon: '🚶‍♂️', title: 'Walk With Me', sub: 'Safe Escort', action: () => { setActiveTab('services'); setActiveServiceScreen('walk'); } },
                        { icon: '🚨', title: 'Report SOS', sub: 'Armed Alert', action: () => { setActiveTab('services'); setActiveServiceScreen('report'); } },
                        { icon: '🪪', title: 'ID Wallet', sub: 'Digital Card', action: () => { setActiveTab('services'); setActiveServiceScreen('id'); } },
                        { icon: '🏛️', title: 'Audience', sub: 'With Kabiyesi', action: () => { setActiveTab('services'); setActiveServiceScreen('audience'); } },
                        { icon: '📰', title: 'Town News', sub: 'Bulletins', action: () => setActiveTab('news') },
                        { icon: '👑', title: 'Kings Lineage', sub: 'Obas History', action: () => setActiveTab('heritage') },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={item.action}
                          style={{
                            background: '#ffffff',
                            padding: '10px 6px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                        >
                          <div style={{ fontSize: '1.3rem', marginBottom: '3px' }}>{item.icon}</div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                          <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '1px' }}>{item.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Reigning Monarch Spotlight */}
                    <div style={{ background: '#064e3b', border: '1px solid #d97706', borderRadius: '12px', padding: '12px', color: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>👑</span>
                        <div>
                          <div style={{ fontSize: '0.58rem', color: '#fef3c7', fontWeight: 800 }}>CURRENT REIGNING MONARCH</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>Oba James Obafemi Saliu</div>
                          <div style={{ fontSize: '0.65rem', color: '#a7f3d0' }}>The Ologere of Ogere Remo</div>
                        </div>
                      </div>
                      <div style={{ fontStyle: 'italic', fontSize: '0.68rem', color: '#e2e8f0', lineHeight: 1.4, background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '6px' }}>
                        "Omo Olipakala a ji f’oriki bo... Custodian of ancient peace and progressive modernity."
                      </div>
                    </div>

                    {/* Latest Bulletins Preview */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Town News & Decrees</span>
                        <span onClick={() => setActiveTab('news')} style={{ fontSize: '0.65rem', color: '#064e3b', fontWeight: 700, cursor: 'pointer' }}>See All →</span>
                      </div>
                      {SEED_NEWS.slice(0, 2).map((n) => (
                        <div key={n.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontWeight: 800, color: '#d97706', marginBottom: '3px' }}>
                            <span>{n.category}</span>
                            <span style={{ color: '#94a3b8' }}>{n.date}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{n.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SCREEN 2: NEWS TAB ── */}
                {activeTab === 'news' && !activeServiceScreen && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>Town Bulletins & Proclamations</div>
                    {SEED_NEWS.map((n) => (
                      <div key={n.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, color: '#064e3b', marginBottom: '4px' }}>
                          <span>{n.category}</span>
                          <span style={{ color: '#94a3b8' }}>{n.date}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{n.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>{n.summary}</div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '6px' }}>By {n.author} · {n.readTime}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── SCREEN 3: HERITAGE TAB ── */}
                {activeTab === 'heritage' && !activeServiceScreen && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ background: '#064e3b', borderRadius: '12px', padding: '12px', color: '#fff' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>👑 Succession of the Obas</div>
                      <div style={{ fontSize: '0.65rem', color: '#a7f3d0', marginTop: '2px' }}>600+ Years Dynastic Royal Lineage of Ogere Remo</div>
                    </div>

                    {[
                      { name: 'Prince Olipakala', reign: 'c. 1401 A.D.', note: 'Founding Monarch from Ile-Ife royalty' },
                      { name: 'Oba James Obafemi Saliu', reign: 'Present', note: 'Reigning Ologere of Ogere Remo' },
                      { name: 'Oba Babatunde Agunloye', reign: 'Historic Era', note: 'Expansion of trade & farm corridors' },
                    ].map((king, idx) => (
                      <div key={idx} style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', borderLeft: '4px solid #d97706', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.78rem' }}>{king.name}</span>
                          <span style={{ fontSize: '0.6rem', color: '#d97706', fontWeight: 800 }}>{king.reign}</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{king.note}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── SCREEN 4: DIRECTORY TAB ── */}
                {activeTab === 'directory' && !activeServiceScreen && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>24/7 Rapid Emergency Speed Dial</div>
                    {EMERGENCY_LINES.map((serv, idx) => (
                      <div key={idx} style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.3rem' }}>{serv.icon}</span>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{serv.name}</div>
                            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{serv.desc}</div>
                          </div>
                        </div>
                        <a href={`tel:${serv.tel}`} style={{ background: '#22c55e', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', textDecoration: 'none' }}>
                          📞 Dial
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── SCREEN 5: SERVICES TAB MENU ── */}
                {activeTab === 'services' && !activeServiceScreen && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#dc2626' }}>🚨 TACTICAL SAFETY & RESPONSE</div>
                    
                    <div onClick={() => setActiveServiceScreen('walk')} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>🚶‍♂️</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Virtual Safe Escort ("Walk With Me")</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Arrival countdown timer + Covert Duress PIN (9999)</div>
                      </div>
                    </div>

                    <div onClick={() => setActiveServiceScreen('report')} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>🚨</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Report Emergency / Armed Hazard</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Immediate Police, FRSC & Vigilante dispatch</div>
                      </div>
                    </div>

                    <div onClick={() => setActiveServiceScreen('guardians')} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>👨‍👩‍👧‍👦</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Guardian Circles (Emergency Contacts)</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Auto-SMS live tracking radar link to 3 family members</div>
                      </div>
                    </div>

                    <div onClick={() => setActiveServiceScreen('whistle')} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>🔒</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Anonymous Whistleblower Line</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>100% zero-trace cryptographic token tracking</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#d97706', marginTop: '6px' }}>👑 ROYAL & CIVIC OPERATIONS</div>

                    <div onClick={() => setActiveServiceScreen('audience')} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>🏛️</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Book Royal Audience with Kabiyesi</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Private appointment schedule at Aafin Ologere</div>
                      </div>
                    </div>

                    <div onClick={() => setActiveServiceScreen('id')} style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>🪪</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Digital Community ID Wallet</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Certified indigene badge with QR security seal</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#059669', marginTop: '6px' }}>💬 COMMUNITY CONNECT</div>

                    <a href="/messages" style={{ textDecoration: 'none', color: 'inherit', background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>💬</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>Town Chat (WhatsApp Messenger)</div>
                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Real-time civic rooms: Public Square, Diaspora, Trade & Security</div>
                      </div>
                    </a>
                  </div>
                )}

                {/* ── SUB-SCREEN: WALK WITH ME ── */}
                {activeServiceScreen === 'walk' && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', color: '#fff', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 800, letterSpacing: '0.05em' }}>
                        {isEscortActive ? '● ESCORT WATCH ACTIVE' : '○ ESCORT READY TO LAUNCH'}
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0', letterSpacing: '2px', fontVariant: ['tabular-nums'] }}>
                        {formatTimer(escortSeconds)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                        Destination: Agbele Farmlands Corridor
                      </div>

                      {!isEscortActive ? (
                        <button
                          onClick={() => {
                            setIsEscortActive(true);
                            setEscortSeconds(1200);
                          }}
                          style={{
                            background: '#059669',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 800,
                            padding: '8px 16px',
                            borderRadius: '8px',
                            marginTop: '12px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          🛡️ Start Escort Watch (20 min)
                        </button>
                      ) : (
                        <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginBottom: '6px' }}>
                            ENTER 4-DIGIT PIN TO CONFIRM SAFE ARRIVAL
                          </div>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="••••"
                            value={escortPin}
                            onChange={(e) => setEscortPin(e.target.value)}
                            style={{
                              width: '90px',
                              textAlign: 'center',
                              fontSize: '1.2rem',
                              letterSpacing: '6px',
                              padding: '4px',
                              borderRadius: '4px',
                              border: '1px solid #94a3b8',
                              background: '#fff',
                              color: '#000',
                              fontWeight: 900,
                            }}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <button
                              onClick={handleEscortCheckin}
                              style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                              Confirm Safe Arrival
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.65rem', color: '#7f1d1d' }}>
                      <span style={{ fontWeight: 900 }}>⚠️ Covert Duress PIN (9999):</span> If forced or held at gunpoint to cancel this escort, entering 9999 pretends to exit peacefully while silently alerting SWAT and Police!
                    </div>
                  </div>
                )}

                {/* ── SUB-SCREEN: WHISTLEBLOWER LINE ── */}
                {activeServiceScreen === 'whistle' && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ background: '#1e293b', color: '#fff', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>🔒 100% Cryptographic Anonymity</div>
                      <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '2px' }}>Zero IP address or personal identity logged.</div>
                    </div>

                    {!whistleToken ? (
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'grid', gap: '8px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>CATEGORY</div>
                        <select style={{ fontSize: '0.75rem', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <option>Armed Bandits / Kidnappers</option>
                          <option>Illegal Oil Bunkering</option>
                          <option>Weapons Cache</option>
                        </select>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>ESTIMATED LOCATION</div>
                        <input placeholder="e.g. Near old quarry along KM 67" style={{ fontSize: '0.75rem', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>SECRET INTEL DESCRIPTION</div>
                        <textarea placeholder="Describe vehicles, weapons, sighting details..." rows={3} style={{ fontSize: '0.75rem', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <button
                          onClick={() => setWhistleToken('OGR-TIP-7842')}
                          style={{ background: '#064e3b', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                        >
                          Transmit Anonymous Intel
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: '#064e3b', color: '#fff', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem' }}>🛡️</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, marginTop: '4px' }}>Intel Transmitted Safely</div>
                        <div style={{ fontSize: '0.65rem', color: '#d1fae5', marginTop: '2px' }}>Save your secret tracking token:</div>
                        <div style={{ background: '#022c22', border: '1px solid #d97706', padding: '8px 16px', borderRadius: '6px', margin: '10px auto', fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '2px' }}>
                          {whistleToken}
                        </div>
                        <button
                          onClick={() => setWhistleToken(null)}
                          style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                        >
                          Submit Another Tip
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUB-SCREEN: DIGITAL ID WALLET ── */}
                {activeServiceScreen === 'id' && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #042f24 100%)', border: '2px solid #d97706', borderRadius: '14px', padding: '16px', color: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div className="cinzel" style={{ fontSize: '0.72rem', fontWeight: 900, color: '#fef3c7' }}>KINGDOM OF OGERE REMO</div>
                          <div style={{ fontSize: '0.55rem', color: '#a7f3d0' }}>OFFICIAL DIGITAL CITIZEN BADGE</div>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>👑</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '25px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          👤
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 900 }}>Adebayo Adeleke</div>
                          <div style={{ fontSize: '0.68rem', color: '#fef3c7' }}>Agbele Compound · Indigene</div>
                          <div style={{ fontSize: '0.6rem', color: '#a7f3d0' }}>ID: OGR-2026-IND-0829</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', fontSize: '0.6rem' }}>
                        <span style={{ color: '#86efac' }}>✓ Certified by Palace Registry</span>
                        <span style={{ background: '#ffffff', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>QR SEAL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUB-SCREEN: ROYAL AUDIENCE ── */}
                {activeServiceScreen === 'audience' && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => setActiveServiceScreen(null)}
                        style={{ background: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#334155', cursor: 'pointer' }}
                      >
                        ← Back to Services
                      </button>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#d97706' }}>
                        👑 AAFIN OLOGERE
                      </span>
                    </div>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                      <button
                        onClick={() => setAudienceTab('book')}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          background: audienceTab === 'book' ? '#d97706' : 'transparent',
                          color: audienceTab === 'book' ? '#fff' : '#64748b',
                          fontSize: '0.68rem', fontWeight: 800,
                        }}
                      >
                        👑 Request Audience
                      </button>
                      <button
                        onClick={() => setAudienceTab('track')}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          background: audienceTab === 'track' ? '#d97706' : 'transparent',
                          color: audienceTab === 'track' ? '#fff' : '#64748b',
                          fontSize: '0.68rem', fontWeight: 800,
                        }}
                      >
                        🔍 Track Status
                      </button>
                    </div>

                    {audienceTab === 'track' ? (
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'grid', gap: '8px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Palace Appointment Lookup</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Enter your Reference Code (e.g. AUD-2026-XXXX) or registered email:</div>
                        <input
                          value={audTrackingCode}
                          onChange={e => setAudTrackingCode(e.target.value)}
                          placeholder="Reference or Email"
                          style={{ fontSize: '0.75rem', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          disabled={audTrackingLoading}
                          onClick={async () => {
                            if (!audTrackingCode.trim()) return;
                            setAudTrackingLoading(true);
                            setAudTrackingError('');
                            setAudTrackedData(null);
                            try {
                              const res = await fetch(`/api/royal-audiences?action=track&code=${encodeURIComponent(audTrackingCode.trim())}`);
                              const data = await res.json();
                              if (res.ok && data.booking) {
                                setAudTrackedData(data.booking);
                              } else {
                                setAudTrackingError(data.error || 'No appointment found with this code.');
                              }
                            } catch {
                              setAudTrackingError('Network error connecting to Palace Secretariat.');
                            } finally {
                              setAudTrackingLoading(false);
                            }
                          }}
                          style={{ background: '#064e3b', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                        >
                          {audTrackingLoading ? 'Checking Palace Log…' : '🔍 Verify Status'}
                        </button>

                        {audTrackingError && (
                          <div style={{ padding: '6px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.65rem', color: '#dc2626', textAlign: 'center' }}>
                            {audTrackingError}
                          </div>
                        )}

                        {audTrackedData && (
                          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gap: '4px', fontSize: '0.68rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 900, color: '#d97706' }}>{audTrackedData.reference_number || audTrackedData.reference}</span>
                              <span style={{
                                padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.58rem',
                                background: audTrackedData.status === 'confirmed' ? '#dcfce7' : audTrackedData.status === 'postponed' ? '#fef3c7' : audTrackedData.status === 'declined' ? '#fee2e2' : '#f1f5f9',
                                color: audTrackedData.status === 'confirmed' ? '#166534' : audTrackedData.status === 'postponed' ? '#b45309' : audTrackedData.status === 'declined' ? '#991b1b' : '#475569'
                              }}>
                                {(audTrackedData.status || 'PENDING').toUpperCase()}
                              </span>
                            </div>
                            <div><strong>Applicant:</strong> {audTrackedData.full_name || audTrackedData.applicant}</div>
                            <div><strong>Purpose:</strong> {audTrackedData.purpose}</div>
                            <div><strong>Confirmed Date:</strong> {audTrackedData.confirmed_date || audTrackedData.scheduled_date || 'Awaiting Confirmation'}</div>
                            <div><strong>Chamber:</strong> {audTrackedData.palace_chamber || 'To Be Assigned'}</div>
                            {audTrackedData.notes && (
                              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #064e3b', marginTop: '4px' }}>
                                <div style={{ fontWeight: 800, color: '#064e3b', fontSize: '0.6rem' }}>Palace Official Note:</div>
                                <div style={{ color: '#334155' }}>{audTrackedData.notes}</div>
                              </div>
                            )}
                            {audTrackedData.postponed_reason && (
                              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #f59e0b', marginTop: '4px' }}>
                                <div style={{ fontWeight: 800, color: '#b45309', fontSize: '0.6rem' }}>Rescheduled Reason:</div>
                                <div style={{ color: '#334155' }}>{audTrackedData.postponed_reason}</div>
                              </div>
                            )}
                            {audTrackedData.decline_reason && (
                              <div style={{ background: '#fff', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #ef4444', marginTop: '4px' }}>
                                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.6rem' }}>Palace Response:</div>
                                <div style={{ color: '#334155' }}>{audTrackedData.decline_reason}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : audSubmittedRef ? (
                      <div style={{ background: '#064e3b', color: '#fff', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>👑</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, marginTop: '4px' }}>Audience Request Transmitted</div>
                        <div style={{ fontSize: '0.65rem', color: '#d1fae5', marginTop: '2px' }}>A receipt email has been sent to {audEmail}</div>
                        <div style={{ background: '#022c22', border: '1px solid #d97706', padding: '8px 16px', borderRadius: '6px', margin: '10px auto', fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>
                          {audSubmittedRef}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              setAudTrackingCode(audSubmittedRef);
                              setAudienceTab('track');
                            }}
                            style={{ background: '#d97706', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Track Appointment
                          </button>
                          <button
                            onClick={() => setAudSubmittedRef(null)}
                            style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                          >
                            New Request
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'grid', gap: '6px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a' }}>Palace Secretariat Booking Form</div>
                        
                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>FULL LEGAL NAME *</div>
                        <input value={audFullName} onChange={e => setAudFullName(e.target.value)} style={{ fontSize: '0.72rem', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <div>
                            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>PHONE NUMBER *</div>
                            <input value={audPhone} onChange={e => setAudPhone(e.target.value)} style={{ width: '100%', fontSize: '0.72rem', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>EMAIL ADDRESS *</div>
                            <input value={audEmail} onChange={e => setAudEmail(e.target.value)} style={{ width: '100%', fontSize: '0.72rem', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                        </div>

                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>RESIDENTIAL / DIASPORA ADDRESS *</div>
                        <input value={audAddress} onChange={e => setAudAddress(e.target.value)} placeholder="Full physical or diaspora address" style={{ fontSize: '0.72rem', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />

                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>PURPOSE OF VISIT *</div>
                        <select value={audPurpose} onChange={e => setAudPurpose(e.target.value)} style={{ fontSize: '0.72rem', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <option>Royal Homage & Courtesy Call</option>
                          <option>Diaspora Community Development</option>
                          <option>Chieftaincy & Heritage Inquiries</option>
                          <option>Family Land / Dispute Resolution</option>
                          <option>Business & Investment Proposal</option>
                        </select>

                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>PREFERRED DATE</div>
                        <input type="date" value={audDate} onChange={e => setAudDate(e.target.value)} style={{ fontSize: '0.72rem', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />

                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569' }}>MATTERS FOR THE OBA *</div>
                        <textarea rows={2} value={audMessage} onChange={e => setAudMessage(e.target.value)} style={{ fontSize: '0.72rem', padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />

                        <button
                          onClick={async () => {
                            if (!audFullName || !audPhone || !audEmail || !audAddress || !audMessage) {
                              alert('Please complete Name, Phone, Email, Address, and Purpose details.');
                              return;
                            }
                            try {
                              const res = await fetch('/api/royal-audiences', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'create',
                                  fullName: audFullName,
                                  phone: audPhone,
                                  email: audEmail,
                                  address: audAddress,
                                  purpose: audPurpose,
                                  preferredDate: audDate,
                                  message: audMessage,
                                }),
                              });
                              const json = await res.json();
                              if (res.ok && json.success) {
                                setAudSubmittedRef(json.reference || 'AUD-2026-9901');
                              } else {
                                setAudSubmittedRef('AUD-2026-' + Math.floor(1000 + Math.random() * 9000));
                              }
                            } catch {
                              setAudSubmittedRef('AUD-2026-' + Math.floor(1000 + Math.random() * 9000));
                            }
                          }}
                          style={{ background: '#d97706', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: 'none', marginTop: '4px', cursor: 'pointer' }}
                        >
                          👑 Submit Booking to Palace Registry
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUB-SCREEN: EMERGENCY SOS DISPATCH ── */}
                {activeServiceScreen === 'report' && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {/* Header Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => setActiveServiceScreen(null)}
                        style={{ background: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#334155', cursor: 'pointer' }}
                      >
                        ← Back to Services
                      </button>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#dc2626' }}>
                        ● 24/7 COMMAND DESK
                      </span>
                    </div>

                    {/* Immediate Speed-Dials */}
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#991b1b', marginBottom: '4px' }}>
                        🚨 Immediate Life Threat? Dial Direct:
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href="tel:122" style={{ flex: 1, background: '#dc2626', color: '#fff', textAlign: 'center', padding: '6px 4px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 900 }}>
                          FRSC 122
                        </a>
                        <a href="tel:08033456789" style={{ flex: 1, background: '#1e3a8a', color: '#fff', textAlign: 'center', padding: '6px 4px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 900 }}>
                          POLICE POST
                        </a>
                        <a href="tel:08029994433" style={{ flex: 1, background: '#064e3b', color: '#fff', textAlign: 'center', padding: '6px 4px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 900 }}>
                          SO-SAFE
                        </a>
                      </div>
                    </div>

                    {/* Active Beacon Card if Submitted */}
                    {sosActiveBeacon ? (
                      <div style={{ background: '#7f1d1d', border: '2px solid #ef4444', borderRadius: '12px', padding: '14px', color: '#fff', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', animation: 'pulseGlow 1.5s infinite' }}>🚨</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, marginTop: '4px', letterSpacing: '0.05em' }}>
                          EMERGENCY BEACON TRANSMITTED
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#fecaca', marginTop: '2px' }}>
                          Incident Ref: <strong style={{ color: '#fef08a' }}>{sosActiveBeacon.id}</strong>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', margin: '10px 0', textAlign: 'left', fontSize: '0.68rem', lineHeight: 1.5 }}>
                          <div>📍 <strong>Sector:</strong> {sosActiveBeacon.landmark}</div>
                          <div>⚡ <strong>Threat:</strong> {sosActiveBeacon.category} ({sosActiveBeacon.severity})</div>
                          <div>⏱️ <strong>Dispatched:</strong> {sosActiveBeacon.timestamp}</div>
                          <div style={{ color: '#86efac', marginTop: '4px', fontWeight: 800 }}>
                            ✓ Status: {sosActiveBeacon.status}
                          </div>
                          <div style={{ color: '#cbd5e1', fontSize: '0.62rem' }}>
                            🚓 Ogere Police Cruiser #04 & So-Safe Armed Patrol en route.
                          </div>
                        </div>

                        {sosLiveTracking && (
                          <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', padding: '6px 10px', borderRadius: '6px', fontSize: '0.62rem', color: '#bbf7d0', marginBottom: '10px' }}>
                            📡 Perpetual Moving GPS Live Radar Active (Streaming coordinates to Command Desk)
                          </div>
                        )}

                        <button
                          onClick={() => setSosActiveBeacon(null)}
                          style={{ background: '#ffffff', color: '#991b1b', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          Dismiss or Submit Another Beacon
                        </button>
                      </div>
                    ) : (
                      /* Incident Dispatch Form */
                      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0', display: 'grid', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                            1. INCIDENT THREAT TYPE
                          </div>
                          <select
                            value={sosCategory}
                            onChange={(e) => setSosCategory(e.target.value)}
                            style={{ width: '100%', fontSize: '0.72rem', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          >
                            <option>🚨 Armed Robbery / Banditry</option>
                            <option>💥 Gunfire / Ambush / Terrorism</option>
                            <option>🚷 Kidnapping / Abduction in Progress</option>
                            <option>🚗 Highway Collision / Entrapment</option>
                            <option>🔥 Fire Outbreak / Tanker Spill</option>
                            <option>⛽ CNG / Pipeline Gas Leak</option>
                            <option>🏥 Medical Crisis / Trauma</option>
                          </select>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                            2. SEVERITY LEVEL
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {[
                              { id: 'Critical', label: '🔴 Critical' },
                              { id: 'High', label: '🟠 High' },
                              { id: 'Medium', label: '🟡 Medium' },
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSosSeverity(s.id)}
                                style={{
                                  flex: 1,
                                  padding: '5px 2px',
                                  borderRadius: '6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  border: sosSeverity === s.id ? '2px solid #dc2626' : '1px solid #e2e8f0',
                                  background: sosSeverity === s.id ? '#fee2e2' : '#f8fafc',
                                  color: sosSeverity === s.id ? '#991b1b' : '#64748b',
                                  cursor: 'pointer',
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                            3. NEAREST SECTOR / LANDMARK
                          </div>
                          <select
                            value={sosLandmark}
                            onChange={(e) => setSosLandmark(e.target.value)}
                            style={{ width: '100%', fontSize: '0.72rem', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          >
                            <option>KM 66-68 Expressway Axis</option>
                            <option>Ogere Tollgate Corridor</option>
                            <option>Palace Way / Aafin Ologere</option>
                            <option>Isale-Ogere Hospital Road</option>
                            <option>OMCOOSA College Junction</option>
                            <option>Trailer Park Outpost</option>
                            <option>Oke-Ogere Market Complex</option>
                            <option>Agbele Farmland Axis</option>
                          </select>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                            4. DETAILS / CASUALTIES
                          </div>
                          <textarea
                            value={sosDetails}
                            onChange={(e) => setSosDetails(e.target.value)}
                            rows={2}
                            placeholder="Describe number of assailants, weapons, vehicle make, casualties..."
                            style={{ width: '100%', fontSize: '0.72rem', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        {/* WhatsApp Live Location Radar Toggle */}
                        <div
                          onClick={() => setSosLiveTracking(!sosLiveTracking)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>📡</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#065f46' }}>
                              Live Location Radar (WhatsApp-Style)
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#047857' }}>
                              Perpetually stream moving GPS coordinates to Police command
                            </div>
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: sosLiveTracking ? '#059669' : '#94a3b8' }}>
                            {sosLiveTracking ? '🟢 ACTIVE' : 'OFF'}
                          </span>
                        </div>

                        <button
                          onClick={handleTransmitSos}
                          disabled={isSubmittingSos}
                          style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                            color: '#ffffff',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '4px',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                          }}
                        >
                          {isSubmittingSos ? 'TRANSMITTING BEACON...' : '🚨 TRANSMIT EMERGENCY SOS DISPATCH'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUB-SCREEN: GUARDIAN CIRCLES ── */}
                {activeServiceScreen === 'guardians' && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => setActiveServiceScreen(null)}
                        style={{ background: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#334155', cursor: 'pointer' }}
                      >
                        ← Back to Services
                      </button>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#064e3b' }}>
                        FAMILY KIN BEACON
                      </span>
                    </div>

                    <div style={{ background: '#064e3b', color: '#fff', padding: '10px 12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 900 }}>👨‍👩‍👧‍👦 Guardian Circles ({guardiansList.length}/3)</div>
                      <div style={{ fontSize: '0.62rem', color: '#d1fae5', marginTop: '2px' }}>
                        Trusted family or kin notified immediately via SMS with a direct public live tracking radar link whenever you trigger an SOS.
                      </div>
                    </div>

                    {guardiansList.map((g) => (
                      <div key={g.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{g.name}</span>
                            <span style={{ fontSize: '0.55rem', background: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              {g.relationship}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>📞 {g.phone}</div>
                          <div style={{ fontSize: '0.58rem', color: '#059669', fontWeight: 800, marginTop: '2px' }}>⚡ Auto-SMS Live Radar Link Enabled</div>
                        </div>
                        <button
                          onClick={() => handleDeleteGuardian(g.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', padding: '4px' }}
                          title="Remove Guardian"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}

                    {!showAddGuardian ? (
                      guardiansList.length < 3 && (
                        <button
                          onClick={() => setShowAddGuardian(true)}
                          style={{ background: '#ecfdf5', color: '#065f46', border: '1px dashed #059669', padding: '8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          + Add Guardian Contact
                        </button>
                      )
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'grid', gap: '6px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>Register New Guardian</div>
                        <input
                          placeholder="Guardian Name (e.g. Chief Adebayo)"
                          value={newGuardianName}
                          onChange={(e) => setNewGuardianName(e.target.value)}
                          style={{ fontSize: '0.72rem', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <input
                          placeholder="Phone (for instant SMS)"
                          value={newGuardianPhone}
                          onChange={(e) => setNewGuardianPhone(e.target.value)}
                          style={{ fontSize: '0.72rem', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <select
                          value={newGuardianRel}
                          onChange={(e) => setNewGuardianRel(e.target.value)}
                          style={{ fontSize: '0.72rem', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        >
                          <option>Spouse</option>
                          <option>Parent</option>
                          <option>Sibling</option>
                          <option>Child</option>
                          <option>Close Friend</option>
                          <option>Neighbor</option>
                        </select>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button
                            onClick={handleAddGuardian}
                            style={{ flex: 1, background: '#064e3b', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Save Guardian
                          </button>
                          <button
                            onClick={() => setShowAddGuardian(false)}
                            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* ── BOTTOM TAB NAVIGATION BAR ── */}
              <div style={{
                height: '64px',
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingBottom: '8px',
                zIndex: 10,
              }}>
                {[
                  { id: 'home', label: 'Home', emoji: '🏛️' },
                  { id: 'news', label: 'News', emoji: '📰' },
                  { id: 'sos', label: 'SOS 🚨', emoji: '🚨' },
                  { id: 'heritage', label: 'Heritage', emoji: '👑' },
                  { id: 'services', label: 'Services', emoji: '⚡' },
                ].map((tab) => {
                  const isFocused = tab.id === 'sos' ? activeServiceScreen === 'report' : (activeTab === tab.id && !activeServiceScreen);
                  return (
                    <div
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'sos') {
                          setActiveTab('services');
                          setActiveServiceScreen('report');
                        } else {
                          setActiveTab(tab.id);
                          setActiveServiceScreen(null);
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '2px',
                      }}
                    >
                      <div
                        style={{
                          padding: '3px 12px',
                          borderRadius: '14px',
                          background: isFocused ? '#e6f4ea' : 'transparent',
                          fontSize: isFocused ? '1.2rem' : '1.05rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {tab.emoji}
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: isFocused ? 900 : 600,
                          color: isFocused ? '#064e3b' : '#94a3b8',
                        }}
                      >
                        {tab.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: INSTRUCTIONS & REAL PHONE SETUP GUIDE ── */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(201,150,58,0.3)' }}>
              <div className="cinzel" style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 800, marginBottom: '0.8rem' }}>
                🚀 Run on Your Physical Smartphone (Expo Go)
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                You can run this exact native application directly on your physical iPhone or Android smartphone with zero cables:
              </p>

              <ol style={{ paddingLeft: '1.2rem', marginTop: '1rem', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.8 }}>
                <li>
                  Install the free <strong>Expo Go</strong> app from the{' '}
                  <a href="https://apps.apple.com/app/expo-go/id982107779" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>App Store</a> (iOS) or{' '}
                  <a href="https://play.google.com/store/apps/details?id=host.exp.exponent" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>Google Play Store</a> (Android).
                </li>
                <li>In your terminal, navigate to the <code style={{ color: 'var(--gold)' }}>mobile</code> directory:
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.6rem 0.8rem', borderRadius: '6px', margin: '0.5rem 0', fontFamily: 'monospace' }}>
                    cd mobile<br />
                    npx expo start
                  </div>
                </li>
                <li>
                  Open your <strong>Camera app</strong> (iOS) or the <strong>Expo Go app</strong> (Android) and scan the QR code printed in the terminal.
                </li>
              </ol>
            </div>

            {/* Feature Highlights Card */}
            <div className="glass" style={{ padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="cinzel" style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, marginBottom: '1rem' }}>
                ✨ Tested Mobile Capabilities in This App
              </div>
              <div style={{ display: 'grid', gap: '0.8rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span>🛡️</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Virtual Safe Escort ("Walk With Me"):</strong> Destination countdown timer with Covert Hostage Duress PIN (<code>9999</code>) that silently summons SWAT without alerting the attacker.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span>🟢</span>
                  <div>
                    <strong style={{ color: '#fff' }}>WhatsApp-Style Live GPS Streaming:</strong> High-frequency 4.5s perpetual coordinates streaming directly to the Ogere Security Command console.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span>👨‍👩‍👧‍👦</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Guardian Family Circles:</strong> Instant SMS dispatches with a dedicated live tracking link (<code>/track/:id</code>) during an emergency.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span>🔒</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Zero-Trace Whistleblower Line:</strong> Cryptographic token tracking with officer SITREPs and two-way anonymous messaging.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span>📴</span>
                  <div>
                    <strong style={{ color: '#fff' }}>100% Offline-First SQLite Cache:</strong> News, Obas succession lineage, and emergency helplines work without internet or mobile reception.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
