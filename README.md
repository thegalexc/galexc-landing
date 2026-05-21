# galexc-landing

Astro landing surface for `galexc.net`.

## Stack

- Astro server output
- Cloudflare Workers with custom domains
- D1 for waitlist storage
- KV for rate limiting
- Cloudflare Access for `/admin`
- Turnstile for public waitlist submissions

## Routes

- `/` landing page
- `POST /api/waitlist` public waitlist intake
- `/admin` private waitlist dashboard

## Local development

```bash
pnpm install
pnpm dev
pnpm check
```

Set local environment values in `.env` or your shell as needed.

## Required Cloudflare bindings and secrets

- D1 binding `DB`
- KV binding `RATE_LIMIT`
- `GALEXC_ADMIN_EMAILS`
- `IP_HMAC_SECRET`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET`

## Deploy

Push to Forgejo. The deploy workflow builds Astro and deploys the generated worker with custom domains for `galexc.net` and `www.galexc.net`.
