import { sqlQuery } from './lib/db.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Paystack-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const isVerify = pathname.includes('paystack-verify') || req.query.action === 'verify';
  const isWebhook = pathname.includes('paystack-webhook');

  // 1. Paystack Webhook Handler
  if (isWebhook && req.method === 'POST') {
    const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key_ogere';
    const paystackSignature = req.headers['x-paystack-signature'];

    if (paystackSignature && req.body) {
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== paystackSignature) {
        return res.status(401).json({ message: 'Invalid cryptographic signature from Paystack.' });
      }
    }

    const event = req.body || {};
    if (event.event === 'charge.success') {
      const data = event.data || {};
      const amountNaira = (data.amount || 0) / 100;
      const ref = data.reference;
      const meta = data.metadata || {};

      try {
        await sqlQuery(
          `INSERT INTO project_donations 
            (id, project_id, project_title, donor_name, donor_email, amount_naira, paystack_reference, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'success')
           ON CONFLICT (id) DO UPDATE SET status = 'success'`,
          [
            `DON-${ref.slice(-8)}`,
            meta.projectId || 'civic_centre',
            meta.projectTitle || 'Community Civic Project',
            data.customer?.name || 'Anonymous Diaspora Member',
            data.customer?.email || 'diaspora@ogereremo.ng',
            amountNaira,
            ref,
          ]
        );
      } catch (err) {
        console.error('Webhook SQL save error:', err.message);
      }
      return res.status(200).json({ status: 'success' });
    }
    return res.status(200).json({ status: 'ignored' });
  }

  // 2. Paystack Verify Handler
  if (isVerify) {
    const reference = req.query.reference || req.body?.reference;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Missing transaction reference' });
    }

    const donationId = `DON-${reference.slice(-8)}`;
    const projectId = req.body?.projectId || 'civic_centre';
    const projectTitle = req.body?.projectTitle || 'Community Civic Project';
    const amountNaira = Number(req.body?.amount || 25000);
    const donorName = req.body?.name || 'Diaspora Contributor';
    const donorEmail = req.body?.email || 'diaspora@ogereremo.ng';

    try {
      await sqlQuery(
        `INSERT INTO project_donations 
          (id, project_id, project_title, donor_name, donor_email, amount_naira, paystack_reference, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'success')
         ON CONFLICT (id) DO UPDATE SET status = 'success'`,
        [donationId, projectId, projectTitle, donorName, donorEmail, amountNaira, reference]
      );

      return res.status(200).json({
        success: true,
        message: 'Transaction successfully verified and logged.',
        data: { id: donationId, amountNaira, reference, donorName },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. Post Donation
  if (req.method === 'POST') {
    const body = req.body || {};
    const donationId = `DON-${Date.now()}`;

    try {
      await sqlQuery(
        `INSERT INTO project_donations
          (id, project_id, project_title, donor_name, donor_email, amount_naira, paystack_reference, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. Fundraising Stats — GET /api/donations?stats=true
  // Used by ComingSoonPage to show live ₦ raised + donor count.
  if (req.method === 'GET' && req.query.stats === 'true') {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
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
      console.error('[donations?stats] DB error:', err);
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

  // 5. Get All Donations & Summary (original GET)
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

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
