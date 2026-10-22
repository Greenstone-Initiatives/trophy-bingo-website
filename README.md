# Trophy Bingo landing page

The landing page for **Trophy Bingo** — the free dog-rescue action-bingo game.
Its job is to get visitors playing: it shows off the game and hands everyone off
to iWin, where Trophy Bingo actually lives.

Home: **greenstone.games/trophybingo/**. The site root redirects there.

- **Play the game:** <https://iwin.com/free-games/play/trophy-bingo>
- **Game page on iWin:** <https://iwin.com/games/trophy-bingo>

## What this is

A **single static page** — plain HTML, CSS, and a few lines of vanilla JS. No
framework, no build step, no package manager. You can edit it directly on
GitHub and the change is live in seconds.

```
trophybingo/
  index.html      The whole page (served at /trophybingo/)
styles.css        All styling (candy/playful brand)
_headers          Caching + security headers
_redirects        Root → /trophybingo/
assets/
  logo.png        Trophy Bingo wordmark
  favicon.png     App-icon (Goldie + B7 ball) — favicon & social image
  tile.png        Same app-icon (used for og:image)
  hero.mp4        Looping gameplay video behind the hero
  hero.png        Game-board still (video poster + play-button backdrop)
  bg-candy.jpg    Original candy border texture (spare)
  screenshots/    In-game screenshots (Spin Wheel, board, etc.)
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
  `/` redirects to `/trophybingo/`.
- **Staging:** the `staging` branch builds as a Cloudflare Preview. Its stable
  Preview URL is in the Worker's **Previews** section and on the pull request.

### Publish an update

1. Commit the change to `staging` and push. The Preview rebuilds in a minute.
2. Review it on the Preview URL.
3. Approve by merging the `staging` → `main` pull request. The merge deploys
   to production automatically (`bunx wrangler deploy`).

A manual deploy, if ever needed, is `bunx wrangler deploy` from the repo root.
Config lives in `wrangler.jsonc`; `.assetsignore` keeps repo files (docs,
config, `.git`) from being served. There is no build step.

## Assets & credit

Brand art and gameplay assets are Trophy Bingo's, reused from the game and its
iWin page. The game is published on iWin by Greenstone Games.
