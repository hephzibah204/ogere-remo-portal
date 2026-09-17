import React, { useState, useEffect } from 'react';
import sirenSound from '../services/sirenSound';
import { resolveOgereLocation, getOgereMapUrls } from '../services/ogereGeoEngine';

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
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [mapMode, setMapMode] = useState('hybrid'); // 'hybrid' (satellite) or 'roadmap' (street)
  const [mapZoom, setMapZoom] = useState(18); // 18-19: building/rooftop level zoom
  const [showFirModal, setShowFirModal] = useState(false);

  useEffect(() => {
    const unsub = sirenSound.subscribe(({ isPlaying, isMuted }) => {
      setIsSirenActive(isPlaying);
      setIsSirenMuted(isMuted);
    });
    return unsub;
  }, []);

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
      latitude: 6.9388,
      longitude: 3.6437,
      accuracy: 6,
      ip_address: '197.210.54.12',
      device_model: 'Samsung Galaxy A54',
      device_os: 'Android 14',
      battery_level: 68,
      network_type: '4G · MTN',
      is_live_tracking: true,
      severity: 'Critical',
      threat_level: 'CODE_RED',
      status: 'DISPATCHED',
      officer: 'Insp. Kayode Adeleke (Unit 4)',
      time: '12 mins ago',
    },
  ]);

  const [selectedIncident, setSelectedIncident] = useState(null);

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

  const [activeEscorts, setActiveEscorts] = useState([
    {
      id: 'ESC-8921',
      citizenName: 'Adewale Johnson',
      citizenPhone: '08033445566',
      origin: 'Ogere Central Mosque / Market',
      destination: 'KM 67 Tollgate Expressway',
      durationMinutes: 15,
      remainingSeconds: 420,
      startTime: new Date().toISOString(),
      status: 'ACTIVE_MONITORING',
      assignedUnit: 'Patrol Unit 4 (Highway & Rural Intercept)',
      latitude: 6.9388,
      longitude: 3.6437,
    },
  ]);

  const formatTimer = (secs) => {
    if (secs == null || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleSosEvent = (e) => {
      const sosItem = e.detail;
      if (sosItem) {
        // Automatically switch to security officer view so alert is front and center
        setCurrentRole('security_officer');
        setCurrentOfficer(SEED_OFFICERS[0]);
        setActiveScreen('dashboard');

        // TRIGGER HIGH-DECIBEL SIREN ALARM FOR SECURITY
        sirenSound.startEmergencySiren();

        const newInc = {
          id: sosItem.id || `INC-${Date.now().toString().slice(-4)}`,
          threat_level: 'CODE_RED',
          category: sosItem.category || '🚨 SOS Emergency Panic',
          location: sosItem.location || 'Ogere Remo Corridor',
          latitude: sosItem.latitude || 6.9388,
          longitude: sosItem.longitude || 3.6437,
          accuracy: sosItem.accuracy || 5,
          ip_address: sosItem.ipAddress || sosItem.ip_address || '197.210.54.12',
          google_maps_url: sosItem.googleMapsUrl || `https://www.google.com/maps?q=${sosItem.latitude || 6.9388},${sosItem.longitude || 3.6437}`,
          device_model: sosItem.deviceModel || 'Mobile Device',
          device_os: sosItem.deviceOs || 'Android 14',
          battery_level: sosItem.batteryLevel ?? 75,
          network_type: sosItem.networkType || '4G',
          is_live_tracking: true,
          description: sosItem.description || 'Emergency SOS trigger received from citizen mobile app.',
          reporter_name: sosItem.reporterName || 'Citizen Mobile App',
          reporter_phone: sosItem.reporterPhone || '08081762371',
          status: 'CRITICAL_DISPATCH',
          assigned_agency: 'Police / Joint Patrol Command',
          camera_feed_active: sosItem.cameraFeedActive,
          audio_feed_active: sosItem.audioFeedActive,
          media_url: sosItem.mediaUrl,
          created_at: new Date().toISOString(),
        };

        setIncidents((prev) => [newInc, ...prev.filter(i => i.id !== newInc.id)]);
        setSelectedIncident(newInc);
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

    const handleEscortStarted = (e) => {
      const escort = e.detail;
      if (escort) {
        setActiveEscorts((prev) => [escort, ...prev.filter((item) => item.id !== escort.id)]);
        // Automatically ensure security officer view is open to acknowledge
        setCurrentRole('security_officer');
        setCurrentOfficer(SEED_OFFICERS[0]);
        setActiveScreen('dashboard');
        sirenSound.playTestChime();
      }
    };

    const handleEscortTick = (e) => {
      const { sessionId, remainingSeconds } = e.detail || {};
      if (sessionId) {
        setActiveEscorts((prev) =>
          prev.map((esc) =>
            esc.id === sessionId ? { ...esc, remainingSeconds } : esc
          )
        );
      }
    };

    const handleEscortCompleted = (e) => {
      const { sessionId, status } = e.detail || {};
      if (sessionId) {
        setActiveEscorts((prev) =>
          prev.map((esc) =>
            esc.id === sessionId
              ? { ...esc, status: status || 'SAFELY_ARRIVED', remainingSeconds: 0 }
              : esc
          )
        );
      }
    };

    window.addEventListener('ogere-sos-triggered', handleSosEvent);
    window.addEventListener('ogere-escort-started', handleEscortStarted);
    window.addEventListener('ogere-escort-tick', handleEscortTick);
    window.addEventListener('ogere-escort-completed', handleEscortCompleted);

    return () => {
      window.removeEventListener('ogere-sos-triggered', handleSosEvent);
      window.removeEventListener('ogere-escort-started', handleEscortStarted);
      window.removeEventListener('ogere-escort-tick', handleEscortTick);
      window.removeEventListener('ogere-escort-completed', handleEscortCompleted);
      sirenSound.stop();
    };
  }, []);

  return (
    <div
      style={{
        width: '380px',
        height: '760px',
        background: '#0c0604',
        borderRadius: deviceFrame === 'iphone' ? '48px' : deviceFrame === 'android' ? '32px' : '14px',
        border: isSirenActive
          ? '10px solid #ef4444'
          : deviceFrame === 'none'
          ? '2px solid rgba(201,150,58,0.4)'
          : '10px solid #1e293b',
        boxShadow: isSirenActive
          ? '0 0 50px rgba(239, 68, 68, 0.95), 0 25px 50px -12px rgba(0,0,0,0.9)'
          : '0 25px 50px -12px rgba(0,0,0,0.9), 0 0 25px rgba(201,150,58,0.2)',
        transition: 'all 0.25s ease',
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
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isSirenActive ? '#ef4444' : '#dc2626' }} />
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

      {/* High-Decibel Siren Alert HUD */}
      {isSirenActive ? (
        <div
          style={{
            background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #b91c1c 100%)',
            color: '#ffffff',
            padding: '7px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.6)',
            borderBottom: '1px solid #f87171',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem' }}>🚨</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                CODE RED SIREN ACTIVE!
              </div>
              <div style={{ fontSize: '0.58rem', color: '#fecaca' }}>
                Tactical Rapid Intercept Alert
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => sirenSound.stop()}
            style={{
              background: '#ffffff',
              color: '#b91c1c',
              border: 'none',
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '0.66rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            }}
          >
            🔇 Silence
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.22)',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.64rem',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fca5a5' }}>
            <span>🔊</span>
            <span style={{ fontWeight: 800 }}>SECURITY SIREN ARMED</span>
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => sirenSound.playTestChime()}
              title="Test the police siren wail"
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#fecaca',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '0.58rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ▶ Test Siren
            </button>
            <button
              type="button"
              onClick={() => sirenSound.toggleMute()}
              style={{
                background: isSirenMuted ? '#4b5563' : 'rgba(255, 255, 255, 0.1)',
                color: isSirenMuted ? '#cbd5e1' : '#ffffff',
                border: 'none',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '0.58rem',
                cursor: 'pointer',
              }}
            >
              {isSirenMuted ? '🔕 Muted' : '🔔 Mute'}
            </button>
          </div>
        </div>
      )}

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
            {selectedIncident ? (
              /* TACTICAL SOS RADAR & MAP INTERCEPT SCREEN */
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    style={{ background: '#334155', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ← Back to Feed
                  </button>
                  <span style={{ fontSize: '0.62rem', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontWeight: 900 }}>
                    🚨 CODE RED INTERCEPT
                  </span>
                </div>

                {/* Ogere Hyper-Local Resolution & High-Precision URLs */}
                {(() => {
                  const sLat = selectedIncident.latitude || 6.9388;
                  const sLng = selectedIncident.longitude || 3.6437;
                  const ogereLoc = resolveOgereLocation(sLat, sLng, selectedIncident.accuracy || 8);
                  const mapUrls = getOgereMapUrls(sLat, sLng, 'Ogere Citizen SOS');
                  const batLvl = selectedIncident.battery_level ?? selectedIncident.batteryLevel ?? null;
                  const isLowBat = batLvl !== null && batLvl <= 20;

                  return (
                    <>
                      {/* Hyper-Local Ogere Landmark Badge */}
                      <div style={{ background: 'linear-gradient(90deg, #1e293b, #0f172a)', border: '1px solid #38bdf8', padding: '6px 8px', borderRadius: '6px', fontSize: '0.62rem' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>📍 OGERE REMO PINPOINT:</span>
                          <span style={{ color: '#f8fafc' }}>{ogereLoc.formattedText}</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.55rem', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Sector: {ogereLoc.sector}</span>
                          <span>🚓 ~{ogereLoc.distanceToPolice}m to Police DPO (ETA: ~{ogereLoc.policeEtaMinutes}m)</span>
                        </div>
                      </div>

                      {/* Critical Low Battery Alert */}
                      {isLowBat && (
                        <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '4px 8px', borderRadius: '6px', fontSize: '0.58rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🪫 CRITICAL BATTERY:</span>
                          <span>Victim phone at {batLvl}%! Risk of signal loss. Intercept immediately!</span>
                        </div>
                      )}

                      {/* Map Controls: Satellite Hybrid vs Street & Rooftop Zoom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setMapMode('hybrid')}
                            style={{
                              background: mapMode === 'hybrid' ? '#0284c7' : '#1e293b',
                              color: '#fff',
                              border: mapMode === 'hybrid' ? '1px solid #38bdf8' : '1px solid #475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            🛰️ Satellite
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapMode('roadmap')}
                            style={{
                              background: mapMode === 'roadmap' ? '#0284c7' : '#1e293b',
                              color: '#fff',
                              border: mapMode === 'roadmap' ? '1px solid #38bdf8' : '1px solid #475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            🗺️ Streets
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setMapZoom(19)}
                            style={{
                              background: mapZoom === 19 ? '#16a34a' : '#1e293b',
                              color: '#fff',
                              border: '1px solid #475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            🔍 Z:19 (Rooftop)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapZoom(17)}
                            style={{
                              background: mapZoom === 17 ? '#16a34a' : '#1e293b',
                              color: '#fff',
                              border: '1px solid #475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            🔍 Z:17 (Sector)
                          </button>
                        </div>
                      </div>

                      {/* Embedded Live Map with Rooftop Satellite & Street Modes */}
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #22c55e', position: 'relative' }}>
                        <iframe
                          title="officer-live-map"
                          width="100%"
                          height="185"
                          frameBorder="0"
                          style={{ display: 'block' }}
                          src={`https://maps.google.com/maps?q=${sLat},${sLng}&t=${mapMode === 'hybrid' ? 'k' : 'm'}&z=${mapZoom}&output=embed`}
                        />
                        <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(5, 46, 22, 0.9)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #22c55e', fontSize: '0.58rem', color: '#4ade80', fontWeight: 800 }}>
                          🟢 {mapMode === 'hybrid' ? '🛰️ HIGH-RES SATELLITE RADAR' : '🗺️ PRECISION STREET RADAR'}
                        </div>
                        <a
                          href={mapUrls.satellitePin}
                          target="_blank"
                          rel="noreferrer"
                          style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(15, 23, 42, 0.9)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #38bdf8', fontSize: '0.55rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 800 }}
                        >
                          ↗ Open Satellite Pin
                        </a>
                      </div>

                      {/* Telemetry Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', fontSize: '0.62rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: '4px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.55rem' }}>GPS COORDS</div>
                          <div style={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}>
                            {Number(sLat).toFixed(5)}, {Number(sLng).toFixed(5)}
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: '4px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.55rem' }}>ACCURACY</div>
                          <div style={{ color: (selectedIncident.accuracy || 5) <= 10 ? '#4ade80' : '#fde047', fontWeight: 800 }}>
                            ±{selectedIncident.accuracy || 5}m ({ogereLoc.accuracyRating === 'pinpoint_satellite' ? '🟢 Sat' : '🟡 GPS'})
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: '4px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.55rem' }}>BATTERY</div>
                          <div style={{ color: (batLvl ?? 82) > 20 ? '#4ade80' : '#ef4444', fontWeight: 900 }}>
                            🔋 {batLvl !== null ? `${batLvl}%` : '82%'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.62rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: '4px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.55rem' }}>DEVICE MODEL</div>
                          <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{selectedIncident.device_model || selectedIncident.deviceModel || 'Citizen Mobile'}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: '4px' }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.55rem' }}>PUBLIC IP</div>
                          <div style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{selectedIncident.ip_address || selectedIncident.ipAddress || '197.210.54.12'}</div>
                        </div>
                      </div>

                      {/* Turn-by-Turn Navigation */}
                      <a
                        href={mapUrls.turnByTurnNavigation}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#16a34a', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontWeight: 900, fontSize: '0.72rem', display: 'block' }}
                      >
                        ⚡ Intercept Target (Google Maps Navigation) ➔
                      </a>
                    </>
                  );
                })()}

                {/* SITREP Details */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', fontSize: '0.65rem', lineHeight: 1.4 }}>
                  <div>📍 <strong>Sector / Landmark:</strong> {selectedIncident.location}</div>
                  <div>🚨 <strong>Threat:</strong> {selectedIncident.category}</div>
                  <div>👤 <strong>Primary Contact:</strong> {selectedIncident.reporter_name || 'Citizen'} ({selectedIncident.reporter_phone || 'Unlisted'})</div>
                  {(selectedIncident.backup_phone || selectedIncident.backupPhone) && (
                    <div style={{ color: '#38bdf8', fontWeight: 800 }}>
                      👥 <strong>Next-of-Kin / Backup:</strong> {selectedIncident.backup_phone || selectedIncident.backupPhone}
                    </div>
                  )}
                  <div style={{ marginTop: '4px', color: '#f5edd8' }}>{selectedIncident.description}</div>
                </div>

                {/* Call Primary & Next-of-Kin */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {selectedIncident.reporter_phone && (
                    <a
                      href={`tel:${selectedIncident.reporter_phone}`}
                      style={{ flex: 1, background: '#047857', color: '#fff', textAlign: 'center', padding: '6px', borderRadius: '6px', textDecoration: 'none', fontWeight: 800, fontSize: '0.65rem', display: 'block' }}
                    >
                      📞 Call Primary ({selectedIncident.reporter_phone})
                    </a>
                  )}
                  {(selectedIncident.backup_phone || selectedIncident.backupPhone) && (
                    <a
                      href={`tel:${selectedIncident.backup_phone || selectedIncident.backupPhone}`}
                      style={{ flex: 1, background: '#0284c7', color: '#fff', textAlign: 'center', padding: '6px', borderRadius: '6px', textDecoration: 'none', fontWeight: 800, fontSize: '0.65rem', display: 'block' }}
                    >
                      👥 Call Kin ({selectedIncident.backup_phone || selectedIncident.backupPhone})
                    </a>
                  )}
                </div>

                {/* Generate Official Police FIR Evidence Dossier */}
                <button
                  type="button"
                  onClick={() => setShowFirModal(true)}
                  style={{
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    width: '100%',
                    marginTop: '2px',
                  }}
                >
                  📄 Generate Official Police FIR Dossier (Court Evidence)
                </button>
              </div>
            ) : (
              <div>
                {/* LIVE ESCORT WATCH RADAR SECTION */}
                {activeEscorts.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#38bdf8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🚶‍♂️</span> LIVE ESCORT RADAR
                      </span>
                      <span style={{ fontSize: '0.58rem', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        {activeEscorts.filter(e => e.status === 'ACTIVE_MONITORING').length} ACTIVE
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      {activeEscorts.map((esc) => {
                        const isMonitoring = esc.status === 'ACTIVE_MONITORING';
                        const isOverdue = esc.status === 'OVERDUE_ALARM_TRIGGERED';
                        const isDuress = esc.status === 'DURESS_TRIGGERED';
                        const isSafe = esc.status === 'SAFELY_ARRIVED';

                        return (
                          <div
                            key={esc.id}
                            style={{
                              background: isOverdue || isDuress
                                ? 'rgba(239, 68, 68, 0.15)'
                                : isSafe
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(56, 189, 248, 0.08)',
                              border: isOverdue || isDuress
                                ? '1px solid #ef4444'
                                : isSafe
                                ? '1px solid #22c55e'
                                : '1px solid rgba(56, 189, 248, 0.35)',
                              borderRadius: '8px',
                              padding: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '1.1rem' }}>
                                  {isOverdue || isDuress ? '🚨' : isSafe ? '✅' : '🚶‍♂️'}
                                </span>
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#ffffff' }}>
                                    {esc.citizenName}
                                  </div>
                                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                                    📞 {esc.citizenPhone || '08081762371'} · {esc.assignedUnit || 'Patrol Unit 4'}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span
                                style={{
                                  fontSize: '0.58rem',
                                  fontWeight: 900,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: isOverdue || isDuress
                                    ? '#dc2626'
                                    : isSafe
                                    ? '#16a34a'
                                    : '#0284c7',
                                  color: '#ffffff',
                                }}
                              >
                                {isOverdue ? 'OVERDUE SOS' : isDuress ? 'DURESS INTERCEPT' : isSafe ? 'SAFELY ARRIVED' : 'MONITORING'}
                              </span>
                            </div>

                            {/* Route & Countdown */}
                            <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '6px', padding: '6px', margin: '6px 0', fontSize: '0.64rem' }}>
                              <div style={{ color: '#cbd5e1', marginBottom: '3px' }}>
                                🏁 <strong>Route:</strong> {esc.origin || 'Ogere Central'} ➔ <strong>{esc.destination}</strong>
                              </div>
                              {isMonitoring ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  <span style={{ color: '#94a3b8', fontSize: '0.58rem' }}>Check-in Window:</span>
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontWeight: 900,
                                      fontSize: '0.75rem',
                                      color: (esc.remainingSeconds || 0) < 60 ? '#f87171' : '#38bdf8',
                                      background: (esc.remainingSeconds || 0) < 60 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    ⏳ {formatTimer(esc.remainingSeconds)} left
                                  </span>
                                </div>
                              ) : isSafe ? (
                                <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.62rem' }}>
                                  ✓ Citizen entered PIN and arrived safely.
                                </div>
                              ) : (
                                <div style={{ color: '#f87171', fontWeight: 800, fontSize: '0.62rem' }}>
                                  ⚠️ Intercept alert active! Location transmitted.
                                </div>
                              )}
                            </div>

                            {/* Quick Officer Actions */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                              {esc.citizenPhone && (
                                <a
                                  href={`tel:${esc.citizenPhone}`}
                                  style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    background: '#047857',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    padding: '5px',
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                  }}
                                >
                                  📞 Call Citizen
                                </a>
                              )}
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${esc.latitude || 6.9388},${esc.longitude || 3.6437}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  flex: 1,
                                  textAlign: 'center',
                                  background: isOverdue || isDuress ? '#dc2626' : '#2563eb',
                                  color: '#fff',
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  padding: '5px',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                }}
                              >
                                🗺️ Intercept Map
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                      <div style={{ fontSize: '0.68rem', color: '#fca5a5', marginBottom: '4px' }}>
                        📍 {inc.location}
                      </div>

                      {/* Telemetry Badge Strip */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0 6px' }}>
                        <span style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.58rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                          🛰️ {Number(inc.latitude || 6.9388).toFixed(4)}, {Number(inc.longitude || 3.6437).toFixed(4)}
                        </span>
                        <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.58rem', color: '#4ade80' }}>
                          ±{inc.accuracy || 5}m
                        </span>
                        {inc.battery_level != null && (
                          <span style={{ background: inc.battery_level > 20 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.2)', border: '1px solid ' + (inc.battery_level > 20 ? 'rgba(34,197,94,0.3)' : '#ef4444'), borderRadius: '3px', padding: '1px 4px', fontSize: '0.58rem', color: inc.battery_level > 20 ? '#4ade80' : '#fca5a5', fontWeight: 800 }}>
                            🔋 {inc.battery_level}%
                          </span>
                        )}
                        {inc.device_model && (
                          <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.58rem', color: '#cbd5e1' }}>
                            📱 {inc.device_model}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.66rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.3 }}>
                        {inc.description}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedIncident(inc)}
                          style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          🗺️ View Radar & Map
                        </button>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${inc.latitude || 6.9388},${inc.longitude || 3.6437}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1, textAlign: 'center', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '4px', padding: '6px', fontSize: '0.68rem', fontWeight: 800 }}
                        >
                          ⚡ Intercept GPS
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Official Police FIR Evidence Dossier Modal */}
      {showFirModal && selectedIncident && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.62rem',
              lineHeight: 1.4,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '6px', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                🇳🇬 THE NIGERIA POLICE FORCE
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569' }}>
                OGERE DIVISIONAL POLICE HEADQUARTERS · OGUN STATE COMMAND
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#dc2626', marginTop: '3px' }}>
                FIRST INFORMATION REPORT (FIR) & CRIME SITREP DOSSIER
              </div>
            </div>

            {/* Case Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: '#f8fafc', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
              <div><strong>FIR Case Ref:</strong> {selectedIncident.id}</div>
              <div><strong>Threat Category:</strong> {selectedIncident.category}</div>
              <div><strong>Date / Time Logged:</strong> {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}</div>
              <div><strong>Classification:</strong> <span style={{ color: '#dc2626', fontWeight: 900 }}>CRITICAL SOS (CODE RED)</span></div>
            </div>

            {/* Complainant & Contacts */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '4px' }}>
                1. COMPLAINANT & EMERGENCY CONTACT DATA
              </div>
              <div><strong>Victim / Reporter:</strong> {selectedIncident.reporter_name || 'Citizen in Distress'}</div>
              <div><strong>Primary Direct Phone:</strong> {selectedIncident.reporter_phone || 'Unlisted'}</div>
              {(selectedIncident.backup_phone || selectedIncident.backupPhone) && (
                <div><strong>Emergency Next-of-Kin Phone:</strong> {selectedIncident.backup_phone || selectedIncident.backupPhone}</div>
              )}
            </div>

            {/* GPS Crime Scene Telemetry */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '4px' }}>
                2. SCENE GPS TELEMETRY & DIGITAL FOOTPRINT
              </div>
              <div><strong>Landmark / Sector:</strong> {selectedIncident.location}</div>
              <div><strong>Precise Coordinates:</strong> {Number(selectedIncident.latitude || 6.9388).toFixed(5)}°N, {Number(selectedIncident.longitude || 3.6437).toFixed(5)}°E (±{selectedIncident.accuracy || 5}m)</div>
              <div><strong>Network Carrier & IP:</strong> {selectedIncident.network_type || '4G'} · {selectedIncident.ip_address || selectedIncident.ipAddress || '197.210.54.12'}</div>
              <div><strong>Device Hardware:</strong> {selectedIncident.device_model || selectedIncident.deviceModel || 'Mobile Web Client'} (🔋 {selectedIncident.battery_level ?? selectedIncident.batteryLevel ?? '82'}%)</div>
            </div>

            {/* Narrative */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '4px' }}>
                3. INCIDENT STATEMENT & EVIDENCE LOG
              </div>
              <div style={{ fontStyle: 'italic', color: '#334155', marginTop: '2px' }}>
                "{selectedIncident.description || 'Emergency panic trigger activated. Tactical rapid response unit dispatched to scene.'}"
              </div>
            </div>

            {/* Officer Sign-off */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '6px', fontSize: '0.58rem' }}>
              <div>
                <div><strong>Investigating Officer:</strong></div>
                <div>{currentOfficer.name} ({currentOfficer.badge})</div>
                <div>Ogere Divisional Command</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Official Seal / Timestamp:</strong></div>
                <div style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 800 }}>CERTIFIED · SECURE LOG</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  padding: '7px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                🖨️ Print / Save FIR PDF
              </button>
              <button
                type="button"
                onClick={() => setShowFirModal(false)}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
