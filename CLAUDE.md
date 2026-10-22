# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **Trophy Bingo** landing page — a single static page
(`trophybingo/index.html` + `styles.css`, no framework, no build step) whose job is to funnel visitors into
the game hosted on iWin. It **hands off** to iWin — every Play button opens
`https://iwin.com/free-games/play/trophy-bingo` in a new tab. The game is **not**
embedded (an in-page iframe was janky across browsers; see README).

Hosted on **Cloudflare**: static assets plus one small Worker (`worker.js`)
that handles the members sign-up at `/api/join`, configured by `wrangler.jsonc`. Live at **greenstone.games** and **greenstone.games/trophybingo/** (the
root serves the same page via `worker.js`) and <https://trophy-bingo.gsii.workers.dev/trophybingo/>.
See `README.md`.

## Deploying: staging first, then approve

- **`main` is production.** Every push to `main` deploys automatically through
  Cloudflare Workers Builds (deploy command `bunx wrangler deploy`).
- **Changes go to the `staging` branch first.** Every push to `staging` deploys
  the `trophy-bingo-staging` Worker (`bunx wrangler deploy --env staging`) at
  <https://trophy-bingo-staging.gsii.workers.dev/trophybingo/>. It has no custom
  domains, so it can never touch greenstone.games. On staging `worker.js` runs
  for every request and adds `X-Robots-Tag: noindex` plus a disallow-all
  robots.txt. In production it runs only for `/api/*` and `/` (which serves
  the Trophy Bingo page); everything else stays static.
- Keep a pull request `staging` → `main` open. **James reviews the staging URL
  and approves in chat; Claude then merges the PR**, which deploys to
  greenstone.games. Never push design or copy changes straight to `main`.
- Check the page locally first, push to `staging`, confirm the staging build
  succeeded and shows the change, then hand James the staging URL and the PR.
- If a manual deploy is ever needed: `bunx wrangler deploy` from the repo root.
  Never `npx`.
- Joe also edits this repo directly on GitHub. Pull before you change anything.

## Rules of the road

- **No build tooling.** Keep it plain HTML/CSS/vanilla-JS so Joe and James can
  edit directly on GitHub. Do not add a bundler, framework, or `package.json`.
  (`wrangler.jsonc` is deploy config and `worker.js` is one plain module;
  neither is a build step.)
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

## The pack and the members club

- Dog names, breeds, worlds, Power Plays / Helper Skills, bios and breed facts
  live in `trophybingo/dogs.js` (from the game's collections design matrix).
  Faces are `assets/pack/<img>.png` (head sprites with the game's eye sprites fitted); story art is `assets/story/`.
- Sign-ups POST to `/api/join` and land in Workers KV as `member:<email>`
  with the consent wording, timestamp and UTM source. Production store:
  `trophy-bingo-members`; staging store: `trophy-bingo-members-staging`.
- The consent wording appears in both `trophybingo/index.html` and
  `worker.js`; change them together.

## Preview

```bash
bunx wrangler dev --env staging   # http://localhost:8787/trophybingo/ (sign-up works locally)
```
