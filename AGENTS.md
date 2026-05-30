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
- Avoid `@theme` token inflation for one-off editorial spacing or sizing values. Inline arbitrary values like `text-[0.68rem]` are preferred over inventing a `--spacing-*` or `--text-*` token that the rest of the site never reuses.

### Use default-scale Tailwind utilities, not arbitrary numeric values

When a Tailwind v4 default-scale class is within a small tolerance of the value you want, use the class. Reach for `[Xrem]`, `[Xpx]`, `[Xem]`, `[Xdeg]` only when there is no close-enough preset.

Snap rules (use these tolerances when normalizing):

- Spacing utilities (`gap`, `m*`, `p*`, `w`, `h`, `min-w/max-w`, `inset`, `top/right/bottom/left`, `space-*`, `translate-*`, `scroll-*`): snap to the nearest default unit if within `0.1rem`. The v4 scale is `0, px, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, ...` So `gap-[2.4rem] -> gap-10`, `pt-[1.6rem] -> pt-6`, `gap-[0.9rem] -> gap-3.5`, `mt-[1.05rem] -> mt-4`, `right-[0.35rem] -> right-1.5`, `top-[-0.5rem] -> -top-2`, `translate-y-[-1px] -> -translate-y-px`, `w-[80%] -> w-4/5`.
- Type sizes (`text-[Xrem]`): snap if within `0.05rem`. Default scale is `xs=0.75, sm=0.875, base=1, lg=1.125, xl=1.25, 2xl=1.5, 3xl=1.875, 4xl=2.25, 5xl=3, 6xl=3.75, 7xl=4.5, 8xl=6, 9xl=8`. So `text-[1.04rem] -> text-base`, `text-[1.55rem] -> text-2xl`, `text-[1.08rem] -> text-lg`. Smaller deliberate editorial sizes like mono eyebrow `text-[0.68rem]` stay arbitrary because they are intentionally below `text-xs`.
- Numeric `leading-[X]` (unitless): snap if within `0.025`. Snap targets are `none=1, tight=1.25, snug=1.375, normal=1.5, relaxed=1.625, loose=2`. So `leading-[1.02] -> leading-none`, `leading-[1.6] -> leading-relaxed`. Tight display values like `leading-[0.95]` and generous body values like `leading-[1.8]` stay arbitrary on purpose because they sit outside the snap tolerance.
- Radius (`rounded-[Xrem]`): use the preset when exact: `rounded-[1rem] -> rounded-2xl`, `rounded-[1.5rem] -> rounded-3xl`, `rounded-[2rem] -> rounded-4xl`. Off-grid radii like `rounded-[1.75rem]` (equidistant from `3xl` and `4xl`) and multi-corner shorthands stay arbitrary.
- Rotation: prefer the bare integer form. Tailwind v4 accepts any whole-degree number directly: `rotate-[135deg] -> rotate-135`, `rotate-[-45deg] -> -rotate-45`.
- Padding shorthand `p-[X_Y]`: split into the matching `py-N px-M` pair when both axes have close presets, e.g. `p-[0.9rem_0.95rem] -> py-3.5 px-4`, `p-[1.15rem_1.2rem] -> p-5`.

It is fine, and often correct, to keep arbitrary values for:

- Custom editorial colours (`text-[#2b241d]`, `border-[rgba(120,113,108,0.14)]`).
- `clamp()` type sizes, `minmax()`/`fr` grid templates, `min(...)`/`max(...)` widths, `ch`/`%`/`vw`/`vh` units.
- Custom shadows, multi-property `transition-[...]`, multi-stop `duration-[Xms,Yms]`, `ease-[cubic-bezier(...)]`.
- Custom font stacks like `font-['Cormorant_Garamond',serif]`.
- Wide editorial `tracking-[0.12em|0.14em|0.18em]` (intentionally wider than `tracking-widest = 0.1em`).
- Off-grid editorial typography that loses meaning when snapped: tight display `leading-[0.95]/[0.96]/[1.05]`, body `leading-[1.8]`, mono eyebrow `text-[0.68rem]`, in-between body `text-[0.93rem]`, bespoke widths like `max-w-[14ch]`, `max-w-[18ch]`, `max-w-[46rem]`, `max-w-[900px]`.

Quick audit before opening a PR: `rg -o --no-filename '\b[a-z-]+-\[[^\]]*[0-9][^\]]*\]' -g '!src/styles/**' src | sort | uniq -c | sort -rn` should show only values that fall into the "fine to keep arbitrary" buckets above.

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
