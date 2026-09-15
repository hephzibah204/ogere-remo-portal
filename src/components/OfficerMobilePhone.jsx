import React, { useState, useEffect } from 'react';

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

export default function OfficerMobilePhone({ deviceFrame = 'iphone' }) {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('security_officer');
  const [currentOfficer, setCurrentOfficer] = useState(SEED_OFFICERS[0]);

  const [stats, setStats] = useState({
    incidents: { total: 14, code_red: 1, open_count: 3, dispatched_count: 2 },
    audiences: { total: 28, pending: 4, confirmed: 19, postponed: 3 },
    idCards: { total: 142, pending: 8, approved: 129 },
  });

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
  ]);

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2026-001',
      category: '🚨 Armed Robbery / Banditry',
      description: 'Suspicious armed suspects sighted along KM 67 boundary.',
      location: 'KM 67 Tollgate Expressway, Ogere',
      severity: 'Critical',
      threat_level: 'CODE_RED',
      status: 'DISPATCHED',
      officer: 'Insp. Kayode Adeleke (Unit 4)',
      time: '12 mins ago',
    },
  ]);

  const [selectedAudience, setSelectedAudience] = useState(null);
  const [audienceAction, setAudienceAction] = useState('confirmed');
  const [chamberSelect, setChamberSelect] = useState(CHAMBERS[0]);
  const [audienceDate, setAudienceDate] = useState('2026-09-24');
  const [audienceTime, setAudienceTime] = useState('11:00 AM');

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    const officer = SEED_OFFICERS.find((o) => o.role === role);
    if (officer) setCurrentOfficer(officer);
    if (role === 'palace_protocol') setActiveScreen('audiences');
    else if (role === 'ocda_admin') setActiveScreen('idCards');
    else setActiveScreen('dashboard');
  };

  const handleOpenDecisionModal = (aud, action) => {
    setSelectedAudience(aud);
    setAudienceAction(action);
  };

  const handleConfirmAudience = (e) => {
    e.preventDefault();
    if (!selectedAudience) return;
    setAudiences((prev) =>
      prev.map((a) =>
        a.id === selectedAudience.id
          ? { ...a, status: audienceAction, chamber: chamberSelect, confirmedDate: audienceDate, timeSlot: audienceTime }
          : a
      )
    );
    setSelectedAudience(null);
  };

  const handleProcessIdCard = (cardId, decision) => {
    setIdCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: decision } : c)));
  };

  useEffect(() => {
    const handleSosEvent = (e) => {
      const sosItem = e.detail;
      if (sosItem) {
        setIncidents((prev) => [
          {
            id: sosItem.id,
            threat_level: 'CODE_RED',
            category: sosItem.category || '🚨 SOS Emergency Panic',
            location: sosItem.location || 'Ogere Remo Corridor',
            description: sosItem.description || 'Emergency SOS trigger received from citizen mobile app.',
            reporter_name: sosItem.reporterName || 'Citizen Mobile App',
            status: 'CRITICAL_DISPATCH',
            assigned_agency: 'Police / Joint Patrol Command',
            camera_feed_active: sosItem.cameraFeedActive,
            audio_feed_active: sosItem.audioFeedActive,
            media_url: sosItem.mediaUrl,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setStats((prev) => ({
          ...prev,
          incidents: {
            ...prev.incidents,
            open_count: prev.incidents.open_count + 1,
            code_red: prev.incidents.code_red + 1,
            dispatched_count: prev.incidents.dispatched_count + 1,
          },
        }));
      }
    };

    window.addEventListener('ogere-sos-triggered', handleSosEvent);
    return () => {
      window.removeEventListener('ogere-sos-triggered', handleSosEvent);
    };
  }, []);

  return (
    <div
      style={{
        width: '380px',
        height: '760px',
        background: '#0c0604',
        borderRadius: deviceFrame === 'iphone' ? '48px' : deviceFrame === 'android' ? '32px' : '14px',
        border: deviceFrame === 'none' ? '2px solid rgba(201,150,58,0.4)' : '10px solid #1e293b',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9), 0 0 25px rgba(201,150,58,0.2)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Island / Notch */}
      {deviceFrame === 'iphone' && (
        <div
          style={{
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
          }}
        >
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
        </div>
      )}

      {/* Top Status Bar */}
      <div
        style={{
          padding: '14px 18px 4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#ffffff',
          zIndex: 10,
        }}
      >
        <span>09:41</span>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span>5G</span>
          <span>🛡️</span>
          <span>100%</span>
        </div>
      </div>

      {/* Officer Header Strip */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1b0c06 0%, #0d0603 100%)',
          borderBottom: '1px solid rgba(201,150,58,0.25)',
          padding: '8px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{currentOfficer.icon}</span>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#F5EDD8' }}>
              {currentOfficer.name}
            </div>
            <div style={{ fontSize: '0.62rem', color: currentOfficer.themeColor, fontWeight: 700 }}>
              {currentOfficer.badge} · {currentRole === 'security_officer' ? 'Tactical Police' : currentRole === 'palace_protocol' ? 'Palace Protocol' : 'OCDA Admin'}
            </div>
          </div>
        </div>

        <select
          value={currentRole}
          onChange={(e) => handleRoleSwitch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#F5EDD8',
            border: '1px solid rgba(201,150,58,0.3)',
            borderRadius: '4px',
            fontSize: '0.62rem',
            padding: '2px 4px',
            cursor: 'pointer',
          }}
        >
          <option value="security_officer">🛡️ Police</option>
          <option value="palace_protocol">👑 Protocol</option>
          <option value="ocda_admin">🏛️ OCDA</option>
        </select>
      </div>

      {/* Screen Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', background: '#090503' }}>
        {/* TAB 1: DASHBOARD / INCIDENTS */}
        {activeScreen === 'dashboard' && (
          <div>
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f87171' }}>{stats.incidents.code_red}</div>
                <div style={{ fontSize: '0.58rem', color: '#fca5a5' }}>CODE RED</div>
              </div>
              <div style={{ background: 'rgba(201, 150, 58, 0.15)', border: '1px solid #C9963A', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#F5EDD8' }}>{stats.audiences.pending}</div>
                <div style={{ fontSize: '0.58rem', color: '#C9963A' }}>AUDIENCES</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399' }}>{stats.idCards.pending}</div>
                <div style={{ fontSize: '0.58rem', color: '#6ee7b7' }}>ID REQS</div>
              </div>
            </div>

            {/* Incidents Section */}
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#C9963A', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚨 ACTIVE EMERGENCY FEED</span>
              <span style={{ fontSize: '0.6rem', color: '#ef4444' }}>LIVE</span>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    background: inc.threat_level === 'CODE_RED' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    border: inc.threat_level === 'CODE_RED' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.62rem', background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                      CODE RED
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{inc.id}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#ffffff', marginBottom: '3px' }}>
                    {inc.category}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#fca5a5', marginBottom: '6px' }}>
                    📍 {inc.location}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.3 }}>
                    {inc.description}
                  </div>

                  {(inc.camera_feed_active || inc.audio_feed_active) && (
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {inc.camera_feed_active && <span style={{ fontSize: '0.6rem', background: '#ef4444', color: '#fff', padding: '1px 4px', borderRadius: '2px' }}>📹 Live Camera</span>}
                      {inc.audio_feed_active && <span style={{ fontSize: '0.6rem', background: '#059669', color: '#fff', padding: '1px 4px', borderRadius: '2px' }}>🎙️ Live Audio</span>}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => alert(`Patrol dispatch acknowledged for incident ${inc.id}. Units deployed.`)}
                      style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      ✓ Acknowledge
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inc.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textAlign: 'center', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '4px', padding: '5px', fontSize: '0.68rem', fontWeight: 800 }}
                    >
                      🗺️ Intercept GPS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIENCES */}
        {activeScreen === 'audiences' && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#C9963A', marginBottom: '8px' }}>
              👑 ROYAL AUDIENCES DESK
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {audiences.map((aud) => (
                <div key={aud.id} style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.25)', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{aud.fullName}</span>
                    <span style={{ fontSize: '0.6rem', background: aud.status === 'confirmed' ? '#15803d' : '#d97706', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>
                      {aud.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    {aud.purpose}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                    📅 {aud.bookingDate} · {aud.timeSlot}
                  </div>
                  {aud.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenDecisionModal(aud, 'confirmed')}
                        style={{ flex: 1, background: '#C9963A', color: '#000', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Grant Audience
                      </button>
                      <button
                        onClick={() => handleOpenDecisionModal(aud, 'postponed')}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ID DESK */}
        {activeScreen === 'idCards' && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#34d399', marginBottom: '8px' }}>
              🪪 DIGITAL INDIGENE ID CERTIFICATION
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {idCards.map((c) => (
                <div key={c.id} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{c.fullName}</span>
                    <span style={{ fontSize: '0.6rem', color: '#34d399' }}>{c.id}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                    Quarter: {c.quarter} · Compound: {c.compound}
                  </div>
                  {c.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleProcessIdCard(c.id, 'approved')}
                        style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        ✓ Approve ID
                      </button>
                      <button
                        onClick={() => handleProcessIdCard(c.id, 'rejected')}
                        style={{ flex: 1, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: '4px', padding: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700 }}>✓ Verified & Certified</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Native Tabs */}
      <div
        style={{
          height: '52px',
          background: '#120804',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveScreen('dashboard')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'dashboard' ? '#C9963A' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>🏛️</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>Command</span>
        </button>
        <button
          onClick={() => setActiveScreen('audiences')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'audiences' ? '#C9963A' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>👑</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>Audiences</span>
        </button>
        <button
          onClick={() => setActiveScreen('idCards')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'idCards' ? '#34d399' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>🪪</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>ID Desk</span>
        </button>
      </div>

      {/* Decision Modal */}
      {selectedAudience && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
          }}
        >
          <form
            onSubmit={handleConfirmAudience}
            style={{
              background: '#170b06',
              border: '2px solid #C9963A',
              borderRadius: '8px',
              padding: '12px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#C9963A' }}>
              Grant Royal Audience
            </div>
            <div style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>
              {selectedAudience.fullName}
            </div>
            <div>
              <label style={{ fontSize: '0.6rem', color: '#C9963A' }}>Allocated Chamber:</label>
              <select
                value={chamberSelect}
                onChange={(e) => setChamberSelect(e.target.value)}
                style={{ width: '100%', padding: '4px', background: '#090503', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.65rem' }}
              >
                {CHAMBERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedAudience(null)}
                style={{ flex: 1, padding: '4px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '4px', background: '#C9963A', color: '#000', border: 'none', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
