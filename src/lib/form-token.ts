import { env } from 'cloudflare:workers';
import { createHmac } from './crypto';

const MIN_FORM_AGE_MS = 2000;
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24;

function getSecret(): string {
  return env.IP_HMAC_SECRET ?? 'local-form-secret';
}

export async function createFormToken(issuedAt: string, routeKey: string): Promise<string> {
  return createHmac(`${routeKey}:${issuedAt}`, getSecret());
}

export async function verifyFormToken(issuedAt: string, routeKey: string, token: string): Promise<boolean> {
  const expected = await createFormToken(issuedAt, routeKey);
  return expected === token;
}

export function getFormAgeStatus(issuedAt: string, now = Date.now()): 'ok' | 'too_fast' | 'expired' | 'invalid' {
  const issuedAtMs = Number.parseInt(issuedAt, 10);
  if (!Number.isFinite(issuedAtMs)) {
    return 'invalid';
  }

  const ageMs = now - issuedAtMs;
  if (ageMs < MIN_FORM_AGE_MS) {
    return 'too_fast';
  }
  if (ageMs > MAX_FORM_AGE_MS) {
    return 'expired';
  }
  return 'ok';
}
