import { sqlQuery } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { actionType, targetId, status, notes } = req.body || {};

  if (!actionType || !targetId) {
    return res.status(400).json({ success: false, message: 'Missing actionType or targetId' });
  }

  try {
    let query = '';
    let params = [];

    switch (actionType) {
      case 'id_card_status':
        query = 'UPDATE id_cards SET status = $1, verified_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *';
        params = [status || 'approved', notes || 'HRH Ologere Palace Secretariat', targetId];
        break;

      case 'royal_audience_status':
        query = 'UPDATE royal_audiences SET status = $1, palace_notes = $2 WHERE id = $3 RETURNING *';
        params = [status || 'confirmed', notes || 'Confirmed by Palace Office', targetId];
        break;

      case 'land_registry_status':
        query = 'UPDATE land_registry SET status = $1 WHERE id = $2 RETURNING *';
        params = [status || 'Verified', targetId];
        break;

      case 'scholarship_status':
        query = 'UPDATE scholarship_applications SET status = $1 WHERE id = $2 RETURNING *';
        params = [status || 'awarded', targetId];
        break;

      case 'marketplace_status':
        query = 'UPDATE marketplace_listings SET status = $1 WHERE id = $2 RETURNING *';
        params = [status || 'active', targetId];
        break;

      case 'incident_status':
        query = 'UPDATE incident_reports SET status = $1 WHERE id = $2 RETURNING *';
        params = [status || 'resolved', targetId];
        break;

      default:
        return res.status(400).json({ success: false, message: `Unknown actionType: ${actionType}` });
    }

    const updatedRows = await sqlQuery(query, params);

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${actionType} record ${targetId} to ${status}.`,
      data: updatedRows[0] || null,
    });
  } catch (err) {
    console.error('[Admin Action Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
