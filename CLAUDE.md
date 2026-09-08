# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **trophybingo.com** landing page — a single static page (`index.html` +
`styles.css`, no framework, no build step) whose job is to funnel visitors into
the **Trophy Bingo** game hosted on iWin. The page embeds the real game in an
`<iframe>` pointing at `https://iwin.com/free-games/play/trophy-bingo`.

Deployed via **Cloudflare Pages** connected to
`Greenstone-Initiatives/trophy-bingo-website`; pushes to `main` auto-deploy.
See `README.md` for the full picture.

## Rules of the road

- **No build tooling.** Keep it plain HTML/CSS/vanilla-JS so Joe and James can
  edit directly on GitHub. Do not add a bundler, framework, or `package.json`.
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
