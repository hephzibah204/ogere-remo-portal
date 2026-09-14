/**
 * GET /api/donation-stats
 * Returns aggregate fundraising progress for the portal's main campaign.
 * Used by the ComingSoonPage to show live ₦ raised + donor count.
 */
import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache for 60 seconds at the CDN edge (Vercel)
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rows = await sqlQuery(`
      SELECT
        COALESCE(SUM(amount_naira), 0)::numeric AS total_raised,
        COUNT(DISTINCT COALESCE(donor_email, id))::int  AS donor_count
      FROM project_donations
      WHERE status = 'success'
    `);

    const row = rows?.[0] || {};

    return res.status(200).json({
      success:      true,
      total_raised: Number(row.total_raised  ?? 0),
      donor_count:  Number(row.donor_count   ?? 0),
      target:       10_000_000,
      currency:     'NGN',
      launch_date:  '2026-11-04',
      updated_at:   new Date().toISOString(),
    });
  } catch (err) {
    console.error('[donation-stats] DB error:', err);
    // Graceful fallback — never break the landing page
    return res.status(200).json({
      success:      false,
      total_raised: 0,
      donor_count:  0,
      target:       10_000_000,
      currency:     'NGN',
      launch_date:  '2026-11-04',
      updated_at:   new Date().toISOString(),
      error:        err.message,
    });
  }
}
