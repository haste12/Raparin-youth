import crypto from 'crypto';

// ─── Fail fast if credentials are missing ─────────────────────────────────────
// Never fall back to hardcoded values — credentials must always come from .env.local
if (!process.env.ADMIN_SECRET) {
  throw new Error('[auth] ADMIN_SECRET is not set. Add it to .env.local and restart the server.');
}
if (!process.env.ADMIN_USERNAME) {
  throw new Error('[auth] ADMIN_USERNAME is not set. Add it to .env.local and restart the server.');
}
if (!process.env.ADMIN_PASSWORD) {
  throw new Error('[auth] ADMIN_PASSWORD is not set. Add it to .env.local and restart the server.');
}

const SECRET = process.env.ADMIN_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function verifyCredentials(username, password) {
  // Use timing-safe comparison to prevent timing attacks
  const userMatch =
    username.length === ADMIN_USERNAME.length &&
    crypto.timingSafeEqual(Buffer.from(username), Buffer.from(ADMIN_USERNAME));
  const passMatch =
    password.length === ADMIN_PASSWORD.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
  return userMatch && passMatch;
}

export function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ username, iat: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  // Timing-safe comparison
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  return request.cookies.get('admin-token')?.value || null;
}

export function verifyAdminToken(request) {
  const token = getTokenFromRequest(request);
  return verifyToken(token);
}
