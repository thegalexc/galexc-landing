# galexc-landing

Astro landing surface for `galexc.net`.

## Stack

- Astro server output
- Cloudflare Workers with custom domains and preview URLs
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

`pnpm dev` bootstraps local D1 migrations before starting Astro, so admin routes work against the local schema. Local dev also bypasses rate limiting and Turnstile checks.

Set local environment values in `.env` or your shell as needed.

## Formatting

Astro edits should be explicitly formatted after changes.

- `pnpm check` validates types and Astro diagnostics, but does not format files.
- Zed is configured to format on save for Astro files, so unformatted agent edits may be rewritten heavily on the next manual save.
- The repo style is defined by `.prettierrc.json` with `prettier-plugin-astro`.

Preferred agent workflow for touched Astro files:

```bash
pnpm prettier src/path/to/file.astro --write
pnpm check
```

Prefer file-scoped Prettier runs over repo-wide formatting when making targeted edits.

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

Push to Forgejo.

- `main` deploys the single production Worker `galexc-landing` with custom domains for `galexc.net` and `www.galexc.net`.
- `feat/*` and `agent/*` branches upload preview versions onto that same Worker instead of creating separate preview Workers.
- Preview versions get preview URLs on `workers.dev`, including a stable branch alias when available.
- Preview deployments run with `PREVIEW_MODE=true`, disable public submissions and admin/auth routes, and are safe for design and content review without touching production flows.
