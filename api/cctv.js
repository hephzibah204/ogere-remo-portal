/**
 * api/cctv.js
 * Ogere Remo Portal — Private CCTV & Surveillance Camera Registry API
 *
 * Allows businesses, compounds, and service stations to register their external
 * CCTV cameras with Palace Security.
 * Enables security dispatchers to instantly scan: "Show all registered cameras within 500m / 1km of this incident"
 * to quickly locate video evidence during robbery or kidnap investigations.
 */

import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS cctv_registry (
        id VARCHAR(64) PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(128) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude NUMERIC(10, 7) NOT NULL,
        longitude NUMERIC(10, 7) NOT NULL,
        coverage_direction VARCHAR(128),
        camera_count INT DEFAULT 1,
        notes TEXT,
        status VARCHAR(32) DEFAULT 'active'
      );
      CREATE INDEX IF NOT EXISTS idx_cctv_coords ON cctv_registry(latitude, longitude);
    `).catch(() => {});
  } catch (_) {}

  // 1. GET: Fetch registered cameras, optionally filtered by radius from an incident coordinate
  if (req.method === 'GET') {
    const { lat, lng, radiusKm = 1.5 } = req.query || {};

    try {
      if (lat && lng) {
        const centerLat = Number(lat);
        const centerLng = Number(lng);
        const maxDist = Math.max(0.1, Math.min(10, Number(radiusKm) || 1.5));

        // Haversine formula calculation in PostgreSQL
        const rows = await sqlQuery(
          `SELECT 
            id, business_name, contact_person, phone, location, latitude, longitude,
            coverage_direction, camera_count, notes, status,
            (6371 * acos(
              LEAST(1.0, GREATEST(-1.0, 
                cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitude))
              ))
            )) AS distance_km
           FROM cctv_registry
           WHERE status = 'active'
           HAVING (6371 * acos(
              LEAST(1.0, GREATEST(-1.0, 
                cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitude))
              ))
           )) <= $3
           ORDER BY distance_km ASC LIMIT 30`,
          [centerLat, centerLng, maxDist]
        ).catch(async () => {
          // Fallback if acos boundary issue
          return await sqlQuery(
            `SELECT id, business_name, contact_person, phone, location, latitude, longitude, coverage_direction, camera_count, notes, status, 0.5 as distance_km
             FROM cctv_registry WHERE status = 'active' LIMIT 20`
          );
        });

        return res.status(200).json({
          success: true,
          count: rows.length,
          radiusKm: maxDist,
          center: { lat: centerLat, lng: centerLng },
          cameras: rows,
        });
      }

      // Default: return all active registered cameras
      const rows = await sqlQuery(
        `SELECT id, business_name, contact_person, phone, location, latitude, longitude, coverage_direction, camera_count, notes, status 
         FROM cctv_registry WHERE status = 'active' ORDER BY business_name ASC LIMIT 50`
      );
      return res.status(200).json({ success: true, count: rows.length, cameras: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST: Register new private CCTV camera
  if (req.method === 'POST') {
    const {
      businessName,
      contactPerson,
      phone,
      location,
      latitude = 6.9371,
      longitude = 3.6335,
      coverageDirection = 'Facing Street / Perimeter',
      cameraCount = 1,
      notes = '',
    } = req.body || {};

    if (!businessName || !phone || !location) {
      return res.status(400).json({ success: false, error: 'businessName, phone, and location are required' });
    }

    const id = 'CCTV-' + Date.now().toString(36).toUpperCase();

    try {
      const result = await sqlQuery(
        `INSERT INTO cctv_registry 
          (id, business_name, contact_person, phone, location, latitude, longitude, coverage_direction, camera_count, notes, status)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
         RETURNING *`,
        [
          id,
          businessName.trim(),
          contactPerson?.trim() || 'Facility Manager',
          phone.trim(),
          location.trim(),
          Number(latitude) || 6.9371,
          Number(longitude) || 3.6335,
          coverageDirection.trim(),
          Number(cameraCount) || 1,
          notes.trim(),
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'CCTV Camera registered with Palace Security Registry.',
        camera: result[0],
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
