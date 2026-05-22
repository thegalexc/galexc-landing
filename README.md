# galexc-landing

Astro landing surface for `galexc.net`.

## Stack

- Astro server output
- Cloudflare Workers with custom domains
- D1 for users, waitlist storage, and admin audit events
- KV for rate limiting
- password-based hidden admin login at `/login`
- Turnstile for public waitlist submissions

## Routes

- `/` landing page
- `POST /api/waitlist` public waitlist intake
- `/login` hidden admin login
- `POST /api/session/login` admin session login
- `POST /api/session/logout` admin session logout
- `/admin` private admin dashboard

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
- encrypted secrets in `secrets/github.env` and `secrets/github-preview.env`
- Forgejo secret `SOPS_AGE_KEY` for CI decryption

Runtime env expected by the app:

- `GALEXC_BOOTSTRAP_ADMIN_EMAILS`
- `GALEXC_ADMIN_PASSWORD`
- `GALEXC_COOKIE_SECRET`
- `IP_HMAC_SECRET`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET`

## SOPS

This repo follows the same repo-local key pattern as `galexc-net`.

Local workstation setup:

- place `.sops-age-key.txt` in the repo root
- keep it untracked

Encrypted dotenv files:

- `secrets/github.env`
- `secrets/github-preview.env`

To edit one locally:

```bash
just env-edit secrets/github.env
```

To verify local decryption works:

```bash
just env-check secrets/github.env
```

CI decrypts these files with the Forgejo secret `SOPS_AGE_KEY` and uploads worker runtime secrets from the decrypted values during deploy.

## Database

Initial schema lives at `migrations/0001_create_waitlist.sql`.
Auth and user expansion live at `migrations/0002_add_users_and_auth.sql`.

Apply migrations with:

```bash
pnpm db:migrate:local
pnpm exec wrangler d1 migrations apply DB --remote
```

## Deploy

Push to Forgejo. The deploy workflow builds Astro and deploys the generated worker with custom domains for `galexc.net` and `www.galexc.net`.
