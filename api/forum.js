export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const newPost = {
      id: Date.now(),
      name: body.name || 'Anonymous Indigene',
      cat: body.cat || 'general',
      topic: body.topic || '',
      body: body.body || '',
      date: new Date().toLocaleDateString('en-NG'),
      likes: 1,
      replies: [],
    };

    return res.status(201).json({
      success: true,
      message: 'Discussion topic posted to community forum.',
      data: newPost,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Forum API endpoint active.',
  });
}
