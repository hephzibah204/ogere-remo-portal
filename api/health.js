export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'Ogere Remo Kingdom Portal Serverless API',
    version: '6.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/verify-id',
      '/api/id-cards',
      '/api/royal-audiences',
      '/api/marketplace',
      '/api/land-registry',
      '/api/donations',
      '/api/paystack-webhook',
      '/api/forum',
    ],
  });
}
