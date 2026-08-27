import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { plotId, area } = req.query;

  try {
    if (plotId) {
      const rows = await sqlQuery('SELECT * FROM land_registry WHERE UPPER(id) = UPPER($1) LIMIT 1', [plotId]);
      if (rows && rows.length > 0) {
        return res.status(200).json({ success: true, data: rows[0] });
      }
      return res.status(404).json({ success: false, message: `Plot ${plotId} not found in verified registry.` });
    }

    let query = 'SELECT * FROM land_registry';
    const params = [];

    if (area && area !== 'All') {
      params.push(`%${area}%`);
      query += ' WHERE area_quarter ILIKE $1';
    }

    query += ' ORDER BY id ASC LIMIT 50';
    const rows = await sqlQuery(query, params);

    return res.status(200).json({
      success: true,
      totalRecords: rows.length,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
