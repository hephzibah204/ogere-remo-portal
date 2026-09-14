/**
 * api/live-location.js
 * Ogere Remo Portal — WhatsApp-Style Live Emergency Location Tracking API
 *
 * Enables citizens in emergency/SOS/hostage situations to perpetually stream
 * their live moving coordinates, heading, and speed to Ogere Security Command.
 * Security dispatchers and mobile patrol units can track their live location in real-time.
 *
 * POST /api/live-location
 *   Body: {
 *     incidentId: string,
 *     latitude: number,
 *     longitude: number,
 *     heading?: number,
 *     speed?: number,       // in km/h or m/s
 *     accuracy?: number,    // in meters
 *     isEnded?: boolean     // true when user stops live location sharing
 *   }
 *
 * GET /api/live-location?incidentId=XYZ
 *   Returns:
 *     - incident current live location, status, and last ping timestamp
 *     - recent breadcrumb trail pings (up to last 60 points) to trace route/path
 */

import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure live tracking columns and breadcrumbs table exist
  try {
    await sqlQuery(`
      ALTER TABLE incident_reports
      ADD COLUMN IF NOT EXISTS is_live_tracking BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS heading NUMERIC(6, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS speed NUMERIC(6, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS accuracy NUMERIC(6, 2) DEFAULT NULL;

      CREATE TABLE IF NOT EXISTS incident_location_pings (
        id BIGSERIAL PRIMARY KEY,
        incident_id VARCHAR(64) NOT NULL,
        latitude NUMERIC(10, 7) NOT NULL,
        longitude NUMERIC(10, 7) NOT NULL,
        heading NUMERIC(6, 2),
        speed NUMERIC(6, 2),
        accuracy NUMERIC(6, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_pings_incident ON incident_location_pings(incident_id, created_at DESC);
    `).catch(() => {});
  } catch (_) {}

  // 1. POST: Receive a live location ping or end live stream
  if (req.method === 'POST') {
    const {
      incidentId,
      latitude,
      longitude,
      heading = null,
      speed = null,
      accuracy = null,
      isEnded = false,
    } = req.body || {};

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'incidentId is required' });
    }

    try {
      if (isEnded) {
        // Stop live tracking for this incident
        await sqlQuery(
          `UPDATE incident_reports 
           SET is_live_tracking = FALSE,
               last_ping_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [incidentId]
        );

        return res.status(200).json({
          success: true,
          message: 'Live location sharing ended.',
          isLiveTracking: false,
        });
      }

      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
        return res.status(400).json({ success: false, error: 'latitude and longitude are required' });
      }

      const lat = Number(latitude);
      const lng = Number(longitude);
      const hdg = heading !== null && heading !== undefined ? Number(heading) : null;
      const spd = speed !== null && speed !== undefined ? Number(speed) : null;
      const acc = accuracy !== null && accuracy !== undefined ? Number(accuracy) : null;

      // 1. Update master incident record with newest live coordinates
      const updateResult = await sqlQuery(
        `UPDATE incident_reports 
         SET latitude = $1,
             longitude = $2,
             heading = $3,
             speed = $4,
             accuracy = $5,
             is_live_tracking = TRUE,
             last_ping_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, threat_level, status, is_live_tracking, last_ping_at`,
        [lat, lng, hdg, spd, acc, incidentId]
      );

      // 2. Insert into breadcrumbs table to preserve movement history trail
      await sqlQuery(
        `INSERT INTO incident_location_pings 
          (incident_id, latitude, longitude, heading, speed, accuracy, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [incidentId, lat, lng, hdg, spd, acc]
      );

      return res.status(200).json({
        success: true,
        incidentId,
        latitude: lat,
        longitude: lng,
        heading: hdg,
        speed: spd,
        accuracy: acc,
        isLiveTracking: true,
        lastPingAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[API live-location POST error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. GET: Retrieve current live location and breadcrumb trail for an incident
  if (req.method === 'GET') {
    const { incidentId } = req.query || {};

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'incidentId parameter is required' });
    }

    try {
      const incidentRows = await sqlQuery(
        `SELECT 
          id, category, severity, threat_level, is_silent_panic, assigned_agency,
          responding_unit, location, latitude, longitude, heading, speed, accuracy,
          is_live_tracking, last_ping_at, status, created_at
         FROM incident_reports
         WHERE id = $1 LIMIT 1`,
        [incidentId]
      );

      if (incidentRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Incident not found' });
      }

      const incident = incidentRows[0];

      // Retrieve recent breadcrumb trail (last 60 pings, chronological order)
      const pings = await sqlQuery(
        `SELECT latitude, longitude, heading, speed, accuracy, created_at 
         FROM incident_location_pings 
         WHERE incident_id = $1 
         ORDER BY created_at ASC 
         LIMIT 60`,
        [incidentId]
      );

      return res.status(200).json({
        success: true,
        incident,
        breadcrumbs: pings,
        breadcrumbsCount: pings.length,
      });
    } catch (err) {
      console.error('[API live-location GET error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
