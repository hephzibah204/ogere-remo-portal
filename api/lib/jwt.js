import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_KEY || 'default_fallback_secret_do_not_use_in_prod_123';

export function signToken(payload) {
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64Payload, signature] = parts;

  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(b64Payload).digest('base64url');
  
  // Prevent timing attacks
  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch (e) {
    if (signature !== expectedSignature) return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
}
