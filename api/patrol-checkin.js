/**
 * api/patrol-checkin.js
 * Ogere Remo Portal — Vigilante & Security Patrol Geofenced Check-In API
 *
 * Enables Night Watchmen, So-Safe Corps, and Palace Vigilante officers on patrol
 * to log hourly geofenced check-ins at strategic flashpoint outposts.
 * Displays real-time patrol readiness on the Security Command Dashboard.
 */

import { sqlQuery } from './lib/db.js';

export const OUTPOSTS = [
  { id: 'outpost_tollgate', name: 'Old Tollgate / Expressway KM 66 Bypass', lat: 6.9380, lng: 3.6410 },
  { id: 'outpost_trailer', name: 'Ogere Central Trailer Park Outpost', lat: 6.9366, lng: 3.6344 },
  { id: 'outpost_palace', name: 'Palace Way / Aafin Ologere Square', lat: 6.9368, lng: 3.6330 },
  { id: 'outpost_agbele', name: 'Agbele Agricultural Axis & Bush Path', lat: 6.9290, lng: 3.6260 },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS patrol_checkins (
        id SERIAL PRIMARY KEY,
        outpost_name VARCHAR(128) NOT NULL,
        officer_name VARCHAR(128) NOT NULL,
        agency VARCHAR(64) NOT NULL,
        latitude NUMERIC(10, 7) NOT NULL,
        longitude NUMERIC(10, 7) NOT NULL,
        is_verified BOOLEAN DEFAULT TRUE,
        checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_patrol_checked ON patrol_checkins(checked_in_at DESC);
    `).catch(() => {});
  } catch (_) {}

  // 1. POST: Officer submits hourly outpost check-in with GPS
  if (req.method === 'POST') {
    const {
      outpostName,
      officerName = 'Patrol Officer',
      agency = 'Palace Vigilante',
      latitude,
      longitude,
    } = req.body || {};

    if (!outpostName || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'outpostName, latitude, and longitude are required.',
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    // Verify distance from target outpost (approx 500m geofence tolerance)
    const targetOutpost = OUTPOSTS.find(o => o.name === outpostName) || OUTPOSTS[0];
    const dLat = (lat - targetOutpost.lat) * 111.32; // km
    const dLng = (lng - targetOutpost.lng) * 111.32 * Math.cos(targetOutpost.lat * (Math.PI / 180));
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
    const isVerified = distKm <= 1.0; // within 1km radius

    try {
      const result = await sqlQuery(
        `INSERT INTO patrol_checkins 
          (outpost_name, officer_name, agency, latitude, longitude, is_verified, checked_in_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [outpostName, officerName, agency, lat, lng, isVerified]
      );

      return res.status(201).json({
        success: true,
        message: isVerified
          ? `✓ Outpost check-in verified at ${outpostName}.`
          : `⚠️ Check-in recorded, but GPS is ${distKm.toFixed(2)}km from outpost station.`,
        checkin: result[0],
        distanceKm: distKm,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. GET: Return recent check-in logs and outpost status
  if (req.method === 'GET') {
    try {
      const rows = await sqlQuery(
        `SELECT id, outpost_name, officer_name, agency, latitude, longitude, is_verified, checked_in_at 
         FROM patrol_checkins 
         ORDER BY checked_in_at DESC LIMIT 40`
      );

      return res.status(200).json({
        success: true,
        outposts: OUTPOSTS,
        recentCheckins: rows,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
