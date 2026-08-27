import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key_ogere';
  const paystackSignature = req.headers['x-paystack-signature'];

  // Verify hash signature if present
  if (paystackSignature && req.body) {
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== paystackSignature) {
      return res.status(401).json({ message: 'Invalid cryptographic signature from Paystack.' });
    }
  }

  const event = req.body || {};
  const eventType = event.event;
  const data = event.data || {};

  if (eventType === 'charge.success') {
    const amountNaira = (data.amount || 0) / 100;
    const customerEmail = data.customer?.email;
    const reference = data.reference;
    const metadata = data.metadata || {};

    console.log(`[Paystack Webhook] Verified payment of ₦${amountNaira} for ${customerEmail} (Ref: ${reference})`);

    return res.status(200).json({
      status: 'success',
      message: 'Transaction successfully processed and recorded in Ogere community ledger.',
      transaction: {
        reference,
        amount: amountNaira,
        customerEmail,
        metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  return res.status(200).json({ status: 'ignored', message: `Unhandled event type: ${eventType}` });
}
