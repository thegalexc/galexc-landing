export const AUTH_COOKIE_NAME = 'galexc_session';
export const SESSION_VERSION = 1;
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SessionTokenPayload {
    v: typeof SESSION_VERSION;
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

function getEnv(
    name: 'GALEXC_ADMIN_PASSWORD' | 'GALEXC_COOKIE_SECRET',
): string | undefined {
    return import.meta.env[name] || undefined;
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function isPasswordValid(password: string): boolean {
    const expected = getEnv('GALEXC_ADMIN_PASSWORD');
    return Boolean(expected && password === expected);
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
}

async function sign(value: string, secret: string): Promise<string> {
    const key = await importSigningKey(secret);
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(value),
    );
    return Array.from(new Uint8Array(signature), (byte) =>
        byte.toString(16).padStart(2, '0'),
    ).join('');
}

function encodeBase64Url(value: string): string {
    const bytes = encoder.encode(value);
    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function decodeBase64Url(value: string): string | null {
    const padding = (4 - (value.length % 4)) % 4;
    const base64 =
        value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padding);

    try {
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (character) =>
            character.charCodeAt(0),
        );
        return decoder.decode(bytes);
    } catch {
        return null;
    }
}

export async function createSignedSessionToken(
    userId: string,
    email: string,
    nowMs = Date.now(),
): Promise<string> {
    const normalizedEmail = normalizeEmail(email);
    const now = Math.floor(nowMs / 1000);
    const payload: SessionTokenPayload = {
        v: SESSION_VERSION,
        userId,
        email: normalizedEmail,
        iat: now,
        exp: now + SESSION_TTL_SECONDS,
    };
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const secret = getEnv('GALEXC_COOKIE_SECRET');
    if (!secret) {
        throw new Error('GALEXC_COOKIE_SECRET is not configured.');
    }
    return `${encodedPayload}.${await sign(encodedPayload, secret)}`;
}

export async function readSignedSessionToken(
    token?: string,
    nowMs = Date.now(),
): Promise<SessionTokenPayload | null> {
    if (!token) {
        return null;
    }

    const [encodedPayload, signature, ...rest] = token.split('.');
    if (!encodedPayload || !signature || rest.length > 0) {
        return null;
    }

    const secret = getEnv('GALEXC_COOKIE_SECRET');
    if (!secret) {
        return null;
    }
    if ((await sign(encodedPayload, secret)) !== signature) {
        return null;
    }

    const payloadJson = decodeBase64Url(encodedPayload);
    if (!payloadJson) {
        return null;
    }

    let payload: unknown;
    try {
        payload = JSON.parse(payloadJson);
    } catch {
        return null;
    }

    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as Partial<SessionTokenPayload>;
    const normalizedEmail = normalizeEmail(candidate.email ?? '');

    if (
        candidate.v !== SESSION_VERSION ||
        typeof candidate.userId !== 'string' ||
        !candidate.userId ||
        !normalizedEmail ||
        !isValidEmail(normalizedEmail) ||
        !Number.isInteger(candidate.iat) ||
        !Number.isInteger(candidate.exp)
    ) {
        return null;
    }

    const now = Math.floor(nowMs / 1000);
    if ((candidate.exp as number) <= now) {
        return null;
    }

    return {
        v: SESSION_VERSION,
        userId: candidate.userId,
        email: normalizedEmail,
        iat: candidate.iat as number,
        exp: candidate.exp as number,
    };
}
