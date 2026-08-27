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
    const bookingId = body.id || `AUD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await sqlQuery(
        `INSERT INTO royal_audiences
          (id, full_name, purpose, booking_date, time_slot, phone, email, group_size, id_card, message, status, palace_notes)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          bookingId,
          body.fullName || 'Citizen',
          body.purpose || 'General Royal Consultation',
          body.date || new Date().toISOString().split('T')[0],
          body.time || '11:00 AM',
          body.phone || '',
          body.email || '',
          body.groupSize || '1',
          body.idCard || '',
          body.message || '',
          body.status || 'pending',
          body.notes || 'Submitted via Ogere Digital Portal',
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Royal Audience appointment booked and saved to Neon database.',
        data: {
          id: bookingId,
          fullName: body.fullName,
          date: body.date,
          time: body.time,
          status: 'pending',
          palaceVenue: 'Palace of the Ologere of Ogere Remo, Palace Way',
        },
      });
    } catch (err) {
      console.error('Error inserting royal audience:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    const rows = await sqlQuery('SELECT * FROM royal_audiences ORDER BY booking_date ASC LIMIT 50');
    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
