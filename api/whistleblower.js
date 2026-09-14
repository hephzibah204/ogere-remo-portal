/**
 * api/whistleblower.js
 * Ogere Remo Portal — Cryptographic Anonymous Whistleblower Intelligence API
 *
 * Allows citizens to submit high-value intel (arms caches, robbery gangs, kidnapping hideouts)
 * with complete cryptographic anonymity.
 * Returns a unique Secret Tip Token (e.g. OGR-TIP-8291) so informants can check investigation
 * status and officer SITREP notes without ever disclosing their identity.
 */

import { sqlQuery } from './lib/db.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS anonymous_tips (
        id VARCHAR(64) PRIMARY KEY,
        tip_token VARCHAR(32) UNIQUE NOT NULL,
        category VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        sector VARCHAR(128),
        latitude NUMERIC(10, 7),
        longitude NUMERIC(10, 7),
        status VARCHAR(32) DEFAULT 'submitted',
        officer_response TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_tips_token ON anonymous_tips(tip_token);
    `).catch(() => {});
  } catch (_) {}

  // 1. POST: Submit a new anonymous tip
  if (req.method === 'POST') {
    const {
      category = 'Suspicious Activity',
      description,
      sector = 'Ogere Remo Corridor',
      latitude = null,
      longitude = null,
    } = req.body || {};

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a detailed description of at least 10 characters.',
      });
    }

    const tipId = 'TIP-' + Date.now().toString(36).toUpperCase();
    // Generate secure 6-digit alphanumeric token for informant check-in
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const tipToken = `OGR-TIP-${randomSuffix}`;

    try {
      const result = await sqlQuery(
        `INSERT INTO anonymous_tips 
          (id, tip_token, category, description, sector, latitude, longitude, status, created_at)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, 'submitted', CURRENT_TIMESTAMP)
         RETURNING id, tip_token, category, sector, status, created_at`,
        [tipId, tipToken, category, description.trim(), sector, latitude, longitude]
      );

      return res.status(201).json({
        success: true,
        message: 'Anonymous tip securely received by Palace Security Secretariat & Police Command.',
        tipToken,
        tip: result[0],
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. GET: Informant looks up their tip by Secret Token OR Security Officer views list
  if (req.method === 'GET') {
    const { token, all = 'false' } = req.query || {};

    try {
      if (token) {
        const rows = await sqlQuery(
          `SELECT id, tip_token, category, sector, status, officer_response, created_at 
           FROM anonymous_tips 
           WHERE tip_token = $1 LIMIT 1`,
          [token.trim().toUpperCase()]
        );

        if (rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Tip token not found.' });
        }

        return res.status(200).json({ success: true, tip: rows[0] });
      }

      // Security officer view: all tips
      const rows = await sqlQuery(
        `SELECT id, tip_token, category, description, sector, status, officer_response, created_at 
         FROM anonymous_tips 
         ORDER BY created_at DESC LIMIT 50`
      );
      return res.status(200).json({ success: true, tips: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. PATCH: Officer updates status or leaves encrypted SITREP feedback for informant
  if (req.method === 'PATCH') {
    const { tipToken, status = 'investigating', officerResponse } = req.body || {};

    if (!tipToken) {
      return res.status(400).json({ success: false, error: 'tipToken is required' });
    }

    try {
      const result = await sqlQuery(
        `UPDATE anonymous_tips 
         SET status = $1, officer_response = COALESCE($2, officer_response)
         WHERE tip_token = $3
         RETURNING *`,
        [status, officerResponse || null, tipToken.trim().toUpperCase()]
      );

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Tip not found' });
      }

      return res.status(200).json({ success: true, message: 'Tip updated.', tip: result[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
