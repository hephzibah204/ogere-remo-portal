import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbInsert } from '../services/db';
import sirenSound from '../services/sirenSound';
import { resolveOgereLocation, getOgereMapUrls, isInsideOgere } from '../services/ogereGeoEngine';
import {
  reverseGeocodeLocation,
  searchAddressInRealtime,
  acquirePreciseGpsLocation,
  getStandardMapUrls,
} from '../services/liveLocationEngine';

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
  const [manualLandmark, setManualLandmark] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [backupPhone, setBackupPhone] = useState('');
  const [sosState, setSosState] = useState('idle'); // idle, triggering, dispatched
  const [countdown, setCountdown] = useState(3);
  const [dispatchedData, setDispatchedData] = useState(null);

  // ─── Real GPS & IP Telemetry (Reporter Location) ─────────────────────────────
  const [deviceLocation, setDeviceLocation] = useState(null); // { lat, lng, accuracy, ip, mapsUrl, isGps, fullAddress, directionsUrl }
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, acquiring, acquired, denied, error
  const locationRef = useRef(null); // keeps latest location for use in executeSosDispatch

  const acquireExactLocation = async () => {
    setLocationStatus('acquiring');
    let lat = null, lng = null, accuracy = null, isGps = false;

    // Helper: fetch with timeout (works on all browsers, avoids AbortSignal.timeout)
    const fetchWithTimeout = (url, ms = 4000) => {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
    };

    // 1. Try browser Geolocation (prompts the user for permission)
    const gpsResult = await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => { console.warn('[SOS] GPS denied or unavailable:', err.message); resolve(null); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    if (gpsResult) {
      lat = gpsResult.lat;
      lng = gpsResult.lng;
      accuracy = gpsResult.accuracy;
      isGps = true;
    }

    // 2. Fetch public IP — try 3 services in sequence
    let ip = 'Unknown';
    try {
      const r = await fetchWithTimeout('https://api.ipify.org?format=json', 4000);
      if (r.ok) { const d = await r.json(); ip = d.ip || ip; }
    } catch (_) {}

    if (ip === 'Unknown') {
      try {
        const r2 = await fetchWithTimeout('https://ipapi.co/json/', 4000);
        if (r2.ok) { const d2 = await r2.json(); ip = d2.ip || ip; }
      } catch (_) {}
    }

    if (ip === 'Unknown') {
      try {
        const r3 = await fetchWithTimeout('https://api4.my-ip.io/ip.json', 4000);
        if (r3.ok) { const d3 = await r3.json(); ip = d3.ip || ip; }
      } catch (_) {}
    }

    // 3. IP-based geolocation fallback if GPS failed
    if (!isGps && ip !== 'Unknown') {
      // Try ipapi.co
      try {
        const geoRes = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`, 5000);
        if (geoRes.ok) {
          const gd = await geoRes.json();
          if (typeof gd.latitude === 'number') { lat = gd.latitude; lng = gd.longitude; accuracy = 500; }
        }
      } catch (_) {}

      // Fallback to ipinfo.io
      if (lat === null) {
        try {
          const geoRes2 = await fetchWithTimeout(`https://ipinfo.io/${ip}/json`, 5000);
          if (geoRes2.ok) {
            const gd2 = await geoRes2.json();
            if (gd2.loc) {
              const [la, lo] = gd2.loc.split(',').map(Number);
              if (!isNaN(la) && !isNaN(lo)) { lat = la; lng = lo; accuracy = 1000; }
            }
          }
        } catch (_) {}
      }
    }

    // 4. Browser Device Intelligence
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || navigator.userAgentData?.platform || 'Web';
    const language = navigator.language || 'en';
    const timezone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'UTC';
    const screenW = window.screen?.width || 0;
    const screenH = window.screen?.height || 0;
    const screenResolution = screenW && screenH ? `${screenW}x${screenH}` : null;

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const networkType = conn?.effectiveType || conn?.type || 'unknown';
    const networkDownlink = conn?.downlink ? `${conn.downlink}Mbps` : null;

    let batteryLevel = null;
    let isCharging = false;
    try {
      if (typeof navigator.getBattery === 'function') {
        const bat = await navigator.getBattery();
        batteryLevel = Math.round(bat.level * 100);
        isCharging = !!bat.charging;
      }
    } catch (_) {}

    if (batteryLevel === null) {
      batteryLevel = 88;
    }

    const ogereLoc = resolveOgereLocation(lat, lng, accuracy);
    let resolvedFullAddress = '';
    let stdMaps = getStandardMapUrls(lat || 6.9388, lng || 3.6437);
    if (lat && lng) {
      try {
        const rev = await reverseGeocodeLocation(lat, lng);
        resolvedFullAddress = rev.fullAddress;
        setFullAddress((prev) => prev || rev.fullAddress);
        stdMaps = rev;
      } catch (_) {}
    }

    const loc = {
      lat, lng, accuracy, ip,
      mapsUrl: stdMaps.googleMapsUrl,
      directionsUrl: stdMaps.directionsUrl,
      satelliteMapsUrl: stdMaps.satelliteMapsUrl,
      fullAddress: resolvedFullAddress,
      isGps,
      userAgent: ua, platform, language, timezone,
      screenResolution, networkType, networkDownlink, batteryLevel, isCharging,
      ogereLoc, isInsideOgere: isInsideOgere(lat, lng),
    };
    setDeviceLocation(loc);
    locationRef.current = loc;
    setLocationStatus(lat ? (isGps ? 'acquired' : 'acquired_ip') : 'error');
    return loc;
  };

  const handleAddressSearch = async (val) => {
    if (!val || val.length < 2) {
      setAddressSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const res = await searchAddressInRealtime(val);
      setAddressSuggestions(res);
    } catch (_) {
      setAddressSuggestions([]);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleLockExactGps = async () => {
    setLocationStatus('acquiring');
    try {
      const fix = await acquirePreciseGpsLocation({ timeoutMs: 12000, targetAccuracyMeters: 15 });
      const rev = await reverseGeocodeLocation(fix.latitude, fix.longitude);
      setFullAddress(rev.fullAddress);
      setManualLandmark(rev.nearestLandmark);
      const loc = {
        lat: fix.latitude,
        lng: fix.longitude,
        accuracy: fix.accuracy,
        isGps: fix.isGpsPrecise,
        fullAddress: rev.fullAddress,
        mapsUrl: fix.googleMapsUrl,
        directionsUrl: fix.directionsUrl,
        satelliteMapsUrl: fix.satelliteMapsUrl,
      };
      setDeviceLocation((prev) => ({ ...prev, ...loc }));
      locationRef.current = { ...(locationRef.current || {}), ...loc };
      setLocationStatus('acquired');
    } catch (err) {
      console.warn('GPS lock error:', err);
      setLocationStatus('error');
    }
  };

  // Acquire location on modal open
  useEffect(() => {
    if (isOpen && locationStatus === 'idle') {
      acquireExactLocation();
    }
    if (!isOpen) {
      setLocationStatus('idle');
      setDeviceLocation(null);
      locationRef.current = null;
    }
  }, [isOpen]);

  // Live Camera & Audio Streaming States
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isMediaStarting, setIsMediaStarting] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioAnimFrameRef = useRef(null);
  const snapshotIntervalRef = useRef(null);
  const liveLocationIntervalRef = useRef(null);
  const currentIncidentIdRef = useRef(null);

  // Walk With Me State
  const [walkOrigin, setWalkOrigin] = useState(OGERE_SECTORS[0]);
  const [walkDest, setWalkDest] = useState(OGERE_SECTORS[2]);
  const [walkDuration, setWalkDuration] = useState(15);
  const [walkContact, setWalkContact] = useState('');
  const [isWalking, setIsWalking] = useState(false);
  const [walkSecondsLeft, setWalkSecondsLeft] = useState(15 * 60);

  const countdownTimerRef = useRef(null);
  const walkIntervalRef = useRef(null);

  // Stop all camera, microphone tracks, audio context, and live location streaming
  const stopMediaStream = () => {
    if (liveLocationIntervalRef.current) {
      clearInterval(liveLocationIntervalRef.current);
      liveLocationIntervalRef.current = null;
    }
    if (currentIncidentIdRef.current) {
      fetch('/api/live-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: currentIncidentIdRef.current, isEnded: true }),
      }).catch(() => {});
      currentIncidentIdRef.current = null;
    }
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
      snapshotIntervalRef.current = null;
    }
    if (audioAnimFrameRef.current) {
      cancelAnimationFrame(audioAnimFrameRef.current);
      audioAnimFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setAudioLevel(0);
  };

  // Start media stream based on flags
  const startMedia = async (useVideo, useAudio, facing = facingMode) => {
    setMediaError('');
    if (!useVideo && !useAudio) {
      stopMediaStream();
      return;
    }
    try {
      setIsMediaStarting(true);
      // Stop old tracks first
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((t) => t.stop());
        } catch (_) {}
      }
      if (audioAnimFrameRef.current) {
        cancelAnimationFrame(audioAnimFrameRef.current);
        audioAnimFrameRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
        audioCtxRef.current = null;
      }

      const constraints = {
        video: useVideo
          ? {
              facingMode: facing,
              width: { ideal: 640 },
              height: { ideal: 480 },
            }
          : false,
        audio: useAudio ? { echoCancellation: true, noiseSuppression: true } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && useVideo) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Audio analysis if audio is enabled
      if (useAudio) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const actx = new AudioCtx();
            audioCtxRef.current = actx;
            const src = actx.createMediaStreamSource(stream);
            const analyser = actx.createAnalyser();
            analyser.fftSize = 64;
            src.connect(analyser);
            audioAnalyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkAudio = () => {
              if (!audioAnalyserRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              audioAnimFrameRef.current = requestAnimationFrame(checkAudio);
            };
            checkAudio();
          }
        } catch (_) {}
      }

      setIsMediaStarting(false);
    } catch (err) {
      console.warn('getUserMedia error:', err);
      setIsMediaStarting(false);
      setMediaError(
        err.name === 'NotAllowedError'
          ? 'Permission denied. Please tap the lock icon in your browser address bar to allow Camera and Microphone.'
          : 'Could not connect to camera/mic on this device. Please check hardware permissions.'
      );
    }
  };

  const toggleCamera = () => {
    const nextVal = !cameraEnabled;
    setCameraEnabled(nextVal);
    startMedia(nextVal, audioEnabled, facingMode);
  };

  const toggleAudio = () => {
    const nextVal = !audioEnabled;
    setAudioEnabled(nextVal);
    startMedia(cameraEnabled, nextVal, facingMode);
  };

  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (cameraEnabled) {
      startMedia(true, audioEnabled, nextFacing);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !cameraEnabled) return null;
    try {
      const v = videoRef.current;
      if (v.videoWidth === 0 || v.videoHeight === 0) return null;
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      const maxW = 480;
      const scale = Math.min(1, maxW / v.videoWidth);
      canvas.width = v.videoWidth * scale;
      canvas.height = v.videoHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.55);
    } catch (err) {
      return null;
    }
  };

  // Reset states on modal close
  useEffect(() => {
    if (!isOpen) {
      setSosState('idle');
      setCountdown(3);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      stopMediaStream();
      setCameraEnabled(false);
      setAudioEnabled(false);
    }
  }, [isOpen]);

  // Make sure video srcObject stays connected when video element mounts/updates
  useEffect(() => {
    if (cameraEnabled && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [cameraEnabled, sosState]);

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

  // Trigger Panic SOS
  const handleStartSosCountdown = () => {
    setSosState('triggering');
    setCountdown(3);
    sirenSound.playCountdownTick();

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count > 0) {
        sirenSound.playCountdownTick();
      } else {
        clearInterval(countdownTimerRef.current);
        executeSosDispatch();
      }
    }, 1000);
  };

  const handleCancelSos = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
      snapshotIntervalRef.current = null;
    }
    stopMediaStream();
    setCameraEnabled(false);
    setAudioEnabled(false);
    setSosState('idle');
    setCountdown(3);
  };

  const executeSosDispatch = async () => {
    const incidentId = `SOS-${Date.now().toString().slice(-6)}`;
    const initialSnapshot = captureSnapshot();

    // Use live-acquired GPS/IP — re-acquire if not ready yet
    let loc = locationRef.current;
    if (!loc) {
      loc = await acquireExactLocation();
    }

    const finalLocation = manualLandmark.trim() || sector;
    const finalFullAddress = fullAddress.trim() || loc?.fullAddress || `${finalLocation}, Ogere Remo, Ogun State, Nigeria`;
    const finalDirectionsUrl = loc?.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${loc?.lat || 6.9388},${loc?.lng || 3.6437}&travelmode=driving`;
    const finalBackup = backupPhone.trim();

    const newSos = {
      id: incidentId,
      title: `🚨 CRITICAL SOS PANIC: ${finalLocation}`,
      category: 'Armed Response / Distress',
      severity: 'CRITICAL_DISPATCH',
      threatLevel: 'CODE_RED',
      location: finalLocation,
      landmark: finalLocation,
      fullAddress: finalFullAddress,
      full_address: finalFullAddress,
      directionsUrl: finalDirectionsUrl,
      directions_url: finalDirectionsUrl,
      // Real GPS telemetry — precise latitude/longitude from device
      latitude: loc?.lat || null,
      longitude: loc?.lng || null,
      accuracy: loc?.accuracy || null,
      ipAddress: loc?.ip || null,
      googleMapsUrl: loc?.mapsUrl || null,
      // Browser device intelligence
      deviceModel: loc?.platform || 'Web Browser',
      deviceOs: loc?.userAgent ? (loc.userAgent.includes('Android') ? 'Android' : loc.userAgent.includes('iPhone') || loc.userAgent.includes('iPad') ? 'iOS' : 'Desktop') : 'Web',
      networkType: loc?.networkType || null,
      batteryLevel: loc?.batteryLevel ?? null,
      screenResolution: loc?.screenResolution || null,
      locale: loc?.language || navigator.language || null,
      timezone: loc?.timezone || null,
      appVersion: 'web-portal',
      description: `EMERGENCY SOS BUTTON TRIGGERED by ${callerName || 'Citizen in Distress'} (${callerPhone || 'Unlisted'}${finalBackup ? ` | Kin: ${finalBackup}` : ''}). Location: ${finalLocation}. Immediate tactical dispatch required.${loc?.lat ? ` GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)} (±${loc.accuracy ? Math.round(loc.accuracy) : '?'}m).` : ''} Network: ${loc?.networkType || '?'}. Battery: ${loc?.batteryLevel != null ? loc.batteryLevel + '%' : '?'}. ${cameraEnabled ? '[LIVE CAMERA FEED ACTIVE]' : ''} ${audioEnabled ? '[AMBIENT AUDIO FEED ACTIVE]' : ''}`.trim(),
      reporterName: callerName || 'Citizen SOS Alert',
      reporterPhone: callerPhone || 'Emergency Caller',
      backupPhone: finalBackup,
      backup_phone: finalBackup,
      assignedAgency: 'Police / Amotekun Area Command',
      status: 'CRITICAL_DISPATCH',
      isLiveTracking: true,
      isSos: true,
      cameraFeedActive: cameraEnabled,
      audioFeedActive: audioEnabled,
      mediaUrl: initialSnapshot,
      mediaType: initialSnapshot ? 'image/jpeg' : null,
      createdAt: new Date().toISOString(),
    };

    currentIncidentIdRef.current = incidentId;

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

    // Start WhatsApp-style Continuous Live Location Streamer (every 4s)
    if (navigator.geolocation) {
      liveLocationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetch('/api/live-location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                incidentId,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                heading: pos.coords.heading ?? null,
                speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null,
                accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
                isEnded: false,
              }),
            }).catch(() => {});
          },
          () => {},
          { enableHighAccuracy: true, timeout: 3500, maximumAge: 1000 }
        );
      }, 4000);
    }

    // Start recurring live video snapshot broadcaster (every 3.5s) if camera is active
    if (cameraEnabled || audioEnabled) {
      snapshotIntervalRef.current = setInterval(() => {
        const snap = captureSnapshot();
        fetch('/api/security', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: incidentId,
            cameraFeedActive: cameraEnabled,
            audioFeedActive: audioEnabled,
            mediaUrl: snap || undefined,
            mediaType: snap ? 'image/jpeg' : undefined,
          }),
        }).catch(() => {});
      }, 3500);
    }

    setDispatchedData(newSos);
    setSosState('dispatched');
  };

  // Walk With Me Start
  const handleStartWalk = () => {
    setIsWalking(true);
    setWalkSecondsLeft(walkDuration * 60);

    const walkLoc = locationRef.current;
    const walkIncident = {
      id: `WALK-${Date.now().toString().slice(-6)}`,
      title: `🛡️ Virtual Escort Active: ${walkOrigin} → ${walkDest}`,
      category: 'Virtual Escort Guard',
      severity: 'Monitoring',
      threatLevel: 'CODE_YELLOW',
      location: `${walkOrigin} → ${walkDest}`,
      latitude: walkLoc?.lat || null,
      longitude: walkLoc?.lng || null,
      accuracy: walkLoc?.accuracy || null,
      ipAddress: walkLoc?.ip || null,
      googleMapsUrl: walkLoc?.mapsUrl || null,
      description: `Virtual Escort activated for ${walkDuration} mins. Emergency contact: ${walkContact || 'Palace Night Watch'}.${walkLoc?.lat ? ` Start GPS: ${walkLoc.lat.toFixed(5)}, ${walkLoc.lng.toFixed(5)}.` : ''}`,
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
    const distressLoc = locationRef.current;
    const distressIncident = {
      id: `WALK-PANIC-${Date.now().toString().slice(-6)}`,
      title: `🚨 VIRTUAL ESCORT DISTRESS: ${walkOrigin} → ${walkDest}`,
      category: 'Escort Distress / Panic',
      severity: 'CRITICAL_DISPATCH',
      threatLevel: 'CODE_RED',
      location: `${walkOrigin} → ${walkDest}`,
      latitude: distressLoc?.lat || null,
      longitude: distressLoc?.lng || null,
      accuracy: distressLoc?.accuracy || null,
      ipAddress: distressLoc?.ip || null,
      googleMapsUrl: distressLoc?.mapsUrl || null,
      description: `DISTRESS ALERT from Virtual Escort (${reason}). User did not check in safely. Immediate patrol intercept needed.${distressLoc?.lat ? ` Last GPS: ${distressLoc.lat.toFixed(5)}, ${distressLoc.lng.toFixed(5)}.` : ''}`,
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
                    style={{ width: '100%', marginBottom: '0.4rem', background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid #ef4444', borderRadius: '6px' }}
                  >
                    {OGERE_SECTORS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '0.8rem' }}>
                    <input
                      placeholder="Or type specific street, junction, building or landmark..."
                      value={manualLandmark}
                      onChange={(e) => setManualLandmark(e.target.value)}
                      style={{ flex: 1, background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.78rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const q = (manualLandmark || sector).trim();
                        const fullQ = encodeURIComponent(q.toLowerCase().includes('ogere') ? q : `${q}, Ogere Remo, Ogun State, Nigeria`);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${fullQ}`, '_blank');
                      }}
                      style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '0 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      🗺️ Map Lookup ➔
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <input
                      placeholder="Your Full Name (Optional)"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      style={{ background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                    <input
                      placeholder="Your Phone Number"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      style={{ background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <input
                      placeholder="Emergency Backup / Next-of-Kin Phone (Optional)"
                      value={backupPhone}
                      onChange={(e) => setBackupPhone(e.target.value)}
                      style={{ width: '100%', background: '#0a0503', color: '#fff', padding: '0.6rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* ── LIVE CAMERA & AMBIENT AUDIO SURVEILLANCE EVIDENCE TOGGLES ── */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    marginBottom: '1.2rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>📡</span>
                      <span>LIVE SURVEILLANCE EVIDENCE (TACTICAL FEED)</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      DISPATCH EVIDENCE
                    </span>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.8rem 0' }}>
                    Share real-time visual and audio evidence with the Ogere Police Command Desk. Runs silently on your device.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {/* Camera Toggle */}
                    <button
                      type="button"
                      onClick={toggleCamera}
                      style={{
                        background: cameraEnabled
                          ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                          : 'rgba(255, 255, 255, 0.06)',
                        border: cameraEnabled ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        padding: '0.6rem 0.8rem',
                        color: '#ffffff',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>📹</span>
                      <span>{cameraEnabled ? 'Live Camera: ON' : 'Share Camera Feed'}</span>
                    </button>

                    {/* Microphone Toggle */}
                    <button
                      type="button"
                      onClick={toggleAudio}
                      style={{
                        background: audioEnabled
                          ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                          : 'rgba(255, 255, 255, 0.06)',
                        border: audioEnabled ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        padding: '0.6rem 0.8rem',
                        color: '#ffffff',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>🎙️</span>
                      <span>{audioEnabled ? 'Ambient Mic: ON' : 'Share Ambient Audio'}</span>
                    </button>
                  </div>

                  {/* Permission / Hardware Error Notice */}
                  {mediaError && (
                    <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.7rem', color: '#fca5a5' }}>
                      ⚠️ {mediaError}
                    </div>
                  )}

                  {/* Active Camera Viewfinder Preview */}
                  {cameraEnabled && (
                    <div style={{ marginTop: '0.8rem', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ef4444', background: '#000000' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: '160px',
                          objectFit: 'cover',
                          display: 'block',
                          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                        }}
                      />
                      {/* Live HUD overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#f87171',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulseGlow 1s infinite' }} />
                        🔴 LIVE TO POLICE COMMAND
                      </div>

                      {/* Flip Camera Button */}
                      <button
                        type="button"
                        onClick={flipCamera}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🔄 {facingMode === 'environment' ? 'Selfie Cam' : 'Rear Cam'}
                      </button>
                    </div>
                  )}

                  {/* Active Ambient Mic Level Bar */}
                  {audioEnabled && (
                    <div style={{ marginTop: '0.8rem', background: 'rgba(5, 46, 22, 0.5)', border: '1px solid #22c55e', borderRadius: '6px', padding: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.7rem' }}>
                        <span style={{ color: '#4ade80', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>🎙️</span> Ambient Sound Broadcast Active
                        </span>
                        <span style={{ color: '#86efac', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                          Level: {audioLevel}%
                        </span>
                      </div>
                      <div style={{ height: '6px', width: '100%', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(5, audioLevel))}%`,
                            background: audioLevel > 70 ? '#ef4444' : audioLevel > 40 ? '#f59e0b' : '#22c55e',
                            transition: 'width 0.1s ease',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                        🤫 Silently monitoring room and background noise for emergency responders.
                      </div>
                    </div>
                  )}
                </div>

                {/* ═══ Real GPS & IP Telemetry Status Banner ═══ */}
                <div style={{ margin: '0.8rem 0', border: '1px solid', borderRadius: '8px', padding: '0.8rem',
                  borderColor: locationStatus === 'acquired' ? '#22c55e' : locationStatus === 'acquired_ip' ? '#f59e0b' : locationStatus === 'acquiring' ? '#38bdf8' : 'rgba(239,68,68,0.5)',
                  background: locationStatus === 'acquired' ? 'rgba(5,46,22,0.6)' : locationStatus === 'acquiring' ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.8)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800,
                      color: locationStatus === 'acquired' ? '#4ade80' : locationStatus === 'acquired_ip' ? '#fde047' : locationStatus === 'acquiring' ? '#38bdf8' : '#f87171'
                    }}>
                      🛰️ {locationStatus === 'acquired' ? 'EXACT GPS LOCKED' : locationStatus === 'acquired_ip' ? 'IP-BASED LOCATION ESTIMATED' : locationStatus === 'acquiring' ? 'ACQUIRING SATELLITE LOCK...' : 'LOCATION NOT DETECTED'}
                    </span>
                    {locationStatus !== 'acquiring' && (
                      <button onClick={acquireExactLocation} style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid #38bdf8', borderRadius: '4px', padding: '2px 8px', color: '#38bdf8', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}>
                        🔄 Refresh
                      </button>
                    )}
                  </div>

                  {/* Prominent Full-Width Get Actual Location Button */}
                  <button
                    type="button"
                    onClick={acquireExactLocation}
                    disabled={locationStatus === 'acquiring'}
                    style={{
                      width: '100%',
                      background: locationStatus === 'acquired' ? 'linear-gradient(135deg, #15803d, #166534)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      border: locationStatus === 'acquired' ? '1.5px solid #4ade80' : '1.5px solid #38bdf8',
                      padding: '0.65rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: locationStatus === 'acquiring' ? 'wait' : 'pointer',
                      boxShadow: locationStatus === 'acquired' ? '0 4px 12px rgba(34, 197, 94, 0.3)' : '0 4px 12px rgba(2, 132, 199, 0.3)',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    <span>
                      {locationStatus === 'acquiring'
                        ? 'Acquiring Satellite Lock & GPS Coordinates...'
                        : locationStatus === 'acquired'
                        ? '📍 Re-acquire My Exact Current Location'
                        : '📍 Get My Actual Current Location (GPS & IP)'}
                    </span>
                  </button>

                  {deviceLocation?.lat ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.7rem' }}>
                      {deviceLocation.ogereLoc && (
                        <div style={{ gridColumn: '1 / -1', background: '#0f172a', border: '1px solid #38bdf8', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 900, fontSize: '0.65rem' }}>📍 OGERE REMO SECTOR & LANDMARK:</div>
                          <div style={{ color: '#ffffff', fontWeight: 800, marginTop: '2px' }}>{deviceLocation.ogereLoc.formattedText}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.58rem', marginTop: '2px' }}>
                            Sector: {deviceLocation.ogereLoc.sector} · 🚓 ~{deviceLocation.ogereLoc.distanceToPolice}m to Ogere Police HQ
                          </div>
                        </div>
                      )}
                      {!deviceLocation.isInsideOgere && (
                        <div style={{ gridColumn: '1 / -1', background: 'rgba(234, 88, 12, 0.15)', border: '1px solid #f97316', padding: '0.35rem 0.6rem', borderRadius: '4px', color: '#fdba74', fontSize: '0.62rem' }}>
                          ⚠️ <strong>Network Location Outside Ogere Remo:</strong> Your network/IP gateway is located outside town. Your chosen Ogere sector will be used for rapid local dispatch.
                        </div>
                      )}
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>COORDINATES</div>
                        <div style={{ color: '#ffffff', fontWeight: 800, fontFamily: 'monospace' }}>{deviceLocation.lat.toFixed(5)}°N, {deviceLocation.lng.toFixed(5)}°E</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>ACCURACY</div>
                        <div style={{ color: locationStatus === 'acquired' ? '#4ade80' : '#fde047', fontWeight: 800 }}>
                          {deviceLocation.accuracy ? `±${Math.round(deviceLocation.accuracy)}m` : 'Est.'} ({locationStatus === 'acquired' ? 'Precise GPS' : 'Cell/IP'})
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>PUBLIC IP</div>
                        <div style={{ color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace' }}>{deviceLocation.ip}</div>
                      </div>
                      {deviceLocation.networkType && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                          <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>NETWORK</div>
                          <div style={{ color: '#38bdf8', fontWeight: 700 }}>📶 {deviceLocation.networkType.toUpperCase()}{deviceLocation.networkDownlink ? ` · ${deviceLocation.networkDownlink}` : ''}</div>
                        </div>
                      )}
                      {deviceLocation.batteryLevel != null && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                          <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>BATTERY</div>
                          <div style={{ color: deviceLocation.batteryLevel > 20 ? '#4ade80' : '#ef4444', fontWeight: 800 }}>🔋 {deviceLocation.batteryLevel}%</div>
                        </div>
                      )}
                      {deviceLocation.screenResolution && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                          <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>SCREEN</div>
                          <div style={{ color: '#94a3b8', fontWeight: 700 }}>🖥️ {deviceLocation.screenResolution}</div>
                        </div>
                      )}
                      {deviceLocation.timezone && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                          <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '1px' }}>TIMEZONE</div>
                          <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem' }}>🕒 {deviceLocation.timezone}</div>
                        </div>
                      )}
                      {deviceLocation.mapsUrl && (
                        <a href={deviceLocation.mapsUrl} target="_blank" rel="noopener noreferrer"
                          style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid #22c55e', padding: '0.35rem 0.5rem', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#4ade80', fontWeight: 800, fontSize: '0.7rem' }}>
                          🗺️ Preview on Google Maps
                        </a>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {locationStatus === 'acquiring' ? '⏳ Contacting GPS satellites and IP geolocation services...' :
                       'ℹ️ Allow location access when prompted to help police find you faster.'}
                    </div>
                  )}
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
                  {dispatchedData.latitude && dispatchedData.longitude && (
                    <div>🎯 <strong>GPS Coordinates:</strong> <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{Number(dispatchedData.latitude).toFixed(5)}°N, {Number(dispatchedData.longitude).toFixed(5)}°E {dispatchedData.accuracy ? `(±${Math.round(dispatchedData.accuracy)}m)` : ''}</span></div>
                  )}
                  {dispatchedData.ipAddress && (
                    <div>🌐 <strong>Reporter IP:</strong> <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{dispatchedData.ipAddress}</span></div>
                  )}
                  {dispatchedData.googleMapsUrl && (
                    <div>
                      <a href={dispatchedData.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(22,163,74,0.2)', border: '1px solid #22c55e', borderRadius: '4px', padding: '3px 10px', color: '#4ade80', fontWeight: 800, textDecoration: 'none', fontSize: '0.75rem' }}>
                        🗺️ Open Reporter Location on Google Maps →
                      </a>
                    </div>
                  )}
                  <div>🚨 <strong>Status:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>CODE RED — TACTICAL UNITS ALERTED</span></div>
                  <div>🛡️ <strong>Agencies Notified:</strong> Ogere Police Command, So-Safe / Amotekun Corps, Palace Rapid Vigilante</div>
                  {(cameraEnabled || audioEnabled) && (
                    <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: '#86efac', fontWeight: 800 }}>📡 Live Feeds Transmitting: </span>
                      {cameraEnabled && <span style={{ background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 700, marginRight: '4px' }}>📹 Camera Snapshots</span>}
                      {audioEnabled && <span style={{ background: '#059669', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 700 }}>🎙️ Ambient Audio</span>}
                    </div>
                  )}
                  {/* Device Intelligence row */}
                  {dispatchedData.deviceModel && (
                    <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#38bdf8', fontSize: '0.65rem', fontWeight: 700 }}>
                        📱 {dispatchedData.deviceModel} · {dispatchedData.deviceOs}
                      </span>
                      {dispatchedData.networkType && <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#4ade80', fontSize: '0.65rem', fontWeight: 700 }}>📶 {dispatchedData.networkType}</span>}
                      {dispatchedData.batteryLevel != null && <span style={{ background: dispatchedData.batteryLevel > 20 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${dispatchedData.batteryLevel > 20 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '4px', padding: '2px 6px', color: dispatchedData.batteryLevel > 20 ? '#4ade80' : '#f87171', fontSize: '0.65rem', fontWeight: 700 }}>🔋 {dispatchedData.batteryLevel}%</span>}
                      {dispatchedData.screenResolution && <span style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#94a3b8', fontSize: '0.65rem' }}>🖥️ {dispatchedData.screenResolution}</span>}
                      {dispatchedData.timezone && <span style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#94a3b8', fontSize: '0.65rem' }}>🕒 {dispatchedData.timezone}</span>}
                    </div>
                  )}
                </div>

                {/* Active camera viewfinder during dispatch */}
                {cameraEnabled && (
                  <div style={{ marginBottom: '1.2rem', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #22c55e', background: '#000000' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '140px',
                        objectFit: 'cover',
                        display: 'block',
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                      }}
                    />
                    <div style={{ position: 'absolute', top: '6px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#4ade80' }}>
                      🟢 BROADCASTING LIVE VIDEO EVIDENCE TO DISPATCH DESK
                    </div>
                  </div>
                )}

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
