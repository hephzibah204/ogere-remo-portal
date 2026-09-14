/**
 * api/push-tokens.js
 * Ogere Remo Portal — Expo Push Notification Token Registry & Broadcaster
 *
 * POST /api/push-tokens       — Register a device's Expo push token
 * GET  /api/push-tokens       — List registered tokens (internal/admin only)
 * POST /api/push-tokens?action=broadcast — Send an emergency push to all security_agent tokens
 *
 * Called automatically by:
 *   - Mobile app on launch (device registration)
 *   - api/incidents.js when a CODE_RED incident is created (broadcast trigger)
 */

import { sqlQuery } from './lib/db.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ──────────────────────────────────────────────────────────────────────────────
// Send push notifications to a batch of Expo push tokens
// ──────────────────────────────────────────────────────────────────────────────
async function sendExpoPush(messages) {
  if (!messages || messages.length === 0) return;

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    const errors = (result.data || []).filter(r => r.status === 'error');
    if (errors.length > 0) {
      console.error('[Push Broadcast] Expo push errors:', JSON.stringify(errors));
    }
    return result;
  } catch (err) {
    console.error('[Push Broadcast] Failed to send Expo push:', err.message);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Broadcast a CODE_RED emergency alert to all registered security agents
// ──────────────────────────────────────────────────────────────────────────────
export async function broadcastEmergencyAlert({ category, location, threatLevel, incidentId }) {
  try {
    // Ensure push_tokens table exists
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id           SERIAL PRIMARY KEY,
        token        TEXT NOT NULL UNIQUE,
        user_id      TEXT,
        role         TEXT DEFAULT 'citizen',
        platform     TEXT DEFAULT 'android',
        registered_at TIMESTAMPTZ DEFAULT NOW(),
        last_seen_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Fetch all security agent tokens
    const rows = await sqlQuery(
      `SELECT token FROM push_tokens WHERE role = 'security_agent'`
    );

    if (rows.length === 0) return;

    const isCodeRed = threatLevel === 'CODE_RED';

    const messages = rows.map(row => ({
      to: row.token,
      title: isCodeRed
        ? `🚨 CODE RED — ${category}`
        : `⚠️ Emergency Alert — ${category}`,
      body: `📍 ${location} — Dispatch patrol immediately.`,
      sound: 'default',
      priority: isCodeRed ? 'high' : 'normal',
      channelId: 'emergency',
      badge: 1,
      data: {
        isEmergency: true,
        threatLevel,
        incidentId,
        location,
        screen: 'SecurityDashboard',
      },
    }));

    // Expo push API accepts batches of up to 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      await sendExpoPush(messages.slice(i, i + BATCH_SIZE));
    }

    console.log(`[Push] Broadcast CODE_RED to ${rows.length} security agent(s).`);
  } catch (err) {
    console.error('[Push] broadcastEmergencyAlert error:', err.message);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// HTTP Handler
// ──────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure the push_tokens table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id            SERIAL PRIMARY KEY,
        token         TEXT NOT NULL UNIQUE,
        user_id       TEXT,
        role          TEXT DEFAULT 'citizen',
        platform      TEXT DEFAULT 'android',
        registered_at TIMESTAMPTZ DEFAULT NOW(),
        last_seen_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (dbErr) {
    console.error('[Push] Table init error:', dbErr.message);
  }

  // ── POST /api/push-tokens — Register or refresh a device token ──
  if (req.method === 'POST' && req.query.action !== 'broadcast') {
    const { token, userId, role, platform, registeredAt } = req.body || {};

    if (!token || !token.startsWith('ExponentPushToken[')) {
      return res.status(400).json({
        success: false,
        error: 'A valid Expo push token is required.',
      });
    }

    try {
      await sqlQuery(
        `INSERT INTO push_tokens (token, user_id, role, platform, registered_at, last_seen_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (token) DO UPDATE
           SET user_id      = EXCLUDED.user_id,
               role         = EXCLUDED.role,
               platform     = EXCLUDED.platform,
               last_seen_at = NOW()`,
        [token, userId || null, role || 'citizen', platform || 'android', registeredAt || new Date().toISOString()]
      );

      return res.status(200).json({ success: true, message: 'Push token registered.' });
    } catch (err) {
      console.error('[Push] Token registration error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to register push token.' });
    }
  }

  // ── POST /api/push-tokens?action=broadcast — Manual broadcast trigger ──
  if (req.method === 'POST' && req.query.action === 'broadcast') {
    const { category, location, threatLevel, incidentId } = req.body || {};

    if (!category || !location) {
      return res.status(400).json({ success: false, error: 'category and location are required.' });
    }

    await broadcastEmergencyAlert({ category, location, threatLevel: threatLevel || 'CODE_RED', incidentId });
    return res.status(200).json({ success: true, message: 'Emergency broadcast dispatched.' });
  }

  // ── GET /api/push-tokens — List registered tokens (admin) ──
  if (req.method === 'GET') {
    try {
      const rows = await sqlQuery(
        `SELECT id, user_id, role, platform, registered_at, last_seen_at FROM push_tokens ORDER BY last_seen_at DESC LIMIT 200`
      );
      return res.status(200).json({ success: true, count: rows.length, tokens: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
