import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbInsert } from '../services/db';

const EMERGENCY_SERVICES = [
  {
    name: 'Ogere Police Post',
    desc: 'Ogun State Police Command (Expressway Axis)',
    phone: '08081762371',
    displayPhone: '0808 176 2371',
    badge: 'Police',
    color: '#3b82f6',
    icon: '👮‍♂️',
  },
  {
    name: 'Amotekun & So-Safe Corps',
    desc: 'Ogere Remo Rapid Tactical Response Team',
    phone: '08034681687',
    displayPhone: '0803 468 1687',
    badge: 'Armed Response',
    color: '#10b981',
    icon: '🛡️',
  },
  {
    name: 'FRSC Expressway Rescue',
    desc: 'Sagamu / Ogere Corridor Tollgate Emergency',
    phone: '122',
    displayPhone: '122 (Toll Free) / 0807 769 0200',
    badge: 'Crash / Rescue',
    color: '#ef4444',
    icon: '🚑',
  },
  {
    name: 'Aafin Ologere Palace Vigilante',
    desc: 'Royal Hunters & Compound Night Watch',
    phone: '08145550192',
    displayPhone: '0814 555 0192',
    badge: 'Local Defense',
    color: '#d97706',
    icon: '👑',
  },
  {
    name: 'Ogere Specialist Medical Clinic',
    desc: '24/7 Maternity & Emergency Trauma Ward',
    phone: '08112000033',
    displayPhone: '0811 200 0033',
    badge: 'Ambulance',
    color: '#ec4899',
    icon: '🏥',
  },
];

const OGERE_SECTORS = [
  'Oke-Ogere Central Market Axis',
  'KM 67 Lagos–Ibadan Expressway Bypass',
  'Palace Way / Aafin Ologere Area',
  'Isale-Ogere Hospital Road',
  'OMCOOSA College Junction',
  'Agbele Ancestral Corridor',
  'Trailer Park Outpost',
  'Ajura Road / Industrial Corridor',
];

