import { useState, useEffect, useRef } from 'react';
import ActiveDispatchTerminal from '../components/ActiveDispatchTerminal';
import IncidentListPanel from '../components/IncidentListPanel';
import SecurityMetricCards from '../components/SecurityMetricCards';
import SecurityDashboardHeader from '../components/SecurityDashboardHeader';
import SEO from '../components/SEO';
import { apiRequest } from '../services/apiClient';
import Section from '../components/Section';
import sirenSound from '../services/sirenSound';
import TacticalRadarMap from '../components/TacticalRadarMap';
import { resolveOgereLocation, getOgereMapUrls } from '../services/ogereGeoEngine';
import { OGERE_STATIONS, ONBOARDED_OFFICERS, getStationById, getOfficerById } from '../services/securityUnits';
import { autoRouteIncident, claimIncident, reassignIncident, getIncidentClaim } from '../services/dispatchRouter';
import { RADIO_CHANNELS, getTacticalMessages, sendTacticalMessage, playRadioSquelchSound } from '../services/tacticalComms';

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

function SlaBadge({ incident }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!incident) return null;

  if (incident.status === 'resolved') {
    return (
      <span style={{
        fontSize: '0.62rem',
        fontWeight: 800,
        padding: '0.15rem 0.45rem',
        borderRadius: '4px',
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#86efac',
        border: '1px solid #16a34a',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
      }}>
        ✓ SLA MET
      </span>
    );
  }

  const targetMinutes = incident.sla_target_minutes || (
    incident.threat_level === 'CODE_RED' ? 3 :
    incident.threat_level === 'CODE_ORANGE' ? 5 : 15
  );

  const createdAtTime = new Date(incident.created_at || Date.now()).getTime();
  const deadline = createdAtTime + targetMinutes * 60 * 1000;
  const diffSecs = Math.floor((deadline - now) / 1000);
  const isBreached = diffSecs <= 0;
  const absSecs = Math.abs(diffSecs);
  const mins = Math.floor(absSecs / 60);
  const secs = absSecs % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <span style={{
      fontSize: '0.62rem',
      fontWeight: 900,
      padding: '0.15rem 0.45rem',
      borderRadius: '4px',
      background: isBreached ? 'rgba(239, 68, 68, 0.25)' : diffSecs < 120 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(34, 197, 94, 0.2)',
      color: isBreached ? '#ef4444' : diffSecs < 120 ? '#f59e0b' : '#4ade80',
      border: `1px solid ${isBreached ? '#ef4444' : diffSecs < 120 ? '#f59e0b' : '#22c55e'}`,
      letterSpacing: '0.04em',
      animation: isBreached ? 'codeRedFlash 1s infinite' : 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      <span>⏱️</span>
      <span>{isBreached ? `SLA BREACHED (-${formatted})` : `SLA: ${formatted}`}</span>
    </span>
  );
}

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
  const [dashboardMapMode, setDashboardMapMode] = useState('hybrid'); // 'hybrid' (satellite) or 'roadmap'
  const [newIncidentForm, setNewIncidentForm] = useState(false);
  const [manualReport, setManualReport] = useState({
    category: 'Armed Robbery / Banditry',
    threatLevel: 'CODE_RED',
    location: SECTORS[0],
    description: '',
    reporterName: 'Command Dispatch Officer',
    assignedAgency: 'Police',
  });

  // AI Routing, Tactical Radio & Case Claiming States
  const [claimedIncidents, setClaimedIncidents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ogere_incident_claims') || '{}');
    } catch (_) {
      return {};
    }
  });
  const [tacticalChannel, setTacticalChannel] = useState('all-units');
  const [tacticalMsgs, setTacticalMsgs] = useState(() => getTacticalMessages('all-units'));
  const [tacticalInput, setTacticalInput] = useState('');
  const [adminSelectedStation, setAdminSelectedStation] = useState(OGERE_STATIONS[0].id);

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

  const handleAdminReassign = (incidentId) => {
    const reassigned = reassignIncident(incidentId, adminSelectedStation, null, 'HQ Admin Dispatcher');
    setClaimedIncidents((prev) => ({
      ...prev,
      [incidentId]: reassigned,
    }));
    playRadioSquelchSound();
  };

  const handleSendAdminTactical = (e) => {
    if (e) e.preventDefault();
    if (!tacticalInput.trim()) return;
    const msg = sendTacticalMessage({
      channel: tacticalChannel,
      senderId: 'off-001',
      text: `[HQ DISPATCH]: ${tacticalInput.trim()}`,
      radioCode: '10-4',
    });
    setTacticalMsgs((prev) => [...prev, msg]);
    setTacticalInput('');
  };

  const fetchIncidents = async () => {
    try {
      let url = `/api/incidents?limit=60`;
      if (selectedAgency !== 'all') url += `&agency=${encodeURIComponent(selectedAgency)}`;
      if (threatFilter !== 'all') url += `&threat=${encodeURIComponent(threatFilter)}`;
      if (statusFilter !== 'all') url += `&status=${encodeURIComponent(statusFilter)}`;

      const data = await apiRequest(url);
      if (data) {
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
      const data = await apiRequest('/api/broadcasts');
      if (data) setBroadcasts(data.broadcasts || []);
    } catch (_) {}
  };

  // Fetch anonymous whistleblower tips
  const fetchTips = async () => {
    try {
      const data = await apiRequest('/api/whistleblower');
      if (data) setTips(data.tips || []);
    } catch (_) {}
  };

  // Fetch night patrol outposts & check-ins
  const fetchPatrolData = async () => {
    try {
      const data = await apiRequest('/api/patrol-checkin');
      if (data) setPatrolData(data);
    } catch (_) {}
  };

  // Scan CCTV cameras within 1km of incident coordinates
  const handleScanCctv = async () => {
    if (!activeIncident?.latitude || !activeIncident?.longitude) return;
    setLoadingCctv(true);
    setShowCctvModal(true);
    try {
      const data = await apiRequest(`/api/cctv?lat=${activeIncident.latitude}&lng=${activeIncident.longitude}&radiusKm=1.5`);
      if (data) setNearbyCctv(data.cameras || []);
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
      const data = await apiRequest('/api/broadcasts', {
        method: 'POST',
        body: broadcastForm,
      });
      if (data) {
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
      const data = await apiRequest('/api/broadcasts', { method: 'PATCH', body: { id, isActive: false } });
      if (data) fetchBroadcasts();
    } catch (_) {}
  };

  // Update anonymous tip SITREP
  const handleUpdateTipSitrep = async (e) => {
    e.preventDefault();
    if (!selectedTip) return;
    setIsUpdating(true);
    try {
      const data = await apiRequest('/api/whistleblower', {
        method: 'PATCH',
        body: {
          tipToken: selectedTip.tip_token,
          status: tipStatus,
          officerResponse: tipSitrep,
        },
      });
      if (data) {
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
        const data = await apiRequest(`/api/live-location?incidentId=${encodeURIComponent(activeIncident.id)}`);
        if (data) {
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

    const handleClaimEvent = (e) => {
      if (e.detail?.incidentId) {
        setClaimedIncidents((prev) => ({
          ...prev,
          [e.detail.incidentId]: e.detail,
        }));
      }
    };

    const handleRoutedEvent = (e) => {
      if (e.detail?.incidentId) {
        setClaimedIncidents((prev) => ({
          ...prev,
          [e.detail.incidentId]: {
            ...prev[e.detail.incidentId],
            ...e.detail,
          },
        }));
      }
    };

    const handleTacticalEvent = (e) => {
      if (e.detail) {
        setTacticalMsgs((prev) => {
          if (prev.some((m) => m.id === e.detail.id)) return prev;
          return [...prev, e.detail];
        });
      }
    };

    window.addEventListener('ogere-sos-triggered', handleSosEvent);
    window.addEventListener('ogere-incident-claimed', handleClaimEvent);
    window.addEventListener('ogere-incident-routed', handleRoutedEvent);
    window.addEventListener('ogere-incident-reassigned', handleRoutedEvent);
    window.addEventListener('ogere-tactical-msg', handleTacticalEvent);

    return () => {
      window.removeEventListener('ogere-sos-triggered', handleSosEvent);
      window.removeEventListener('ogere-incident-claimed', handleClaimEvent);
      window.removeEventListener('ogere-incident-routed', handleRoutedEvent);
      window.removeEventListener('ogere-incident-reassigned', handleRoutedEvent);
      window.removeEventListener('ogere-tactical-msg', handleTacticalEvent);
    };
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 8000); // Poll every 8 seconds
    return () => {
      clearInterval(interval);
      stopAlarm(); // Ensure alarm stops on unmount
    };
  }, [selectedAgency, threatFilter, statusFilter, audioEnabled]);



  const [newSitrepText, setNewSitrepText] = useState('');

  const handleUpdateStatus = async (newStatus, customSitrep = null) => {
    if (!activeIncident) return;
    setIsUpdating(true);
    try {
      const data = await apiRequest('/api/incidents', {
        method: 'PATCH',
        body: {
          id: activeIncident.id,
          status: newStatus,
          assignedAgency: dispatchAgency,
          respondingUnit: dispatchUnit || activeIncident.responding_unit,
          agencyNotes: agencyNotes || activeIncident.agency_notes,
          sitrepMessage: customSitrep || (newStatus === 'resolved' ? 'Incident resolved and situation neutralized.' : `Status updated to ${newStatus}.`),
          sitrepAuthor: 'Command Dispatcher (Police / Palace)',
        },
      });

      if (data) {
        const updated = data;
        setActiveIncident(updated.incident);
        fetchIncidents();
        if (newStatus === 'resolved') {
          sirenSound.playAllClearChime();
        } else {
          sirenSound.playSonarPing();
        }
      }
    } catch (err) {
      alert('Error updating incident dispatch: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRadioSitrep = async () => {
    if (!newSitrepText.trim() || !activeIncident) return;
    await handleUpdateStatus(activeIncident.status, newSitrepText.trim());
    setNewSitrepText('');
  };

  // Tactical Dispatcher Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (activeIncident && activeIncident.status === 'open') {
          handleUpdateStatus('investigating');
        }
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        if (activeIncident) {
          handleUpdateStatus('dispatched');
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        const next = !audioEnabled;
        setAudioEnabled(next);
        if (next && codeRedCount > 0) triggerAudioAlarm(true);
        if (!next) stopAlarm();
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        setShowBroadcastModal((b) => !b);
      } else if (e.code === 'Digit1') {
        setThreatFilter('all');
      } else if (e.code === 'Digit2') {
        setThreatFilter('CODE_RED');
      } else if (e.code === 'Digit3') {
        setThreatFilter('CODE_ORANGE');
      } else if (e.code === 'Digit4') {
        setThreatFilter('CODE_YELLOW');
      } else if (e.code === 'Escape') {
        setActiveIncident(null);
        setShowBroadcastModal(false);
        setShowTipsModal(false);
        setShowPatrolModal(false);
        setNewIncidentForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIncident, audioEnabled, codeRedCount, dispatchAgency, dispatchUnit, agencyNotes]);

  const handleManualDispatch = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const data = await apiRequest('/api/incidents', {
        method: 'POST',
        body: {
          category: manualReport.category,
          threatLevel: manualReport.threatLevel,
          severity: 'Critical',
          location: manualReport.location,
          description: manualReport.description,
          reporterName: manualReport.reporterName,
          assignedAgency: manualReport.assignedAgency,
          isSos: true,
        },
      });

      if (data) {
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

      <SecurityDashboardHeader
        codeRedCount={codeRedCount}
        audioEnabled={audioEnabled}
        stopAlarm={stopAlarm}
        setAudioEnabled={setAudioEnabled}
        triggerAudioAlarm={triggerAudioAlarm}
        setShowBroadcastModal={setShowBroadcastModal}
        setShowTipsModal={setShowTipsModal}
        setShowPatrolModal={setShowPatrolModal}
        setNewIncidentForm={setNewIncidentForm}
        tips={tips}
      />

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
        <SecurityMetricCards
          codeRedCount={codeRedCount}
          activeDispatched={activeDispatched}
          totalOpen={totalOpen}
        />

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

        {/* Tactical Command Hotkeys Ribbon */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(201, 150, 58, 0.3)',
          borderRadius: '8px',
          padding: '0.6rem 1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.8rem',
          fontSize: '0.72rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.05em' }}>
              ⌨️ TACTICAL HOTKEYS:
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>
              <kbd style={{ background: '#334155', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569' }}>SPACE</kbd> Triage
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>
              <kbd style={{ background: '#334155', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569' }}>D</kbd> Dispatch
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>
              <kbd style={{ background: '#334155', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569' }}>M</kbd> Mute/Arm Siren
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>
              <kbd style={{ background: '#334155', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569' }}>B</kbd> Broadcast
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>
              <kbd style={{ background: '#334155', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569' }}>1-4</kbd> Threat
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>
              <kbd style={{ background: '#334155', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569' }}>ESC</kbd> Clear
            </span>
          </div>
          <div style={{ color: '#86efac', fontSize: '0.68rem', fontWeight: 800 }}>
            🛰️ OGERE GIS RADAR ACTIVE · LATENCY 24ms
          </div>
        </div>

        {/* GIS Tactical Radar Canvas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <TacticalRadarMap
            incidents={displayedIncidents}
            activeIncident={activeIncident}
            onSelectIncident={(inc) => {
              setActiveIncident(inc);
              setDispatchAgency(inc.assigned_agency || 'Police');
              setDispatchUnit(inc.responding_unit || '');
              setAgencyNotes(inc.agency_notes || '');
            }}
            breadcrumbs={breadcrumbs}
          />
        </div>

        {/* Dashboard Main Grid: Incident Feed & Dispatch Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: activeIncident ? '1.2fr 1fr' : '1fr', gap: '1.5rem' }}>
          <IncidentListPanel
              loading={loading}
              displayedIncidents={displayedIncidents}
              activeIncident={activeIncident}
              setActiveIncident={setActiveIncident}
              setDispatchAgency={setDispatchAgency}
              setDispatchUnit={setDispatchUnit}
              setAgencyNotes={setAgencyNotes}
              THREAT_LEVELS={THREAT_LEVELS}
              SlaBadge={SlaBadge}
            />

          <ActiveDispatchTerminal
            activeIncident={activeIncident}
            setActiveIncident={setActiveIncident}
            dispatchAgency={dispatchAgency}
            setDispatchAgency={setDispatchAgency}
            dispatchUnit={dispatchUnit}
            setDispatchUnit={setDispatchUnit}
            agencyNotes={agencyNotes}
            setAgencyNotes={setAgencyNotes}
            AGENCIES={AGENCIES}
            isUpdating={isUpdating}
            handleUpdateStatus={handleUpdateStatus}
            handleScanCctv={handleScanCctv}
            CCTV_CAMERAS={CCTV_CAMERAS}
            claimedIncidents={claimedIncidents}
            adminSelectedStation={adminSelectedStation}
            setAdminSelectedStation={setAdminSelectedStation}
            adminRouteToStation={adminRouteToStation}
            SlaBadge={SlaBadge}
          />
        </div>

        {/* ── TACTICAL INTER-AGENCY RADIO COMMS & VOIP COMMAND NET ── */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📻</span>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.04em' }}>
                  OGERE JOINT SECURITY TACTICAL COMMS & INTERCOM NET
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Real-Time Inter-Officer Radio Grid & WhatsApp-Style Encrypted Voice Relay for All Onboarded Units
                </div>
              </div>
            </div>

            {/* Radio Channels Selector */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {RADIO_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setTacticalChannel(ch.id);
                    setTacticalMsgs(getTacticalMessages(ch.id));
                    playRadioSquelchSound();
                  }}
                  style={{
                    background: tacticalChannel === ch.id ? '#0284c7' : '#1e293b',
                    color: '#ffffff',
                    border: tacticalChannel === ch.id ? '1px solid #38bdf8' : '1px solid #334155',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {ch.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
            {/* Left: Tactical Radio Feed & HQ Dispatch Composer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.75rem',
                height: '240px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                {tacticalMsgs.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: '3px solid #38bdf8',
                      borderRadius: '4px',
                      padding: '0.45rem 0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 800 }}>
                        {msg.avatar} {msg.senderName} ({msg.senderBadge} · {msg.callsign})
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.58rem' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#fde047', fontWeight: 800 }}>
                      [{msg.radioCode}]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#f1f5f9', marginTop: '0.15rem', lineHeight: 1.35 }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendAdminTactical} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={tacticalInput}
                  onChange={(e) => setTacticalInput(e.target.value)}
                  placeholder={`Broadcast HQ SITREP on ${tacticalChannel}...`}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    color: '#ffffff',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '4px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.72rem',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0 1rem',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  📡 Transmit
                </button>
              </form>
            </div>

            {/* Right: Onboarded Active Personnel Roster */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              padding: '0.75rem',
              maxHeight: '290px',
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#4ade80', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>👥 ACTIVE ONBOARDED FIELD OFFICERS</span>
                <span style={{ fontSize: '0.6rem', color: '#86efac' }}>6 CONNECTED</span>
              </div>

              <div style={{ display: 'grid', gap: '0.45rem' }}>
                {ONBOARDED_OFFICERS.map((off) => (
                  <div
                    key={off.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      padding: '0.45rem 0.6rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc' }}>
                        {off.avatar} {off.name}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                        {off.agency.split('—')[0]} · {off.callsign} ({off.badge})
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#38bdf8', marginTop: '0.1rem' }}>
                        📍 {off.location.landmark} · 🔋 {off.battery}%
                      </div>
                    </div>

                    <a
                      href={`tel:${off.phone}`}
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>📞</span> Direct Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="cinzel" style={{ fontSize: '1.1rem', color: '#60a5fa', margin: 0 }}>
                      📹 REGISTERED CCTV CAMERAS SCANNER
                    </h3>
                    <span style={{ background: '#f59e0b', color: '#000000', fontSize: '0.62rem', fontWeight: 900, padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Live Field Simulation
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                    Scanning 1km radius around: {activeIncident?.location} ({Number(activeIncident?.latitude).toFixed(4)}°N, {Number(activeIncident?.longitude).toFixed(4)}°E) · Tactical demonstration matrix
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
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff' }}>
                            {c.name || c.business_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                            📍 {c.location} {c.camera_count ? `(${c.camera_count} cameras)` : `· ${c.sector || 'Municipal'}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {c.phone && (
                            <a href={`tel:${c.phone}`} style={{ background: '#2563eb', color: '#ffffff', padding: '0.3rem 0.7rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 800 }}>
                              📞 Call: {c.phone}
                            </a>
                          )}
                          {c.latitude && c.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}&t=k&z=19`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ background: '#0284c7', color: '#ffffff', padding: '0.3rem 0.7rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 800 }}
                            >
                              🛰️ Sat Pin
                            </a>
                          )}
                        </div>
                      </div>
                      {c.thumbnail && (
                        <div style={{ marginTop: '0.6rem', height: '110px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                          <img src={c.thumbnail} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: '4px', left: '6px', background: 'rgba(0,0,0,0.7)', color: '#38bdf8', padding: '2px 6px', borderRadius: '3px', fontSize: '0.62rem', fontFamily: 'monospace', display: 'flex', gap: '6px' }}>
                            <span>{c.resolution || '1080p 30FPS'} · {c.status || 'LIVE'}</span>
                            <span style={{ color: '#fbbf24', fontWeight: 800 }}>[SIMULATED]</span>
                          </div>
                        </div>
                      )}
                      {c.coverage_direction && (
                        <div style={{ fontSize: '0.72rem', color: '#d1d5db', marginTop: '0.4rem' }}>
                          <strong>Coverage Angle:</strong> {c.coverage_direction}
                        </div>
                      )}
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
