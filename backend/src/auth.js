import { createHmac, timingSafeEqual } from 'node:crypto';

const encode = (value) => Buffer.from(value).toString('base64url');
const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('base64url');

export function issuePatientToken(patientId, secret, expiresInSeconds = 60 * 60 * 24 * 30) {
  const payload = encode(JSON.stringify({ sub: patientId, role: 'patient', exp: Math.floor(Date.now() / 1000) + expiresInSeconds }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyPatientToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = sign(payload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.role !== 'patient' || !claims.sub || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
