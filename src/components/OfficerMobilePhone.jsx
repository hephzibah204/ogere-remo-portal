import React, { useState, useEffect, useRef } from 'react';
import sirenSound from '../services/sirenSound';
import { resolveOgereLocation, getOgereMapUrls } from '../services/ogereGeoEngine';
import { OGERE_STATIONS, ONBOARDED_OFFICERS, getStationById, getOfficerById } from '../services/securityUnits';
import { autoRouteIncident, claimIncident, getIncidentClaim } from '../services/dispatchRouter';
import {
  RADIO_CHANNELS,
  getTacticalMessages,
  sendTacticalMessage,
  startOutgoingRingtone,
  stopRingtone,
  playCallConnectedSound,
  playCallEndSound,
  playRadioSquelchSound
} from '../services/tacticalComms';

const SEED_OFFICERS = [
  {
    role: 'security_officer',
    name: 'Insp. Babatunde Alabi',
    badge: 'NPF-8842',
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

const OGERE_CCTV_CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Ogere Tollgate North ANPR (Lagos-Ibadan Exp.)',
    sector: 'Sector 1 — Highway Corridor',
    location: 'KM 66.8 Lagos-Ibadan Expressway Intercept',
    latitude: 6.9388,
    longitude: 3.6437,
    agency: 'FRSC Expressway Command',
    resolution: '4K UHD · 60 FPS',
    status: 'LIVE_HD',
    anpr: true,
    thumbnail: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=60',
    plates: ['LSR-821-XA (Toyota Hilux) - Cleared', 'KJA-319-BB (Innoson Bus) - Speed 82km/h'],
  },
  {
    id: 'CAM-02',
    name: 'Aafin Ologere Palace Square (PTZ 360° Dome)',
    sector: 'Sector 2 — Central Heritage Core',
    location: 'Palace Way / Oba Council Chamber',
    latitude: 6.9372,
    longitude: 3.6335,
    agency: 'Palace Royal Guard / Vigilante',
    resolution: '1080p · 30 FPS',
    status: 'LIVE_HD',
    anpr: false,
    thumbnail: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=60',
    plates: [],
  },
  {
    id: 'CAM-03',
    name: 'Ogere Trailer Park Weighbridge & Haulage Hub',
    sector: 'Sector 1 — Highway Corridor',
    location: 'Trailer Park Bypass South Gate',
    latitude: 6.9366,
    longitude: 3.6344,
    agency: 'So-Safe Corps / Fire Precaution',
    resolution: '1080p · 30 FPS',
    status: 'MOTION_DETECTED',
    anpr: true,
    thumbnail: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60',
    plates: ['KTU-912-XY (Mack Hauler) - Motion Flag'],
  },
  {
    id: 'CAM-04',
    name: 'Oja Ogere Central Market & Commercial Ring',
    sector: 'Sector 2 — Central Heritage Core',
    location: 'Market Road / Civic Center',
    latitude: 6.9354,
    longitude: 3.6338,
    agency: 'Joint Vigilante Command',
    resolution: '1080p · 30 FPS',
    status: 'LIVE_HD',
    anpr: false,
    thumbnail: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=60',
    plates: [],
  },
  {
    id: 'CAM-05',
    name: 'Isale-Ogere Hospital Junction & Emergency Axis',
    sector: 'Sector 4 — Medical & Social',
    location: 'Isale-Ogere Hospital Road',
    latitude: 6.9325,
    longitude: 3.6310,
    agency: 'Civil Defence (NSCDC)',
    resolution: '1080p · 30 FPS',
    status: 'LIVE_HD',
    anpr: false,
    thumbnail: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=60',
    plates: [],
  },
  {
    id: 'CAM-06',
    name: 'Ositelu Memorial / Awomosu Academic Axis',
    sector: 'Sector 5 — Academic Belt',
    location: 'Awomosu Agbato Drive',
    latitude: 6.9405,
    longitude: 3.6397,
    agency: 'Community Watch',
    resolution: '1080p · 30 FPS',
    status: 'LIVE_HD',
    anpr: false,
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60',
    plates: [],
  },
  {
    id: 'CAM-07',
    name: 'Saapade Junction / Remo North Axis Gateway',
    sector: 'Sector 7 — Northern Gateway',
    location: 'Ibadan-Remo Arterial Junction',
    latitude: 6.9550,
    longitude: 3.6480,
    agency: 'Joint Border Command',
    resolution: '4K UHD · 60 FPS',
    status: 'LIVE_HD',
    anpr: true,
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=60',
    plates: ['ABJ-502-KW (Toyota Prado) - Verified Diplomatic'],
  },
];

