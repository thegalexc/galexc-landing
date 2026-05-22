import { env } from 'cloudflare:workers';

export function isPreviewMode(): boolean {
    return env.PREVIEW_MODE === 'true';
}
