# ziqodevs — site v2

The single `index.html` grew up: this is now a **React 19 + TypeScript** single-page app,
bundled by **Vite** and deployed to **Cloudflare Workers** as static assets with a tiny
edge Worker owning the API. One entry page in, one polished product out.

```
browser ── /            ──► ASSETS binding (hashed, immutable, edge-cached)
        ── /api/org      ──► Worker → GitHub API (edge-cached 5 min, shared per colo)
        ── /api/edge     ──► Worker → request.cf (which datacenter answered you)
```

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  (hot reload)
npm run build      # icons → typecheck → vite build → dist/
npm run preview    # serve the production build locally
npm run deploy     # build + `wrangler deploy` (needs `npx wrangler login` once)
```

`npm run cf:dev` boots the *real* Cloudflare runtime locally (`wrangler dev` on :8787),
serving `dist/` **and** the Worker API — the closest thing to production without deploying.

## What's in the box

| Trick | Where | Notes |
| --- | --- | --- |
| Pointer-reactive dot lattice | `components/Backdrop.tsx` | one canvas, DPR-clamped, paused when hidden, reduced-motion aware |
| ⌘K command palette | `components/CommandPalette.tsx` | fuzzy search over sections, actions, repos, people; full keyboard flow |
| A real shell | `components/Terminal.tsx` | `help`, `ls`, `neofetch`, `matrix`, `theme`, `accent`, `open …`, history, ⇥-completion |
| Scroll-ink statement | `hooks/useScroll.ts` → `useFillProgress` | the About sentence paints itself as you read (background-clip + `--fill`) |
| Morphing nav pill | `components/Header.tsx` | measured indicator slides between sections via IntersectionObserver |
| Scramble-decode tagline | `hooks/useFx.ts` → `useScramble` | monospaced so the line never reflows |
| Magnetic buttons / 3D tilt / spotlight borders | `hooks/useFx.ts` | pointer physics, `--mx/--my` driven CSS |
| Difference-blend cursor | `components/Cursor.tsx` | dot + lerped ring, inflates over interactive elements, off for touch |
| Live GitHub data | `lib/api.ts` + Worker `/api/org` | cache-first: localStorage → edge → direct browser fallback (dev/offline) |
| Edge readout | Worker `/api/edge` | colo, country, TLS, cf-ray of the datacenter serving *you* |
| Theme × accent matrix | `useTheme.ts` + CSS custom props | dark/light × 5 signal colours, persisted, no FOUC (inline boot script) |
| Count-up stats, marquee, grain, conic-border CTA | components | all respect `prefers-reduced-motion` |
| Generated brand assets | `scripts/build-icons.mjs` | one SVG source → favicon.svg, PWA icons, maskable, apple-touch, 1200×630 OG |

No CSS framework, no animation library, no icon package — the CSS is one sectioned
stylesheet (`src/styles/app.css`) and every effect is ~30 lines of hand-rolled hooks.
Three self-hosted variable fonts (Space Grotesk, Inter, JetBrains Mono) via fontsource;
zero third-party requests at runtime except the optional GitHub API fallback.

## Project map

```
index.html              entry + SEO/OG/JSON-LD + no-FOUC theme boot
worker/index.ts         edge API (/api/org, /api/edge) + ASSETS fallback
wrangler.jsonc          Worker config: assets, run_worker_first, observability
public/                 generated icons, manifest, _headers, robots, sitemap
scripts/build-icons.mjs SVG → PNG rasterizer (resvg + woff2→ttf decompression)
src/
  main.tsx / App.tsx    bootstrap + composition
  components/           one file per surface (header, hero, terminal, palette…)
  hooks/                useFx, useScroll, useReveal, useTheme, useOrg
  lib/                  api, bus (typed events), utils, types
  data/site.ts          all copy + people + pillars in one editable place
  styles/app.css        the whole design system
```

Content lives in `src/data/site.ts` — edit copy/people/pillars there, not in JSX.

## Icons

`npm run icons` (runs automatically inside `npm run build`) redraws every brand asset
from the SVG source in `scripts/build-icons.mjs`. resvg only speaks TTF/OTF, so the
script decompresses the fontsource `woff2` files with `wawoff2` into
`node_modules/.cache/ziqo-icons/` first. Deterministic, offline, no system fonts needed.

## Deploying to Cloudflare

**Workers (recommended, what `wrangler.jsonc` describes):**

```bash
npx wrangler login     # once
npm run deploy
```

**Dashboard / Git integration:** build command `npm run build`, output directory `dist`.
The same `wrangler.jsonc` is picked up automatically, so `/api/*` keeps working.

**Optional:** raise the GitHub rate limit from 60/h to 5000/h with
`npx wrangler secret put GITHUB_TOKEN` — the Worker adds it automatically when present.

Headers (`public/_headers`) mark hashed assets `immutable` for a year and apply
nosniff / frame / referrer / permissions-policy defaults everywhere else.
Deep links are handled by `assets.not_found_handling = "single-page-application"`.

## Testing

```bash
npm run typecheck   # three tsconfigs: app (src), worker, node (vite config)
npm run smoke       # boots the BUILT bundle in jsdom and asserts every surface rendered
npm test            # build:fast + smoke
```

The smoke test (`scripts/smoke.mjs`) shims canvas/IntersectionObserver/matchMedia, seeds
the localStorage cache fixture and fails on any uncaught runtime error — a cheap CI stand-in
for a real browser.
