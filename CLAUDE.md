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
(`greenstone-games-website` repo) with its own terms. This site carries its own
`/terms/` and `/privacy/`; the footer links to both.
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
- Sign-ups also POST to `/api/join` and land in Workers KV as `member:<email>`
  with the consent wording, timestamp and UTM source. Production store:
  `trophy-bingo-members`; staging store: `trophy-bingo-members-staging`.
- The consent wording appears in both `index.html` and
  `worker.js`; change them together.

## FairShare sign-in

- Every page loads the AE Connect snippet for the Greenstone Games FairShare
  account (framework 624, application 166), just above `</body>`, with an
  `AEJSReady` hook that exposes `window.tbAEJS`. trophybingo.com and the staging
  host are on that account's allowlist; the snippet is refused on any host that isn't.
- It doesn't draw anything. Sign-in buttons (`data-ae-register-link="<service>"`)
  are added per page for the services Trophy Bingo uses; a button for a service
  that isn't switched on in the account leads to a missing page.
- Both Members Club forms (the club section and the Join the Pack bar) are FairShare
  register forms (`data-ae-register-form="email"`). On a valid submit the page also
  posts a copy to `/api/join` (Workers KV, with first name and consent wording,
  `keepalive`), then FairShare takes over and returns the visitor to `/?joined=1#club`,
  where the club form says thanks. If the FairShare script hasn't loaded, `/api/join`
  alone takes the sign-up. On staging the return URL points at the staging host.
- Under the club form, "or join with" (`.sso`) shows Facebook and Google
  sign-in buttons (`data-ae-register-link`), returning to `/?joined=1#club`; TikTok's
  `<li>` stays `hidden` until TikTok is switched on in the FairShare account. Social
  sign-ups go to FairShare only, not to `/api/join`; the fine print under the buttons
  carries the email-updates consent.
- TikTok's `<li>` also carries `data-preview="tiktok"`: it shows with `?tiktok=1` (remembered for
  the tab) for testing in TikTok's Sandbox. Once TikTok approves the app, drop `hidden` and `data-preview`.
- A visitor signed in to FairShare (`aeJS.loggedIn`, via the `tbOnAE` hook the home page's `AEJSReady`
  calls) sees "You're in the Pack" in place of the form and buttons, with a line linking to unsubscribe
  (Privacy Center or support@trophybingo.com), and never gets the Join the Pack bar. FairShare's
  `accessToken` and `ae_session` are stripped from the address bar once signed in.
- The footer links to the account's FairShare Privacy Center
  (https://get.myfairshare.io/privacycenter/customer/291/166/login).
- The Privacy Policy's "Website and advertising data" line covers FairShare's
  cookies; keep it in step if the sign-in changes.

## Help & FAQ

- `help/index.html` is the Help & FAQ page, plain HTML. Each answer is
  a `<details>` with a stable id, so links like `/help/#blockers`
  open the right answer (`#save-progress`, `#blockers` and so on). The Q&A
  comes from Joe's checked help fragment; the site's term is "Power Play" (two words).
- The villain is **Earnest Getmyway** (the game's own spelling). Wrap
  "Trophy Bingo" in visible copy in `<span class="nb">` so it never splits
  across two lines.

## Terms of Service

- `terms/index.html`: covers trophybingo.com, shop.trophybingo.com, the
  Members Club, the Shop and promotions. Play and in-game purchases fall under
  iWin's terms. Contact support@trophybingo.com.

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
