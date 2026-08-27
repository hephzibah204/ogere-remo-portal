import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category, quarter, search } = req.query;

  if (req.method === 'POST') {
    const body = req.body || {};
    const listingId = body.id || `MKT-${Date.now().toString().slice(-4)}`;

    try {
      await sqlQuery(
        `INSERT INTO marketplace_listings
          (id, title, category, description, price, seller_name, quarter, phone, whatsapp, icon, badge, is_verified, status, image_url)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          listingId,
          body.title || 'Marketplace Item',
          body.category || 'Farm Produce',
          body.desc || '',
          body.price || 'Contact Seller',
          body.seller || 'Ogere Trader',
          body.quarter || 'Oke-Ogere',
          body.phone || '',
          body.whatsapp || body.phone || '',
          body.icon || '🛍️',
          body.badge || 'fresh',
          true,
          'active',
          body.imageUrl || '',
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Marketplace item published and saved to Neon cloud database.',
        data: { id: listingId, ...body },
      });
    } catch (err) {
      console.error('Error inserting marketplace listing:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    let query = 'SELECT * FROM marketplace_listings WHERE status = $1';
    const params = ['active'];

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (quarter && quarter !== 'All Quarters') {
      params.push(quarter);
      query += ` AND quarter = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const rows = await sqlQuery(query, params);
    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
