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
    const cardId = body.id || `OGR-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await sqlQuery(
        `INSERT INTO id_cards 
          (id, full_name, card_type, dob, compound, quarter, phone, email, address, occupation, status, issued_date, expiry_date, photo_url, verified_by)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 years', $12, $13)
         ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP`,
        [
          cardId,
          body.fullName || 'Citizen Applicant',
          body.cardType || 'indigene',
          body.dob || null,
          body.compound || '',
          body.quarter || 'Oke-Ogere',
          body.phone || '',
          body.email || '',
          body.address || '',
          body.occupation || '',
          body.status || 'pending',
          body.photoUrl || '',
          body.verifiedBy || 'HRH Ologere Palace Office',
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'ID application saved to Neon PostgreSQL database.',
        data: {
          id: cardId,
          fullName: body.fullName,
          qrCodeUrl: `https://ogereremo.vercel.app/verify-id/${cardId}`,
          status: body.status || 'pending',
        },
      });
    } catch (err) {
      console.error('Error inserting ID card into Neon:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    const rows = await sqlQuery('SELECT * FROM id_cards ORDER BY created_at DESC LIMIT 50');
    return res.status(200).json({
      success: true,
      totalRecords: rows.length,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
