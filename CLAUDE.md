# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **Trophy Bingo** landing page — a single static page
(`index.html` + `styles.css`, no framework, no build step) whose job is to funnel visitors into
the game hosted on iWin. It **hands off** to iWin — every Play button opens
`https://iwin.com/free-games/play/trophy-bingo` in a new tab. The game is **not**
embedded (an in-page iframe was janky across browsers; see README).

Hosted on **Cloudflare**: static assets plus one small Worker (`worker.js`)
that handles the members sign-up at `/api/join` and the hostname redirects,
configured by `wrangler.jsonc`. Live at **trophybingo.com** and
<https://trophy-bingo.gsii.workers.dev/>. www.trophybingo.com and any old
`/trophybingo/…` path 301 to trophybingo.com (apex is canonical;
`/trophybingo/x` maps to `/x`). greenstone.games is a separate Worker
(`greenstone-games-website` repo); it carries the Terms of Service and Privacy
Policy that this site's footer links to. If this site starts collecting
anything new, update that repo's `privacy/index.html` to match.
See `README.md`.

## Deploying: staging first, then approve

- **`main` is production.** Every push to `main` deploys automatically through
  Cloudflare Workers Builds (deploy command `bunx wrangler deploy`).
- **Changes go to the `staging` branch first.** Every push to `staging` deploys
  the `trophy-bingo-staging` Worker (`bunx wrangler deploy --env staging`) at
  <https://trophy-bingo-staging.gsii.workers.dev/>. It has no custom
  domains, so it can never touch trophybingo.com. `worker.js` runs for every
  request in both environments. On staging it skips the redirects and adds
  `X-Robots-Tag: noindex` plus a disallow-all robots.txt.
- Keep a pull request `staging` → `main` open. **James reviews the staging URL
  and approves in chat; Claude then merges the PR**, which deploys to
  trophybingo.com. Never push design or copy changes straight to `main`.
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
- **The page lives at `index.html`** (Help at `help/index.html`). Assets live in `assets/` at
  the root. Don't introduce a `pages/` structure.
- **The hand-off is the point.** Every Play link (`a.js-play`) opens the iWin
  game in a new tab; don't re-add an embed. Those clicks fire the Meta Pixel
  `Lead`/`PlayClicked` events and carry incoming `utm_*` params through to iWin.
- **Paths are root-absolute** (`/assets/…`, `/styles.css`, `/help/`).
  Canonical, og:url, og:image, robots.txt and sitemap.xml all use
  `https://trophybingo.com/`.
- **Don't hot-link iWin's CDN** for the video/screenshots — they're copied into
  `assets/` on purpose so the page doesn't break if iWin moves things.
- **Never touch the game repos** (`trophy-bingo`, `trophy-bingo-jh`). This
  landing-page repo is the only Trophy Bingo repo Claude may change.

## The pack and the members club

- Dog names, breeds, worlds, Power Plays / Helper Skills, bios and breed facts
  live in `dogs.js` (from the game's collections design matrix).
  Faces are `assets/pack/<img>.png` (head sprites with the game's eye sprites fitted); story art is `assets/story/`.
- Sign-ups POST to `/api/join` and land in Workers KV as `member:<email>`
  with the consent wording, timestamp and UTM source. Production store:
  `trophy-bingo-members`; staging store: `trophy-bingo-members-staging`.
- The consent wording appears in both `index.html` and
  `worker.js`; change them together.

## Help & FAQ

- `help/index.html` is the Help & FAQ page, plain HTML. Each answer is
  a `<details>` with a stable id, so links like `/help/#blockers`
  open the right answer (`#save-progress`, `#blockers` and so on). The Q&A
  comes from Joe's checked help fragment; the site's term is "Power Play" (two words).
- The villain is **Earnest Getmyway** (the game's own spelling). Wrap
  "Trophy Bingo" in visible copy in `<span class="nb">` so it never splits
  across two lines.

## Privacy Policy

- `privacy/index.html`, adapted from the Greenstone privacy-notice template
  (Core notice + Schedule A regional terms). Controller: Greenstone Business
  Services Inc. dba Greenstone Games; processor: Appreciation Engine Inc.;
  contact privacy@trophybingo.com. Update "Who we share it with" when a
  service provider is added, and change the date at the top.
- The Meta Pixel loader skips loading when the browser sends Global Privacy
  Control; the policy promises this, so keep it.

## Preview

```bash
bunx wrangler dev --env staging   # http://localhost:8787/ (sign-up works locally)
```
