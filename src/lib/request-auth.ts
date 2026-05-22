import type { APIContext } from 'astro';
import { AUTH_COOKIE_NAME, readSignedSessionToken } from './auth';
import { getUserById } from './db';
import type { PortalUser } from '../types/portal';

export async function getAuthenticatedUser(
    context: Pick<APIContext, 'cookies'>,
): Promise<PortalUser | null> {
    const token = context.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = await readSignedSessionToken(token);
    if (!session) {
        return null;
    }

    const user = await getUserById(session.userId);
    if (!user || user.status === 'suspended') {
        return null;
    }

    return user;
}

export async function requireAdminUser(
    context: Pick<APIContext, 'cookies'>,
): Promise<PortalUser | Response> {
    const user = await getAuthenticatedUser(context);
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    if (!user.roles.includes('admin')) {
        return new Response('Forbidden', { status: 403 });
    }

    return user;
}
