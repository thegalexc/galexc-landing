import { env } from 'cloudflare:workers';
import type { APIContext } from 'astro';
import type { AdminUser } from '../types/admin';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAdminAllowlist(): string[] {
  const raw = env.GALEXC_ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function getAccessAuthenticatedEmail(context: APIContext | { request: Request }): string | null {
  const email = context.request.headers.get('cf-access-authenticated-user-email');
  if (!email) {
    return null;
  }
  return normalizeEmail(email);
}

export function getAdminUser(context: APIContext | { request: Request }): AdminUser | null {
  const email = getAccessAuthenticatedEmail(context);
  if (!email) {
    return null;
  }

  if (!getAdminAllowlist().includes(email)) {
    return null;
  }

  return { email };
}
