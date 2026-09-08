# trophybingo.com

The landing page for **Trophy Bingo** — the free dog-rescue action-bingo game.
Its job is to get visitors playing: the page embeds the full game and points
everything at iWin, where Trophy Bingo actually lives.

- **Live game (embedded here):** <https://iwin.com/free-games/play/trophy-bingo>
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

The big **Play** button loads the real iWin game in an `<iframe>` right on the
page (`index.html` → `GAME_URL`). Because the frame points at `iwin.com`, the
player is first-party on iWin **inside the frame**, so coins, memberships, the
Spin Wheel and everything else work exactly as they do on iWin.

The game is **click-to-load** on purpose: it keeps the landing page fast and
avoids autoplaying iWin's pre-game ad before the visitor asks to play.

> **Heads-up on browsers:** a few browsers (notably Safari, and Chrome with
> third-party cookies disabled) restrict cookies inside cross-site frames,
> which can interfere with staying signed in _in the frame_. That's why every
> screen keeps a visible **"Open on iWin ↗"** link as a fallback — it opens the
> same game first-party on iWin where sign-in always works.

## Editing

Common changes:

- **Copy / headlines** — edit the text in `index.html`.
- **Where Play points** — change `GAME_URL` in the `<script>` at the bottom of
  `index.html` (and the two footer links).
- **Colours / spacing** — the palette is CSS variables at the top of
  `styles.css` (`:root { --pink … }`).
- **Screenshots** — drop new images in `assets/screenshots/` and update the
  `<img>` tags in the "Take a peek" section.

### Preview locally

No tooling needed — just serve the folder:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

(The embedded game only loads over `http`/`https`, not from a `file://` path.)

## Deploying (Cloudflare Pages)

The site is served by **Cloudflare Pages**, connected to this GitHub repo.
Every push to `main` deploys automatically.

First-time setup (once, in the Cloudflare dashboard):

1. **Workers & Pages → Create → Pages → Connect to Git** and pick this repo
   (`Greenstone-Initiatives/trophy-bingo-website`).
2. Build settings: **Framework preset: None**, **Build command: _(empty)_**,
   **Build output directory: `/`** (the site is already static at the root).
3. Deploy. Pages gives you a `*.pages.dev` URL to check.
4. **Custom domains → Set up a custom domain** → add `www.trophybingo.com`
   (and `trophybingo.com` with a redirect to `www`). Point the domain's DNS at
   Cloudflare and the certificate is issued automatically.

After that, editing is just: commit to `main` → live.

## Assets & credit

Brand art and gameplay assets are Trophy Bingo's, reused from the game and its
iWin page. The game is published on iWin by Greenstone Games.
