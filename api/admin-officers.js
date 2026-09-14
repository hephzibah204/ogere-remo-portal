import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Officer Roster & Command Dashboard Counters
  if (req.method === 'GET') {
    try {
      // Live system counters for field officers
      const [
        incidentCounts,
        audienceCounts,
        idCardCounts,
        officerList,
      ] = await Promise.all([
        sqlQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE threat_level = 'CODE_RED' AND status != 'resolved') as code_red,
            COUNT(*) FILTER (WHERE status = 'open') as open_count,
            COUNT(*) FILTER (WHERE status = 'dispatched') as dispatched_count,
            COUNT(*) FILTER (WHERE is_silent_panic = TRUE AND status != 'resolved') as silent_panic
          FROM incident_reports
        `).catch(() => [{ total: 0, code_red: 0, open_count: 0, dispatched_count: 0, silent_panic: 0 }]),

        sqlQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
            COUNT(*) FILTER (WHERE status = 'postponed') as postponed
          FROM royal_audiences
        `).catch(() => [{ total: 0, pending: 0, confirmed: 0, postponed: 0 }]),

        sqlQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'approved') as approved
          FROM id_cards
        `).catch(() => [{ total: 0, pending: 0, approved: 0 }]),

        sqlQuery(`
          SELECT id, full_name, email, phone, role, agency_name, badge_number, is_officer_verified, last_login, created_at
          FROM users
          WHERE role IN ('security_officer', 'palace_protocol', 'ocda_admin', 'super_admin', 'admin')
          ORDER BY created_at DESC
        `).catch(() => []),
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          incidents: incidentCounts[0] || {},
          audiences: audienceCounts[0] || {},
          idCards: idCardCounts[0] || {},
        },
        officers: officerList || [],
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Admin Officers API Error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST: Verify or Update Officer Status
  if (req.method === 'POST') {
    const { officerId, isVerified, newRole } = req.body || {};

    if (!officerId) {
      return res.status(400).json({ success: false, error: 'officerId required.' });
    }

    try {
      const updated = await sqlQuery(
        `UPDATE users
         SET is_officer_verified = COALESCE($1, is_officer_verified),
             role = COALESCE($2, role),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, full_name, role, agency_name, badge_number, is_officer_verified`,
        [isVerified !== undefined ? isVerified : null, newRole || null, officerId]
      );

      return res.status(200).json({
        success: true,
        message: 'Officer record updated successfully.',
        officer: updated[0] || null,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
