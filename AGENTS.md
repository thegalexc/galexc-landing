# galexc-landing agent notes

## Project overview

Astro landing surface for `galexc.net`, deployed to a single Cloudflare Worker with production routes and preview versions for feature branches.

## Working posture

- Keep the landing minimal and editorial.
- Prefer small, local edits over broad rewrites.
- Validate behavior with `pnpm check`.
- Format touched files explicitly after edits, especially `.astro` files.

## Styling policy

- Prefer inline Tailwind utilities first for page layout, spacing, responsive behavior, and one-off editorial composition.
- Treat `src/styles/global.css` as the secondary layer.
- Keep `global.css` for true globals and high-leverage exceptions only:
    - theme and base typography
    - shared site chrome
    - shared link and prose defaults
    - pseudo-elements
    - dialog, animation, and stateful patterns that are awkward inline
- Do not add new page-specific semantic styling to `global.css` when inline Tailwind or a small Astro component will do.
- If a utility cluster repeats across pages, extract a small Astro component before adding another shared semantic CSS block.
- Prefer repo theme tokens for recurring editorial spacing, color, and sizing decisions so inline utilities stay consistent over time.

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