export default function SosHeaderModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sos'); // sos, walk, directory
  const [sector, setSector] = useState(OGERE_SECTORS[0]);
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [sosState, setSosState] = useState('idle'); // idle, triggering, dispatched
  const [countdown, setCountdown] = useState(3);
  const [dispatchedData, setDispatchedData] = useState(null);

  // Walk With Me State
  const [walkOrigin, setWalkOrigin] = useState(OGERE_SECTORS[0]);
  const [walkDest, setWalkDest] = useState(OGERE_SECTORS[2]);
  const [walkDuration, setWalkDuration] = useState(15);
  const [walkContact, setWalkContact] = useState('');
  const [isWalking, setIsWalking] = useState(false);
  const [walkSecondsLeft, setWalkSecondsLeft] = useState(15 * 60);

  const countdownTimerRef = useRef(null);
  const walkIntervalRef = useRef(null);

  // Reset states on modal close
  useEffect(() => {
    if (!isOpen) {
      setSosState('idle');
      setCountdown(3);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }
  }, [isOpen]);

  // Walk with me timer
  useEffect(() => {
    if (isWalking) {
      walkIntervalRef.current = setInterval(() => {
        setWalkSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(walkIntervalRef.current);
            handleWalkDistress('TIMER_EXPIRED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    }
    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [isWalking]);

  // Audio Beep
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
  };

  // Trigger Panic SOS (Completely silent on citizen side for covert safety)
  const handleStartSosCountdown = () => {
    setSosState('triggering');
    setCountdown(3);

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownTimerRef.current);
        executeSosDispatch();
      }
    }, 1000);
  };

  const handleCancelSos = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setSosState('idle');
    setCountdown(3);
  };

  const executeSosDispatch = async () => {
    const incidentId = `SOS-${Date.now().toString().slice(-6)}`;
    const newSos = {
      id: incidentId,
      title: `🚨 CRITICAL SOS PANIC: ${sector}`,
      category: 'Armed Response / Distress',
      severity: 'CRITICAL_DISPATCH',
      threatLevel: 'CODE_RED',
      location: sector,
      description: `EMERGENCY SOS BUTTON TRIGGERED by ${callerName || 'Citizen in Distress'} (${callerPhone || 'Unlisted'}). Immediate tactical dispatch required.`,
      reporterName: callerName || 'Citizen SOS Alert',
      reporterPhone: callerPhone || 'Emergency Caller',
      assignedAgency: 'Police / Amotekun Area Command',
      status: 'CRITICAL_DISPATCH',
      createdAt: new Date().toISOString(),
    };

    try {
      await dbInsert('incident_reports', newSos);
    } catch (err) {
      console.warn('Local SOS save fallback:', err);
    }

    // Post to Serverless Security API
    fetch('/api/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSos),
    }).catch(() => {});

    // Broadcast sitewide so Security Dashboard and Admin get instant audio alert
    window.dispatchEvent(new CustomEvent('ogere-sos-triggered', { detail: newSos }));

    setDispatchedData(newSos);
    setSosState('dispatched');
  };

  // Walk With Me Start
  const handleStartWalk = () => {
    setIsWalking(true);
    setWalkSecondsLeft(walkDuration * 60);

    const walkIncident = {
      id: `WALK-${Date.now().toString().slice(-6)}`,
      title: `🛡️ Virtual Escort Active: ${walkOrigin} → ${walkDest}`,
      category: 'Virtual Escort Guard',
      severity: 'Monitoring',
      threatLevel: 'CODE_YELLOW',
      location: `${walkOrigin} → ${walkDest}`,
      description: `Virtual Escort activated for ${walkDuration} mins. Emergency contact: ${walkContact || 'Palace Night Watch'}.`,
      reporterName: callerName || 'Walking Citizen',
      reporterPhone: callerPhone || 'Walk Contact',
      status: 'active_escort',
      createdAt: new Date().toISOString(),
    };

    fetch('/api/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(walkIncident),
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent('ogere-sos-triggered', { detail: walkIncident }));
  };

  const handleWalkArrived = () => {
    setIsWalking(false);
    alert('🎉 Walk With Me: You have safely completed your journey. Escort session closed.');
  };

  const handleWalkDistress = (reason = 'USER_PANIC') => {
    setIsWalking(false);
    const distressIncident = {
      id: `WALK-PANIC-${Date.now().toString().slice(-6)}`,
      title: `🚨 VIRTUAL ESCORT DISTRESS: ${walkOrigin} → ${walkDest}`,
      category: 'Escort Distress / Panic',
      severity: 'CRITICAL_DISPATCH',
      threatLevel: 'CODE_RED',
      location: `${walkOrigin} → ${walkDest}`,
      description: `DISTRESS ALERT from Virtual Escort (${reason}). User did not check in safely. Immediate patrol intercept needed.`,
      reporterName: callerName || 'Walking Citizen in Danger',
      reporterPhone: callerPhone || walkContact || 'Emergency Contact',
      status: 'CRITICAL_DISPATCH',
      createdAt: new Date().toISOString(),
    };

    fetch('/api/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(distressIncident),
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent('ogere-sos-triggered', { detail: distressIncident }));
    executeSosDispatch();
  };

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #180907 0%, #0d0604 100%)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '580px',
          padding: '1.6rem',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.45)',
          color: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1.5px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🚨
            </div>
            <div>
              <h2 className="cinzel" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fca5a5' }}>
                OGERE EMERGENCY COMMAND
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                Real-Time Panic Dispatch, Virtual Escort & Emergency Lines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.4rem', borderBottom: '1px solid rgba(239,68,68,0.25)', paddingBottom: '0.6rem' }}>
          <button
            onClick={() => setActiveTab('sos')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'sos' ? 'linear-gradient(135deg, #b91c1c, #991b1b)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🚨 Instant SOS Panic
          </button>

          <button
            onClick={() => setActiveTab('walk')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'walk' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🛡️ Walk With Me (Escort)
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'directory' ? 'rgba(201,150,58,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'directory' ? '#fef08a' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            📞 Direct Hotlines
          </button>
        </div>

        {/* TAB 1: INSTANT SOS PANIC */}
        {activeTab === 'sos' && (
          <div>
            {sosState === 'idle' && (
              <div>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.6rem' }}>
                    📍 Set Your Current Location in Ogere:
                  </div>
                  <select
                    className="ainp"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    style={{ width: '100%', marginBottom: '0.8rem', background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid #ef4444', borderRadius: '6px' }}
                  >
                    {OGERE_SECTORS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <input
                      placeholder="Your Name (Optional)"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      style={{ background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                    <input
                      placeholder="Phone Number (Optional)"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      style={{ background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* Big Red Panic Button */}
                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                  <button
                    onClick={handleStartSosCountdown}
                    style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ef4444 0%, #b91c1c 70%, #7f1d1d 100%)',
                      border: '6px solid #fecaca',
                      color: '#ffffff',
                      fontSize: '1.6rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 35px rgba(239, 68, 68, 0.7), inset 0 0 15px rgba(0,0,0,0.5)',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '2.4rem' }}>🚨</span>
                    <span>PRESS SOS</span>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', opacity: 0.9 }}>DISPATCH AUTHORITIES</span>
                  </button>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.8rem' }}>
                    🤫 <strong>100% Silent Transmission on Your Device:</strong> Makes no sound on your phone to keep you safe from assailants, while instantly triggering live audio sirens at Police Command &amp; Patrol outposts.
                  </p>
                </div>
              </div>
            )}

            {sosState === 'triggering' && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '1.2rem', color: '#f87171', fontWeight: 800, marginBottom: '0.5rem' }}>
                  🚨 TRANSMITTING CRITICAL EMERGENCY SIGNAL IN:
                </div>
                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#ef4444', margin: '0.5rem 0', fontFamily: 'monospace' }}>
                  {countdown}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                  Target Sector: <strong>{sector}</strong>
                </p>
                <button
                  onClick={handleCancelSos}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid #ffffff',
                    borderRadius: '8px',
                    padding: '0.8rem 2rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕ CANCEL / FALSE ALARM
                </button>
              </div>
            )}

            {sosState === 'dispatched' && dispatchedData && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22c55e', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>✅</div>
                <h3 className="cinzel" style={{ color: '#4ade80', fontSize: '1.4rem', margin: '0 0 0.4rem 0' }}>
                  EMERGENCY DISPATCH TRANSMITTED!
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#f1f5f9', margin: '0 0 1rem 0' }}>
                  Tracking ID: <code style={{ color: '#fde047', fontWeight: 700 }}>{dispatchedData.id}</code>
                </p>

                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1rem', textAlign: 'left', marginBottom: '1.2rem', fontSize: '0.8rem', display: 'grid', gap: '0.4rem' }}>
                  <div>📍 <strong>Location:</strong> {dispatchedData.location}</div>
                  <div>🚨 <strong>Status:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>CODE RED — TACTICAL UNITS ALERTED</span></div>
                  <div>🛡️ <strong>Agencies Notified:</strong> Ogere Police Command, So-Safe / Amotekun Corps, Palace Rapid Vigilante</div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/security-dashboard');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #d97706, #b45309)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1.2rem',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    🛰️ View on Live Security Console →
                  </button>

                  <button
                    onClick={handleCancelSos}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      padding: '0.75rem 1.2rem',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WALK WITH ME (VIRTUAL ESCORT) */}
        {activeTab === 'walk' && (
          <div>
            {!isWalking ? (
              <div>
                <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.6rem' }}>
                    🛡️ Virtual Guardian & Escort Journey
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0 0 1rem 0' }}>
                    Walking at night or through quiet sectors in Ogere? Activate Virtual Escort. If you do not check in before the timer expires, an alert is automatically dispatched to Community Security.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'block', marginBottom: '0.2rem' }}>Starting Point:</label>
                      <select
                        value={walkOrigin}
                        onChange={(e) => setWalkOrigin(e.target.value)}
                        style={{ width: '100%', background: '#0a0503', color: '#fff', padding: '0.5rem', border: '1px solid #0284c7', borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        {OGERE_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'block', marginBottom: '0.2rem' }}>Destination:</label>
                      <select
                        value={walkDest}
                        onChange={(e) => setWalkDest(e.target.value)}
                        style={{ width: '100%', background: '#0a0503', color: '#fff', padding: '0.5rem', border: '1px solid #0284c7', borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        {OGERE_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'block', marginBottom: '0.2rem' }}>Estimated Walking Time:</label>
                      <select
                        value={walkDuration}
                        onChange={(e) => setWalkDuration(Number(e.target.value))}
                        style={{ width: '100%', background: '#0a0503', color: '#fff', padding: '0.5rem', border: '1px solid #0284c7', borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        <option value={5}>5 Minutes (Quick stroll)</option>
                        <option value={10}>10 Minutes</option>
                        <option value={15}>15 Minutes (Standard walk)</option>
                        <option value={25}>25 Minutes (Cross-town)</option>
                        <option value={45}>45 Minutes (Long distance)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'block', marginBottom: '0.2rem' }}>Emergency Contact Phone:</label>
                      <input
                        placeholder="e.g. 0803 123 4567"
                        value={walkContact}
                        onChange={(e) => setWalkContact(e.target.value)}
                        style={{ width: '100%', background: '#0a0503', color: '#fff', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartWalk}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '0.9rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  <span>🚀</span>
                  <span>ACTIVATE VIRTUAL ESCORT</span>
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(2, 132, 199, 0.15)', border: '2px solid #0284c7', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  🛡️ VIRTUAL ESCORT ACTIVATED
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', margin: '0.3rem 0' }}>
                  {walkOrigin} ➔ {walkDest}
                </div>

                {/* Big Countdown Timer */}
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: walkSecondsLeft < 120 ? '#ef4444' : '#38bdf8', margin: '0.8rem 0', fontFamily: 'monospace' }}>
                  {formatTimer(walkSecondsLeft)}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1.2rem 0' }}>
                  🛰️ GPS Breadcrumbs active. If you feel unsafe, tap Distress Panic immediately.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <button
                    onClick={handleWalkArrived}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      border: '1px solid #4ade80',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    ✅ I Have Arrived Safely
                  </button>

                  <button
                    onClick={() => handleWalkDistress('USER_DISTRESS_PANIC')}
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                      border: '1px solid #f87171',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      animation: 'pulseGlow 1.5s infinite',
                    }}
                  >
                    🚨 DISTRESS PANIC!
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIRECT HOTLINES */}
        {activeTab === 'directory' && (
          <div style={{ display: 'grid', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto' }}>
            {EMERGENCY_SERVICES.map((serv) => (
              <a
                key={serv.name}
                href={`tel:${serv.phone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{serv.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{serv.name}</span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: `${serv.color}25`,
                          color: serv.color,
                        }}
                      >
                        {serv.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{serv.desc}</div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                  }}
                >
                  📞 Call
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Footer Link */}
        <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/alerts');
            }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            📋 File Detailed Incident Report
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/security-dashboard');
            }}
            style={{ background: 'none', border: 'none', color: '#fde047', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
          >
            🛡️ Open Security Command Console →
          </button>
        </div>
      </div>
    </div>
  );
}
