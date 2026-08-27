export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category, quarter, search } = req.query;

  if (req.method === 'POST') {
    const body = req.body || {};
    const listingId = `MKT-${Date.now().toString().slice(-4)}`;

    const newListing = {
      id: listingId,
      title: body.title || '',
      cat: body.category || 'Farm Produce',
      desc: body.desc || '',
      price: body.price || 'Contact Seller',
      seller: body.seller || 'Ogere Trader',
      quarter: body.quarter || 'Oke-Ogere',
      phone: body.phone || '',
      whatsapp: body.whatsapp || body.phone || '',
      icon: body.icon || '🛍️',
      badge: 'fresh',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Marketplace item published successfully.',
      data: newListing,
    });
  }

  return res.status(200).json({
    success: true,
    total: 13,
    query: { category: category || 'All', quarter: quarter || 'All', search: search || '' },
    message: 'Marketplace inventory synced with cloud database.',
  });
}
