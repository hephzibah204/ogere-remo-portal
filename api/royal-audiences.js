export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const bookingId = `AUD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = {
      id: bookingId,
      fullName: body.fullName || '',
      purpose: body.purpose || 'General Royal Consultation',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '11:00 AM',
      phone: body.phone || '',
      email: body.email || '',
      groupSize: body.groupSize || '1',
      idCard: body.idCard || '',
      message: body.message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      palaceVenue: 'Palace of the Ologere of Ogere Remo, Palace Way',
    };

    return res.status(201).json({
      success: true,
      message: 'Royal Audience booking received. The Palace Secretary will review and confirm availability.',
      data: newBooking,
    });
  }

  return res.status(200).json({
    success: true,
    data: [
      {
        id: 'AUD-2026-001',
        fullName: 'Chief Olumide Sobukonla',
        purpose: 'Community Project Briefing (Youth Skills Hub)',
        date: '2026-09-04',
        time: '11:00 AM',
        status: 'confirmed',
      },
    ],
  });
}
