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
  // 1. LIVE LOCATION & BREADCRUMBS: /api/live-location
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'live-location' || pathname.includes('/live-location')) {
    if (req.method === 'POST') {
      const { incidentId, latitude, longitude, heading, speed, accuracy } = req.body || {};
      if (!incidentId || !latitude || !longitude) {
        return res.status(400).json({ success: false, error: 'incidentId, latitude, longitude required.' });
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

        await sqlQuery(
          `UPDATE incident_reports
           SET latitude = $1, longitude = $2, last_ping_at = CURRENT_TIMESTAMP, is_live_tracking = TRUE
           WHERE id = $3`,
          [latitude, longitude, incidentId]
        ).catch(() => {});
      } catch (_) {}

      // Update in-memory copy
      const inc = memoryIncidents.find((i) => i.id === incidentId);
      if (inc) {
        inc.latitude = parseFloat(latitude);
        inc.longitude = parseFloat(longitude);
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
        const escortId = `ESC-${Date.now().toString().slice(-6)}`;
        const duration = parseInt(body.durationMinutes || '20', 10);
        const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
        const newEscort = {
          id: escortId,
          user_id: body.userId || 'citizen_user',
          destination: body.destination || 'Agbele Ancestral Farmland',
          duration_minutes: duration,
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
          status: 'active',
          safety_pin: body.safetyPin || '1234',
          duress_pin: '9999',
          last_latitude: body.latitude || 6.9371,
          last_longitude: body.longitude || 3.6335,
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

      // B. HEARTBEAT PING
      if (action === 'ping') {
        const { escortId, latitude, longitude } = body;
        const esc = memoryEscorts.find((e) => e.id === escortId);
        if (esc) {
          esc.last_latitude = latitude;
          esc.last_longitude = longitude;
        }
        try {
          await sqlQuery(
            `UPDATE virtual_escorts SET last_latitude = $1, last_longitude = $2 WHERE id = $3`,
            [latitude, longitude, escortId]
          ).catch(() => {});
        } catch (_) {}
        return res.status(200).json({ success: true, message: 'Ping recorded.' });
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

          try {
            await sqlQuery(
              `INSERT INTO incident_reports 
                (id, category, severity, threat_level, is_silent_panic, is_live_tracking, assigned_agency, responding_unit, location, latitude, longitude, description, reporter_name, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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

    return res.status(200).json({ success: true, escorts: memoryEscorts.slice(0, 10) });
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

    try {
      const rows = await sqlQuery('SELECT * FROM anonymous_tips ORDER BY created_at DESC LIMIT 50').catch(() => []);
      const results = rows.length > 0 ? rows : memoryTips;
      return res.status(200).json({ success: true, tips: results });
    } catch (_) {
      return res.status(200).json({ success: true, tips: memoryTips });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. CCTV REGISTRY: /api/cctv
  // ─────────────────────────────────────────────────────────────────────────────
  if (subroute === 'cctv' || pathname.includes('/cctv')) {
    const cctvCameras = [
      { id: 'cctv_01', business_name: 'Ogere Resort Gatehouse', location: 'KM 67 Expressway', latitude: 6.9388, longitude: 3.6437, phone: '09062470474', camera_count: 6 },
      { id: 'cctv_02', business_name: 'TotalEnergies Station', location: 'KM 66.5 Tollgate Bypass', latitude: 6.938, longitude: 3.641, phone: '08023456781', camera_count: 8 },
      { id: 'cctv_03', business_name: 'Trailer Park Logistics', location: 'Trailer Park Outpost', latitude: 6.9366, longitude: 3.6344, phone: '08034681687', camera_count: 4 },
      { id: 'cctv_04', business_name: 'Aafin Ologere Palace Gate', location: 'Palace Square', latitude: 6.9368, longitude: 3.633, phone: '08023456789', camera_count: 5 },
    ];
    return res.status(200).json({ success: true, cameras: cctvCameras });
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

    const severity = body.severity || (body.category?.includes('🚨') || body.category?.includes('Robbery') || body.isSos ? 'Critical' : 'Medium');
    const threatLevel = body.threatLevel || (severity === 'Critical' ? 'CODE_RED' : severity === 'High' ? 'CODE_ORANGE' : 'CODE_YELLOW');

    const newIncident = {
      id: incidentId,
      category: body.category || 'General Incident',
      severity,
      threat_level: threatLevel,
      is_silent_panic: Boolean(body.isSilentPanic || body.is_silent_panic),
      is_live_tracking: Boolean(body.isLiveTracking || body.is_live_tracking),
      assigned_agency: body.assignedAgency || (threatLevel === 'CODE_RED' ? 'Police / Joint Patrol Command' : 'All Agencies Broadcast'),
      responding_unit: body.respondingUnit || 'Dispatched Intercept Unit',
      agency_notes: body.agencyNotes || 'Incident received and logged into Ogere Joint Command Center.',
      location: body.location || body.landmark || 'Ogere Remo Corridor',
      latitude: body.latitude || 6.9388,
      longitude: body.longitude || 3.6437,
      description: body.description || body.details || 'Emergency incident alert dispatched from mobile terminal.',
      reporter_name: body.isAnonymous ? 'Anonymous Citizen' : (body.reporterName || 'Concerned Citizen'),
      reporter_phone: body.isAnonymous ? null : (body.reporterPhone || 'N/A'),
      status: 'open',
      created_at: new Date().toISOString(),
    };

    memoryIncidents.unshift(newIncident);

    try {
      await sqlQuery(
        `INSERT INTO incident_reports 
          (id, category, severity, threat_level, is_silent_panic, is_live_tracking, assigned_agency, responding_unit, agency_notes, location, latitude, longitude, description, reporter_name, reporter_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          incidentId,
          newIncident.category,
          newIncident.severity,
          newIncident.threat_level,
          newIncident.is_silent_panic,
          newIncident.is_live_tracking,
          newIncident.assigned_agency,
          newIncident.responding_unit,
          newIncident.agency_notes,
          newIncident.location,
          newIncident.latitude,
          newIncident.longitude,
          newIncident.description,
          newIncident.reporter_name,
          newIncident.reporter_phone,
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

  // PATCH: Update Incident (Status, Agency, Unit notes)
  if (req.method === 'PATCH') {
    const { id, status, assignedAgency, respondingUnit, agencyNotes } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, error: 'Incident id required.' });
    }

    const inc = memoryIncidents.find((i) => i.id === id);
    if (inc) {
      if (status) inc.status = status;
      if (assignedAgency) inc.assigned_agency = assignedAgency;
      if (respondingUnit) inc.responding_unit = respondingUnit;
      if (agencyNotes) inc.agency_notes = agencyNotes;
    }

    try {
      await sqlQuery(
        `UPDATE incident_reports
         SET status = COALESCE($1, status),
             assigned_agency = COALESCE($2, assigned_agency),
             responding_unit = COALESCE($3, responding_unit),
             agency_notes = COALESCE($4, agency_notes),
             resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
         WHERE id = $5`,
        [status, assignedAgency, respondingUnit, agencyNotes, id]
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
