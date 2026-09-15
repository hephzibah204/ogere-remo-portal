import { sqlQuery } from './lib/db.js';

function normalizePlot(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    area: row.area || row.area_quarter || '',
    area_quarter: row.area_quarter || row.area || '',
    owner: row.owner || row.owner_name || '',
    owner_name: row.owner_name || row.owner || '',
    size: row.size || row.size_description || '',
    size_description: row.size_description || row.size || '',
    use: row.use || row.land_use || 'Residential',
    land_use: row.land_use || row.use || 'Residential',
    status: row.status || 'Verified',
    date: row.date || (row.registration_date ? String(row.registration_date).split('T')[0] : ''),
    registration_date: row.registration_date || row.date || '',
    coord: row.coord || row.coordinates || '',
    coordinates: row.coordinates || row.coord || '',
    disputes: row.disputes !== undefined ? Number(row.disputes) : Number(row.disputes_count || 0),
    disputes_count: row.disputes_count !== undefined ? Number(row.disputes_count) : Number(row.disputes || 0),
    documents: row.documents || row.documents_ref || '',
    documents_ref: row.documents_ref || row.documents || '',
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. POST: Register new land plot
  if (req.method === 'POST') {
    const body = req.body || {};
    const plotId = body.id || `OGR-LND-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await sqlQuery(
        `INSERT INTO land_registry 
          (id, area_quarter, owner_name, size_description, land_use, status, registration_date, coordinates, disputes_count, documents_ref)
         VALUES 
          ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
          owner_name = EXCLUDED.owner_name,
          status = EXCLUDED.status,
          documents_ref = EXCLUDED.documents_ref`,
        [
          plotId,
          body.area || body.area_quarter || 'Oke-Ogere',
          body.owner || body.owner_name || 'Community Member',
          body.size || body.size_description || '1 Plot',
          body.use || body.land_use || 'Residential',
          body.status || 'Pending Survey',
          body.coord || body.coordinates || '6.9800° N, 3.6500° E',
          parseInt(body.disputes || body.disputes_count || '0', 10),
          body.documents || body.documents_ref || 'Application filed online',
        ]
      );

      const saved = normalizePlot({
        id: plotId,
        area: body.area || body.area_quarter || 'Oke-Ogere',
        owner: body.owner || body.owner_name || 'Community Member',
        size: body.size || body.size_description || '1 Plot',
        use: body.use || body.land_use || 'Residential',
        status: body.status || 'Pending Survey',
        date: new Date().toISOString().split('T')[0],
        coord: body.coord || body.coordinates || '6.9800° N, 3.6500° E',
        disputes: parseInt(body.disputes || body.disputes_count || '0', 10),
        documents: body.documents || body.documents_ref || 'Application filed online',
      });

      return res.status(201).json({
        success: true,
        message: 'Plot registered and saved to registry database.',
        data: saved,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. GET: Lookup single plot or query list
  const { plotId, area } = req.query || {};

  try {
    if (plotId) {
      const rows = await sqlQuery('SELECT * FROM land_registry WHERE UPPER(id) = UPPER($1) LIMIT 1', [plotId]);
      if (rows && rows.length > 0) {
        return res.status(200).json({ success: true, data: normalizePlot(rows[0]) });
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
    const normalizedRows = (rows || []).map(normalizePlot);

    return res.status(200).json({
      success: true,
      totalRecords: normalizedRows.length,
      data: normalizedRows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
