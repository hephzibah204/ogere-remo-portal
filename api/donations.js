export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const PROJECTS = [
    {
      id: 'civic_centre',
      title: 'Ogere Civic Hall & Town Hall Modernisation',
      goal: 10000000,
      raised: 6850000,
      donorsCount: 42,
    },
    {
      id: 'ict_hub',
      title: 'Ogere Youth ICT & Solar Tech Hub',
      goal: 5000000,
      raised: 3400000,
      donorsCount: 28,
    },
    {
      id: 'lipakala_jubilee',
      title: '50th Lipakala Day Golden Jubilee Cultural Fund',
      goal: 8000000,
      raised: 5100000,
      donorsCount: 65,
    },
    {
      id: 'maternity_clinic',
      title: 'Ogere Maternity Ward & Emergency Clinic Upgrade',
      goal: 6500000,
      raised: 4200000,
      donorsCount: 37,
    },
  ];

  if (req.method === 'POST') {
    const body = req.body || {};
    const donationRecord = {
      id: `DON-${Date.now()}`,
      projectId: body.projectId || 'civic_centre',
      donorName: body.donorName || 'Anonymous Diaspora Member',
      donorEmail: body.donorEmail || '',
      amount: Number(body.amount || 0),
      reference: body.reference || `PSK_${Date.now()}`,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Donation recorded successfully in community endowment fund.',
      data: donationRecord,
    });
  }

  return res.status(200).json({
    success: true,
    totalProjects: PROJECTS.length,
    data: PROJECTS,
  });
}
