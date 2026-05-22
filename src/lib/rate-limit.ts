import { env } from 'cloudflare:workers';

interface RateLimitResult {
    allowed: boolean;
    count: number;
    limit: number;
}

export async function applyRateLimit(
    key: string,
    limit: number,
    ttlSeconds: number,
): Promise<RateLimitResult> {
    const namespace = env.RATE_LIMIT;
    if (!namespace) {
        return { allowed: true, count: 0, limit };
    }

    const currentRaw = await namespace.get(key);
    const nextCount =
        (currentRaw ? Number.parseInt(currentRaw, 10) || 0 : 0) + 1;

    await namespace.put(key, String(nextCount), { expirationTtl: ttlSeconds });

    return {
        allowed: nextCount <= limit,
        count: nextCount,
        limit,
    };
}
