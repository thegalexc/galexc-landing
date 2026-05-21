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
- encrypted secrets in `secrets/github.env` and `secrets/github-preview.env`
- Forgejo secret `SOPS_AGE_KEY` for CI decryption

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
just secrets-edit secrets/github.env
```

To verify local decryption works:

```bash
just secrets-check secrets/github.env
```

CI decrypts these files with the Forgejo secret `SOPS_AGE_KEY`.

## Database

Initial schema lives at `migrations/0001_create_waitlist.sql`.

Apply migrations with:

```bash
pnpm db:migrate:local
pnpm exec wrangler d1 migrations apply DB --remote
```

## Deploy

Push to Forgejo. The deploy workflow builds Astro and deploys the generated worker with custom domains for `galexc.net` and `www.galexc.net`.
