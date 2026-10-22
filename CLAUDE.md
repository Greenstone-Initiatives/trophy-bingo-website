# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **Trophy Bingo** landing page — a single static page (`index.html` +
`styles.css`, no framework, no build step) whose job is to funnel visitors into
the game hosted on iWin. It **hands off** to iWin — every Play button opens
`https://iwin.com/free-games/play/trophy-bingo` in a new tab. The game is **not**
embedded (an in-page iframe was janky across browsers; see README).

Hosted on **Cloudflare** (static assets, no Worker code of our own), configured
by `wrangler.jsonc`. Live at **greenstone.games** (and www.greenstone.games) and
<https://trophy-bingo.gsii.workers.dev>. See `README.md`.

## Deploying

- **Every push to `main` deploys automatically** through Cloudflare Workers
  Builds (deploy command `bunx wrangler deploy`). There is nothing to run by hand.
- Page, design and copy changes James asks for go straight to `main`. Check the
  page locally first, push, then confirm the build succeeded and the live site
  shows the change.
- If a manual deploy is ever needed: `bunx wrangler deploy` from the repo root.
  Never `npx`.
- Joe also edits this repo directly on GitHub. Pull before you change anything.

## Rules of the road

- **No build tooling.** Keep it plain HTML/CSS/vanilla-JS so Joe and James can
  edit directly on GitHub. Do not add a bundler, framework, or `package.json`.
  (`wrangler.jsonc` is deploy config, not a build step.)
- **Paths are relative and flat.** Assets live in `assets/`. Don't introduce a
  `pages/` structure.
- **The hand-off is the point.** Every Play link (`a.js-play`) opens the iWin
  game in a new tab; don't re-add an embed. Those clicks fire the Meta Pixel
  `Lead`/`PlayClicked` events and carry incoming `utm_*` params through to iWin.
- **Asset paths are root-absolute** (`/assets/…`, `/styles.css`) so the page
  works served at the root or under `/trophybingo`.
- **Don't hot-link iWin's CDN** for the video/screenshots — they're copied into
  `assets/` on purpose so the page doesn't break if iWin moves things.
- **Never touch the game repos** (`trophy-bingo`, `trophy-bingo-jh`). This
  landing-page repo is the only Trophy Bingo repo Claude may change.

## Preview

```bash
python -m http.server 8000   # http://localhost:8000  (game needs http, not file://)
```
