import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 1. Incidents
  if (req.method === 'POST') {
    const body = req.body || {};
    const incidentId = body.id || `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await sqlQuery(
        `INSERT INTO incident_reports 
          (id, category, severity, location, description, reporter_name, reporter_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          incidentId,
          body.category || 'general',
          body.severity || 'Medium',
          body.location || 'Ogere Remo',
          body.description || body.title || 'Security incident report',
          body.reporterName || 'Anonymous Citizen',
          body.reporterPhone || '',
          'open',
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Incident reported and dispatched to Ogere Community Security Network.',
        data: { id: incidentId, ...body },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    const rows = await sqlQuery('SELECT * FROM incident_reports ORDER BY created_at DESC LIMIT 50');
    return res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
