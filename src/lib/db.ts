import { env } from 'cloudflare:workers';
import { createHmac } from './crypto';
import type { PortalRoleKey, PortalUser } from '../types/portal';
import { normalizeEmail } from './auth';

export { normalizeEmail } from './auth';

interface D1ResultRow {
    [key: string]: unknown;
}

function getDb() {
    if (!env.DB) {
        throw new Error('D1 database binding `DB` is not configured.');
    }
    return env.DB;
}

function nowIso(now = new Date()): string {
    return now.toISOString();
}

function cleanName(name: string | null | undefined): string | null {
    const trimmed = name?.trim() ?? '';
    return trimmed || null;
}

export interface WaitlistEntryInput {
    userId: string;
    email: string;
    name: string | null;
    note: string | null;
    source: string;
    ipAddress: string | null;
    userAgent: string | null;
}

export interface WaitlistEntryRecord {
    id: string;
    userId: string | null;
    email: string;
    email_normalized: string;
    name: string | null;
    note: string | null;
    source: string;
    status: string;
    created_at: string;
}

function toPortalUser(
    row: D1ResultRow & { roles_csv?: string | null },
): PortalUser {
    return {
        id: String(row.id),
        email: String(row.email),
        normalizedEmail: String(row.normalized_email),
        emailKey: String(row.email_key),
        name:
            row.name === null || row.name === undefined
                ? null
                : String(row.name),
        status: String(row.status) as PortalUser['status'],
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
        lastLoginAt:
            row.last_login_at === null || row.last_login_at === undefined
                ? null
                : String(row.last_login_at),
        roles: row.roles_csv
            ? (String(row.roles_csv)
                  .split(',')
                  .filter(Boolean) as PortalRoleKey[])
            : [],
        submissionCount: Number(row.submission_count ?? 0),
    };
}

async function getRoleId(roleKey: PortalRoleKey): Promise<number> {
    const row = await getDb()
        .prepare('SELECT id FROM roles WHERE key = ?')
        .bind(roleKey)
        .first<{ id: number }>();
    if (!row) {
        throw new Error(`Role not found: ${roleKey}`);
    }
    return row.id;
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

export function parseBootstrapAdminEmails(
    value: string | undefined = env.GALEXC_BOOTSTRAP_ADMIN_EMAILS,
): string[] {
    const combined = [value, env.GALEXC_ADMIN_EMAILS]
        .filter(Boolean)
        .join(',');

    if (!combined) {
        return [];
    }

    return Array.from(
        new Set(
            combined
                .split(',')
                .map((email) => normalizeEmail(email))
                .filter(Boolean),
        ),
    );
}

export async function getUserById(userId: string): Promise<PortalUser | null> {
    const row = await getDb()
        .prepare(
            `
      SELECT
        users.id,
        users.email,
        users.normalized_email,
        users.email_key,
        users.name,
        users.status,
        users.created_at,
        users.updated_at,
        users.last_login_at,
        COALESCE(GROUP_CONCAT(roles.key), '') AS roles_csv,
        COUNT(DISTINCT waitlist_entries.id) AS submission_count
      FROM users
      LEFT JOIN user_roles
        ON user_roles.user_id = users.id
        AND user_roles.revoked_at IS NULL
      LEFT JOIN roles
        ON roles.id = user_roles.role_id
      LEFT JOIN waitlist_entries
        ON waitlist_entries.user_id = users.id
      WHERE users.id = ?
      GROUP BY users.id
    `,
        )
        .bind(userId)
        .first<D1ResultRow & { roles_csv?: string | null }>();

    return row ? toPortalUser(row) : null;
}

export async function getUserByEmail(
    email: string,
): Promise<PortalUser | null> {
    const row = await getDb()
        .prepare(
            `
      SELECT
        users.id,
        users.email,
        users.normalized_email,
        users.email_key,
        users.name,
        users.status,
        users.created_at,
        users.updated_at,
        users.last_login_at,
        COALESCE(GROUP_CONCAT(roles.key), '') AS roles_csv,
        COUNT(DISTINCT waitlist_entries.id) AS submission_count
      FROM users
      LEFT JOIN user_roles
        ON user_roles.user_id = users.id
        AND user_roles.revoked_at IS NULL
      LEFT JOIN roles
        ON roles.id = user_roles.role_id
      LEFT JOIN waitlist_entries
        ON waitlist_entries.user_id = users.id
      WHERE users.email_key = ?
      GROUP BY users.id
    `,
        )
        .bind(getEmailKey(email))
        .first<D1ResultRow & { roles_csv?: string | null }>();

    return row ? toPortalUser(row) : null;
}

export async function upsertUserByEmail(
    email: string,
    options: { name?: string | null; touchLastLogin?: boolean } = {},
): Promise<PortalUser> {
    const db = getDb();
    const normalizedEmail = normalizeEmail(email);
    const emailKey = getEmailKey(email);
    const timestamp = nowIso();
    const incomingName = cleanName(options.name);
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
        const nextName = incomingName ?? existingUser.name;
        const nextLastLoginAt = options.touchLastLogin
            ? timestamp
            : existingUser.lastLoginAt;

        await db
            .prepare(
                `
          UPDATE users
          SET email = ?, normalized_email = ?, email_key = ?, name = ?, updated_at = ?, last_login_at = ?
          WHERE id = ?
        `,
            )
            .bind(
                normalizedEmail,
                normalizedEmail,
                emailKey,
                nextName,
                timestamp,
                nextLastLoginAt,
                existingUser.id,
            )
            .run();

        const updatedUser = await getUserById(existingUser.id);
        if (!updatedUser) {
            throw new Error('Failed to reload updated user.');
        }
        return updatedUser;
    }

    const userId = crypto.randomUUID();
    await db
        .prepare(
            `
        INSERT INTO users (
          id,
          email,
          normalized_email,
          email_key,
          name,
          status,
          created_at,
          updated_at,
          last_login_at
        ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `,
        )
        .bind(
            userId,
            normalizedEmail,
            normalizedEmail,
            emailKey,
            incomingName,
            timestamp,
            timestamp,
            options.touchLastLogin ? timestamp : null,
        )
        .run();

    const createdUser = await getUserById(userId);
    if (!createdUser) {
        throw new Error('Failed to load created user.');
    }
    return createdUser;
}

