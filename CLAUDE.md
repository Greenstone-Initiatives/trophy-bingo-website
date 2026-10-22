# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **Trophy Bingo** landing page — a single static page
(`trophybingo/index.html` + `styles.css`, no framework, no build step) whose job is to funnel visitors into
the game hosted on iWin. It **hands off** to iWin — every Play button opens
`https://iwin.com/free-games/play/trophy-bingo` in a new tab. The game is **not**
embedded (an in-page iframe was janky across browsers; see README).

Hosted on **Cloudflare** (static assets, no Worker code of our own), configured
by `wrangler.jsonc`. Live at **greenstone.games/trophybingo/** (the root
302-redirects there) and <https://trophy-bingo.gsii.workers.dev/trophybingo/>.
See `README.md`.

## Deploying: staging first, then approve

- **`main` is production.** Every push to `main` deploys automatically through
  Cloudflare Workers Builds (deploy command `bunx wrangler deploy`).
- **Changes go to the `staging` branch first.** Workers Builds builds it as a
  Preview; the stable Preview URL is listed under the Worker's Previews section
  in Cloudflare and posted on the pull request.
- Open (or update) a pull request `staging` → `main`. **James approves by
  merging it**; the merge deploys to greenstone.games. Never push design or copy
  changes straight to `main`.
- Check the page locally first, push to `staging`, confirm the Preview build
  succeeded and shows the change, then hand James the Preview URL and the PR.
- If a manual deploy is ever needed: `bunx wrangler deploy` from the repo root.
  Never `npx`.
- Joe also edits this repo directly on GitHub. Pull before you change anything.

## Rules of the road

- **No build tooling.** Keep it plain HTML/CSS/vanilla-JS so Joe and James can
  edit directly on GitHub. Do not add a bundler, framework, or `package.json`.
  (`wrangler.jsonc` is deploy config, not a build step.)
- **The page lives at `trophybingo/index.html`.** Assets live in `assets/` at
  the root. Don't introduce a `pages/` structure.
- **The hand-off is the point.** Every Play link (`a.js-play`) opens the iWin
  game in a new tab; don't re-add an embed. Those clicks fire the Meta Pixel
  `Lead`/`PlayClicked` events and carry incoming `utm_*` params through to iWin.
- **Asset paths are root-absolute** (`/assets/…`, `/styles.css`) so the page
  works at /trophybingo/ here and at the root of trophybingo.com later.
- **Don't hot-link iWin's CDN** for the video/screenshots — they're copied into
  `assets/` on purpose so the page doesn't break if iWin moves things.
- **Never touch the game repos** (`trophy-bingo`, `trophy-bingo-jh`). This
  landing-page repo is the only Trophy Bingo repo Claude may change.

## Preview

```bash
python -m http.server 8000   # http://localhost:8000/trophybingo/
```
