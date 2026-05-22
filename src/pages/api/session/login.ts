import type { APIRoute } from 'astro';
import {
    AUTH_COOKIE_NAME,
    SESSION_TTL_SECONDS,
    createSignedSessionToken,
    isPasswordValid,
    isValidEmail,
    normalizeEmail,
} from '../../../lib/auth';
import { applyRateLimit } from '../../../lib/rate-limit';
import {
    getEmailKey,
    getUserById,
    grantRole,
    hasActiveRole,
    insertAuditEvent,
    parseBootstrapAdminEmails,
    upsertUserByEmail,
} from '../../../lib/db';

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
    const formData = await request.formData();
    const normalizedEmail = normalizeEmail(String(formData.get('email') ?? ''));
    const password = String(formData.get('password') ?? '');

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        return redirect('/login?error=email');
    }

    const ipAddress = request.headers.get('cf-connecting-ip') ?? 'unknown';
    const ipLimit = await applyRateLimit(`admin-login:ip:${ipAddress}`, 10, 60 * 60);
    if (!ipLimit.allowed) {
        return redirect('/login?error=1');
    }

    const emailLimit = await applyRateLimit(
        `admin-login:email:${getEmailKey(normalizedEmail)}`,
        5,
        60 * 60,
    );
    if (!emailLimit.allowed) {
        return redirect('/login?error=1');
    }

    if (!password || !isPasswordValid(password)) {
        return redirect('/login?error=1');
    }

    const user = await upsertUserByEmail(normalizedEmail, { touchLastLogin: true });

    if (user.status === 'suspended') {
        cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
        return redirect('/login?error=paused');
    }

    const bootstrapEmails = parseBootstrapAdminEmails();
    if (bootstrapEmails.includes(user.email) && !(await hasActiveRole(user.id, 'admin'))) {
        const granted = await grantRole(user.id, 'admin', user.id);
        if (granted) {
            await insertAuditEvent('role.granted.bootstrap_admin', user.id, user.id, {
                role: 'admin',
                source: 'bootstrap-login',
            });
        }
    }

    const refreshedUser = await getUserById(user.id);
    if (!refreshedUser || !refreshedUser.roles.includes('admin')) {
        cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
        return redirect('/login?error=admin');
    }

    cookies.set(
        AUTH_COOKIE_NAME,
        await createSignedSessionToken(refreshedUser.id, refreshedUser.email),
        {
            httpOnly: true,
            sameSite: 'lax',
            secure: !import.meta.env.DEV,
            path: '/',
            maxAge: SESSION_TTL_SECONDS,
        },
    );

    await insertAuditEvent('user.login', refreshedUser.id, refreshedUser.id, {
        email: refreshedUser.email,
    });

    return redirect('/admin');
};
