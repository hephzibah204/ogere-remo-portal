/**
 * api/broadcasts.js
 * Ogere Remo Portal — Palace Amber Alerts & Community Broadcasts API
 *
 * Dispatches high-priority community-wide emergency advisories, curfews,
 * and expressway siege warnings across both web and mobile app headers.
 */

import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS community_broadcasts (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(32) NOT NULL DEFAULT 'CRITICAL',
        target_sector VARCHAR(128) DEFAULT 'All Sectors',
        author_role VARCHAR(64) DEFAULT 'Palace Security Secretariat',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS idx_broadcasts_active ON community_broadcasts(is_active);
    `).catch(() => {});
  } catch (_) {}

  // 1. GET: Fetch active community broadcasts
  if (req.method === 'GET') {
    const { all = 'false' } = req.query || {};

    try {
      let query = `
        SELECT id, title, message, severity, target_sector, author_role, is_active, created_at, expires_at 
        FROM community_broadcasts
      `;

      if (all !== 'true') {
        query += ` WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) `;
      }

      query += ` ORDER BY created_at DESC LIMIT 20`;

      const rows = await sqlQuery(query);
      return res.status(200).json({ success: true, broadcasts: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST: Publish new Palace Amber Alert or Curfew Notice
  if (req.method === 'POST') {
    const {
      title,
      message,
      severity = 'CRITICAL',
      targetSector = 'All Ogere Remo Sectors',
      authorRole = 'Palace Security Secretariat',
      durationHours = 24,
    } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'title and message are required' });
    }

    const id = 'BCAST-' + Date.now().toString(36).toUpperCase();
    const hours = Math.max(1, Number(durationHours) || 24);

    try {
      const result = await sqlQuery(
        `INSERT INTO community_broadcasts 
          (id, title, message, severity, target_sector, author_role, is_active, created_at, expires_at)
         VALUES 
          ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ($7 || ' hours')::INTERVAL)
         RETURNING *`,
        [id, title.trim(), message.trim(), severity.toUpperCase(), targetSector.trim(), authorRole.trim(), hours]
      );

      return res.status(201).json({
        success: true,
        message: 'Community Amber Alert broadcast dispatched.',
        broadcast: result[0],
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. PATCH: Deactivate or clear alert
  if (req.method === 'PATCH') {
    const { id, isActive = false } = req.body || {};
    if (!id) return res.status(400).json({ success: false, error: 'Broadcast id is required' });

    try {
      await sqlQuery(
        `UPDATE community_broadcasts SET is_active = $1 WHERE id = $2`,
        [Boolean(isActive), id]
      );
      return res.status(200).json({ success: true, message: 'Broadcast status updated.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
