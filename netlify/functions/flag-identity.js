import { verify } from 'node:crypto';

const PROJECT = 'arabic-3e9b3';
let cached = null;
let expires = 0;
async function certificates() {
  if (cached && Date.now() < expires) return cached;
  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Identity verification unavailable');
  cached = await response.json();
  expires = Date.now() + 300000;
  return cached;
}

export async function flagIdentity(req) {
  const authorization = req.headers.get('authorization');
  if (!authorization) return ['Anonymous', '', ''];
  const match = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(authorization);
  if (!match || match[1].length > 16000) throw new Error('Invalid identity');
  const parts = match[1].split('.');
  if (parts.length !== 3) throw new Error('Invalid identity');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Invalid identity');
  const certs = await certificates();
  const certificate = Object.hasOwn(certs, header.kid) ? certs[header.kid] : null;
  if (!certificate || !verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), certificate, Buffer.from(parts[2], 'base64url'))) throw new Error('Invalid identity');
  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== PROJECT || claims.iss !== 'https://securetoken.google.com/' + PROJECT || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128 || typeof claims.exp !== 'number' || claims.exp <= now || typeof claims.iat !== 'number' || claims.iat > now || typeof claims.auth_time !== 'number' || claims.auth_time > now) throw new Error('Invalid identity');
  const text = (value, length) => typeof value === 'string' ? value.trim().slice(0, length) : '';
  return [text(claims.name, 200) || 'Signed-in user', claims.sub, text(claims.email, 320)];
}
