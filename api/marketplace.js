import { sqlQuery } from './lib/db.js';

function normalizeListing(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    title: row.title || 'Marketplace Listing',
    cat: row.cat || row.category || 'General',
    category: row.category || row.cat || 'General',
    desc: row.desc || row.description || '',
    description: row.description || row.desc || '',
    price: row.price || 'Contact Seller',
    seller: row.seller || row.seller_name || 'Ogere Citizen Trader',
    seller_name: row.seller_name || row.seller || 'Ogere Citizen Trader',
    quarter: row.quarter || 'Oke-Ogere',
    phone: row.phone || '',
    whatsapp: row.whatsapp || row.phone || '',
    icon: row.icon || '🛍️',
    badge: row.badge || 'fresh',
    verified: row.verified !== undefined ? Boolean(row.verified) : (row.is_verified !== undefined ? Boolean(row.is_verified) : true),
    is_verified: row.is_verified !== undefined ? Boolean(row.is_verified) : (row.verified !== undefined ? Boolean(row.verified) : true),
    status: row.status || 'active',
    imageUrl: row.imageUrl || row.image_url || '',
    image_url: row.image_url || row.imageUrl || '',
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    created_at: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category, quarter, search } = req.query || {};

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
          body.category || body.cat || 'Farm Produce',
          body.desc || body.description || '',
          body.price || 'Contact Seller',
          body.seller || body.seller_name || 'Ogere Trader',
          body.quarter || 'Oke-Ogere',
          body.phone || '',
          body.whatsapp || body.phone || '',
          body.icon || '🛍️',
          body.badge || 'fresh',
          true,
          'active',
          body.imageUrl || body.image_url || '',
        ]
      );

      const saved = normalizeListing({
        id: listingId,
        ...body,
        status: 'active',
      });

      return res.status(201).json({
        success: true,
        message: 'Marketplace item published and saved to Neon cloud database.',
        data: saved,
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
    const normalizedRows = (rows || []).map(normalizeListing);

    return res.status(200).json({
      success: true,
      total: normalizedRows.length,
      data: normalizedRows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
