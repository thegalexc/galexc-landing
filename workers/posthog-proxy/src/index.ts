const POSTHOG_HOST = 'us.i.posthog.com';
const ASSET_HOST = 'us-assets.i.posthog.com';

export default {
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(request),
            });
        }

        if (url.pathname.startsWith('/static/')) {
            const target = new URL(url.pathname, `https://${ASSET_HOST}`);
            const resp = await fetch(
                new Request(target.toString(), {
                    method: request.method,
                    headers: cleanHeaders(request.headers),
                }),
            );
            const headers = new Headers(resp.headers);
            for (const [k, v] of Object.entries(corsHeaders(request))) {
                headers.set(k, v);
            }
            return new Response(resp.body, {
                status: resp.status,
                headers,
            });
        }

        const target = new URL(url.pathname + url.search, `https://${POSTHOG_HOST}`);
        const resp = await fetch(
            new Request(target.toString(), {
                method: request.method,
                body: request.body,
                headers: cleanHeaders(request.headers),
            }),
        );

        const headers = new Headers(resp.headers);
        for (const [k, v] of Object.entries(corsHeaders(request))) {
            headers.set(k, v);
        }
        return new Response(resp.body, {
            status: resp.status,
            headers,
        });
    },
};

function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('origin') || '*';
    return {
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization',
    };
}

function cleanHeaders(incoming: Headers): Headers {
    const h = new Headers(incoming);
    h.delete('host');
    const clientIp = incoming.get('cf-connecting-ip');
    if (clientIp) h.set('x-forwarded-for', clientIp);
    h.delete('cf-connecting-ip');
    return h;
}
