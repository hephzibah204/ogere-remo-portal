import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, id } = req.query;
  const lookupKey = (code || id || '').trim().toUpperCase();

  if (!lookupKey) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid ID card reference number (e.g. OGR-782910)',
    });
  }

  try {
    const rows = await sqlQuery(
      'SELECT id, full_name, card_type, dob, compound, quarter, occupation, status, issued_date, expiry_date, verified_by FROM id_cards WHERE UPPER(id) = $1 LIMIT 1',
      [lookupKey]
    );

    if (rows && rows.length > 0) {
      const card = rows[0];
      return res.status(200).json({
        success: true,
        valid: card.status === 'approved',
        data: {
          id: card.id,
          fullName: card.full_name,
          cardType: card.card_type,
          dob: card.dob,
          compound: card.compound,
          quarter: card.quarter,
          occupation: card.occupation,
          status: card.status,
          issuedDate: card.issued_date,
          expiryDate: card.expiry_date,
          verifiedBy: card.verified_by || 'HRH Ologere Palace Office',
        },
        verificationTimestamp: new Date().toISOString(),
        issuer: 'Kingdom of Ogere Remo Official Registry',
      });
    }

    return res.status(404).json({
      success: false,
      valid: false,
      message: `No active official community ID record found in Neon database matching reference "${lookupKey}".`,
    });
  } catch (err) {
    console.error('Verify ID database error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal database query error while verifying ID card.',
    });
  }
}
