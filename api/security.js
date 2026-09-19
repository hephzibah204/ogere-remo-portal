import { sqlQuery } from './lib/db.js';

// In-memory fallback buffers if database connection is in mock/offline mode
let memoryIncidents = [
  {
    id: 'INC-2026-901',
    category: '🚨 Armed Robbery / Banditry',
    severity: 'Critical',
    threat_level: 'CODE_RED',
    is_silent_panic: false,
    is_live_tracking: true,
    assigned_agency: 'Nigeria Police Force (NPF)',
    responding_unit: 'Patrol Unit 4 — Highway Delta',
    agency_notes: 'Officer Kayode Adeleke dispatched to KM 67 axis.',
    location: 'KM 67 Tollgate Expressway Corridor, Ogere Remo',
    latitude: 6.9388,
    longitude: 3.6437,
    accuracy: 4.5,
    ip_address: '197.210.54.12',
    google_maps_url: 'https://www.google.com/maps?q=6.9388,3.6437',
    description: 'Armed robbery beacon triggered along expressway bypass. Intercept team en route.',
    reporter_name: 'Concerned Motorist',
    reporter_phone: '08033221144',
    status: 'dispatched',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'INC-2026-902',
    category: '🔥 Tanker Fire Precaution',
    severity: 'High',
    threat_level: 'CODE_ORANGE',
    is_silent_panic: false,
    is_live_tracking: false,
    assigned_agency: 'Fire Service / So-Safe Corps',
    responding_unit: 'Trailer Park Post B',
    agency_notes: 'Tanker cooling underway. Traffic diverted to bypass.',
    location: 'Ogere Trailer Park South Gate',
    latitude: 6.9366,
    longitude: 3.6344,
    accuracy: 8.0,
    ip_address: '105.112.98.45',
    google_maps_url: 'https://www.google.com/maps?q=6.9366,3.6344',
    description: 'Diesel truck overheating at truck parking depot.',
    reporter_name: 'Depot Marshal',
    reporter_phone: '08099887766',
    status: 'investigating',
    created_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  }
];

