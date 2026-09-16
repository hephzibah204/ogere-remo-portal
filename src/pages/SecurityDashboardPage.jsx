import { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import Section from '../components/Section';
import sirenSound from '../services/sirenSound';

const AGENCIES = [
  { id: 'all', name: 'All Security Agencies', icon: '🌐' },
  { id: 'Police', name: 'Nigeria Police Force (NPF)', icon: '🚔', phone: '08081762371' },
  { id: 'FRSC', name: 'FRSC Expressway Command', icon: '🚦', phone: '122' },
  { id: 'So-Safe', name: 'So-Safe Corps (Ogun State)', icon: '🛡️', phone: '08034681687' },
  { id: 'Palace Vigilante', name: 'Palace Vigilante & Night Watch', icon: '👑', phone: '08023456789' },
  { id: 'Fire Service', name: 'Ogun State Fire & Rescue', icon: '🔥', phone: '08134680660' },
];

const THREAT_LEVELS = {
  CODE_RED: {
    label: 'CODE RED — ARMED CRITICAL',
    desc: 'Armed Robbery, Terrorism, Kidnapping, Gunfire, Hostage Crisis',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#dc2626',
    badge: '🚨 CODE RED'
  },
  CODE_ORANGE: {
    label: 'CODE ORANGE — MASS CASUALTY / EXPLOSION',
    desc: 'Tanker Explosion, CNG Pipeline Leak, Expressway Multi-Vehicle Crash',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: '#ea580c',
    badge: '🔥 CODE ORANGE'
  },
  CODE_YELLOW: {
    label: 'CODE YELLOW — GENERAL HAZARD',
    desc: 'Public Disorder, Road Obstruction, Local Dispute, Suspicious Movement',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.1)',
    border: '#ca8a04',
    badge: '⚠️ CODE YELLOW'
  },
};

const SECTORS = [
  'KM 66-68 Lagos-Ibadan Expressway',
  'Ogere Tollgate Bypass / Old Tollgate',
  'Palace Way / Aafin Ologere Axis',
  'Isale-Ogere Hospital Road',
  'Oke-Ogere Central Market Complex',
  'OMCOOSA College Junction',
  'Agbele Ancestral Corridor',
  'Trailer Park Outpost',
];

