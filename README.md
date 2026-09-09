# Trophy Bingo landing page

The landing page for **Trophy Bingo** — the free dog-rescue action-bingo game.
Its job is to get visitors playing: it shows off the game and hands everyone off
to iWin, where Trophy Bingo actually lives.

Intended home: **greenstone.games** (root) and **greenstone.games/trophybingo**.

- **Play the game:** <https://iwin.com/free-games/play/trophy-bingo>
- **Game page on iWin:** <https://iwin.com/games/trophy-bingo>

## What this is

A **single static page** — plain HTML, CSS, and a few lines of vanilla JS. No
framework, no build step, no package manager. You can edit it directly on
GitHub and the change is live in seconds.

```
index.html        The whole page
styles.css        All styling (candy/playful brand)
_headers          Cloudflare Pages caching + security headers
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

- **Copy / headlines** — edit the text in `index.html`.
- **Where Play points** — every Play link is a normal `<a href="https://iwin.com/…">`
  with `class="js-play"`; change the URL on those anchors.
- **Colours / spacing** — the palette is CSS variables at the top of
  `styles.css` (`:root { --pink … }`).
- **Meta Pixel** — paste your Pixel ID into `META_PIXEL_ID` near the top of
  `index.html` (tracking stays off until you do).
- **Screenshots** — drop new images in `assets/screenshots/` and update the
  `<img>` tags in the "Take a peek" section.

### Preview locally

No tooling needed — just serve the folder:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploying (Cloudflare)

The site is hosted on **Cloudflare** as static assets (no server code of our
own). It is **live now** at:

- **<https://trophy-bingo.gsii.workers.dev>** (the Cloudflare URL)
- **greenstone.games** — *once the domain is moved to Cloudflare (see below)*

`/trophybingo` is a friendly alias that redirects to the root (see `_redirects`).

### Publish an update

From this folder, on the `James Hursthouse (GSII)` Cloudflare account:

```bash
npx wrangler deploy
```

That uploads the current files and goes live in a few seconds. Config lives in
`wrangler.jsonc`; `.assetsignore` keeps non-site files (README, config) from
being served. There is no build step.

### Point greenstone.games at it

greenstone.games is registered at **GoDaddy** and must be **moved to Cloudflare**
before a Worker can serve it (Workers custom domains require the zone to live on
Cloudflare). One-time:

1. **Cloudflare dashboard → Add a domain →** `greenstone.games` (Free plan). It
   imports the existing DNS and gives you **two Cloudflare nameservers**.
2. **At GoDaddy → greenstone.games → Nameservers →** replace
   `ns21/ns22.domaincontrol.com` with the two Cloudflare nameservers. Propagation
   is usually minutes to a couple of hours.
3. Once Cloudflare shows the zone **Active**, add the custom domain to the Worker
   by putting this in `wrangler.jsonc` and running `npx wrangler deploy`:

   ```jsonc
   "routes": [
     { "pattern": "greenstone.games",     "custom_domain": true },
     { "pattern": "www.greenstone.games", "custom_domain": true }
   ]
   ```

   Cloudflare issues the certificate automatically. The root then serves this
   page, and `greenstone.games/trophybingo` redirects to it.

The `routes` block is left out of `wrangler.jsonc` until the zone is on
Cloudflare — adding it before then makes `wrangler deploy` fail.

### Optional: auto-deploy on push

If you'd rather deploy on every `git push` instead of running the command,
connect the repo in the dashboard (**Workers & Pages → the project → Settings →
Builds → Connect to Git**), framework preset **None**, build command empty,
output directory `/`. Direct `wrangler deploy` keeps working alongside it.

## Assets & credit

Brand art and gameplay assets are Trophy Bingo's, reused from the game and its
iWin page. The game is published on iWin by Greenstone Games.
