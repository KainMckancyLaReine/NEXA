/* ============================================================
   NEXA — Authentication & authorization (zero-dependency)
   ------------------------------------------------------------
   Real auth built on Node's crypto:
     • Passwords are hashed with scrypt + per-user salt.
     • Sessions are stateless, signed tokens (HMAC-SHA256) with
       an expiry — verified on every protected request.
     • A small middleware extracts and verifies the bearer token
       and attaches { userId, tenantId, role } to the request.

   No secrets are hard-coded: the signing secret comes from
   NEXA_AUTH_SECRET (falls back to a per-install random secret
   persisted in the store, so tokens survive restarts but are
   unique per deployment).
   ============================================================ */
const crypto = require('crypto');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h

/* ---------- password hashing (scrypt) ---------- */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.startsWith('scrypt$')) return false;
  const [, salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(password), salt, 64);
  const ref = Buffer.from(hash, 'hex');
  return test.length === ref.length && crypto.timingSafeEqual(test, ref);
}

/* ---------- signed, stateless tokens ---------- */
const b64url = (buf) => Buffer.from(buf).toString('base64url');
const unb64url = (s) => Buffer.from(s, 'base64url').toString('utf8');

function sign(payloadStr, secret) {
  return crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');
}

function issueToken({ userId, tenantId, role }, secret, ttl = TOKEN_TTL_MS) {
  const payload = { u: userId, t: tenantId, r: role, exp: Date.now() + ttl };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body, secret)}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = sign(body, secret);
  // constant-time compare
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(unb64url(body)); } catch { return null; }
  if (!payload.exp || Date.now() > payload.exp) return null;
  // Purpose-tagged tokens (e.g. password reset) are NOT valid session tokens.
  if (payload.p) return null;
  return { userId: payload.u, tenantId: payload.t, role: payload.r, exp: payload.exp };
}

/* ---------- single-purpose password-reset tokens (30 min) ---------- */
function issueResetToken({ userId, tenantId }, secret, ttl = 30 * 60 * 1000) {
  const body = b64url(JSON.stringify({ u: userId, t: tenantId, p: 'reset', exp: Date.now() + ttl }));
  return `${body}.${sign(body, secret)}`;
}
function verifyResetToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = sign(body, secret);
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let p; try { p = JSON.parse(unb64url(body)); } catch { return null; }
  if (p.p !== 'reset' || !p.exp || Date.now() > p.exp) return null;
  return { userId: p.u, tenantId: p.t };
}

/* ---------- request helper ---------- */
function bearerFrom(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'];
  if (h && /^Bearer\s+/i.test(h)) return h.replace(/^Bearer\s+/i, '').trim();
  return null;
}

/* Returns the verified auth context, or null if unauthenticated. */
function authContext(req, secret) {
  return verifyToken(bearerFrom(req), secret);
}

/* ---------- simple in-memory login rate limiter ---------- */
const attempts = new Map(); // key -> { count, first }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
function rateLimited(key) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) { attempts.set(key, { count: 1, first: now }); return false; }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}
function resetRateLimit(key) { attempts.delete(key); }

module.exports = {
  hashPassword, verifyPassword,
  issueToken, verifyToken, authContext, bearerFrom,
  issueResetToken, verifyResetToken,
  rateLimited, resetRateLimit,
  TOKEN_TTL_MS,
};