let memoryBroadcasts = [
  {
    id: 'bcast_01',
    title: 'Expressway Night Visibility & Safety Advisory',
    message: 'Heavy fog and haulage traffic reported along KM 66-68 Lagos-Ibadan Expressway. Joint patrol units active.',
    severity: 'CRITICAL',
    target_sector: 'All Ogere Remo Sectors',
    author_role: 'Palace Security Secretariat',
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

let memoryEscorts = [];
let memoryLocationPings = [];
let memoryTips = [];
let memoryPatrolCheckins = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const subroute = pathname.split('/').filter(Boolean).pop() || '';

  // ─────────────────────────────────────────────────────────────────────────────
  // 0. REAL-TIME GEOCODING & HIGH PRECISION LOCATION: /api/geocode
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'geocode' || pathname.includes('/geocode')) {
    const OGERE_LANDMARKS = [
      { name: 'Aafin Ologere Palace & Royal Square', sector: 'Sector 2 — Central Heritage Core', lat: 6.9368, lng: 3.6330, address: 'Palace Way, Oke-Ogere' },
      { name: 'Ogere Toll Gate / Expressway Intercept', sector: 'Sector 1 — Highway Corridor', lat: 6.9388, lng: 3.6437, address: 'KM 67 Lagos-Ibadan Expressway' },
      { name: 'Ogere Resort & Convention Centre', sector: 'Sector 1 — Highway Corridor', lat: 6.9388, lng: 3.6437, address: 'KM 67 Lagos-Ibadan Expressway' },
      { name: 'Ogere Central Market (Oja Ogere)', sector: 'Sector 2 — Central Heritage Core', lat: 6.9354, lng: 3.6338, address: 'Market Road, Oke-Ogere' },
      { name: 'Ogere Police Divisional Station', sector: 'Sector 3 — Security & Emergency', lat: 6.9348, lng: 3.6356, address: 'Palace Way, Ogere Remo' },
      { name: 'Ogere State Hospital & Health Centre', sector: 'Sector 4 — Medical & Social', lat: 6.9325, lng: 3.6310, address: 'Isale-Ogere Hospital Road' },
      { name: 'Ogere Trailer Park & Logistics Hub', sector: 'Sector 1 — Highway Corridor', lat: 6.9366, lng: 3.6344, address: 'Expressway Bypass South' },
      { name: 'Ositelu Memorial College', sector: 'Sector 5 — Academic Belt', lat: 6.9405, lng: 3.6397, address: 'Awomosu Agbato Drive' },
      { name: 'The Church of the Lord (Aladura) Worldwide HQ', sector: 'Sector 2 — Central Heritage Core', lat: 6.9360, lng: 3.6420, address: 'Mount Taborar, Lisa Quarter' },
      { name: 'Ogere Town Hall & Civic Centre (OCDA HQ)', sector: 'Sector 2 — Central Heritage Core', lat: 6.9363, lng: 3.6318, address: 'Town Centre, Ogere Remo' },
      { name: 'Agbele Ancestral Corridor', sector: 'Sector 6 — Western Residential', lat: 6.9290, lng: 3.6260, address: 'Agbele / Odo-Alaro Road' },
      { name: 'Saapade Junction / Remo North Axis', sector: 'Sector 7 — Northern Gateway', lat: 6.9550, lng: 3.6480, address: 'Ibadan-Remo Arterial Junction' },
      { name: 'Hephzibah Edutech & Innovation Campus', sector: 'Sector 2 — Central Heritage Core', lat: 6.9378, lng: 3.6360, address: 'Palace Way / Expressway Corridor' },
    ];

    function calcDist(lat1, lon1, lat2, lon2) {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    function getMaps(lat, lng) {
      const safeLat = Number(lat).toFixed(6);
      const safeLng = Number(lng).toFixed(6);
      return {
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`,
        satelliteMapsUrl: `https://www.google.com/maps?q=${safeLat},${safeLng}&ll=${safeLat},${safeLng}&z=19&t=k`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}&travelmode=driving`,
        embedUrl: `https://maps.google.com/maps?q=${safeLat},${safeLng}&z=17&ie=UTF8&output=embed`,
      };
    }

    const queryParams = req.query || Object.fromEntries(searchParams.entries());
    const body = req.body || {};

    const query = queryParams.q || queryParams.query || body.q || body.query;
    const latParam = queryParams.lat || queryParams.latitude || body.lat || body.latitude;
    const lngParam = queryParams.lng || queryParams.longitude || body.lng || body.longitude;

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ success: false, error: 'Invalid latitude or longitude coordinates.' });
      }

      let closestLandmark = OGERE_LANDMARKS[0];
      let minDistance = Infinity;
      for (const lm of OGERE_LANDMARKS) {
        const dist = calcDist(lat, lng, lm.lat, lm.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestLandmark = lm;
        }
      }

      const isInsideOgere = lat >= 6.905 && lat <= 6.975 && lng >= 3.605 && lng <= 3.675;
      let liveAddress = null;
      let rawNominatim = null;

      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 4500);
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'OgereRemoCivicPortal/2.1 (contact@ogeremo.org)',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: ctrl.signal,
          }
        );
        clearTimeout(tid);
        if (nomRes.ok) {
          rawNominatim = await nomRes.json();
          const addr = rawNominatim.address || {};
          const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
          const suburb = addr.suburb || addr.quarter || addr.village || addr.city_district || '';
          const town = addr.town || addr.city || addr.county || 'Ogere Remo';
          const state = addr.state || 'Ogun State';
          const country = addr.country || 'Nigeria';
          const parts = [road, suburb, town, state, country].filter(Boolean);
          if (parts.length > 0) liveAddress = parts.join(', ');
        }
      } catch (_) {}

      const formattedLandmark = minDistance <= 50
        ? `Directly at ${closestLandmark.name}`
        : minDistance <= 500
        ? `~${minDistance}m from ${closestLandmark.name} (${closestLandmark.sector})`
        : isInsideOgere
        ? `~${(minDistance / 1000).toFixed(1)}km from ${closestLandmark.name} (Ogere Remo)`
        : `~${Math.round(minDistance / 1000)}km outside Ogere Remo`;

      const finalAddress = liveAddress || `${closestLandmark.address}, Ogere Remo, Ogun State, Nigeria`;
      const maps = getMaps(lat, lng);

      return res.status(200).json({
        success: true,
        latitude: lat,
        longitude: lng,
        address: finalAddress,
        rawAddress: rawNominatim?.address || null,
        isInsideOgere,
        nearestLandmark: closestLandmark.name,
        landmarkSector: closestLandmark.sector,
        distanceToLandmarkMeters: minDistance,
        landmarkFormatted: formattedLandmark,
        ...maps,
      });
    }

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const results = [];

      for (const lm of OGERE_LANDMARKS) {
        if (
          lm.name.toLowerCase().includes(qLower) ||
          lm.address.toLowerCase().includes(qLower) ||
          lm.sector.toLowerCase().includes(qLower)
        ) {
          results.push({
            id: `local-${lm.name.replace(/\s+/g, '-').toLowerCase()}`,
            name: lm.name,
            address: `${lm.address}, Ogere Remo, Ogun State`,
            sector: lm.sector,
            latitude: lm.lat,
            longitude: lm.lng,
            isLocal: true,
            ...getMaps(lm.lat, lm.lng),
          });
        }
      }

      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 4500);
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=ng&limit=5&addressdetails=1`;
        const nomRes = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'OgereRemoCivicPortal/2.1 (contact@ogeremo.org)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: ctrl.signal,
        });
        clearTimeout(tid);
        if (nomRes.ok) {
          const data = await nomRes.json();
          for (const item of data) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            results.push({
              id: `nom-${item.place_id}`,
              name: item.name || item.display_name.split(',')[0],
              address: item.display_name,
              sector: 'External Coordinate Point',
              latitude: lat,
              longitude: lng,
              isLocal: false,
              ...getMaps(lat, lng),
            });
          }
        }
      } catch (_) {}

      return res.status(200).json({
        success: true,
        query,
        count: results.length,
        results,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Provide either "q" (for address search) or "lat" and "lng" (for reverse geocoding).',
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LIVE LOCATION & BREADCRUMBS: /api/live-location
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'live-location' || pathname.includes('/live-location')) {
    if (req.method === 'POST') {
      const { incidentId, latitude, longitude, heading, speed, accuracy, isEnded } = req.body || {};
      if (!incidentId) {
        return res.status(400).json({ success: false, error: 'incidentId required.' });
      }

      if (isEnded) {
        try {
          await sqlQuery(
            `UPDATE incident_reports SET is_live_tracking = FALSE WHERE id = $1`,
            [incidentId]
          ).catch(() => {});
        } catch (_) {}
        const inc = memoryIncidents.find((i) => i.id === incidentId);
        if (inc) inc.is_live_tracking = false;
        return res.status(200).json({ success: true, message: 'Live tracking session ended.' });
      }

      if (!latitude || !longitude) {
        return res.status(400).json({ success: false, error: 'latitude and longitude required.' });
      }

      const ping = {
        id: Date.now(),
        incident_id: incidentId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        heading: heading || null,
        speed: speed || null,
        accuracy: accuracy || null,
        created_at: new Date().toISOString(),
      };
      memoryLocationPings.unshift(ping);

      try {
        await sqlQuery(
          `INSERT INTO incident_location_pings (incident_id, latitude, longitude, heading, speed, accuracy)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [incidentId, latitude, longitude, heading || null, speed || null, accuracy || null]
        ).catch(() => {});

        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        await sqlQuery(
          `UPDATE incident_reports
           SET latitude = $1, longitude = $2, accuracy = $3, google_maps_url = $4, last_ping_at = CURRENT_TIMESTAMP, is_live_tracking = TRUE
           WHERE id = $5`,
          [latitude, longitude, accuracy || null, mapsUrl, incidentId]
        ).catch(() => {});
      } catch (_) {}

      // Update in-memory copy
      const inc = memoryIncidents.find((i) => i.id === incidentId);
      if (inc) {
        inc.latitude = parseFloat(latitude);
        inc.longitude = parseFloat(longitude);
        inc.accuracy = accuracy ? parseFloat(accuracy) : null;
        inc.google_maps_url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        inc.last_ping_at = ping.created_at;
        inc.is_live_tracking = true;
      }

      return res.status(200).json({ success: true, message: 'Live coordinate streamed.', ping });
    }

    // GET breadcrumbs for an incident
    const incidentId = searchParams.get('incidentId') || '';
    let breadcrumbs = [];
    let incidentData = null;

    try {
      const incRows = await sqlQuery('SELECT * FROM incident_reports WHERE id = $1', [incidentId]).catch(() => []);
      incidentData = incRows[0] || memoryIncidents.find((i) => i.id === incidentId) || null;

      const pings = await sqlQuery(
        'SELECT * FROM incident_location_pings WHERE incident_id = $1 ORDER BY created_at DESC LIMIT 30',
        [incidentId]
      ).catch(() => []);
      breadcrumbs = pings.length > 0 ? pings : memoryLocationPings.filter((p) => p.incident_id === incidentId).slice(0, 30);
    } catch (_) {
      incidentData = memoryIncidents.find((i) => i.id === incidentId) || null;
      breadcrumbs = memoryLocationPings.filter((p) => p.incident_id === incidentId).slice(0, 30);
    }

    return res.status(200).json({ success: true, incident: incidentData, breadcrumbs });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. VIRTUAL SAFE ESCORT ("WALK WITH ME"): /api/escort
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'escort' || pathname.includes('/escort')) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const action = body.action || 'start';

      // A. START ESCORT
      if (action === 'start') {
        const escortId = body.escortId || body.id || `ESC-${Date.now().toString().slice(-6)}`;
        const duration = parseInt(body.durationMinutes || '20', 10);
        const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
        const newEscort = {
          id: escortId,
          user_id: body.userId || 'citizen_user',
          citizen_name: body.citizenName || body.name || 'Citizen User',
          citizen_phone: body.citizenPhone || body.userId || '08081762371',
          origin: body.origin || 'Ogere Remo Corridor',
          destination: body.destination || 'Agbele Ancestral Farmland',
          duration_minutes: duration,
          remaining_seconds: duration * 60,
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
          status: 'active',
          safety_pin: body.safetyPin || '1234',
          duress_pin: '9999',
          last_latitude: parseFloat(body.latitude || 6.9371),
          last_longitude: parseFloat(body.longitude || 3.6335),
          battery_level: body.batteryLevel || 88,
          accuracy: body.accuracy || 6,
          assignedUnit: body.assignedUnit || 'Patrol Unit 4 (Highway & Rural Intercept)',
        };
        memoryEscorts.unshift(newEscort);

        try {
          await sqlQuery(
            `INSERT INTO virtual_escorts 
              (id, user_id, destination, duration_minutes, expires_at, status, safety_pin, duress_pin, last_latitude, last_longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              escortId,
              newEscort.user_id,
              newEscort.destination,
              duration,
              expiresAt,
              'active',
              newEscort.safety_pin,
              '9999',
              newEscort.last_latitude,
              newEscort.last_longitude,
            ]
          ).catch(() => {});
        } catch (_) {}

        return res.status(201).json({
          success: true,
          message: 'Virtual safe escort session initiated. Ogere Security Command Watchdog active.',
          escort: newEscort,
        });
      }

      // B. HEARTBEAT PING & REAL-TIME TELEMETRY
      if (action === 'ping') {
        const { escortId, latitude, longitude, speed, heading, accuracy, batteryLevel, isCharging } = body;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const esc = memoryEscorts.find((e) => e.id === escortId);
        if (esc) {
          if (!isNaN(lat)) esc.last_latitude = lat;
          if (!isNaN(lng)) esc.last_longitude = lng;
          esc.speed = speed != null ? parseFloat(speed) : esc.speed;
          esc.heading = heading != null ? parseFloat(heading) : esc.heading;
          esc.accuracy = accuracy != null ? parseFloat(accuracy) : esc.accuracy;
          if (batteryLevel != null) esc.battery_level = batteryLevel;
          if (isCharging != null) esc.is_charging = isCharging;
          esc.last_ping_at = new Date().toISOString();
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          memoryLocationPings.unshift({
            id: Date.now(),
            incident_id: escortId,
            latitude: lat,
            longitude: lng,
            heading: heading || null,
            speed: speed || null,
            accuracy: accuracy || null,
            created_at: new Date().toISOString(),
          });
        }

        try {
          await sqlQuery(
            `UPDATE virtual_escorts SET last_latitude = $1, last_longitude = $2 WHERE id = $3`,
            [lat, lng, escortId]
          ).catch(() => {});
        } catch (_) {}
        return res.status(200).json({ success: true, message: 'Live escort ping recorded.', escort: esc });
      }

      // C. CHECK-IN PIN VERIFICATION
      if (action === 'checkin') {
        const { escortId, pin } = body;
        const esc = memoryEscorts.find((e) => e.id === escortId);

        if (pin === '9999') {
          // COVERT DURESS PIN TRIGGERED!
          // Silently dispatch a CODE_RED incident to Police and Vigilante Command!
          const incidentId = `INC-DURESS-${Date.now().toString().slice(-4)}`;
          const duressIncident = {
            id: incidentId,
            category: '🚷 Kidnapping / Hostage Duress Alarm',
            severity: 'Critical',
            threat_level: 'CODE_RED',
            is_silent_panic: true,
            is_live_tracking: true,
            assigned_agency: 'Police / SWAT Rapid Response',
            responding_unit: 'Tactical Squad 1',
            location: esc ? esc.destination : 'Ogere Remo Outpost Axis',
            latitude: esc ? esc.last_latitude : 6.9371,
            longitude: esc ? esc.last_longitude : 3.6335,
            description: `COVERT DURESS TRIGGERED! User entered hostage PIN 9999 on Walk With Me session ${escortId}. Destination: ${esc?.destination || 'En route'}. Suspects may be holding victim.`,
            reporter_name: 'Covert Panic Beacon',
            reporter_phone: 'DISPATCH',
            status: 'open',
            created_at: new Date().toISOString(),
          };

          memoryIncidents.unshift(duressIncident);
          if (esc) esc.status = 'duress_triggered';

          duressIncident.ip_address = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
          duressIncident.google_maps_url = `https://www.google.com/maps?q=${duressIncident.latitude},${duressIncident.longitude}`;

          try {
            await sqlQuery(
              `INSERT INTO incident_reports 
                (id, category, severity, threat_level, is_silent_panic, is_live_tracking, assigned_agency, responding_unit, location, latitude, longitude, description, reporter_name, ip_address, google_maps_url, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
              [
                incidentId,
                duressIncident.category,
                'Critical',
                'CODE_RED',
                true,
                true,
                'Police / SWAT Rapid Response',
                'Tactical Squad 1',
                duressIncident.location,
                duressIncident.latitude,
                duressIncident.longitude,
                duressIncident.description,
                'Covert Panic Beacon',
                duressIncident.ip_address,
                duressIncident.google_maps_url,
                'open',
              ]
            ).catch(() => {});

            await sqlQuery(`UPDATE virtual_escorts SET status = 'duress_triggered', incident_id = $1 WHERE id = $2`, [
              incidentId,
              escortId,
            ]).catch(() => {});
          } catch (_) {}

          return res.status(200).json({
            success: true,
            message: 'Session closed.',
            isDuress: true,
            incidentId,
          });
        }

        // Standard Safe Arrival PIN
        if (esc) esc.status = 'safe_arrival';
        try {
          await sqlQuery(`UPDATE virtual_escorts SET status = 'safe_arrival' WHERE id = $1`, [escortId]).catch(() => {});
        } catch (_) {}

        return res.status(200).json({
          success: true,
          message: 'Safe arrival verified. Escort watchdog decommissioned.',
          isDuress: false,
        });
      }
    }

    const escortId = searchParams.get('escortId') || searchParams.get('id');
    if (escortId) {
      const esc = memoryEscorts.find((e) => e.id === escortId);
      const breadcrumbs = memoryLocationPings.filter((p) => p.incident_id === escortId).slice(0, 50);
      if (esc) {
        return res.status(200).json({ success: true, escort: esc, breadcrumbs });
      }
      return res.status(404).json({ success: false, error: 'Escort session not found.' });
    }

    const activeList = memoryEscorts.filter((e) => e.status === 'active' || e.status === 'ACTIVE_MONITORING');
    return res.status(200).json({ success: true, escorts: activeList.length > 0 ? activeList : memoryEscorts.slice(0, 10) });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. BROADCASTS & PALACE AMBER ALERTS: /api/broadcasts
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'broadcasts' || pathname.includes('/broadcasts')) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const broadcastId = `BCAST-${Date.now().toString().slice(-6)}`;
      const newBcast = {
        id: broadcastId,
        title: body.title || 'Town Emergency Advisory',
        message: body.message || 'Civic announcement from Ogere security desk.',
        severity: body.severity || 'CRITICAL',
        target_sector: body.targetSector || 'All Ogere Remo Sectors',
        author_role: body.authorRole || 'Palace Security Secretariat',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      memoryBroadcasts.unshift(newBcast);

      try {
        await sqlQuery(
          `INSERT INTO community_broadcasts (id, title, message, severity, target_sector, author_role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [broadcastId, newBcast.title, newBcast.message, newBcast.severity, newBcast.target_sector, newBcast.author_role, true]
        ).catch(() => {});
      } catch (_) {}

      return res.status(201).json({ success: true, message: 'Palace broadcast published.', broadcast: newBcast });
    }

    if (req.method === 'PATCH') {
      const { id, isActive } = req.body || {};
      const found = memoryBroadcasts.find((b) => b.id === id);
      if (found) found.is_active = isActive !== false;
      try {
        await sqlQuery('UPDATE community_broadcasts SET is_active = $1 WHERE id = $2', [isActive, id]).catch(() => {});
      } catch (_) {}
      return res.status(200).json({ success: true, message: 'Broadcast updated.' });
    }

    try {
      const rows = await sqlQuery('SELECT * FROM community_broadcasts WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 10').catch(() => []);
      const results = rows.length > 0 ? rows : memoryBroadcasts.filter((b) => b.is_active);
      return res.status(200).json({ success: true, broadcasts: results });
    } catch (_) {
      return res.status(200).json({ success: true, broadcasts: memoryBroadcasts.filter((b) => b.is_active) });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. ANONYMOUS WHISTLEBLOWER: /api/whistleblower
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'whistleblower' || pathname.includes('/whistleblower')) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const tipToken = `OGR-TIP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTip = {
        id: `TIP-${Date.now().toString().slice(-6)}`,
        tip_token: tipToken,
        category: body.category || 'Anonymous Intel',
        description: body.description || '',
        sector: body.location || body.sector || 'Ogere Expressway Corridor',
        latitude: body.latitude || 6.9371,
        longitude: body.longitude || 3.6335,
        status: 'submitted',
        officer_response: 'Intel received by Palace & Joint Security Operations Desk. Under preliminary evaluation.',
        created_at: new Date().toISOString(),
      };
      memoryTips.unshift(newTip);

      try {
        await sqlQuery(
          `INSERT INTO anonymous_tips (id, tip_token, category, description, sector, latitude, longitude, status, officer_response)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newTip.id,
            newTip.tip_token,
            newTip.category,
            newTip.description,
            newTip.sector,
            newTip.latitude,
            newTip.longitude,
            newTip.status,
            newTip.officer_response,
          ]
        ).catch(() => {});
      } catch (_) {}

      return res.status(201).json({
        success: true,
        message: 'Intel transmitted with zero personal trace.',
        token: tipToken,
        tipToken,
        tip: newTip,
      });
    }

    if (req.method === 'PATCH') {
      const { tipToken, status, officerResponse } = req.body || {};
      const tip = memoryTips.find((t) => t.tip_token === tipToken);
      if (tip) {
        if (status) tip.status = status;
        if (officerResponse) tip.officer_response = officerResponse;
      }
      try {
        await sqlQuery(
          `UPDATE anonymous_tips SET status = COALESCE($1, status), officer_response = COALESCE($2, officer_response) WHERE tip_token = $3`,
          [status, officerResponse, tipToken]
        ).catch(() => {});
      } catch (_) {}
      return res.status(200).json({ success: true, message: 'Tip updated.', tip });
    }

    const queryToken = searchParams.get('token');
    if (queryToken) {
      const tokenUpper = queryToken.trim().toUpperCase();
      try {
        const rows = await sqlQuery('SELECT * FROM anonymous_tips WHERE UPPER(tip_token) = $1 LIMIT 1', [tokenUpper]).catch(() => []);
        const found = rows[0] || memoryTips.find((t) => (t.tip_token || '').toUpperCase() === tokenUpper);
        if (found) {
          return res.status(200).json({ success: true, tip: found });
        } else {
          return res.status(404).json({ success: false, error: 'No intelligence record found with this tracking token.' });
        }
      } catch (_) {
        const found = memoryTips.find((t) => (t.tip_token || '').toUpperCase() === tokenUpper);
        if (found) return res.status(200).json({ success: true, tip: found });
        return res.status(404).json({ success: false, error: 'No intelligence record found with this tracking token.' });
      }
    }

    try {
      const rows = await sqlQuery('SELECT * FROM anonymous_tips ORDER BY created_at DESC LIMIT 50').catch(() => []);
      const results = rows.length > 0 ? rows : memoryTips;
      return res.status(200).json({ success: true, tips: results });
    } catch (_) {
      return res.status(200).json({ success: true, tips: memoryTips });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. CCTV MUNICIPAL SURVEILLANCE MATRIX: /api/cctv
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'cctv' || pathname.includes('/cctv')) {
    const cctvCameras = [
      {
        id: 'CAM-01',
        name: 'Expressway Tollgate North (ANPR Radar)',
        sector: 'Sector 1 — Highway Corridor',
        location: 'KM 67 Lagos-Ibadan Expressway Intercept',
        latitude: 6.9388,
        longitude: 3.6437,
        agency: 'NPF / FRSC Intercept',
        resolution: '4K UHD · 60 FPS',
        fps: 60,
        latencyMs: 34,
        status: 'LIVE_HD',
        ptzCapable: true,
        anprEnabled: true,
        nightVision: true,
        streamUrl: 'https://stream.ogeremo.org/live/cam-01/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60',
        activePlates: ['LSR-821-XA (Toyota Hilux) - Pass', 'JJN-404-OG (DAF Tanker) - Verified'],
      },
      {
        id: 'CAM-02',
        name: 'Aafin Ologere Palace Square & Royal Esplanade (PTZ 360°)',
        sector: 'Sector 2 — Central Heritage Core',
        location: 'Palace Way, Oke-Ogere',
        latitude: 6.9368,
        longitude: 3.6330,
        agency: 'Palace Security Secretariat',
        resolution: '1080p · 30 FPS',
        fps: 30,
        latencyMs: 42,
        status: 'LIVE_HD',
        ptzCapable: true,
        anprEnabled: false,
        nightVision: true,
        streamUrl: 'https://stream.ogeremo.org/live/cam-02/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=60',
        activePlates: [],
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
        fps: 30,
        latencyMs: 48,
        status: 'MOTION_DETECTED',
        ptzCapable: true,
        anprEnabled: true,
        nightVision: true,
        streamUrl: 'https://stream.ogeremo.org/live/cam-03/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60',
        activePlates: ['KTU-912-XY (Mack Hauler) - Motion Flag'],
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
        fps: 30,
        latencyMs: 38,
        status: 'LIVE_HD',
        ptzCapable: true,
        anprEnabled: false,
        nightVision: false,
        streamUrl: 'https://stream.ogeremo.org/live/cam-04/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=60',
        activePlates: [],
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
        fps: 30,
        latencyMs: 29,
        status: 'LIVE_HD',
        ptzCapable: false,
        anprEnabled: false,
        nightVision: true,
        streamUrl: 'https://stream.ogeremo.org/live/cam-05/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=60',
        activePlates: [],
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
        fps: 30,
        latencyMs: 44,
        status: 'LIVE_HD',
        ptzCapable: true,
        anprEnabled: false,
        nightVision: true,
        streamUrl: 'https://stream.ogeremo.org/live/cam-06/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60',
        activePlates: [],
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
        fps: 60,
        latencyMs: 31,
        status: 'LIVE_HD',
        ptzCapable: true,
        anprEnabled: true,
        nightVision: true,
        streamUrl: 'https://stream.ogeremo.org/live/cam-07/hls.m3u8',
        thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=60',
        activePlates: ['ABJ-502-KW (Toyota Prado) - Verified Diplomatic'],
      },
    ];

    if (req.method === 'POST') {
      const { cameraId, action, pan, tilt, zoom } = req.body || {};
      return res.status(200).json({
        success: true,
        message: `CCTV PTZ command executed on ${cameraId}: ${action || 're-positioned'} [P:${pan || 0}°, T:${tilt || 0}°, Z:${zoom || 1}x].`,
        cameraId,
      });
    }

    return res.status(200).json({ success: true, cameras: cctvCameras, totalOnline: cctvCameras.length });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. PATROL CHECK-INS: /api/patrol-checkin
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'patrol-checkin' || pathname.includes('/patrol-checkin')) {
    if (req.method === 'POST') {
      const body = req.body || {};
      const checkin = {
        id: Date.now(),
        outpost_name: body.outpostName || 'Aafin Palace Gatehouse Outpost',
        officer_name: body.officerName || 'Patrol Unit',
        agency: body.agency || 'Joint Patrol',
        latitude: body.latitude || 6.9368,
        longitude: body.longitude || 3.633,
        checked_in_at: new Date().toISOString(),
      };
      memoryPatrolCheckins.unshift(checkin);
      return res.status(201).json({ success: true, message: 'Patrol check-in verified.', checkin });
    }

    return res.status(200).json({
      success: true,
      outposts: [
        { name: 'Aafin Gatehouse Outpost', lat: 6.9368, lng: 3.633 },
        { name: 'KM 67 Tollgate Highway Post', lat: 6.9388, lng: 3.6437 },
        { name: 'Trailer Park Logistics Post', lat: 6.9366, lng: 3.6344 },
      ],
      recentCheckins: memoryPatrolCheckins.slice(0, 10),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. PRIMARY INCIDENT DISPATCH: /api/incidents or /api/security
  // ─────────────────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {};
    const incidentId = body.id || `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Extract Real Client IP Address
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                  req.headers['x-real-ip'] ||
                  req.socket?.remoteAddress ||
                  req.connection?.remoteAddress ||
                  body.ipAddress ||
                  body.ip_address ||
                  '127.0.0.1';
    const clientIp = rawIp.replace(/^::ffff:/, '');

    // 2. Exact GPS Coordinates & Google Maps Link
    const parsedLat = parseFloat(body.latitude ?? body.lat);
    const parsedLng = parseFloat(body.longitude ?? body.lng);
    const latitude = !isNaN(parsedLat) ? parsedLat : 6.9388;
    const longitude = !isNaN(parsedLng) ? parsedLng : 3.6437;
    const accuracy = body.accuracy ? parseFloat(body.accuracy) : null;
    const googleMapsUrl = body.googleMapsUrl || `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 3. Device Intelligence
    const deviceModel = body.deviceModel || null;
    const deviceOs = body.deviceOs || null;
    const networkType = body.networkType || null;
    const networkGeneration = body.networkGeneration || null;
    const carrier = body.carrier || null;
    const batteryLevel = body.batteryLevel !== undefined && body.batteryLevel !== null ? parseFloat(body.batteryLevel) : null;
    const screenResolution = body.screenResolution || null;
    const locale = body.locale || null;
    const timezone = body.timezone || null;
    const appVersion = body.appVersion || null;
    // User-Agent as fallback device info for web clients
    const userAgent = req.headers['user-agent'] || null;

    const severity = body.severity || (body.category?.includes('🚨') || body.category?.includes('Robbery') || body.isSos ? 'Critical' : 'Medium');
    const threatLevel = body.threatLevel || (severity === 'Critical' ? 'CODE_RED' : severity === 'High' ? 'CODE_ORANGE' : 'CODE_YELLOW');
    const cameraFeedActive = Boolean(body.cameraFeedActive || body.camera_feed_active || body.hasLiveCamera);
    const audioFeedActive = Boolean(body.audioFeedActive || body.audio_feed_active || body.hasLiveAudio);
    const mediaUrl = body.mediaUrl || body.media_url || null;
    const mediaType = body.mediaType || body.media_type || (mediaUrl ? 'video' : null);

    const newIncident = {
      id: incidentId,
      category: body.category || 'General Incident',
      severity,
      threat_level: threatLevel,
      is_silent_panic: Boolean(body.isSilentPanic || body.is_silent_panic),
      is_live_tracking: Boolean(body.isLiveTracking || body.is_live_tracking),
      camera_feed_active: cameraFeedActive,
      audio_feed_active: audioFeedActive,
      media_url: mediaUrl,
      media_type: mediaType,
      assigned_agency: body.assignedAgency || (threatLevel === 'CODE_RED' ? 'Police / Joint Patrol Command' : 'All Agencies Broadcast'),
      responding_unit: body.respondingUnit || 'Dispatched Intercept Unit',
      agency_notes: body.agencyNotes || 'Incident received and logged into Ogere Joint Command Center.',
      location: body.location || body.landmark || 'Ogere Remo Corridor',
      latitude,
      longitude,
      accuracy,
      ip_address: clientIp,
      google_maps_url: googleMapsUrl,
      full_address: body.fullAddress || body.full_address || body.address || body.location || 'Ogere Remo Corridor',
      directions_url: body.directionsUrl || body.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
      // Device Intelligence fields
      device_model: deviceModel,
      device_os: deviceOs,
      network_type: networkType,
      network_generation: networkGeneration,
      carrier,
      battery_level: batteryLevel,
      screen_resolution: screenResolution,
      locale,
      timezone,
      app_version: appVersion,
      user_agent: userAgent,
      description: body.description || body.details || 'Emergency incident alert dispatched from mobile terminal.',
      reporter_name: body.isAnonymous ? 'Anonymous Citizen' : (body.reporterName || 'Concerned Citizen'),
      reporter_phone: body.isAnonymous ? null : (body.reporterPhone || 'N/A'),
      status: 'open',
      created_at: new Date().toISOString(),
      // SLA & Tactical Defense Engine
      sla_target_minutes: threatLevel === 'CODE_RED' ? 3 : threatLevel === 'CODE_ORANGE' ? 5 : 15,
      acknowledged_at: null,
      dispatched_at: null,
      arrived_at: null,
      resolved_at: null,
      sla_breached: false,
      voice_note_url: body.voiceNoteUrl || body.voice_note_url || null,
      evidence_files: Array.isArray(body.evidenceFiles) ? body.evidenceFiles : (body.evidenceFile ? [body.evidenceFile] : []),
      sitreps: [
        {
          timestamp: new Date().toISOString(),
          author: 'System Dispatch Engine',
          message: `Incident registered with threat level ${threatLevel}. Primary Agency: ${body.assignedAgency || 'Joint Command'}.`,
        }
      ],
    };

    memoryIncidents.unshift(newIncident);

    try {
      await sqlQuery(`
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS camera_feed_active BOOLEAN DEFAULT FALSE;
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS audio_feed_active BOOLEAN DEFAULT FALSE;
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS media_url TEXT;
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS media_type VARCHAR(32);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS accuracy DOUBLE PRECISION;
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS device_model VARCHAR(128);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS device_os VARCHAR(64);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS network_type VARCHAR(32);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS network_generation VARCHAR(16);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS carrier VARCHAR(64);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS battery_level SMALLINT;
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS screen_resolution VARCHAR(32);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS locale VARCHAR(16);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS timezone VARCHAR(64);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS app_version VARCHAR(32);
        ALTER TABLE incident_reports ADD COLUMN IF NOT EXISTS user_agent TEXT;
      `).catch(() => {});

      await sqlQuery(
        `INSERT INTO incident_reports
          (id, category, severity, threat_level, is_silent_panic, is_live_tracking, camera_feed_active, audio_feed_active,
           media_url, media_type, assigned_agency, responding_unit, agency_notes, location,
           latitude, longitude, accuracy, description, reporter_name, reporter_phone,
           ip_address, google_maps_url,
           device_model, device_os, network_type, network_generation, carrier,
           battery_level, screen_resolution, locale, timezone, app_version, user_agent, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)`,
        [
          incidentId,
          newIncident.category,
          newIncident.severity,
          newIncident.threat_level,
          newIncident.is_silent_panic,
          newIncident.is_live_tracking,
          newIncident.camera_feed_active,
          newIncident.audio_feed_active,
          newIncident.media_url,
          newIncident.media_type,
          newIncident.assigned_agency,
          newIncident.responding_unit,
          newIncident.agency_notes,
          newIncident.location,
          newIncident.latitude,
          newIncident.longitude,
          newIncident.accuracy,
          newIncident.description,
          newIncident.reporter_name,
          newIncident.reporter_phone,
          newIncident.ip_address,
          newIncident.google_maps_url,
          newIncident.device_model,
          newIncident.device_os,
          newIncident.network_type,
          newIncident.network_generation,
          newIncident.carrier,
          newIncident.battery_level,
          newIncident.screen_resolution,
          newIncident.locale,
          newIncident.timezone,
          newIncident.app_version,
          newIncident.user_agent,
          'open',
        ]
      ).catch(() => {});
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: '🚨 Emergency incident reported and broadcast to Ogere Joint Command Center & Responding Units.',
      incident: newIncident,
      data: newIncident,
    });
  }

  // PATCH: Update Incident (Status, Agency, Unit notes, Live Media Feeds, SLA & SITREPs)
  if (req.method === 'PATCH') {
    const {
      id,
      status,
      assignedAgency,
      respondingUnit,
      agencyNotes,
      cameraFeedActive,
      audioFeedActive,
      mediaUrl,
      mediaType,
      sitrepMessage,
      sitrepAuthor,
      evidenceFile,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, error: 'Incident id required.' });
    }

    const inc = memoryIncidents.find((i) => i.id === id);
    const nowIso = new Date().toISOString();

    if (inc) {
      if (status) {
        inc.status = status;
        if (!inc.acknowledged_at && status !== 'open') {
          inc.acknowledged_at = nowIso;
        }
        if (status === 'dispatched' && !inc.dispatched_at) {
          inc.dispatched_at = nowIso;
        }
        if ((status === 'intercepting' || status === 'on_scene') && !inc.arrived_at) {
          inc.arrived_at = nowIso;
        }
        if (status === 'resolved' && !inc.resolved_at) {
          inc.resolved_at = nowIso;
        }
      }
      if (assignedAgency) inc.assigned_agency = assignedAgency;
      if (respondingUnit) {
        inc.responding_unit = respondingUnit;
        if (!inc.dispatched_at) inc.dispatched_at = nowIso;
      }
      if (agencyNotes) inc.agency_notes = agencyNotes;
      if (typeof cameraFeedActive === 'boolean') inc.camera_feed_active = cameraFeedActive;
      if (typeof audioFeedActive === 'boolean') inc.audio_feed_active = audioFeedActive;
      if (mediaUrl) inc.media_url = mediaUrl;
      if (mediaType) inc.media_type = mediaType;

      if (!Array.isArray(inc.sitreps)) inc.sitreps = [];
      if (sitrepMessage) {
        inc.sitreps.push({
          timestamp: nowIso,
          author: sitrepAuthor || 'Command Radio Dispatch',
          message: sitrepMessage,
        });
      }

      if (!Array.isArray(inc.evidence_files)) inc.evidence_files = [];
      if (evidenceFile) {
        inc.evidence_files.push({
          ...evidenceFile,
          timestamp: nowIso,
        });
      }
    }

    try {
      await sqlQuery(
        `UPDATE incident_reports
         SET status = COALESCE($1, status),
             assigned_agency = COALESCE($2, assigned_agency),
             responding_unit = COALESCE($3, responding_unit),
             agency_notes = COALESCE($4, agency_notes),
             camera_feed_active = COALESCE($5, camera_feed_active),
             audio_feed_active = COALESCE($6, audio_feed_active),
             media_url = COALESCE($7, media_url),
             media_type = COALESCE($8, media_type),
             resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
         WHERE id = $9`,
        [status, assignedAgency, respondingUnit, agencyNotes, cameraFeedActive, audioFeedActive, mediaUrl, mediaType, id]
      ).catch(() => {});
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: `Incident ${id} updated to ${status || 'updated'}.`,
      incident: inc || { id, status, assignedAgency, respondingUnit, agencyNotes },
    });
  }

  // GET: Fetch incidents list
  try {
    const rows = await sqlQuery('SELECT * FROM incident_reports ORDER BY created_at DESC LIMIT 50').catch(() => []);
    const results = rows.length > 0 ? rows : memoryIncidents;
    return res.status(200).json({
      success: true,
      total: results.length,
      incidents: results,
      data: results,
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      total: memoryIncidents.length,
      incidents: memoryIncidents,
      data: memoryIncidents,
    });
  }
}