export default function SecurityDashboardPage() {
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [threatFilter, setThreatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [liveOnlyFilter, setLiveOnlyFilter] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIncident, setActiveIncident] = useState(null);
  const [dispatchUnit, setDispatchUnit] = useState('');
  const [dispatchAgency, setDispatchAgency] = useState('Police');
  const [agencyNotes, setAgencyNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true); // ON by default — agents always hear alarms
  const [lastAlertTime, setLastAlertTime] = useState(null);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [newIncidentForm, setNewIncidentForm] = useState(false);
  const [manualReport, setManualReport] = useState({
    category: 'Armed Robbery / Banditry',
    threatLevel: 'CODE_RED',
    location: SECTORS[0],
    description: '',
    reporterName: 'Command Dispatch Officer',
    assignedAgency: 'Police',
  });

  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  // Stop any currently looping alarm
  const stopAlarm = () => {
    sirenSound.stop();
  };

  // Trigger a repeating loud alarm for CODE_RED or brief chime
  const triggerAudioAlarm = (isCodeRed = false) => {
    if (!audioEnabled) return;
    try {
      if (isCodeRed) {
        sirenSound.startEmergencySiren();
      } else {
        sirenSound.playTestChime();
      }
    } catch (_) {}
  };

  const fetchIncidents = async () => {
    try {
      let url = `/api/incidents?limit=60`;
      if (selectedAgency !== 'all') url += `&agency=${encodeURIComponent(selectedAgency)}`;
      if (threatFilter !== 'all') url += `&threat=${encodeURIComponent(threatFilter)}`;
      if (statusFilter !== 'all') url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const incoming = data.incidents || [];
        setIncidents(incoming);

        // Check for active Code Red
        const hasCodeRed = incoming.some(i => i.threat_level === 'CODE_RED' && i.status !== 'resolved');
        const hasCodeOrange = !hasCodeRed && incoming.some(i => i.threat_level === 'CODE_ORANGE' && i.status !== 'resolved');
        if (hasCodeRed) {
          triggerAudioAlarm(true);   // Looping siren
          setLastAlertTime(new Date().toLocaleTimeString());
        } else if (hasCodeOrange) {
          triggerAudioAlarm(false);  // 2-cycle alert
        } else {
          stopAlarm(); // All clear — stop any running alarm
        }
      }
    } catch (err) {
      console.error('Failed to fetch emergency incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [liveRefreshKey, setLiveRefreshKey] = useState(0);

  // Advanced Security Ecosystem State
  const [broadcasts, setBroadcasts] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    severity: 'CRITICAL',
    targetSector: 'All Ogere Remo Sectors',
    durationHours: 24,
  });

  const [nearbyCctv, setNearbyCctv] = useState([]);
  const [loadingCctv, setLoadingCctv] = useState(false);
  const [showCctvModal, setShowCctvModal] = useState(false);

  const [tips, setTips] = useState([]);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [tipSitrep, setTipSitrep] = useState('');
  const [tipStatus, setTipStatus] = useState('investigating');

  const [patrolData, setPatrolData] = useState({ outposts: [], recentCheckins: [] });
  const [showPatrolModal, setShowPatrolModal] = useState(false);

  // Fetch active Amber alerts & broadcasts
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      }
    } catch (_) {}
  };

  // Fetch anonymous whistleblower tips
  const fetchTips = async () => {
    try {
      const res = await fetch('/api/whistleblower');
      if (res.ok) {
        const data = await res.json();
        setTips(data.tips || []);
      }
    } catch (_) {}
  };

  // Fetch night patrol outposts & check-ins
  const fetchPatrolData = async () => {
    try {
      const res = await fetch('/api/patrol-checkin');
      if (res.ok) {
        const data = await res.json();
        setPatrolData(data);
      }
    } catch (_) {}
  };

  // Scan CCTV cameras within 1km of incident coordinates
  const handleScanCctv = async () => {
    if (!activeIncident?.latitude || !activeIncident?.longitude) return;
    setLoadingCctv(true);
    setShowCctvModal(true);
    try {
      const res = await fetch(`/api/cctv?lat=${activeIncident.latitude}&lng=${activeIncident.longitude}&radiusKm=1.5`);
      if (res.ok) {
        const data = await res.json();
        setNearbyCctv(data.cameras || []);
      }
    } catch (_) {
      setNearbyCctv([]);
    } finally {
      setLoadingCctv(false);
    }
  };

  // Dispatch Palace Amber Alert
  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm),
      });
      if (res.ok) {
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: '',
          message: '',
          severity: 'CRITICAL',
          targetSector: 'All Ogere Remo Sectors',
          durationHours: 24,
        });
        fetchBroadcasts();
      }
    } catch (err) {
      alert('Error creating broadcast: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Deactivate broadcast
  const handleDeactivateBroadcast = async (id) => {
    try {
      const res = await fetch('/api/broadcasts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false }),
      });
      if (res.ok) fetchBroadcasts();
    } catch (_) {}
  };

  // Update anonymous tip SITREP
  const handleUpdateTipSitrep = async (e) => {
    e.preventDefault();
    if (!selectedTip) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/whistleblower', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipToken: selectedTip.tip_token,
          status: tipStatus,
          officerResponse: tipSitrep,
        }),
      });
      if (res.ok) {
        alert(`Tip ${selectedTip.tip_token} SITREP updated.`);
        setSelectedTip(null);
        setTipSitrep('');
        fetchTips();
      }
    } catch (err) {
      alert('Error updating tip: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // High-frequency polling (every 3.5 seconds) for active incident if in Live Tracking mode (WhatsApp-style)
  useEffect(() => {
    if (!activeIncident?.id) {
      setBreadcrumbs([]);
      return;
    }

    const fetchLiveDetails = async () => {
      try {
        const res = await fetch(`/api/live-location?incidentId=${encodeURIComponent(activeIncident.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.incident) {
            setActiveIncident(prev => prev && prev.id === data.incident.id ? { ...prev, ...data.incident } : prev);
          }
          if (data.breadcrumbs) {
            setBreadcrumbs(data.breadcrumbs);
          }
          setLiveRefreshKey(k => k + 1);
        }
      } catch (err) {
        console.warn('[LiveTracking Polling] error:', err);
      }
    };

    fetchLiveDetails();

    const liveInterval = setInterval(() => {
      fetchLiveDetails();
    }, (activeIncident.is_live_tracking || activeIncident.camera_feed_active || activeIncident.audio_feed_active) ? 3500 : 7000);

    return () => clearInterval(liveInterval);
  }, [activeIncident?.id, activeIncident?.is_live_tracking, activeIncident?.camera_feed_active, activeIncident?.audio_feed_active]);

  useEffect(() => {
    fetchBroadcasts();
    fetchTips();
    fetchPatrolData();

    // Listen to real-time SOS panic dispatches from any page or modal
    const handleSosEvent = (e) => {
      const sosItem = e.detail;
      if (sosItem) {
        setIncidents((prev) => [
          {
            id: sosItem.id,
            threat_level: 'CODE_RED',
            category: sosItem.category || 'SOS Emergency Panic',
            location: sosItem.location || 'Ogere Remo Sector',
            description: sosItem.description || 'Emergency SOS trigger received.',
            reporter_name: sosItem.reporterName || 'Citizen Caller',
            status: 'CRITICAL_DISPATCH',
            assigned_agency: 'Police / Amotekun Area Command',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        triggerAudioAlarm(true);
        setLastAlertTime(new Date().toLocaleTimeString());
      }
    };

    window.addEventListener('ogere-sos-triggered', handleSosEvent);
    return () => window.removeEventListener('ogere-sos-triggered', handleSosEvent);
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 8000); // Poll every 8 seconds
    return () => {
      clearInterval(interval);
      stopAlarm(); // Ensure alarm stops on unmount
    };
  }, [selectedAgency, threatFilter, statusFilter, audioEnabled]);



  const handleUpdateStatus = async (newStatus) => {
    if (!activeIncident) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeIncident.id,
          status: newStatus,
          assignedAgency: dispatchAgency,
          respondingUnit: dispatchUnit || activeIncident.responding_unit,
          agencyNotes: agencyNotes || activeIncident.agency_notes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveIncident(updated.incident);
        fetchIncidents();
      }
    } catch (err) {
      alert('Error updating incident dispatch: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualDispatch = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: manualReport.category,
          threatLevel: manualReport.threatLevel,
          severity: 'Critical',
          location: manualReport.location,
          description: manualReport.description,
          reporterName: manualReport.reporterName,
          assignedAgency: manualReport.assignedAgency,
          isSos: true,
        }),
      });

      if (res.ok) {
        setNewIncidentForm(false);
        setManualReport({
          category: 'Armed Robbery / Banditry',
          threatLevel: 'CODE_RED',
          location: SECTORS[0],
          description: '',
          reporterName: 'Command Dispatch Officer',
          assignedAgency: 'Police',
        });
        fetchIncidents();
      }
    } catch (err) {
      alert('Error creating incident: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const codeRedCount = incidents.filter(i => (i.threat_level === 'CODE_RED' || i.category?.toLowerCase().includes('robbery') || i.category?.toLowerCase().includes('terror')) && i.status !== 'resolved').length;
  const activeDispatched = incidents.filter(i => i.status === 'dispatched' || i.status === 'on_scene').length;
  const totalOpen = incidents.filter(i => i.status === 'open').length;
  const liveTrackingCount = incidents.filter(i => i.is_live_tracking && i.status !== 'resolved').length;
  const displayedIncidents = liveOnlyFilter ? incidents.filter(i => i.is_live_tracking) : incidents;

  return (
    <div style={{ background: '#090403', minHeight: '100vh', color: '#f5edd8', paddingBottom: '4rem' }}>
      <SEO
        title="Security Command & Tactical Dispatch Dashboard"
        description="Unified security and emergency response console for Police, FRSC, So-Safe, and Palace Vigilante in Ogere Remo."
      />

      {/* CSS keyframes injected for CODE RED flashing banner */}
      <style>{`
        @keyframes codeRedFlash {
          0%   { background: linear-gradient(90deg, #7f1d1d 0%, #b91c1c 50%, #7f1d1d 100%); }
          50%  { background: linear-gradient(90deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%); }
          100% { background: linear-gradient(90deg, #7f1d1d 0%, #b91c1c 50%, #7f1d1d 100%); }
        }
        @keyframes sirenPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.25); }
        }
        @keyframes liveRadarGlow {
          0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70%  { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes liveTargetBeacon {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px #22c55e); }
          50%       { transform: scale(1.18); filter: drop-shadow(0 0 8px #22c55e); }
        }
      `}</style>

      {/* Top Threat Banner */}
      <div style={{
        background: codeRedCount > 0 
          ? 'linear-gradient(90deg, #7f1d1d 0%, #b91c1c 50%, #7f1d1d 100%)'
          : 'linear-gradient(90deg, #14532d 0%, #166534 50%, #14532d 100%)',
        animation: codeRedCount > 0 ? 'codeRedFlash 1.4s ease-in-out infinite' : 'none',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{
            fontSize: '1.2rem',
            animation: codeRedCount > 0 ? 'sirenPulse 0.7s ease-in-out infinite' : 'none',
            display: 'inline-block',
          }}>
            {codeRedCount > 0 ? '🚨' : '🛡️'}
          </span>
          <div>
            <div className="cinzel" style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', color: '#ffffff' }}>
              {codeRedCount > 0 
                ? `CRITICAL ALERT: ${codeRedCount} ACTIVE CODE RED (ARMED ROBBERY / TERRORISM / HOSTAGE)`
                : 'OGERE REMO SECURITY SECTOR STATUS: NORMAL SURVEILLANCE PATROL'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)' }}>
              Lagos-Ibadan Expressway Corridor · Palace Joint Taskforce Unified Dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* SILENCE ALARM — shown only when CODE_RED active */}
          {codeRedCount > 0 && (
            <button
              onClick={() => { stopAlarm(); setAudioEnabled(false); }}
              style={{
                background: '#1e1b4b',
                border: '1px solid #818cf8',
                color: '#a5b4fc',
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                letterSpacing: '0.04em',
              }}
            >
              🔇 SILENCE ALARM
            </button>
          )}

          <button
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (next && codeRedCount > 0) triggerAudioAlarm(true);
              if (!next) stopAlarm();
            }}
            style={{
              background: audioEnabled ? '#22c55e' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>{audioEnabled ? '🔔 Siren Armed' : '🔕 Siren Muted'}</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            style={{
              background: '#b45309',
              border: '1px solid #f59e0b',
              color: '#ffffff',
              padding: '0.35rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            📢 Palace Amber Alert / Curfew
          </button>

          <button
            onClick={() => setShowTipsModal(true)}
            style={{
              background: '#312e81',
              border: '1px solid #6366f1',
              color: '#ffffff',
              padding: '0.35rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            🕵️ Intel Tips ({tips.length})
          </button>

          <button
            onClick={() => setShowPatrolModal(true)}
            style={{
              background: '#064e3b',
              border: '1px solid #10b981',
              color: '#ffffff',
              padding: '0.35rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            🛡️ Night Patrol Roster
          </button>

          <button
            onClick={() => setNewIncidentForm(true)}
            style={{
              background: '#b91c1c',
              border: '1px solid #ef4444',
              color: '#ffffff',
              padding: '0.35rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            + Log Rapid Tactical Alert
          </button>
        </div>
      </div>

      {/* Active Palace Amber Alert / Town Curfew Banner */}
      {broadcasts.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, #b45309 0%, #d97706 50%, #b45309 100%)',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.8rem',
          borderBottom: '2px solid #fde047',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📢</span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, letterSpacing: '0.08em' }}>
                PALACE COMMUNITY BROADCAST [{broadcasts[0].severity}]: {broadcasts[0].title}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fef3c7', marginTop: '0.1rem' }}>
                {broadcasts[0].message} · Sector: {broadcasts[0].target_sector}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDeactivateBroadcast(broadcasts[0].id)}
            style={{
              background: '#78350f',
              border: '1px solid #fef3c7',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ✕ Dismiss & Archive Broadcast
          </button>
        </div>
      )}


      <Section py="2rem" bg="#090403">
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #dc2626', borderRadius: '8px', padding: '1.2rem' }}>
            <div className="cinzel" style={{ fontSize: '0.6rem', color: '#fca5a5', letterSpacing: '0.1em' }}>ARMED / TERROR THREATS</div>
            <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>{codeRedCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Armed Robbery · Terrorism · Gunfire</div>
          </div>

          <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid #ea580c', borderRadius: '8px', padding: '1.2rem' }}>
            <div className="cinzel" style={{ fontSize: '0.6rem', color: '#fdba74', letterSpacing: '0.1em' }}>ACTIVE PATROL UNITS DISPATCHED</div>
            <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f97316', marginTop: '0.2rem' }}>{activeDispatched}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Units en route or on scene</div>
          </div>

          <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid #ca8a04', borderRadius: '8px', padding: '1.2rem' }}>
            <div className="cinzel" style={{ fontSize: '0.6rem', color: '#fde047', letterSpacing: '0.1em' }}>PENDING DISPATCH / OPEN QUEUE</div>
            <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#eab308', marginTop: '0.2rem' }}>{totalOpen}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Requires immediate triage</div>
          </div>

          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #16a34a', borderRadius: '8px', padding: '1.2rem' }}>
            <div className="cinzel" style={{ fontSize: '0.6rem', color: '#86efac', letterSpacing: '0.1em' }}>COMMUNITY BROADCAST STATUS</div>
            <div className="cinzel" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e', marginTop: '0.6rem' }}>CONNECTED</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Live sync with Mobile App SOS</div>
          </div>
        </div>

        {/* Agency Select Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
          {AGENCIES.map(ag => {
            const isSelected = selectedAgency === ag.id;
            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgency(ag.id)}
                style={{
                  background: isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                  color: isSelected ? '#1a0d06' : '#f5edd8',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(201,150,58,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{ag.icon}</span>
                <span>{ag.name}</span>
                {ag.phone && <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>({ag.phone})</span>}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1.2rem', borderRadius: '6px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>THREAT FILTER:</span>
            {['all', 'CODE_RED', 'CODE_ORANGE', 'CODE_YELLOW'].map(t => (
              <button
                key={t}
                onClick={() => setThreatFilter(t)}
                style={{
                  background: threatFilter === t ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: t === 'CODE_RED' ? '#ef4444' : t === 'CODE_ORANGE' ? '#f97316' : t === 'CODE_YELLOW' ? '#eab308' : '#f5edd8',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>STATUS:</span>
            {['all', 'open', 'dispatched', 'on_scene', 'resolved'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: statusFilter === s ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: s === 'open' ? '#ef4444' : s === 'dispatched' ? '#f59e0b' : s === 'resolved' ? '#22c55e' : '#f5edd8',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {s}
              </button>
            ))}

            <button
              onClick={() => setLiveOnlyFilter(!liveOnlyFilter)}
              style={{
                background: liveOnlyFilter ? '#052e16' : 'rgba(255,255,255,0.05)',
                color: liveOnlyFilter ? '#4ade80' : 'rgba(255,255,255,0.6)',
                border: liveOnlyFilter ? '1.5px solid #22c55e' : '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: liveOnlyFilter ? '0 0 10px rgba(34,197,94,0.4)' : 'none',
              }}
            >
              <span>{liveOnlyFilter ? '🟢' : '⚪'}</span>
              <span>LIVE RADARS ONLY ({liveTrackingCount})</span>
            </button>
          </div>
        </div>

        {/* Dashboard Main Grid: Incident Feed & Dispatch Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: activeIncident ? '1.2fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Left: Live Alerts Feed */}
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                Connecting to Emergency Dispatch Bus...
              </div>
            ) : displayedIncidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
                <div className="cinzel" style={{ fontSize: '1rem', color: 'var(--gold)' }}>All Sectors Clear</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>No active emergency reports matching the selected filters.</div>
              </div>
            ) : (
              displayedIncidents.map(inc => {
                const threat = THREAT_LEVELS[inc.threat_level] || THREAT_LEVELS.CODE_YELLOW;
                const isSelected = activeIncident?.id === inc.id;
                const isSilent = inc.is_silent_panic;
                const isCodeRed = inc.threat_level === 'CODE_RED' || inc.category?.toLowerCase().includes('robbery') || inc.category?.toLowerCase().includes('terror');

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setActiveIncident(inc);
                      setDispatchAgency(inc.assigned_agency || 'Police');
                      setDispatchUnit(inc.responding_unit || '');
                      setAgencyNotes(inc.agency_notes || '');
                    }}
                    style={{
                      background: isSelected ? 'rgba(201,150,58,0.15)' : threat.bg,
                      border: isSelected ? '2px solid var(--gold)' : `1px solid ${threat.border}`,
                      borderLeft: `6px solid ${threat.color}`,
                      borderRadius: '8px',
                      padding: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          background: threat.color,
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 900,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          letterSpacing: '0.08em',
                        }}>
                          {threat.badge}
                        </span>

                        {isSilent && (
                          <span style={{
                            background: '#000000',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}>
                            🤫 SILENT PANIC (NO SIREN)
                          </span>
                        )}

                        {inc.is_live_tracking && (
                          <span style={{
                            background: '#052e16',
                            color: '#4ade80',
                            border: '1px solid #22c55e',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            animation: 'liveRadarGlow 2s infinite',
                          }}>
                            <span style={{ animation: 'liveTargetBeacon 1s infinite' }}>🟢</span> LIVE RADAR
                          </span>
                        )}

                        {(inc.camera_feed_active || inc.media_url) && (
                          <span style={{
                            background: '#450a0a',
                            color: '#fca5a5',
                            border: '1px solid #ef4444',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}>
                            📹 CAM
                          </span>
                        )}

                        {inc.audio_feed_active && (
                          <span style={{
                            background: '#064e3b',
                            color: '#6ee7b7',
                            border: '1px solid #10b981',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}>
                            🎙️ AUDIO
                          </span>
                        )}

                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)' }}>
                          ID: {inc.id}
                        </span>
                      </div>

                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: inc.status === 'resolved' ? 'rgba(34,197,94,0.2)' : inc.status === 'dispatched' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: inc.status === 'resolved' ? '#86efac' : inc.status === 'dispatched' ? '#fde047' : '#fca5a5',
                      }}>
                        ● {inc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                      {inc.category}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                      {inc.description}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--gold-light)' }}>
                        📍 <strong>{inc.location}</strong>
                        {inc.latitude && inc.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${inc.latitude},${inc.longitude}&z=18`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ marginLeft: '0.4rem', color: '#60a5fa', fontSize: '0.68rem', fontWeight: 800, textDecoration: 'none', background: 'rgba(96,165,250,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}
                          >
                            🗺️ Map
                          </a>
                        )}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Assigned: <strong>{inc.assigned_agency || 'Pending'}</strong> {inc.responding_unit ? `(${inc.responding_unit})` : ''}
                      </span>
                      {inc.is_live_tracking ? (
                        <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '0.7rem' }}>
                          ⚡ {inc.speed ? `${inc.speed} km/h` : 'Moving'} · Pinged {inc.last_ping_at ? new Date(inc.last_ping_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live'}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                          🕒 {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Tactical Dispatch Control Panel */}
          {activeIncident && (
            <div style={{
              background: 'rgba(18,10,7,0.95)',
              border: '1px solid var(--gold)',
              borderRadius: '8px',
              padding: '1.5rem',
              position: 'sticky',
              top: '100px',
              height: 'fit-content',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)', paddingBottom: '0.8rem' }}>
                <div>
                  <span className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>TACTICAL INCIDENT DISPATCH</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{activeIncident.id}</div>
                </div>
                <button
                  onClick={() => setActiveIncident(null)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Threat Alert Badge */}
              <div style={{
                background: activeIncident.threat_level === 'CODE_RED' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.15)',
                border: `1px solid ${activeIncident.threat_level === 'CODE_RED' ? '#ef4444' : '#eab308'}`,
                padding: '0.8rem',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: activeIncident.threat_level === 'CODE_RED' ? '#fca5a5' : '#fde047' }}>
                  {activeIncident.threat_level === 'CODE_RED' ? '🚨 TACTICAL ARMED INCIDENT' : '⚠️ CIVIC SAFETY ALERT'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#f5edd8', marginTop: '0.2rem' }}>
                  {activeIncident.is_silent_panic ? 'CRITICAL: Citizen activated SILENT PANIC. Approach covertly without sirens.' : 'Direct response requested.'}
                </div>
              </div>

              {/* Details breakdown */}
              <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.78rem', marginBottom: '1.2rem' }}>
                <div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Location: </span>
                  <span style={{ color: '#ffffff' }}>{activeIncident.location}</span>
                </div>

                {/* ── Citizen Live Tactical Camera & Audio Surveillance Feed ── */}
                {(activeIncident.camera_feed_active || activeIncident.audio_feed_active || activeIncident.media_url) && (
                  <div
                    style={{
                      background: 'linear-gradient(180deg, rgba(35, 10, 10, 0.95) 0%, rgba(18, 6, 6, 0.98) 100%)',
                      border: '2px solid #ef4444',
                      borderRadius: '8px',
                      padding: '0.9rem',
                      boxShadow: '0 0 25px rgba(239, 68, 68, 0.35)',
                      animation: 'pulseGlow 2.5s infinite',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'liveTargetBeacon 0.8s infinite' }} />
                        <span>CITIZEN LIVE TACTICAL SURVEILLANCE FEED</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {(activeIncident.camera_feed_active || activeIncident.media_url) && (
                          <span style={{ fontSize: '0.62rem', background: '#ef4444', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: 800 }}>
                            📹 CAM LIVE
                          </span>
                        )}
                        {activeIncident.audio_feed_active && (
                          <span style={{ fontSize: '0.62rem', background: '#10b981', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: 800 }}>
                            🎙️ MIC LIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Camera Snapshot / Video Stream Frame */}
                    {(activeIncident.camera_feed_active || activeIncident.media_url) && (
                      <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(239,68,68,0.5)', background: '#000000', marginBottom: '0.6rem' }}>
                        {activeIncident.media_url ? (
                          <img
                            src={activeIncident.media_url}
                            alt="Live Citizen Camera Evidence Feed"
                            style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => setFullscreenMedia(activeIncident.media_url)}
                          />
                        ) : (
                          <div style={{ height: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fca5a5', fontSize: '0.75rem', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.8rem' }}>📡</span>
                            <span>Citizen Camera Active · Awaiting First Frame Packet...</span>
                          </div>
                        )}

                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.75)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem', color: '#f87171', fontWeight: 800 }}>
                          SECURE TACTICAL UPLINK · CITIZEN IN DISTRESS
                        </div>

                        {activeIncident.media_url && (
                          <button
                            type="button"
                            onClick={() => setFullscreenMedia(activeIncident.media_url)}
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              background: 'rgba(0,0,0,0.75)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              color: '#fff',
                              borderRadius: '4px',
                              padding: '2px 7px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🔍 Fullscreen View
                          </button>
                        )}
                      </div>
                    )}

                    {/* Ambient Audio Monitor Bar */}
                    {activeIncident.audio_feed_active && (
                      <div style={{ background: 'rgba(6, 78, 59, 0.45)', border: '1px solid #10b981', borderRadius: '6px', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>🎙️</span>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6ee7b7' }}>
                              AMBIENT AUDIO SURVEILLANCE ACTIVE
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#a7f3d0' }}>
                              Citizen device is silently streaming background audio & acoustics.
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '18px' }}>
                          {[40, 75, 100, 60, 85, 45, 90, 65].map((h, idx) => (
                            <span
                              key={idx}
                              style={{
                                width: '3px',
                                height: `${h}%`,
                                background: '#10b981',
                                borderRadius: '1px',
                                animation: `liveTargetBeacon ${0.4 + idx * 0.1}s infinite alternate`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '0.64rem', color: '#fca5a5', marginTop: '0.4rem', textAlign: 'center' }}>
                      ⚡ Feeds are verified & saved in Palace Command Evidence Log for prosecution.
                    </div>
                  </div>
                )}

                {/* ── Real-Time Live Radar HUD (When is_live_tracking is active) ── */}
                {activeIncident.is_live_tracking && (
                  <div style={{
                    background: 'rgba(5, 46, 22, 0.6)',
                    border: '2px solid #22c55e',
                    borderRadius: '6px',
                    padding: '0.8rem',
                    animation: 'liveRadarGlow 2s infinite',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ animation: 'liveTargetBeacon 1s infinite' }}>🟢</span> LIVE MOVING TARGET RADAR
                      </span>
                      <span style={{ fontSize: '0.65rem', background: '#22c55e', color: '#052e16', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 800 }}>
                        STREAMING
                      </span>
                    </div>

                    {/* Telemetry Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', textAlign: 'center', margin: '0.5rem 0' }}>
                      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.58rem', color: '#86efac' }}>SPEED</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffffff' }}>
                          {activeIncident.speed !== null && activeIncident.speed !== undefined ? `${activeIncident.speed} km/h` : 'Moving'}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.58rem', color: '#86efac' }}>HEADING</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffffff' }}>
                          {activeIncident.heading ? `${Math.round(activeIncident.heading)}°` : 'Tracked'}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.58rem', color: '#86efac' }}>ACCURACY</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffffff' }}>
                          ±{activeIncident.accuracy || 5}m
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.35rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.58rem', color: '#86efac' }}>BREADCRUMBS</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffffff' }}>
                          {breadcrumbs.length} pings
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: '#bbf7d0', marginTop: '0.2rem' }}>
                      Citizen is perpetually streaming live movement coordinates. Map auto-centers on each live update.
                    </div>
                  </div>
                )}

                {/* ── Google Maps (Auto-re-centers on live coords) ── */}
                {activeIncident.latitude && activeIncident.longitude && (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {/* Embedded map — auto updates when coords change */}
                    <iframe
                      key={`${activeIncident.latitude}-${activeIncident.longitude}-${liveRefreshKey}`}
                      title="incident-map"
                      width="100%"
                      height="220"
                      frameBorder="0"
                      style={{
                        borderRadius: '6px',
                        border: activeIncident.is_live_tracking ? '2px solid #22c55e' : '2px solid #ef4444',
                        display: 'block',
                      }}
                      src={`https://maps.google.com/maps?q=${activeIncident.latitude},${activeIncident.longitude}&z=17&output=embed`}
                      allowFullScreen
                    />

                    {/* Turn-by-Turn Intercept Navigation Button (Crucial for Police/Patrol units) */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeIncident.latitude},${activeIncident.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        background: activeIncident.is_live_tracking ? '#16a34a' : '#1a73e8',
                        color: '#ffffff',
                        padding: '0.65rem 1rem',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        letterSpacing: 0.3,
                        boxShadow: activeIncident.is_live_tracking ? '0 0 15px rgba(34,197,94,0.4)' : 'none',
                      }}
                    >
                      {activeIncident.is_live_tracking ? '⚡ Intercept Moving Target (Turn-by-Turn Navigation) →' : '🗺️ Open Full Incident Location on Google Maps →'}
                    </a>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
                      {/* CCTV Camera Radius Scanner */}
                      <button
                        onClick={handleScanCctv}
                        style={{
                          background: '#374151',
                          border: '1px solid #9ca3af',
                          color: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        📹 Scan CCTV (1km)
                      </button>

                      {/* Guardian Family Link */}
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/track/${activeIncident.id}`;
                          navigator.clipboard.writeText(url);
                          alert(`Guardian Radar Link copied to clipboard:\n${url}\n\nSend to victim's family / next-of-kin via SMS or WhatsApp.`);
                        }}
                        style={{
                          background: '#065f46',
                          border: '1px solid #34d399',
                          color: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        🔗 Guardian Link
                      </button>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                      Live GPS: {Number(activeIncident.latitude).toFixed(5)}°N, {Number(activeIncident.longitude).toFixed(5)}°E
                      {activeIncident.last_ping_at && ` · Last ping: ${new Date(activeIncident.last_ping_at).toLocaleTimeString()}`}
                    </div>

                    {/* Breadcrumbs Route History Trail */}
                    {breadcrumbs.length > 1 && (
                      <div style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        marginTop: '0.3rem',
                      }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.3rem' }}>
                          📍 MOVEMENT TRAIL ({breadcrumbs.length} RECORDED PINGS)
                        </div>
                        <div style={{ maxHeight: '90px', overflowY: 'auto', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                          {breadcrumbs.slice(-8).reverse().map((b, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span>#{breadcrumbs.length - idx}: {Number(b.latitude).toFixed(5)}°N, {Number(b.longitude).toFixed(5)}°E</span>
                              <span style={{ color: '#86efac' }}>{b.speed ? `${b.speed} km/h` : ''} · {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Reporter: </span>
                  <span style={{ color: '#ffffff' }}>{activeIncident.reporter_name || 'Anonymous'}</span>
                  {activeIncident.reporter_phone && (
                    <a href={`tel:${activeIncident.reporter_phone}`} style={{ marginLeft: '0.5rem', color: '#86efac', textDecoration: 'none', fontWeight: 700 }}>
                      📞 Call {activeIncident.reporter_phone}
                    </a>
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Telemetry Description: </span>
                  <p style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '4px', color: '#f5edd8', marginTop: '0.3rem', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    {activeIncident.description}
                  </p>
                </div>
              </div>


              {/* Dispatch Controls */}
              <div style={{ borderTop: '1px solid rgba(201,150,58,0.2)', paddingTop: '1rem', display: 'grid', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Assign Primary Responding Agency:
                  </label>
                  <select
                    value={dispatchAgency}
                    onChange={e => setDispatchAgency(e.target.value)}
                    style={{ width: '100%', background: '#1c100b', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}
                  >
                    <option value="Police">Nigeria Police Force (Ogere DPO)</option>
                    <option value="FRSC">FRSC Expressway Rescue (122)</option>
                    <option value="So-Safe">So-Safe Corps (Ogun State)</option>
                    <option value="Palace Vigilante">Palace Vigilante Command</option>
                    <option value="Fire Service">Fire & Rescue Service</option>
                    <option value="Joint Taskforce">Joint Taskforce (Police + Vigilante)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Tactical Unit Call-Sign / Responders:
                  </label>
                  <input
                    type="text"
                    value={dispatchUnit}
                    onChange={e => setDispatchUnit(e.target.value)}
                    placeholder="E.g. Patrol Alpha 01 / DPO Team 2"
                    style={{ width: '100%', background: '#1c100b', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Agency Incident Notes / SITREP:
                  </label>
                  <textarea
                    rows={2}
                    value={agencyNotes}
                    onChange={e => setAgencyNotes(e.target.value)}
                    placeholder="Log status, suspects neutralized or fleeing, medical triage..."
                    style={{ width: '100%', background: '#1c100b', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}
                  />
                </div>

                {/* Dispatch Status Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('dispatched')}
                    style={{
                      background: '#d97706',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    🚀 Dispatch Unit
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('on_scene')}
                    style={{
                      background: '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📍 Unit On Scene
                  </button>

                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('resolved')}
                    style={{
                      background: '#16a34a',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      gridColumn: 'span 2',
                    }}
                  >
                    ✅ Mark Situation Secured / Resolved
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Rapid Manual Incident Dispatch Form */}
        {newIncidentForm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}>
            <div style={{
              background: '#160b08',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 0 40px rgba(239,68,68,0.4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚨</span>
                  <div className="cinzel" style={{ fontSize: '1rem', fontWeight: 900, color: '#ef4444' }}>
                    LOG TACTICAL EMERGENCY ALERT
                  </div>
                </div>
                <button
                  onClick={() => setNewIncidentForm(false)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleManualDispatch} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Threat Category *
                  </label>
                  <select
                    value={manualReport.category}
                    onChange={e => setManualReport({ ...manualReport, category: e.target.value })}
                    style={{ width: '100%', background: '#25120d', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.6rem', borderRadius: '4px' }}
                  >
                    <option value="Armed Robbery / Banditry">Armed Robbery / Banditry</option>
                    <option value="Terrorism / Gunfire Attack">Terrorism / Gunfire Attack</option>
                    <option value="Kidnapping along Expressway">Kidnapping along Expressway</option>
                    <option value="Fuel Tanker Explosion / Spill">Fuel Tanker Explosion / Spill</option>
                    <option value="CNG Pipeline Gas Leak">CNG Pipeline Gas Leak</option>
                    <option value="Mass Casualty Highway Crash">Mass Casualty Highway Crash</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Threat Priority Level *
                  </label>
                  <select
                    value={manualReport.threatLevel}
                    onChange={e => setManualReport({ ...manualReport, threatLevel: e.target.value })}
                    style={{ width: '100%', background: '#25120d', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.6rem', borderRadius: '4px' }}
                  >
                    <option value="CODE_RED">🔴 CODE RED (Armed Robbery / Terrorism / Life Threatening)</option>
                    <option value="CODE_ORANGE">🟠 CODE ORANGE (Tanker Explosion / Hazard)</option>
                    <option value="CODE_YELLOW">🟡 CODE YELLOW (Standard Incident)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Incident Sector / Corridor *
                  </label>
                  <select
                    value={manualReport.location}
                    onChange={e => setManualReport({ ...manualReport, location: e.target.value })}
                    style={{ width: '100%', background: '#25120d', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.6rem', borderRadius: '4px' }}
                  >
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Situation Details / Actionable Intelligence *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={manualReport.description}
                    onChange={e => setManualReport({ ...manualReport, description: e.target.value })}
                    placeholder="Details: weapons observed, vehicle plates, direction of flight, number of casualties..."
                    style={{ width: '100%', background: '#25120d', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.6rem', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Primary Lead Agency
                  </label>
                  <select
                    value={manualReport.assignedAgency}
                    onChange={e => setManualReport({ ...manualReport, assignedAgency: e.target.value })}
                    style={{ width: '100%', background: '#25120d', color: '#f5edd8', border: '1px solid rgba(201,150,58,0.3)', padding: '0.6rem', borderRadius: '4px' }}
                  >
                    <option value="Police">Nigeria Police Force (NPF)</option>
                    <option value="FRSC">FRSC Expressway Command</option>
                    <option value="So-Safe">So-Safe Corps</option>
                    <option value="Palace Vigilante">Palace Vigilante Command</option>
                    <option value="All Agencies Broadcast">Broadcast to All Agencies</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setNewIncidentForm(false)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    style={{ background: '#b91c1c', border: 'none', color: '#ffffff', padding: '0.6rem 1.4rem', borderRadius: '4px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    {isUpdating ? 'Transmitting...' : 'Transmit Alert Now →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ── MODAL 1: Palace Amber Alert & Curfew Dispatcher ── */}
        {showBroadcastModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#1a1008', border: '2px solid #f59e0b', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '540px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="cinzel" style={{ fontSize: '1.1rem', color: '#f59e0b', margin: 0 }}>
                  📢 DISPATCH PALACE AMBER ALERT / CURFEW
                </h3>
                <button onClick={() => setShowBroadcastModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateBroadcast} style={{ display: 'grid', gap: '0.9rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Broadcast Headline / Alert Title *</label>
                  <input
                    required
                    value={broadcastForm.title}
                    onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g. Urgent: Armed Highway Siege near KM 67 / Curfew Enforced"
                    style={{ width: '100%', background: '#25120d', color: '#ffffff', border: '1px solid #f59e0b', padding: '0.6rem', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Severity Level</label>
                    <select
                      value={broadcastForm.severity}
                      onChange={e => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                      style={{ width: '100%', background: '#25120d', color: '#ffffff', border: '1px solid #f59e0b', padding: '0.6rem', borderRadius: '4px' }}
                    >
                      <option value="CRITICAL">🔴 CRITICAL (Hostage/Armed Robbery)</option>
                      <option value="CURFEW">⚠️ TOWN CURFEW (Night Movement Ban)</option>
                      <option value="ADVISORY">🟡 CIVIC ADVISORY (Weather/Roadblock)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Duration (Hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={broadcastForm.durationHours}
                      onChange={e => setBroadcastForm({ ...broadcastForm, durationHours: e.target.value })}
                      style={{ width: '100%', background: '#25120d', color: '#ffffff', border: '1px solid #f59e0b', padding: '0.6rem', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Target Sector</label>
                  <input
                    value={broadcastForm.targetSector}
                    onChange={e => setBroadcastForm({ ...broadcastForm, targetSector: e.target.value })}
                    placeholder="e.g. Lagos-Ibadan Expressway Corridor / All Sectors"
                    style={{ width: '100%', background: '#25120d', color: '#ffffff', border: '1px solid #f59e0b', padding: '0.6rem', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#fde047', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Public Safety Directive / Actionable Advice *</label>
                  <textarea
                    required
                    rows={3}
                    value={broadcastForm.message}
                    onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    placeholder="Instruct citizens what to do: 'Stay indoors. Avoid Tollgate bypass. Joint Military & Police taskforce dispatched...'"
                    style={{ width: '100%', background: '#25120d', color: '#ffffff', border: '1px solid #f59e0b', padding: '0.6rem', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowBroadcastModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isUpdating} style={{ background: '#d97706', border: 'none', color: '#ffffff', padding: '0.5rem 1.2rem', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>
                    {isUpdating ? 'Publishing...' : 'Broadcast to All Citizen Apps ➔'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: Private CCTV Surveillance Scanner ── */}
        {showCctvModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#111827', border: '2px solid #3b82f6', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '620px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '0.6rem' }}>
                <div>
                  <h3 className="cinzel" style={{ fontSize: '1.1rem', color: '#60a5fa', margin: 0 }}>
                    📹 REGISTERED CCTV CAMERAS SCANNER
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                    Scanning 1km radius around: {activeIncident?.location} ({Number(activeIncident?.latitude).toFixed(4)}°N, {Number(activeIncident?.longitude).toFixed(4)}°E)
                  </div>
                </div>
                <button onClick={() => setShowCctvModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              {loadingCctv ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#93c5fd' }}>Scanning Palace CCTV Database...</div>
              ) : nearbyCctv.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>No registered private cameras found within 1.5km of this sector.</div>
              ) : (
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  {nearbyCctv.map((c, idx) => (
                    <div key={c.id || idx} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', padding: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff' }}>{c.business_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>📍 {c.location} ({c.camera_count} cameras)</div>
                        </div>
                        <a href={`tel:${c.phone}`} style={{ background: '#2563eb', color: '#ffffff', padding: '0.3rem 0.7rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 800 }}>
                          📞 Call: {c.phone}
                        </a>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#d1d5db', marginTop: '0.4rem' }}>
                        <strong>Coverage Angle:</strong> {c.coverage_direction}
                      </div>
                      {c.notes && (
                        <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                          Spec: {c.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL 3: Cryptographic Whistleblower Intel Queue ── */}
        {showTipsModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0f172a', border: '2px solid #6366f1', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(99,102,241,0.3)', paddingBottom: '0.6rem' }}>
                <div>
                  <h3 className="cinzel" style={{ fontSize: '1.1rem', color: '#818cf8', margin: 0 }}>
                    🕵️ CRYPTOGRAPHIC ANONYMOUS WHISTLEBLOWER INTEL
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                    End-to-End Encrypted Citizen Intel ({tips.length} reports logged)
                  </div>
                </div>
                <button onClick={() => { setShowTipsModal(false); setSelectedTip(null); }} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              {selectedTip ? (
                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '6px' }}>
                  <button onClick={() => setSelectedTip(null)} style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
                    ← Back to Tips Queue
                  </button>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 800 }}>TOKEN: {selectedTip.tip_token}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', margin: '0.3rem 0' }}>{selectedTip.category} · {selectedTip.sector}</div>
                  <p style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '4px', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {selectedTip.description}
                  </p>

                  <form onSubmit={handleUpdateTipSitrep} style={{ marginTop: '1rem', display: 'grid', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>Update Investigation Status</label>
                    <select
                      value={tipStatus}
                      onChange={e => setTipStatus(e.target.value)}
                      style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #6366f1', padding: '0.5rem', borderRadius: '4px' }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing by DPO / Palace</option>
                      <option value="investigating">Tactical Investigation Active</option>
                      <option value="resolved">Action Taken / Resolved</option>
                    </select>

                    <label style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>Encrypted SITREP Reply (Visible to Informant via Token)</label>
                    <textarea
                      rows={3}
                      value={tipSitrep}
                      onChange={e => setTipSitrep(e.target.value)}
                      placeholder="e.g. Undercover operatives dispatched to inspect the abandoned warehouse along Agbele road..."
                      style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #6366f1', padding: '0.5rem', borderRadius: '4px' }}
                    />
                    <button type="submit" disabled={isUpdating} style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.6rem', borderRadius: '4px', fontWeight: 800, cursor: 'pointer' }}>
                      {isUpdating ? 'Saving...' : 'Transmit Encrypted SITREP ➔'}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {tips.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>No whistleblower tips received yet.</div>
                  ) : (
                    tips.map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTip(t); setTipStatus(t.status); setTipSitrep(t.officer_response || ''); }}
                        style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '0.8rem', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818cf8' }}>{t.tip_token}</span>
                          <span style={{ fontSize: '0.65rem', background: t.status === 'resolved' ? '#166534' : '#1e1b4b', color: '#c7d2fe', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                            ● {t.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{t.category} ({t.sector})</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL 4: Night Patrol Flashpoints Live Roster ── */}
        {showPatrolModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#06281e', border: '2px solid #10b981', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '0.6rem' }}>
                <div>
                  <h3 className="cinzel" style={{ fontSize: '1.1rem', color: '#34d399', margin: 0 }}>
                    🛡️ VIGILANTE NIGHT PATROL CHECK-IN ROSTER
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                    Geofenced check-in status across 4 strategic night flashpoints
                  </div>
                </div>
                <button onClick={() => setShowPatrolModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Strategic Outpost Cards */}
              <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {(patrolData.outposts || []).map(o => {
                  const lastCheckin = (patrolData.recentCheckins || []).find(c => c.outpost_name === o.name);
                  return (
                    <div key={o.id} style={{ background: '#0b3b2c', border: '1px solid #059669', borderRadius: '6px', padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff' }}>{o.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>
                          GPS: {o.lat}°N, {o.lng}°E
                        </div>
                        {lastCheckin ? (
                          <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '0.2rem' }}>
                            ✓ Verified Active: {lastCheckin.officer_name} ({lastCheckin.agency}) · {new Date(lastCheckin.checked_in_at).toLocaleTimeString()}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.68rem', color: '#fca5a5', marginTop: '0.2rem' }}>
                            ⚠️ Awaiting next hourly check-in
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', background: lastCheckin ? '#10b981' : '#dc2626', color: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                        {lastCheckin ? 'MANNED' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.5rem' }}>
                Recent Check-In Activity Log
              </div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', fontSize: '0.68rem', color: '#d1fae5' }}>
                {(patrolData.recentCheckins || []).map((rc, idx) => (
                  <div key={rc.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>{rc.officer_name} ({rc.agency}) — {rc.outpost_name}</span>
                    <span style={{ color: '#34d399' }}>{new Date(rc.checked_in_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Citizen Surveillance Media Modal */}
        {fullscreenMedia && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.95)',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setFullscreenMedia(null)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '85vh',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000',
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenMedia}
                alt="High Definition Tactical Snapshot"
                style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
              />
              <div
                style={{
                  padding: '0.8rem 1.2rem',
                  background: 'rgba(15, 6, 6, 0.95)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#f87171', fontWeight: 900, fontSize: '0.85rem' }}>
                    🔴 CITIZEN LIVE EVIDENCE TRANSMISSION
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
                    Incident ID: {activeIncident?.id} · {activeIncident?.location}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreenMedia(null)}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '0.4rem 1rem',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Close View
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