export async function hasActiveRole(
    userId: string,
    roleKey: PortalRoleKey,
): Promise<boolean> {
    const row = await getDb()
        .prepare(
            `
      SELECT user_roles.user_id
      FROM user_roles
      JOIN roles ON roles.id = user_roles.role_id
      WHERE user_roles.user_id = ?
        AND roles.key = ?
        AND user_roles.revoked_at IS NULL
      LIMIT 1
    `,
        )
        .bind(userId, roleKey)
        .first();

    return !!row;
}

export async function grantRole(
    userId: string,
    roleKey: PortalRoleKey,
    grantedByUserId: string | null,
): Promise<boolean> {
    const roleId = await getRoleId(roleKey);
    const result = (await getDb()
        .prepare(
            `
      INSERT OR IGNORE INTO user_roles (user_id, role_id, granted_at, granted_by_user_id, revoked_at)
      VALUES (?, ?, ?, ?, NULL)
    `,
        )
        .bind(userId, roleId, nowIso(), grantedByUserId)
        .run()) as { meta?: { changes?: number } };

    return Number(result?.meta?.changes ?? 0) > 0;
}

export async function insertAuditEvent(
    eventType: string,
    actorUserId: string | null,
    targetUserId: string | null,
    payload: Record<string, unknown>,
): Promise<void> {
    await getDb()
        .prepare(
            `
      INSERT INTO audit_events (id, actor_user_id, target_user_id, event_type, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
        )
        .bind(
            crypto.randomUUID(),
            actorUserId,
            targetUserId,
            eventType,
            JSON.stringify(payload),
            nowIso(),
        )
        .run();
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
        user_id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `,
        )
        .bind(
            id,
            input.userId,
            input.email.trim(),
            normalizedEmail,
            emailKey,
            cleanName(input.name),
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
    const result = await getDb()
        .prepare(
            `
      SELECT id, user_id AS userId, email, email_normalized, name, note, source, status, created_at
      FROM waitlist_entries
      ORDER BY created_at DESC
      LIMIT ?
    `,
        )
        .bind(limit)
        .all<WaitlistEntryRecord>();
    return result.results;
}

export async function listUsers(limit = 200): Promise<PortalUser[]> {
    const result = await getDb()
        .prepare(
            `
      SELECT
        users.id,
        users.email,
        users.normalized_email,
        users.email_key,
        users.name,
        users.status,
        users.created_at,
        users.updated_at,
        users.last_login_at,
        COALESCE(GROUP_CONCAT(roles.key), '') AS roles_csv,
        COUNT(DISTINCT waitlist_entries.id) AS submission_count
      FROM users
      LEFT JOIN user_roles
        ON user_roles.user_id = users.id
        AND user_roles.revoked_at IS NULL
      LEFT JOIN roles
        ON roles.id = user_roles.role_id
      LEFT JOIN waitlist_entries
        ON waitlist_entries.user_id = users.id
      GROUP BY users.id
      ORDER BY COALESCE(users.last_login_at, users.created_at) DESC, users.email ASC
      LIMIT ?
    `,
        )
        .bind(limit)
        .all<D1ResultRow & { roles_csv?: string | null }>();

    return result.results.map((row) => toPortalUser(row));
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
