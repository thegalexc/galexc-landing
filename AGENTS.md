# galexc-landing agent notes

## Project overview

Astro landing surface for `galexc.net`, deployed to a single Cloudflare Worker with production routes and preview versions for feature branches.

## Working posture

- Keep the landing minimal and editorial.
- Prefer small, local edits over broad rewrites.
- Validate behavior with `pnpm check`.
- Format touched files explicitly after edits, especially `.astro` files.

## Formatting rules

This repo has an important formatting wrinkle:

- Zed is configured with format-on-save in `.zed/settings.json`.
- Astro files are formatted through the Astro language server.
- The effective style comes from `.prettierrc.json` and `prettier-plugin-astro`.

That means direct agent edits can look fine, pass `pnpm check`, and still be rewritten on the next human save if they were not formatted first.

### Required agent behavior after Astro edits

After editing any `.astro` file, run file-scoped Prettier on the touched files:

```bash
pnpm prettier src/path/to/file.astro --write
```

For multiple touched files:

```bash
pnpm prettier src/file-a.astro src/file-b.astro --write
```

Do not assume `pnpm check` covers formatting. It does not.

## Why not rely on repo-wide format checks

`pnpm format:check` is useful for spot checks, but this repo may contain files that make repo-wide Prettier runs noisy or fail unexpectedly. Prefer file-scoped formatting for the files you changed.

## Validation

Typical local validation flow for agent edits:

```bash
pnpm prettier <touched-files> --write
pnpm check
```

## Deploy model

- `main` deploys production for `galexc.net` and `www.galexc.net`
- `feat/*` and `agent/*` create preview versions on the same Worker
- previews run with `PREVIEW_MODE=true`
