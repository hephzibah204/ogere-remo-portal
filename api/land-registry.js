export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { plotId, area } = req.query;

  const PLOTS = [
    {
      id: 'OGR-LND-001',
      area: 'Oke-Ogere',
      owner: 'Adelana Royal Family',
      size: '2 Plots (1200sqm)',
      use: 'Commercial',
      status: 'Verified',
      coord: '6.9821° N, 3.6512° E',
      disputes: 0,
    },
    {
      id: 'OGR-LND-002',
      area: 'Isale-Ogere',
      owner: 'Osinowo Lineage Trust',
      size: '5 Acres',
      use: 'Agricultural',
      status: 'Verified',
      coord: '6.9790° N, 3.6580° E',
      disputes: 0,
    },
    {
      id: 'OGR-LND-003',
      area: 'Ago-Ogere',
      owner: 'Chief K. A. Sobukonla',
      size: '4 Plots',
      use: 'Residential',
      status: 'Pending Survey',
      coord: '6.9740° N, 3.6480° E',
      disputes: 1,
    },
  ];

  if (plotId) {
    const match = PLOTS.find(p => p.id.toLowerCase() === plotId.toLowerCase());
    if (match) {
      return res.status(200).json({ success: true, data: match });
    }
    return res.status(404).json({ success: false, message: `Plot with ID ${plotId} not found in verified registry.` });
  }

  return res.status(200).json({
    success: true,
    totalRecords: PLOTS.length,
    data: area ? PLOTS.filter(p => p.area.toLowerCase().includes(area.toLowerCase())) : PLOTS,
  });
}
