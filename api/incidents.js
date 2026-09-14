import { sqlQuery } from './lib/db.js';
import { broadcastEmergencyAlert } from './push-tokens.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure incident_reports has modern emergency columns
  try {
    await sqlQuery(`
      ALTER TABLE incident_reports 
      ADD COLUMN IF NOT EXISTS threat_level VARCHAR(32) DEFAULT 'CODE_YELLOW',
      ADD COLUMN IF NOT EXISTS is_silent_panic BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS assigned_agency VARCHAR(128) DEFAULT 'Unassigned',
      ADD COLUMN IF NOT EXISTS responding_unit VARCHAR(128) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS agency_notes TEXT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7) DEFAULT 6.9371,
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7) DEFAULT 3.6335,
      ADD COLUMN IF NOT EXISTS is_live_tracking BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS heading NUMERIC(6, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS speed NUMERIC(6, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS accuracy NUMERIC(6, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    `).catch(() => {});
  } catch (_) {}

  // 1. POST: Report emergency incident / SOS / Silent Panic / Robbery / Terrorism
  if (req.method === 'POST') {
    const {
      category = 'General Emergency',
      severity = 'Critical',
      threatLevel = 'CODE_YELLOW',
      location = 'Ogere Remo Corridor',
      landmark,
      latitude,
      longitude,
      description,
      reporterName = 'Anonymous Citizen',
      reporterPhone,
      isAnonymous = false,
      isSos = false,
      isSilentPanic = false,
      isLiveTracking = false,
      assignedAgency = 'All Agencies Broadcast',
    } = req.body || {};

    if (!description && !isSos && !isSilentPanic) {
      return res.status(400).json({ success: false, error: 'Incident description or SOS trigger is required.' });
    }

    const prefix = isSilentPanic ? 'SILENT-' : isSos ? 'SOS-' : 'INC-';
    const id = prefix + Date.now().toString(36).toUpperCase();
    const finalName = isAnonymous ? 'Anonymous Citizen' : (reporterName || 'Concerned Citizen');
    
    // Auto calculate threat level
    let calculatedThreat = threatLevel;
    const catLower = (category || '').toLowerCase();
    const descLower = (description || '').toLowerCase();

    if (
      isSilentPanic ||
      catLower.includes('robbery') ||
      catLower.includes('terror') ||
      catLower.includes('bandit') ||
      catLower.includes('kidnap') ||
      descLower.includes('gun') ||
      descLower.includes('armed')
    ) {
      calculatedThreat = 'CODE_RED';
    } else if (
      catLower.includes('tanker') ||
      catLower.includes('gas leak') ||
      catLower.includes('explosion') ||
      catLower.includes('accident')
    ) {
      calculatedThreat = 'CODE_ORANGE';
    }

    const finalDesc = isSilentPanic
      ? `[SILENT PANIC ALERT - COVERT TRIGGER] ${description || 'Citizen covert panic button pressed. Immediate tactical response required. DO NOT SIREN APPROACH.'}`
      : isSos
      ? `[ONE-TAP SOS PANIC ALERT] ${description || 'Immediate emergency response requested.'}`
      : description;
      
    const finalLocation = landmark ? `${location} (Near: ${landmark})` : location;

    // Sector coordinate fallback lookup for Ogere Remo landmarks if client GPS is not supplied
    let lat = latitude ? Number(latitude) : null;
    let lng = longitude ? Number(longitude) : null;

    if (!lat || !lng) {
      const locStr = `${finalLocation} ${landmark || ''}`.toLowerCase();
      if (locStr.includes('km 66') || locStr.includes('km 67') || locStr.includes('km 68') || locStr.includes('tollgate') || locStr.includes('resort')) {
        lat = 6.9388; lng = 3.6437;
      } else if (locStr.includes('trailer park')) {
        lat = 6.9366; lng = 3.6344;
      } else if (locStr.includes('palace') || locStr.includes('aafin') || locStr.includes('oke-ogere')) {
        lat = 6.9368; lng = 3.6330;
      } else if (locStr.includes('police') || locStr.includes('station')) {
        lat = 6.9348; lng = 3.6356;
      } else if (locStr.includes('hospital') || locStr.includes('isale-ogere')) {
        lat = 6.9325; lng = 3.6310;
      } else if (locStr.includes('omcoosa') || locStr.includes('ositelu')) {
        lat = 6.9405; lng = 3.6397;
      } else if (locStr.includes('market')) {
        lat = 6.9354; lng = 3.6338;
      } else if (locStr.includes('agbele')) {
        lat = 6.9290; lng = 3.6260;
      } else if (locStr.includes('ajura')) {
        lat = 6.9550; lng = 3.6480;
      } else {
        lat = 6.9371; lng = 3.6335; // Ogere town centre default
      }
    }

    try {
      await sqlQuery(
        `INSERT INTO incident_reports 
          (id, category, severity, threat_level, is_silent_panic, is_live_tracking, last_ping_at, assigned_agency, location, latitude, longitude, description, reporter_name, reporter_phone, status, created_at)
         VALUES 
          ($1, $2, $3, $4, $5, $6, CASE WHEN $6 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END, $7, $8, $9, $10, $11, $12, $13, 'open', CURRENT_TIMESTAMP)`,
        [
          id,
          category,
          severity,
          calculatedThreat,
          isSilentPanic,
          Boolean(isLiveTracking),
          assignedAgency,
          finalLocation,
          lat,
          lng,
          finalDesc,
          finalName,
          reporterPhone || null
        ]
      );

      // If live tracking requested, seed initial breadcrumb point
      if (isLiveTracking && lat && lng) {
        await sqlQuery(
          `INSERT INTO incident_location_pings 
            (incident_id, latitude, longitude, created_at) 
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING`,
          [id, lat, lng]
        ).catch(() => {});
      }

      // Fire-and-forget push broadcast to registered security agents
      if (calculatedThreat === 'CODE_RED' || calculatedThreat === 'CODE_ORANGE') {
        broadcastEmergencyAlert({
          category,
          location: finalLocation,
          threatLevel: calculatedThreat,
          incidentId: id,
        }).catch(err => console.error('[Push Broadcast] Non-fatal error:', err.message));
      }

      return res.status(201).json({
        success: true,
        message: isSilentPanic
          ? 'Silent panic signal received and queued for tactical dispatch.'
          : isSos
          ? 'SOS Emergency Alert dispatched to Palace & Security Command.'
          : 'Incident report logged successfully.',
        incident: {
          id,
          category,
          severity,
          threatLevel: calculatedThreat,
          isSilentPanic,
          assignedAgency,
          location: finalLocation,
          latitude: lat,
          longitude: lng,
          description: finalDesc,
          reporterName: finalName,
          status: 'open',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error('[API Incidents] Error logging report:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. PATCH / PUT: Security Command Dashboard Updates (Dispatch, Status, Agency, Notes)
  if (req.method === 'PATCH' || req.method === 'PUT') {
    const {
      id,
      status, // 'open', 'dispatched', 'on_scene', 'resolved', 'false_alarm'
      assignedAgency, // 'Police', 'FRSC', 'So-Safe', 'Palace Vigilante', 'Fire Service'
      respondingUnit, // e.g. 'Patrol Alpha 01', 'Ogere DPO Tactical Squad'
      agencyNotes,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, error: 'Incident ID is required for updates.' });
    }

    try {
      const result = await sqlQuery(
        `UPDATE incident_reports 
         SET 
           status = COALESCE($1, status),
           assigned_agency = COALESCE($2, assigned_agency),
           responding_unit = COALESCE($3, responding_unit),
           agency_notes = COALESCE($4, agency_notes),
           resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
         WHERE id = $5
         RETURNING *`,
        [status, assignedAgency, respondingUnit, agencyNotes, id]
      );

      if (!result || result.length === 0) {
        return res.status(404).json({ success: false, error: 'Incident not found' });
      }

      return res.status(200).json({
        success: true,
        message: `Incident ${id} updated to ${status || 'current status'}.`,
        incident: result[0],
      });
    } catch (err) {
      console.error('[API Incidents] Error updating incident:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. GET: Fetch incidents with optional agency & threatLevel filter
  try {
    const { agency, threat, status, limit = 50 } = req.query || {};

    let query = `
      SELECT 
        id, 
        category, 
        severity, 
        threat_level, 
        is_silent_panic, 
        is_live_tracking,
        last_ping_at,
        heading,
        speed,
        accuracy,
        assigned_agency, 
        responding_unit, 
        agency_notes, 
        location, 
        latitude,
        longitude,
        description, 
        reporter_name, 
        reporter_phone, 
        status, 
        created_at, 
        resolved_at
      FROM incident_reports 
      WHERE 1=1
    `;
    const params = [];

    if (agency && agency !== 'all') {
      params.push(`%${agency}%`);
      query += ` AND (assigned_agency ILIKE $${params.length} OR assigned_agency = 'All Agencies Broadcast')`;
    }

    if (threat && threat !== 'all') {
      params.push(threat);
      query += ` AND threat_level = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit) || 50);

    const rows = await sqlQuery(query, params).catch(async () => {
      // Fallback in case columns aren't ready
      return await sqlQuery(
        `SELECT id, category, severity, location, description, reporter_name, status, created_at 
         FROM incident_reports ORDER BY created_at DESC LIMIT 30`
      ).catch(() => []);
    });

    return res.status(200).json({
      success: true,
      total: rows.length,
      incidents: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
