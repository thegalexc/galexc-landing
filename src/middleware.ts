import { defineMiddleware } from 'astro:middleware';
import { getAuthenticatedUser } from './lib/request-auth';
import { isAdminUser } from './lib/admin';
import { isPreviewMode } from './lib/preview-mode';

function isProtectedPath(pathname: string): boolean {
    return pathname === '/admin' || pathname.startsWith('/admin/');
}

function shouldNoindex(pathname: string): boolean {
    return (
        pathname === '/login' ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api/')
    );
}

export const onRequest = defineMiddleware(async (context, next) => {
    const previewMode = isPreviewMode();

    if (
        previewMode &&
        (context.url.pathname === '/login' ||
            context.url.pathname.startsWith('/admin') ||
            context.url.pathname.startsWith('/api/session/'))
    ) {
        return new Response('Not found', {
            status: 404,
            headers: {
                'X-Robots-Tag': 'noindex, nofollow',
                'Cache-Control': 'no-store',
            },
        });
    }

    const authenticatedUser = await getAuthenticatedUser(context);
    context.locals.authenticatedUser = authenticatedUser;
    context.locals.adminUser = isAdminUser(authenticatedUser)
        ? authenticatedUser
        : null;

    if (isProtectedPath(context.url.pathname)) {
        if (!authenticatedUser) {
            return context.redirect('/login');
        }

        if (!context.locals.adminUser) {
            return new Response('Forbidden', {
                status: 403,
                headers: {
                    'X-Robots-Tag': 'noindex, nofollow',
                    'Cache-Control': 'no-store',
                },
            });
        }
    }

    const response = await next();

    if (shouldNoindex(context.url.pathname)) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        response.headers.set('Cache-Control', 'no-store');
    }

    return response;
});
