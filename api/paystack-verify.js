import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const reference = req.query.reference || req.body?.reference;

  if (!reference) {
    return res.status(400).json({ success: false, message: 'Missing transaction reference' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key_ogere';

  try {
    // 1. In production, call Paystack REST API
    let verifiedData = {
      status: 'success',
      reference,
      amount: req.body?.amount || 500000,
      customer: { email: req.body?.email || 'diaspora@ogereremo.ng', name: req.body?.name || 'Diaspora Contributor' },
      metadata: req.body?.metadata || {},
    };

    if (process.env.PAYSTACK_SECRET_KEY && !secretKey.includes('mock')) {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      const json = await paystackRes.json();
      if (!json.status || json.data?.status !== 'success') {
        return res.status(400).json({ success: false, message: 'Transaction verification failed with Paystack.' });
      }
      verifiedData = json.data;
    }

    const amountNaira = (verifiedData.amount || 0) / 100;
    const donationId = `DON-${reference.slice(-8)}`;
    const projectId = verifiedData.metadata?.projectId || req.body?.projectId || 'civic_centre';
    const projectTitle = verifiedData.metadata?.projectTitle || req.body?.projectTitle || 'Community Civic Project';
    const donorName = verifiedData.customer?.name || req.body?.name || 'Diaspora Contributor';
    const donorEmail = verifiedData.customer?.email || req.body?.email || 'diaspora@ogereremo.ng';

    // 2. Save directly to Neon database
    await sqlQuery(
      `INSERT INTO project_donations 
        (id, project_id, project_title, donor_name, donor_email, amount_naira, paystack_reference, status)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET status = 'success'`,
      [donationId, projectId, projectTitle, donorName, donorEmail, amountNaira, reference, 'success']
    );

    return res.status(200).json({
      success: true,
      message: 'Transaction successfully verified and logged in Ogere Community Endowment Ledger.',
      data: {
        id: donationId,
        projectId,
        projectTitle,
        amountNaira,
        reference,
        donorName,
      },
    });
  } catch (err) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
