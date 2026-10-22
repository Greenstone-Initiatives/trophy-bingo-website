# Trophy Bingo landing page

The landing page for **Trophy Bingo** — the free dog-rescue action-bingo game.
Its job is to get visitors playing: it shows off the game and hands everyone off
to iWin, where Trophy Bingo actually lives.

Home: **greenstone.games** and **greenstone.games/trophybingo/** (same page).

- **Play the game:** <https://iwin.com/free-games/play/trophy-bingo>
- **Game page on iWin:** <https://iwin.com/games/trophy-bingo>

## What this is

A **single static page** — plain HTML, CSS, and a few lines of vanilla JS. No
framework, no build step, no package manager. You can edit it directly on
GitHub and the change is live in seconds.

```
trophybingo/
  index.html      The whole page (served at /trophybingo/)
  dogs.js         The pack: names, powers, bios, breed facts
worker.js         Members sign-up (/api/join) + staging noindex
styles.css        All styling (candy/playful brand)
_headers          Caching + security headers
_redirects        /index.html → /
assets/
  logo.png        Trophy Bingo wordmark
  favicon.png     App-icon (Goldie + B7 ball) — favicon & social image
  tile.png        Same app-icon (used for og:image)
  hero-v2.mp4     Looping gameplay video behind the hero (end cap trimmed)
  hero.png        Game-board still (video poster + play-button backdrop)
  bg-candy.jpg    Original candy border texture (spare)
  screenshots/    In-game screenshots (Spin Wheel, board, etc.)
  pack/           A face for every dog in the pack
  story/          Ernest, Chester, Goldie and the story still
```

## How the game is delivered

Every **Play** button opens the full game on iWin
(`https://iwin.com/free-games/play/trophy-bingo`) in a new tab. The game is
**not** embedded — we tried an in-page `<iframe>` but it was janky across
browsers (third-party-cookie limits broke sign-in on Safari, iWin's own ads and
chrome crowded the frame, and it was cramped on mobile). Handing off to iWin
keeps coins, memberships and the Spin Wheel working perfectly, because the
player is first-party on iWin.

Any `utm_*` / `fbclid` params on the incoming ad link are forwarded onto the
iWin links, and each Play click fires the Meta Pixel `Lead` + `PlayClicked`
events, so paid traffic stays measurable.

## Editing

Common changes:

- **Copy / headlines** — edit the text in `trophybingo/index.html`.
- **Where Play points** — every Play link is a normal `<a href="https://iwin.com/…">`
  with `class="js-play"`; change the URL on those anchors.
- **Colours / spacing** — the palette is CSS variables at the top of
  `styles.css` (`:root { --pink … }`).
- **Meta Pixel** — paste your Pixel ID into `META_PIXEL_ID` near the top of
  `trophybingo/index.html` (tracking stays off until you do).
- **Screenshots** — drop new images in `assets/screenshots/` and update the
  `<img>` tags in the "Take a peek" section.

### Preview locally

No tooling needed — just serve the folder:

```bash
python -m http.server 8000
# then open http://localhost:8000/trophybingo/
```

## Deploying (Cloudflare)

The site is static assets on a Cloudflare Worker (`trophy-bingo`), connected
to this repo through Workers Builds:

- **Production:** <https://greenstone.games/trophybingo/> (also
  www.greenstone.games and <https://trophy-bingo.gsii.workers.dev>). The root
  `/` serves the same page, via `worker.js`.
- **Staging:** <https://trophy-bingo-staging.gsii.workers.dev/trophybingo/>,
  a separate Worker (`trophy-bingo-staging`) deployed from the `staging`
  branch with `bunx wrangler deploy --env staging`. No custom domains, and
  `worker.js` keeps it out of search engines (`X-Robots-Tag: noindex`,
  disallow-all robots.txt).

### Publish an update

1. Commit the change to `staging` and push. Staging redeploys in a minute.
2. Review it on the staging URL.
3. On approval, the `staging` → `main` pull request is merged. The merge
   deploys to production automatically (`bunx wrangler deploy`).

A manual deploy, if ever needed, is `bunx wrangler deploy` from the repo root.
Config lives in `wrangler.jsonc`; `.assetsignore` keeps repo files (docs,
config, `worker.js`, `.git`) from being served. There is no build step.

### Members sign-ups

The Members club form posts to `/api/join`. Each member is stored in Workers
KV (`trophy-bingo-members` in production, `trophy-bingo-members-staging` on
staging) as `member:<email>` with first name, the consent wording they agreed
to, the time, country and UTM source.

## Assets & credit

Brand art and gameplay assets are Trophy Bingo's, reused from the game and its
iWin page. The game is published on iWin by Greenstone Games.
