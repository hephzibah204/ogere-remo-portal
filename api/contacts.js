/**
 * api/contacts.js
 * Ogere Remo Portal — Guardian Family Circles (Emergency Contacts API)
 *
 * Allows citizens to register trusted family & next-of-kin contacts (up to 3).
 * When an emergency or SOS is triggered, guardian contacts receive immediate
 * notification and a secure link to watch the live moving radar.
 */

import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ensure table exists
  try {
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        contact_name VARCHAR(128) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        relationship VARCHAR(64) DEFAULT 'Family',
        notify_sms BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_contacts_user ON emergency_contacts(user_id);
    `).catch(() => {});
  } catch (_) {}

  // 1. GET: Fetch emergency contacts for a user
  if (req.method === 'GET') {
    const { userId = 'citizen_anon' } = req.query || {};

    try {
      const rows = await sqlQuery(
        `SELECT id, user_id, contact_name, phone, relationship, notify_sms, created_at 
         FROM emergency_contacts 
         WHERE user_id = $1 
         ORDER BY id ASC LIMIT 3`,
        [userId]
      );
      return res.status(200).json({ success: true, contacts: rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST: Add or update an emergency contact (max 3 per user)
  if (req.method === 'POST') {
    const {
      userId = 'citizen_anon',
      contactName,
      phone,
      relationship = 'Family',
      notifySms = true,
    } = req.body || {};

    if (!contactName || !phone) {
      return res.status(400).json({ success: false, error: 'contactName and phone are required' });
    }

    try {
      const existing = await sqlQuery(
        `SELECT COUNT(*) as count FROM emergency_contacts WHERE user_id = $1`,
        [userId]
      );

      if (parseInt(existing[0]?.count || 0) >= 3) {
        return res.status(400).json({
          success: false,
          error: 'Maximum of 3 Guardian emergency contacts reached. Please delete an existing contact first.',
        });
      }

      const result = await sqlQuery(
        `INSERT INTO emergency_contacts (user_id, contact_name, phone, relationship, notify_sms)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, contactName.trim(), phone.trim(), relationship.trim(), notifySms]
      );

      return res.status(201).json({
        success: true,
        message: 'Guardian contact added successfully.',
        contact: result[0],
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. DELETE: Remove an emergency contact
  if (req.method === 'DELETE') {
    const { id } = req.query || req.body || {};
    if (!id) return res.status(400).json({ success: false, error: 'Contact id is required' });

    try {
      await sqlQuery(`DELETE FROM emergency_contacts WHERE id = $1`, [id]);
      return res.status(200).json({ success: true, message: 'Contact removed.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
