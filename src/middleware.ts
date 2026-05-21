import { defineMiddleware } from 'astro:middleware';
import { getAdminUser } from './lib/admin';

function isProtectedPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.adminUser = getAdminUser(context);

  if (isProtectedPath(context.url.pathname) && !context.locals.adminUser) {
    return new Response('Forbidden', {
      status: 403,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
      },
    });
  }

  const response = await next();

  if (context.url.pathname.startsWith('/admin') || context.url.pathname.startsWith('/api/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store');
  }

  return response;
});
