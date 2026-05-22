import { env } from 'cloudflare:workers';
import { createHmac } from './crypto';

export interface WaitlistEntryInput {
    email: string;
    name: string | null;
    note: string | null;
    source: string;
    ipAddress: string | null;
    userAgent: string | null;
}

export interface WaitlistEntryRecord {
    id: string;
    email: string;
    email_normalized: string;
    name: string | null;
    note: string | null;
    source: string;
    status: string;
    created_at: string;
}

function getDb() {
    if (!env.DB) {
        throw new Error('D1 binding DB is not configured.');
    }
    return env.DB;
}

function nowIso(): string {
    return new Date().toISOString();
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function getEmailKey(email: string): string {
    const normalized = normalizeEmail(email);
    const [localPart, domain = ''] = normalized.split('@');
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
        const localWithoutPlus =
            localPart.split('+')[0]?.replace(/\./g, '') ?? localPart;
        return `${localWithoutPlus}@gmail.com`;
    }
    return normalized;
}

export async function createIpHmac(ipAddress: string | null): Promise<string> {
    return createHmac(
        ipAddress ?? 'unknown',
        env.IP_HMAC_SECRET ?? 'local-ip-secret',
    );
}

export async function insertWaitlistEntry(
    input: WaitlistEntryInput,
): Promise<'created' | 'duplicate'> {
    const db = getDb();
    const timestamp = nowIso();
    const id = crypto.randomUUID();
    const normalizedEmail = normalizeEmail(input.email);
    const emailKey = getEmailKey(input.email);
    const ipHmac = await createIpHmac(input.ipAddress);

    const existing = await db
        .prepare('SELECT id FROM waitlist_entries WHERE email_key = ? LIMIT 1')
        .bind(emailKey)
        .first<{ id: string }>();
    if (existing) {
        return 'duplicate';
    }

    await db
        .prepare(
            `
    INSERT INTO waitlist_entries (
      id,
      email,
      email_normalized,
      email_key,
      name,
      note,
      source,
      ip_hmac,
      user_agent,
      status,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `,
        )
        .bind(
            id,
            input.email.trim(),
            normalizedEmail,
            emailKey,
            input.name,
            input.note,
            input.source,
            ipHmac,
            input.userAgent,
            timestamp,
        )
        .run();

    return 'created';
}

export async function listWaitlistEntries(
    limit = 200,
): Promise<WaitlistEntryRecord[]> {
    const db = getDb();
    const result = await db
        .prepare(
            `
    SELECT id, email, email_normalized, name, note, source, status, created_at
    FROM waitlist_entries
    ORDER BY created_at DESC
    LIMIT ?
  `,
        )
        .bind(limit)
        .all<WaitlistEntryRecord>();
    return result.results;
}

export async function getWaitlistStats(): Promise<{
    total: number;
    today: number;
}> {
    const db = getDb();
    const totalRow = await db
        .prepare('SELECT COUNT(*) AS total FROM waitlist_entries')
        .first<{ total: number | string }>();
    const todayRow = await db
        .prepare(
            `
    SELECT COUNT(*) AS total
    FROM waitlist_entries
    WHERE substr(created_at, 1, 10) = substr(?, 1, 10)
  `,
        )
        .bind(nowIso())
        .first<{ total: number | string }>();

    return {
        total: Number(totalRow?.total ?? 0),
        today: Number(todayRow?.total ?? 0),
    };
}
