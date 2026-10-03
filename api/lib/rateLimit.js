const rateLimits = new Map();
export function checkRateLimit(ip, limit = 5, windowMs = 900000) {
  const now = Date.now();
  const record = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }
  rateLimits.set(ip, record);
  return record.count <= limit;
}
