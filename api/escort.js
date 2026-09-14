/**
 * api/escort.js
 * Ogere Remo Portal — Virtual Safe Escort ("Walk With Me" Journey Watchdog)
 *
 * Provides personal journey escort protection for citizens transiting late at night.
 * Features:
 *   - Destination & journey duration timer (10m, 20m, 30m, 45m, 60m)
 *   - Moving GPS pings during journey
 *   - Safety PIN verification upon safe arrival
 *   - Duress PIN ('9999'): Secret trigger if victim is coerced by robbers/abductors.
 *     Visually confirms dismissal, but immediately registers a silent CODE_RED alert to Police & Palace.
 *   - Auto-expiry watchdog: If timer expires without PIN entered, auto-dispatches CODE_RED.
 */

import { sqlQuery } from './lib/db.js';
import { broadcastEmergencyAlert } from './push-tokens.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS virtual_escorts (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        destination VARCHAR(255) NOT NULL,
        duration_minutes INT NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(32) DEFAULT 'active',
        safety_pin VARCHAR(64) NOT NULL,
        duress_pin VARCHAR(64) DEFAULT '9999',
        last_latitude NUMERIC(10, 7),
        last_longitude NUMERIC(10, 7),
        incident_id VARCHAR(64)
      );
      CREATE INDEX IF NOT EXISTS idx_escorts_status ON virtual_escorts(status);
      CREATE INDEX IF NOT EXISTS idx_escorts_expires ON virtual_escorts(expires_at);
    `).catch(() => {});
  } catch (_) {}

  const action = req.query.action || (req.body && req.body.action) || 'status';

  // 1. POST action=start — Start a new Virtual Escort journey
  if (req.method === 'POST' && action === 'start') {
    const {
      userId = 'citizen_anon',
      destination = 'Ogere Remo Destination',
      durationMinutes = 20,
      safetyPin = '1234',
      duressPin = '9999',
      latitude = 6.9371,
      longitude = 3.6335,
    } = req.body || {};

    const escortId = 'ESC-' + Date.now().toString(36).toUpperCase();
    const duration = Math.max(5, Math.min(180, Number(durationMinutes) || 20));

    try {
      await sqlQuery(
        `INSERT INTO virtual_escorts 
          (id, user_id, destination, duration_minutes, started_at, expires_at, status, safety_pin, duress_pin, last_latitude, last_longitude)
         VALUES 
          ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ($4 || ' minutes')::INTERVAL, 'active', $5, $6, $7, $8)`,
        [escortId, userId, destination, duration, safetyPin, duressPin, latitude, longitude]
      );

      return res.status(201).json({
        success: true,
        escortId,
        destination,
        durationMinutes: duration,
        status: 'active',
        message: `Virtual escort activated. Timer set for ${duration} minutes.`,
      });
    } catch (err) {
      console.error('[Escort start error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST action=ping — Update moving location during escort
  if (req.method === 'POST' && action === 'ping') {
    const { escortId, latitude, longitude } = req.body || {};
    if (!escortId) return res.status(400).json({ success: false, error: 'escortId is required' });

    try {
      await sqlQuery(
        `UPDATE virtual_escorts 
         SET last_latitude = $1, last_longitude = $2 
         WHERE id = $3 AND status = 'active'`,
        [latitude, longitude, escortId]
      );
      return res.status(200).json({ success: true, message: 'Escort location pinged.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. POST action=arrive — Complete journey safely OR trigger duress covert alert
  if (req.method === 'POST' && (action === 'arrive' || action === 'complete')) {
    const { escortId, pin } = req.body || {};
    if (!escortId) return res.status(400).json({ success: false, error: 'escortId is required' });

    try {
      const rows = await sqlQuery(
        `SELECT * FROM virtual_escorts WHERE id = $1 LIMIT 1`,
        [escortId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Escort session not found' });
      }

      const escort = rows[0];

      // Check if DURESS PIN entered ('9999' or custom duressPin)
      if (String(pin).trim() === String(escort.duress_pin || '9999').trim()) {
        // TRIGGER COVERT ARMED HOSTAGE ALERT
        const incidentId = 'DURESS-' + Date.now().toString(36).toUpperCase();
        await sqlQuery(
          `INSERT INTO incident_reports 
            (id, category, severity, threat_level, is_silent_panic, is_live_tracking, assigned_agency, location, latitude, longitude, description, reporter_name, status, created_at)
           VALUES 
            ($1, 'COVERT HOSTAGE DURESS (VIRTUAL ESCORT)', 'Critical', 'CODE_RED', TRUE, TRUE, 'Joint Police & Vigilante Taskforce', $2, $3, $4, $5, 'Citizen Under Duress', 'open', CURRENT_TIMESTAMP)`,
          [
            incidentId,
            escort.destination,
            escort.last_latitude || 6.9371,
            escort.last_longitude || 3.6335,
            `[COVERT DURESS ALERT] Citizen was forced to enter PIN during Virtual Escort to ${escort.destination}. Immediate armed tactical interception required. APPROACH WITH EXTREME CAUTION (NO SIRENS).`,
          ]
        );

        await sqlQuery(
          `UPDATE virtual_escorts 
           SET status = 'duress_triggered', incident_id = $1 
           WHERE id = $2`,
          [incidentId, escortId]
        );

        // Broadcast to police and vigilante
        broadcastEmergencyAlert({
          category: 'Armed Hostage Duress',
          location: escort.destination,
          threatLevel: 'CODE_RED',
          incidentId,
        }).catch(() => {});

        // Return visually normal response so the coercer suspects nothing
        return res.status(200).json({
          success: true,
          status: 'safe_arrival',
          message: 'Journey completed. You have arrived safely.',
          isCovertDuress: true,
        });
      }

      // Check normal safety PIN
      if (String(pin).trim() === String(escort.safety_pin).trim()) {
        await sqlQuery(
          `UPDATE virtual_escorts SET status = 'safe_arrival' WHERE id = $1`,
          [escortId]
        );
        return res.status(200).json({
          success: true,
          status: 'safe_arrival',
          message: 'Safe arrival confirmed. Virtual escort closed.',
        });
      }

      return res.status(401).json({ success: false, error: 'Incorrect PIN' });
    } catch (err) {
      console.error('[Escort arrive error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. GET — Fetch escort status or list active escorts
  if (req.method === 'GET') {
    const { escortId, userId } = req.query || {};

    try {
      if (escortId) {
        const rows = await sqlQuery(
          `SELECT id, destination, duration_minutes, started_at, expires_at, status, last_latitude, last_longitude, incident_id 
           FROM virtual_escorts WHERE id = $1 LIMIT 1`,
          [escortId]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Escort not found' });
        return res.status(200).json({ success: true, escort: rows[0] });
      }

      const rows = await sqlQuery(
        `SELECT id, user_id, destination, duration_minutes, started_at, expires_at, status, last_latitude, last_longitude, incident_id 
         FROM virtual_escorts 
         WHERE status = 'active' OR expires_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
         ORDER BY started_at DESC LIMIT 50`
      );
      return res.status(200).json({ success: true, escorts: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