export default function OfficerMobilePhone({ deviceFrame = 'iphone' }) {
  const [activeScreen, setActiveScreen] = useState('dashboard'); // 'dashboard', 'cctv', 'tactical', 'audiences', 'idCards'
  const [currentRole, setCurrentRole] = useState('security_officer');
  const [currentOfficer, setCurrentOfficer] = useState(SEED_OFFICERS[0]);
  const [activeOfficerId, setActiveOfficerId] = useState('off-001');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [mapMode, setMapMode] = useState('hybrid'); // 'hybrid' (satellite) or 'roadmap' (street)
  const [mapZoom, setMapZoom] = useState(18); // 18-19: building/rooftop level zoom
  const [showFirModal, setShowFirModal] = useState(false);
  const [selectedEscortForMap, setSelectedEscortForMap] = useState(null);
  const [selectedCctvId, setSelectedCctvId] = useState('CAM-01');
  const [cctvNightVision, setCctvNightVision] = useState(false);
  const [cctvZoom, setCctvZoom] = useState(1);
  const [cctvPtzMsg, setCctvPtzMsg] = useState('');

  // Tactical Net & VoIP Calling States
  const [tacticalChannel, setTacticalChannel] = useState('all-units');
  const [tacticalMsgs, setTacticalMsgs] = useState(() => getTacticalMessages('all-units'));
  const [tacticalInput, setTacticalInput] = useState('');
  const [tacticalRadioCode, setTacticalRadioCode] = useState('10-4');
  const [selectedOfficerForCall, setSelectedOfficerForCall] = useState(null);
  const [callStatus, setCallStatus] = useState('IDLE'); // 'IDLE', 'RINGING', 'CONNECTED', 'ENDED'
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [claimedIncidents, setClaimedIncidents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ogere_incident_claims') || '{}');
    } catch (_) {
      return {};
    }
  });

  const callTimerRef = useRef(null);
  const callPickupTimerRef = useRef(null);

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
      endTime: Date.now() + 420 * 1000,
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

  // Call Management Functions
  const handleStartVoipCall = (officer) => {
    setSelectedOfficerForCall(officer);
    setCallStatus('RINGING');
    setCallDuration(0);
    setIsCallMuted(false);
    startOutgoingRingtone();

    // Clear previous timers
    if (callPickupTimerRef.current) clearTimeout(callPickupTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);

    // Simulate officer picking up after 2.4 seconds
    callPickupTimerRef.current = setTimeout(() => {
      stopRingtone();
      playCallConnectedSound();
      setCallStatus('CONNECTED');

      // Start duration ticker
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 2400);
  };

  const handleEndVoipCall = () => {
    stopRingtone();
    if (callPickupTimerRef.current) clearTimeout(callPickupTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    playCallEndSound();
    setCallStatus('ENDED');
    setTimeout(() => {
      setCallStatus('IDLE');
      setSelectedOfficerForCall(null);
      setCallDuration(0);
    }, 900);
  };

  const handleSendTactical = (e) => {
    if (e) e.preventDefault();
    if (!tacticalInput.trim()) return;
    const msg = sendTacticalMessage({
      channel: tacticalChannel,
      senderId: activeOfficerId,
      text: tacticalInput.trim(),
      radioCode: tacticalRadioCode,
    });
    setTacticalMsgs((prev) => [...prev, msg]);
    setTacticalInput('');
  };

  const handleClaim = (incId) => {
    const claim = claimIncident(incId, activeOfficerId);
    setClaimedIncidents((prev) => ({
      ...prev,
      [incId]: claim,
    }));
    playRadioSquelchSound();
  };

  useEffect(() => {
    const handleSosEvent = (e) => {
      const sosItem = e.detail;
      if (sosItem) {
        // Automatically switch to security officer view so alert is front and center
        setCurrentRole('security_officer');
        setCurrentOfficer(SEED_OFFICERS[0]);
        setActiveScreen('dashboard');

        // Auto-route incident with AI proximity engine
        const autoRouting = autoRouteIncident({
          id: sosItem.id || `INC-${Date.now().toString().slice(-4)}`,
          type: sosItem.category || 'SOS Emergency',
          location: { lat: sosItem.latitude || 6.9388, lng: sosItem.longitude || 3.6437 },
        });

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
          backup_phone: sosItem.backupPhone || sosItem.backup_phone || '',
          status: 'CRITICAL_DISPATCH',
          assigned_agency: autoRouting.assignedStation?.name || 'Police / Joint Patrol Command',
          assigned_station: autoRouting.assignedStation,
          assigned_officer: autoRouting.assignedOfficer,
          eta_minutes: autoRouting.etaMinutes,
          camera_feed_active: sosItem.cameraFeedActive,
          audio_feed_active: sosItem.audioFeedActive,
          media_url: sosItem.mediaUrl,
          created_at: new Date().toISOString(),
        };

        setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
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
        const durationSecs = escort.remainingSeconds || (escort.durationMinutes || 15) * 60;
        const normalized = {
          ...escort,
          remainingSeconds: durationSecs,
          endTime: escort.endTime || Date.now() + durationSecs * 1000,
        };
        setActiveEscorts((prev) => [normalized, ...prev.filter((item) => item.id !== escort.id)]);
        // Automatically ensure security officer view is open to acknowledge
        setCurrentRole('security_officer');
        setCurrentOfficer(SEED_OFFICERS[0]);
        setActiveScreen('dashboard');
        sirenSound.playTestChime();
      }
    };

    const handleEscortTick = (e) => {
      const { sessionId, remainingSeconds, latitude, longitude, accuracy } = e.detail || {};
      if (sessionId && remainingSeconds != null) {
        setActiveEscorts((prev) =>
          prev.map((esc) =>
            esc.id === sessionId
              ? {
                  ...esc,
                  remainingSeconds,
                  endTime: Date.now() + remainingSeconds * 1000,
                  ...(latitude ? { latitude } : {}),
                  ...(longitude ? { longitude } : {}),
                  ...(accuracy ? { accuracy } : {}),
                }
              : esc
          )
        );
        setSelectedEscortForMap((prev) => {
          if (prev && prev.id === sessionId) {
            return {
              ...prev,
              remainingSeconds,
              ...(latitude ? { latitude } : {}),
              ...(longitude ? { longitude } : {}),
              ...(accuracy ? { accuracy } : {}),
            };
          }
          return prev;
        });
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

    const handleTacticalMsg = (e) => {
      if (e.detail) {
        setTacticalMsgs((prev) => {
          if (prev.some((m) => m.id === e.detail.id)) return prev;
          return [...prev, e.detail];
        });
      }
    };

    const handleIncidentClaimed = (e) => {
      if (e.detail?.incidentId) {
        setClaimedIncidents((prev) => ({
          ...prev,
          [e.detail.incidentId]: e.detail,
        }));
      }
    };

    const handleIncidentReassigned = (e) => {
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

    window.addEventListener('ogere-sos-triggered', handleSosEvent);
    window.addEventListener('ogere-escort-started', handleEscortStarted);
    window.addEventListener('ogere-escort-tick', handleEscortTick);
    window.addEventListener('ogere-escort-completed', handleEscortCompleted);
    window.addEventListener('ogere-tactical-msg', handleTacticalMsg);
    window.addEventListener('ogere-incident-claimed', handleIncidentClaimed);
    window.addEventListener('ogere-incident-reassigned', handleIncidentReassigned);

    return () => {
      window.removeEventListener('ogere-sos-triggered', handleSosEvent);
      window.removeEventListener('ogere-escort-started', handleEscortStarted);
      window.removeEventListener('ogere-escort-tick', handleEscortTick);
      window.removeEventListener('ogere-escort-completed', handleEscortCompleted);
      window.removeEventListener('ogere-tactical-msg', handleTacticalMsg);
      window.removeEventListener('ogere-incident-claimed', handleIncidentClaimed);
      window.removeEventListener('ogere-incident-reassigned', handleIncidentReassigned);
      sirenSound.stop();
      stopRingtone();
      if (callPickupTimerRef.current) clearTimeout(callPickupTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeOfficerId]);

  // Dedicated Wall-Clock Countdown Timer for Active Escorts (Check-in Window)
  useEffect(() => {
    const tickEscorts = () => {
      setActiveEscorts((prev) => {
        let changed = false;
        const now = Date.now();
        const updated = prev.map((esc) => {
          if (esc.status !== 'ACTIVE_MONITORING') return esc;

          let nextSecs = esc.remainingSeconds;
          if (esc.endTime) {
            nextSecs = Math.max(0, Math.round((esc.endTime - now) / 1000));
          } else {
            nextSecs = Math.max(0, (esc.remainingSeconds || 0) - 1);
          }

          if (nextSecs !== esc.remainingSeconds) {
            changed = true;
            if (nextSecs <= 0) {
              return {
                ...esc,
                remainingSeconds: 0,
                status: 'OVERDUE_ALARM_TRIGGERED',
              };
            }
            return { ...esc, remainingSeconds: nextSecs };
          }
          return esc;
        });
        return changed ? updated : prev;
      });
    };

    const interval = setInterval(tickEscorts, 1000);
    window.addEventListener('visibilitychange', tickEscorts);
    window.addEventListener('focus', tickEscorts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', tickEscorts);
      window.removeEventListener('focus', tickEscorts);
    };
  }, []);

  // Poll remote escorts periodically so security officer receives alerts across devices
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteEscorts = async () => {
      try {
        const res = await fetch('/api/escort');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && Array.isArray(data.escorts) && data.escorts.length > 0 && isMounted) {
          setActiveEscorts((prev) => {
            const merged = [...prev];
            data.escorts.forEach((remote) => {
              const idx = merged.findIndex((m) => m.id === remote.id);
              const mapped = {
                id: remote.id,
                citizenName: remote.citizen_name || remote.citizenName || remote.user_id || 'Citizen User',
                citizenPhone: remote.citizen_phone || remote.citizenPhone || remote.user_id,
                origin: remote.origin || 'Ogere Remo Corridor',
                destination: remote.destination,
                durationMinutes: remote.duration_minutes || remote.durationMinutes || 15,
                remainingSeconds: remote.remaining_seconds != null ? remote.remaining_seconds : 600,
                status: (remote.status === 'safe_arrival' || remote.status === 'completed') ? 'SAFELY_ARRIVED' : (remote.status === 'duress_triggered' ? 'DURESS_TRIGGERED' : 'ACTIVE_MONITORING'),
                assignedUnit: remote.assignedUnit || 'Patrol Unit 4 (Highway & Rural Intercept)',
                latitude: parseFloat(remote.last_latitude || remote.latitude || 6.9388),
                longitude: parseFloat(remote.last_longitude || remote.longitude || 3.6437),
                battery_level: remote.battery_level || 86,
                accuracy: remote.accuracy || 6,
              };
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...mapped };
              } else {
                merged.unshift(mapped);
              }
            });
            return merged;
          });
        }
      } catch (_) {}
    };

    fetchRemoteEscorts();
    const interval = setInterval(fetchRemoteEscorts, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
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
          <span style={{ fontSize: '1.2rem' }}>{currentRole === 'security_officer' ? (getOfficerById(activeOfficerId)?.avatar || '👮‍♂️') : currentOfficer.icon}</span>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#F5EDD8' }}>
              {currentRole === 'security_officer' ? getOfficerById(activeOfficerId)?.name : currentOfficer.name}
            </div>
            <div style={{ fontSize: '0.62rem', color: currentOfficer.themeColor, fontWeight: 700 }}>
              {currentRole === 'security_officer' ? `${getOfficerById(activeOfficerId)?.badge} · ${getOfficerById(activeOfficerId)?.callsign}` : `${currentOfficer.badge} · ${currentRole === 'palace_protocol' ? 'Palace Protocol' : 'OCDA Admin'}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {currentRole === 'security_officer' && (
            <select
              value={activeOfficerId}
              onChange={(e) => setActiveOfficerId(e.target.value)}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid #38bdf8',
                borderRadius: '4px',
                fontSize: '0.58rem',
                padding: '2px 4px',
                cursor: 'pointer',
                maxWidth: '85px',
              }}
              title="Switch Active Onboarded Officer Profile"
            >
              {ONBOARDED_OFFICERS.map((off) => (
                <option key={off.id} value={off.id} style={{ background: '#0f172a', color: '#fff' }}>
                  {off.callsign} ({off.name.split(' ')[0]})
                </option>
              ))}
            </select>
          )}

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

                      {/* AI Auto-Routing Match & Case Claiming Action */}
                      {(() => {
                        const claim = claimedIncidents[selectedIncident.id];
                        const station = selectedIncident.assigned_station || OGERE_STATIONS[0];
                        const officer = selectedIncident.assigned_officer || ONBOARDED_OFFICERS[0];
                        const isClaimed = !!claim;

                        return (
                          <div style={{ background: isClaimed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', border: isClaimed ? '1px solid #22c55e' : '1px solid #eab308', borderRadius: '6px', padding: '7px 9px', fontSize: '0.62rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 900, color: isClaimed ? '#4ade80' : '#fde047' }}>
                                {isClaimed ? '✅ DISPATCH CLAIMED' : '⚡ AI PROXIMITY ROUTED'}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '0.55rem' }}>
                                ETA: ~{selectedIncident.eta_minutes || 3} mins
                              </span>
                            </div>
                            <div style={{ color: '#f8fafc', marginTop: '3px' }}>
                              <strong>Station:</strong> {station.name}
                            </div>
                            <div style={{ color: '#cbd5e1' }}>
                              <strong>Assigned:</strong> {isClaimed ? `${claim.officerName} (${claim.unitName}) · EN ROUTE` : `${officer.name} (${officer.unitName})`}
                            </div>
                            {!isClaimed ? (
                              <button
                                type="button"
                                onClick={() => handleClaim(selectedIncident.id)}
                                style={{
                                  width: '100%',
                                  marginTop: '6px',
                                  background: 'linear-gradient(90deg, #15803d, #16a34a)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '7px',
                                  fontWeight: 900,
                                  fontSize: '0.68rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)'
                                }}
                              >
                                <span>⚡</span> Accept & Claim Dispatch (En Route)
                              </button>
                            ) : (
                              <div style={{ marginTop: '5px', color: '#4ade80', fontSize: '0.58rem', fontWeight: 800 }}>
                                🚓 Status: Broadcasted as CLAIMED by {claim.officerName} ({claim.callsign})
                              </div>
                            )}
                          </div>
                        );
                      })()}
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
                              <button
                                type="button"
                                onClick={() => setSelectedEscortForMap(esc)}
                                style={{
                                  flex: 1,
                                  textAlign: 'center',
                                  background: '#0284c7',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '5px',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                🛰️ Live Radar
                              </button>
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

                      {/* Claim & Auto-Route Indicator in Feed Item */}
                      {(() => {
                        const claim = claimedIncidents[inc.id];
                        const station = inc.assigned_station || OGERE_STATIONS[0];
                        return claim ? (
                          <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '4px', padding: '4px 6px', fontSize: '0.58rem', color: '#4ade80', fontWeight: 800, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🚓 Claimed by {claim.officerName} ({claim.callsign})</span>
                            <span style={{ color: '#86efac' }}>EN ROUTE</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '4px', padding: '4px 6px', fontSize: '0.58rem', color: '#fde047', marginBottom: '6px' }}>
                            <span>⚡ AI Routed: {station.name.split(' ')[0]} {station.name.split(' ')[1]}</span>
                            <button
                              type="button"
                              onClick={() => handleClaim(inc.id)}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', fontWeight: 900, fontSize: '0.58rem', cursor: 'pointer' }}
                            >
                              ⚡ Claim Case
                            </button>
                          </div>
                        );
                      })()}

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

        {/* TAB 4: TACTICAL COMMS & VOIP CALLING NET */}
        {activeScreen === 'tactical' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
            {/* Tactical Channel Selector */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#38bdf8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📻 TACTICAL RADIO GRID</span>
                <span style={{ fontSize: '0.55rem', background: '#0369a1', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>144.800 MHz</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
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
                      color: '#fff',
                      border: tacticalChannel === ch.id ? '1px solid #38bdf8' : '1px solid #334155',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                  >
                    {ch.name.split(' ')[0]} {ch.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Live Chat Stream */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid #334155', borderRadius: '6px', padding: '8px', maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tacticalMsgs.map((msg) => (
                <div key={msg.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '5px 7px', borderLeft: `3px solid ${msg.senderId === activeOfficerId ? '#38bdf8' : '#22c55e'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.58rem', marginBottom: '2px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>
                      {msg.avatar} {msg.senderName} ({msg.callsign})
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.52rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#fde047', fontWeight: 800, marginBottom: '2px' }}>
                    [{msg.radioCode}]
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#e2e8f0', lineHeight: 1.3 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick 10-Codes */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['10-4 (Ack)', '10-20 (Location)', '10-8 (In Service)', '10-33 (Emergency)'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setTacticalRadioCode(code.split(' ')[0])}
                  style={{
                    background: tacticalRadioCode === code.split(' ')[0] ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                    color: tacticalRadioCode === code.split(' ')[0] ? '#000' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    fontSize: '0.52rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Tactical Message Composer Form */}
            <form onSubmit={handleSendTactical} style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                value={tacticalInput}
                onChange={(e) => setTacticalInput(e.target.value)}
                placeholder={`Transmit on ${tacticalChannel}...`}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid #38bdf8',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  fontSize: '0.62rem',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0 10px',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                📡 Send
              </button>
            </form>

            {/* Onboarded Units VoIP Intercom Directory */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#4ade80', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>👥 ONBOARDED ACTIVE UNITS</span>
                <span style={{ fontSize: '0.55rem', color: '#86efac' }}>🟢 6 ONLINE</span>
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {ONBOARDED_OFFICERS.map((off) => (
                  <div
                    key={off.id}
                    style={{
                      background: off.id === activeOfficerId ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.04)',
                      border: off.id === activeOfficerId ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f8fafc' }}>
                        {off.avatar} {off.name}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>
                        {off.agency.split('—')[0]} · {off.callsign}
                      </div>
                      <div style={{ fontSize: '0.52rem', color: '#38bdf8', marginTop: '1px' }}>
                        📍 {off.location.landmark} (🔋 {off.battery}%)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartVoipCall(off)}
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 8px',
                        fontSize: '0.58rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)',
                      }}
                    >
                      <span>📞</span> Intercom
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CCTV SURVEILLANCE FEED & PTZ GRID */}
        {activeScreen === 'cctv' && (() => {
          const activeCam = OGERE_CCTV_CAMERAS.find(c => c.id === selectedCctvId) || OGERE_CCTV_CAMERAS[0];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', overflowY: 'auto' }}>
              {/* CCTV Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#ef4444' }}>
                    📹 MUNICIPAL CCTV SURVEILLANCE
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>
                    7 Municipal Cameras · Live Optical Grid
                  </div>
                </div>
                <span style={{ fontSize: '0.55rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                  ● 7 ONLINE
                </span>
              </div>

              {/* Camera Selector Strip */}
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
                {OGERE_CCTV_CAMERAS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => {
                      setSelectedCctvId(cam.id);
                      setCctvPtzMsg('');
                    }}
                    style={{
                      background: selectedCctvId === cam.id ? '#273549' : '#1e293b',
                      color: selectedCctvId === cam.id ? '#C9963A' : '#94a3b8',
                      border: selectedCctvId === cam.id ? '1px solid #C9963A' : '1px solid #334155',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cam.id}
                  </button>
                ))}
              </div>

              {/* Main Camera Video Simulation Surface */}
              <div
                style={{
                  background: cctvNightVision ? '#052e16' : '#000',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid #334155',
                  position: 'relative',
                }}
              >
                {/* OSD Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.7)', fontSize: '0.55rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#ef4444', fontWeight: 900 }}>● REC LIVE WAT</span>
                  <span style={{ color: '#38bdf8' }}>{activeCam.resolution}</span>
                  <span style={{ color: '#4ade80' }}>28ms</span>
                </div>

                {/* Video Image */}
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={activeCam.thumbnail}
                    alt={activeCam.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: cctvNightVision ? 'contrast(1.4) brightness(1.2) sepia(1) hue-rotate(70deg)' : 'none',
                      transform: `scale(${cctvZoom})`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  {/* Crosshair Overlay */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%' }} />

                  {cctvNightVision && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(5,46,22,0.85)', color: '#4ade80', fontSize: '0.5rem', padding: '2px 4px', borderRadius: '3px', fontWeight: 900 }}>
                      👁️ IR NIGHT
                    </div>
                  )}

                  {cctvPtzMsg && (
                    <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#C9963A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>
                      {cctvPtzMsg}
                    </div>
                  )}

                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '3px 6px', fontSize: '0.55rem', color: '#fff' }}>
                    <strong>{activeCam.name}</strong> · <span style={{ color: '#cbd5e1' }}>{activeCam.sector}</span>
                  </div>
                </div>

                {/* Controls toolbar */}
                <div style={{ display: 'flex', gap: '4px', padding: '4px 6px', background: '#0f172a', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setCctvNightVision(!cctvNightVision)}
                    style={{ background: cctvNightVision ? '#065f46' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '3px', padding: '2px 6px', fontSize: '0.55rem', cursor: 'pointer' }}
                  >
                    {cctvNightVision ? '👁️ Day' : '🌙 Night IR'}
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`📸 Snapshot OGR-${activeCam.id}-${Date.now()} saved to Evidence Vault`)}
                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '3px', padding: '2px 6px', fontSize: '0.55rem', cursor: 'pointer' }}
                  >
                    📸 Frame
                  </button>
                  <a
                    href={`https://www.google.com/maps?q=${activeCam.latitude},${activeCam.longitude}&t=k&z=19`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '3px', padding: '2px 6px', fontSize: '0.55rem', textDecoration: 'none' }}
                  >
                    🛰️ Sat Pin
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeCam.latitude},${activeCam.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', borderRadius: '3px', padding: '2px 6px', fontSize: '0.55rem', textDecoration: 'none', fontWeight: 800 }}
                  >
                    🚨 Dispatch
                  </a>
                </div>
              </div>

              {/* PTZ D-Pad Controls */}
              <div style={{ background: '#111827', borderRadius: '6px', padding: '6px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#C9963A', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🕹️ PTZ 360° CONTROLLER</span>
                  <span style={{ color: '#38bdf8' }}>Zoom: {cctvZoom.toFixed(1)}x</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  {/* D-Pad */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 24px)', gap: '2px', justifyItems: 'center', alignItems: 'center' }}>
                    <div />
                    <button
                      type="button"
                      onClick={() => { setCctvPtzMsg('PTZ: TILT UP'); setTimeout(() => setCctvPtzMsg(''), 1000); }}
                      style={{ width: '24px', height: '24px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '3px', fontSize: '0.55rem', cursor: 'pointer' }}
                    >
                      ▲
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => { setCctvPtzMsg('PTZ: PAN LEFT'); setTimeout(() => setCctvPtzMsg(''), 1000); }}
                      style={{ width: '24px', height: '24px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '3px', fontSize: '0.55rem', cursor: 'pointer' }}
                    >
                      ◄
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCctvZoom(1); setCctvPtzMsg('PTZ: CENTER'); setTimeout(() => setCctvPtzMsg(''), 1000); }}
                      style={{ width: '24px', height: '24px', background: '#0f172a', color: '#C9963A', border: '1px solid #C9963A', borderRadius: '50%', fontSize: '0.55rem', cursor: 'pointer' }}
                    >
                      ↺
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCctvPtzMsg('PTZ: PAN RIGHT'); setTimeout(() => setCctvPtzMsg(''), 1000); }}
                      style={{ width: '24px', height: '24px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '3px', fontSize: '0.55rem', cursor: 'pointer' }}
                    >
                      ►
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => { setCctvPtzMsg('PTZ: TILT DOWN'); setTimeout(() => setCctvPtzMsg(''), 1000); }}
                      style={{ width: '24px', height: '24px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '3px', fontSize: '0.55rem', cursor: 'pointer' }}
                    >
                      ▼
                    </button>
                    <div />
                  </div>

                  {/* Zoom Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setCctvZoom(prev => Math.min(3, prev + 0.5))}
                      style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '3px', padding: '4px 8px', fontSize: '0.58rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🔍 Zoom In +
                    </button>
                    <button
                      type="button"
                      onClick={() => setCctvZoom(prev => Math.max(1, prev - 0.5))}
                      style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '3px', padding: '4px 8px', fontSize: '0.58rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🔍 Zoom Out -
                    </button>
                  </div>
                </div>
              </div>

              {/* ANPR Scanner List */}
              {activeCam.anpr && (
                <div style={{ background: '#111827', borderRadius: '6px', padding: '6px', border: '1px solid #1f2937' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
                    🚘 ANPR HIGHWAY OPTICAL SCANNER
                  </div>
                  {activeCam.plates && activeCam.plates.length > 0 ? (
                    <div style={{ display: 'grid', gap: '3px' }}>
                      {activeCam.plates.map((plate, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a2333', padding: '3px 6px', borderRadius: '3px', fontSize: '0.55rem' }}>
                          <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>🏷️ {plate}</span>
                          <span style={{ color: '#4ade80', fontSize: '0.5rem', fontWeight: 800 }}>LOGGED</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.55rem', fontStyle: 'italic' }}>
                      Scanning lane...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
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
          <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>Command</span>
        </button>
        <button
          onClick={() => setActiveScreen('cctv')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'cctv' ? '#ef4444' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>📹</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>CCTV</span>
        </button>
        <button
          onClick={() => setActiveScreen('tactical')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'tactical' ? '#38bdf8' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>💬</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>Tactical</span>
        </button>
        <button
          onClick={() => setActiveScreen('audiences')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'audiences' ? '#C9963A' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>👑</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>Audiences</span>
        </button>
        <button
          onClick={() => setActiveScreen('idCards')}
          style={{ background: 'none', border: 'none', color: activeScreen === 'idCards' ? '#34d399' : 'rgba(245,237,216,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <span style={{ fontSize: '0.9rem' }}>🪪</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>ID Desk</span>
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

      {/* WHATSAPP-STYLE VOIP AUDIO CALL MODAL */}
      {callStatus !== 'IDLE' && selectedOfficerForCall && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0b141a 0%, #111b21 50%, #081116 100%)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '40px 20px 30px',
            color: '#e9edef',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Top Encryption Indicator */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#8696a0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>🔒</span>
              <span>End-to-end encrypted Tactical Intercom</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e9edef', marginTop: '12px' }}>
              {selectedOfficerForCall.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#00a884', fontWeight: 600, marginTop: '2px' }}>
              {selectedOfficerForCall.callsign} · {selectedOfficerForCall.badge}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#8696a0', marginTop: '2px' }}>
              {selectedOfficerForCall.agency}
            </div>
          </div>

          {/* Center Pulsing Avatar & Audio Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1f2c34 0%, #111b21 100%)',
                border: '3px solid #00a884',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.2rem',
                boxShadow: callStatus === 'CONNECTED' ? '0 0 35px rgba(0, 168, 132, 0.45)' : '0 0 20px rgba(0, 168, 132, 0.25)',
                animation: callStatus === 'RINGING' ? 'pulse 1.8s infinite' : 'none',
              }}
            >
              {selectedOfficerForCall.avatar}
            </div>

            {/* Status & Animated Soundwave */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: callStatus === 'CONNECTED' ? '#25d366' : '#aebac1' }}>
                {callStatus === 'RINGING' && 'Ringing...'}
                {callStatus === 'CONNECTED' && `Tactical Audio · ${formatTimer(callDuration)}`}
                {callStatus === 'ENDED' && 'Call Ended'}
              </div>

              {callStatus === 'CONNECTED' && (
                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center', marginTop: '8px', height: '18px' }}>
                  {[12, 18, 8, 22, 14, 20, 10].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '3px',
                        height: `${h}px`,
                        background: '#00a884',
                        borderRadius: '2px',
                        opacity: isCallMuted ? 0.3 : 1,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Audio & Call Controls */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '240px' }}>
              {/* Speakerphone */}
              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: isSpeakerOn ? 'rgba(0, 168, 132, 0.25)' : 'rgba(255,255,255,0.1)',
                  border: isSpeakerOn ? '1px solid #00a884' : '1px solid rgba(255,255,255,0.2)',
                  color: isSpeakerOn ? '#00a884' : '#e9edef',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Speaker"
              >
                🔊
              </button>

              {/* Mute Mic */}
              <button
                type="button"
                onClick={() => setIsCallMuted(!isCallMuted)}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: isCallMuted ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  border: isCallMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isCallMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isCallMuted ? '🔇' : '🎙️'}
              </button>

              {/* Radio Roger Beep */}
              <button
                type="button"
                onClick={() => playRadioSquelchSound()}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#f59e0b',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="PTT Roger Beep"
              >
                📻
              </button>
            </div>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndVoipCall}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ea0038',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(234, 0, 56, 0.45)',
                transform: 'rotate(135deg)',
              }}
              title="End Tactical Call"
            >
              📞
            </button>
          </div>
        </div>
      )}

      {/* LIVE SATELLITE ESCORT RADAR MODAL */}
      {selectedEscortForMap && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5,10,20,0.96)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            gap: '8px',
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🛰️</span> LIVE ESCORT RADAR (GOOGLE MAPS)
              </div>
              <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                Citizen: <strong>{selectedEscortForMap.citizenName}</strong> · {selectedEscortForMap.id}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEscortForMap(null)}
              style={{
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.65rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Telemetry Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#0f172a', padding: '6px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '0.55rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.5rem', fontWeight: 700 }}>BATTERY</div>
              <div style={{ color: '#4ade80', fontWeight: 900, fontSize: '0.65rem' }}>
                🔋 {selectedEscortForMap.battery_level || 86}% ⚡
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.5rem', fontWeight: 700 }}>CHECK-IN TIMER</div>
              <div style={{ color: '#38bdf8', fontWeight: 900, fontSize: '0.65rem' }}>
                ⏳ {formatTimer(selectedEscortForMap.remainingSeconds)}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.5rem', fontWeight: 700 }}>ACCURACY</div>
              <div style={{ color: '#facc15', fontWeight: 900, fontSize: '0.65rem' }}>
                ±{selectedEscortForMap.accuracy ? Math.round(selectedEscortForMap.accuracy) : 4}m Sat Lock
              </div>
            </div>
          </div>

          {/* Route Destination Ribbon */}
          <div style={{ background: '#131d31', padding: '5px 8px', borderRadius: '4px', fontSize: '0.58rem', color: '#cbd5e1' }}>
            🏁 <strong>Destination:</strong> {selectedEscortForMap.destination}
          </div>

          {/* Embedded Google Maps Satellite Iframe */}
          <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #38bdf8', position: 'relative' }}>
            <iframe
              title="Escort Live Google Map"
              src={`https://maps.google.com/maps?q=${selectedEscortForMap.latitude || 6.9388},${selectedEscortForMap.longitude || 3.6437}&t=k&z=19&output=embed`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              loading="lazy"
            />
            {/* Live GPS Coordinates Tag */}
            <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(15,23,42,0.85)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.55rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              📍 {(selectedEscortForMap.latitude || 6.9388).toFixed(5)}°N, {(selectedEscortForMap.longitude || 3.6437).toFixed(5)}°E
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {selectedEscortForMap.citizenPhone && (
              <a
                href={`tel:${selectedEscortForMap.citizenPhone}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: '#059669',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  padding: '7px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                }}
              >
                📞 Call Citizen
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEscortForMap.latitude || 6.9388},${selectedEscortForMap.longitude || 3.6437}`}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1.5,
                textAlign: 'center',
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                padding: '7px',
                fontSize: '0.65rem',
                fontWeight: 900,
              }}
            >
              ⚡ Turn-by-Turn Driving Navigation
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
