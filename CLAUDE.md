# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **trophybingo.com** landing page — a single static page (`index.html` +
`styles.css`, no framework, no build step) whose job is to funnel visitors into
the **Trophy Bingo** game hosted on iWin. The page embeds the real game in an
`<iframe>` pointing at `https://iwin.com/free-games/play/trophy-bingo`.

Hosted on **Cloudflare** (static assets, no Worker code of our own). Deploys
are a direct upload from this folder — `npx wrangler deploy` — configured by
`wrangler.jsonc`. Live at <https://trophy-bingo.gsii.workers.dev> (custom
domain `www.trophybingo.com` to be attached). See `README.md` for the full
picture.

## Rules of the road

- **No build tooling.** Keep it plain HTML/CSS/vanilla-JS so Joe and James can
  edit directly on GitHub. Do not add a bundler, framework, or `package.json`.
  (`wrangler.jsonc` is deploy config, not a build step.)
- **Paths are relative and flat.** Assets live in `assets/`. Don't introduce a
  `pages/` structure.
- **The game embed is the point.** The play button lazy-loads the iWin iframe
  (`GAME_URL` in `index.html`). Keep the visible **"Open on iWin ↗"** fallback —
  cross-site-cookie restrictions can break in-frame sign-in on some browsers,
  and that link is the escape hatch.
- **Don't hot-link iWin's CDN** for the video/screenshots — they're copied into
  `assets/` on purpose so the page doesn't break if iWin moves things.

## Preview

```bash
python -m http.server 8000   # http://localhost:8000  (game needs http, not file://)
```
