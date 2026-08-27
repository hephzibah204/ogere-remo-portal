export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const cardId = `OGR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newApplication = {
      id: cardId,
      fullName: body.fullName || 'Citizen Applicant',
      cardType: body.cardType || 'indigene',
      dob: body.dob || '',
      compound: body.compound || '',
      quarter: body.quarter || 'Oke-Ogere',
      phone: body.phone || '',
      email: body.email || '',
      address: body.address || '',
      occupation: body.occupation || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${cardId}`,
    };

    return res.status(201).json({
      success: true,
      message: 'ID application submitted successfully for royal secretariat review.',
      data: newApplication,
    });
  }

  return res.status(200).json({
    success: true,
    totalRecords: 3,
    data: [
      { id: 'OGR-782910', fullName: 'Adewale Babatunde Ogunleke', cardType: 'indigene', status: 'approved' },
      { id: 'OGR-D-492019', fullName: 'Dr. Folashade Adeyemi-Clark', cardType: 'diaspora', status: 'approved' },
      { id: 'OGR-R-839201', fullName: 'Chief Emeka Okafor', cardType: 'resident', status: 'approved' },
    ],
  });
}
