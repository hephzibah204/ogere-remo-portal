import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const donationId = `DON-${Date.now()}`;

    try {
      await sqlQuery(
        `INSERT INTO project_donations
          (id, project_id, project_title, donor_name, donor_email, amount_naira, paystack_reference, status)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          donationId,
          body.projectId || 'civic_centre',
          body.projectTitle || 'Community Civic Project',
          body.donorName || 'Anonymous Diaspora Member',
          body.donorEmail || 'diaspora@ogereremo.ng',
          Number(body.amount || 25000),
          body.reference || `PSK_${Date.now()}`,
          'success',
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Donation recorded and credited in Neon PostgreSQL ledger.',
        data: { id: donationId, ...body },
      });
    } catch (err) {
      console.error('Donation SQL error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    const rows = await sqlQuery(`
      SELECT 
        project_id,
        COUNT(*) as total_donors,
        COALESCE(SUM(amount_naira), 0) as total_raised
      FROM project_donations 
      WHERE status = 'success'
      GROUP BY project_id
    `);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
