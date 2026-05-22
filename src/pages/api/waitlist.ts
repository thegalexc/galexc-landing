import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyFormToken, getFormAgeStatus } from '../../lib/form-token';
import { applyRateLimit } from '../../lib/rate-limit';
import {
    getEmailKey,
    insertWaitlistEntry,
    normalizeEmail,
} from '../../lib/waitlist';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectTo(state: string): Response {
    return new Response(null, {
        status: 302,
        headers: {
            Location: `/?waitlist=${state}#waitlist`,
        },
    });
}

async function verifyTurnstile(
    request: Request,
    token: string | null,
): Promise<boolean> {
    if (import.meta.env.DEV && !env.TURNSTILE_SECRET) {
        return true;
    }

    if (!env.TURNSTILE_SECRET || !token) {
        return false;
    }

    const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: env.TURNSTILE_SECRET,
                response: token,
                remoteip: request.headers.get('cf-connecting-ip') ?? '',
            }),
        },
    );

    if (!response.ok) {
        return false;
    }

    const payload = (await response.json()) as { success?: boolean };
    return payload.success === true;
}

export const POST: APIRoute = async ({ request }) => {
    if (!env.DB) {
        return redirectTo('unavailable');
    }

    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    const source =
        String(formData.get('source') ?? 'landing').trim() || 'landing';
    const issuedAt = String(formData.get('issued_at') ?? '');
    const formToken = String(formData.get('form_token') ?? '');
    const company = String(formData.get('company') ?? '').trim();
    const turnstileToken =
        String(formData.get('cf-turnstile-response') ?? '').trim() || null;

    if (company) {
        return redirectTo('blocked');
    }

    const tokenOk = await verifyFormToken(issuedAt, 'waitlist', formToken);
    if (!tokenOk) {
        return redirectTo('blocked');
    }

    const formAgeStatus = getFormAgeStatus(issuedAt);
    if (formAgeStatus !== 'ok') {
        return redirectTo(formAgeStatus === 'too_fast' ? 'blocked' : 'invalid');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
        return redirectTo('invalid');
    }

    const turnstileOk = await verifyTurnstile(request, turnstileToken);
    if (!turnstileOk) {
        return redirectTo('blocked');
    }

    const ipAddress = request.headers.get('cf-connecting-ip');
    const ipLimit = await applyRateLimit(
        `waitlist:ip:${ipAddress ?? 'unknown'}`,
        3,
        60 * 60,
    );
    if (!ipLimit.allowed) {
        return redirectTo('rate_limited');
    }

    const emailLimit = await applyRateLimit(
        `waitlist:email:${getEmailKey(normalizedEmail)}`,
        3,
        60 * 60 * 24,
    );
    if (!emailLimit.allowed) {
        return redirectTo('rate_limited');
    }

    try {
        await insertWaitlistEntry({
            email: normalizedEmail,
            name: name || null,
            note: note || null,
            source,
            ipAddress,
            userAgent: request.headers.get('user-agent'),
        });
    } catch (error) {
        console.error('waitlist insert failed', error);
        return redirectTo('unavailable');
    }

    return redirectTo('success');
};
