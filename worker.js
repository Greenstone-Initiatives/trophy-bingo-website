// Trophy Bingo site Worker. Plain JS, no build step.
//
// Production: runs for every request.
//   trophybingo.com            -> the site (static assets), plus /api/join.
//   www.trophybingo.com        -> 301 to trophybingo.com, same path and query.
//   Old /trophybingo/ paths on trophybingo.com itself also 301 to the new path.
// Staging: no redirects; every response gets noindex so search engines stay out.
//
// POST /api/join  -> adds a member to the MEMBERS KV namespace.

const CANONICAL_HOST = "trophybingo.com";
// www.trophybingo.com redirects everything; the others redirect only /trophybingo/ paths.
const WWW_HOST = "www.trophybingo.com";
const OLD_PATH_HOSTS = new Set([CANONICAL_HOST]);

const CONSENT_TEXT =
  "Yes, send me Trophy Bingo news, member rewards and offers from Greenstone Games by email. I can unsubscribe at any time.";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.STAGING) {
      const target = redirectTarget(url);
      if (target) return Response.redirect(target, 301);
    }

    if (url.pathname === "/api/join") return join(request, env);

    if (env.STAGING && url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", {
        headers: { "content-type": "text/plain", "x-robots-tag": "noindex, nofollow" },
      });
    }

    const res = await env.ASSETS.fetch(request);
    if (!env.STAGING) return res;
    const out = new Response(res.body, res);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  },
};

// Where a request should be sent instead, or null to serve it here.
function redirectTarget(url) {
  const host = url.hostname.toLowerCase();
  const oldPath = url.pathname === "/trophybingo" || url.pathname.startsWith("/trophybingo/");
  if (host !== WWW_HOST && !(OLD_PATH_HOSTS.has(host) && oldPath)) return null;

  let path = url.pathname;
  if (oldPath) path = "/" + path.slice("/trophybingo".length).replace(/^\/+/, "");
  return "https://" + CANONICAL_HOST + path + url.search;
}

function reply(body, status = 200, staging = false) {
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  if (staging) headers["x-robots-tag"] = "noindex, nofollow";
  return new Response(JSON.stringify(body), { status, headers });
}

async function join(request, env) {
  const staging = !!env.STAGING;
  if (request.method !== "POST") return reply({ ok: false, error: "method" }, 405, staging);
  if (!env.MEMBERS) return reply({ ok: false, error: "unavailable" }, 503, staging);

  let data = {};
  try {
    const type = request.headers.get("content-type") || "";
    if (type.includes("application/json")) data = await request.json();
    else data = Object.fromEntries((await request.formData()).entries());
  } catch (e) {
    return reply({ ok: false, error: "bad-request" }, 400, staging);
  }

  // Honeypot: real people never fill this in.
  if (data.website) return reply({ ok: true }, 200, staging);

  const email = String(data.email || "").trim().toLowerCase();
  const name = String(data.name || "").trim().slice(0, 100);
  const firstName = (String(data.firstName || "").trim() || name.split(/\s+/)[0] || "").slice(0, 60);
  const consent = data.consent === true || data.consent === "on" || data.consent === "true";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return reply({ ok: false, error: "email" }, 400, staging);
  }
  if (!consent) return reply({ ok: false, error: "consent" }, 400, staging);

  // Light rate limit per IP: 5 sign-ups a minute.
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rlKey = "rl:" + ip;
  const hits = parseInt((await env.MEMBERS.get(rlKey)) || "0", 10);
  if (hits >= 5) return reply({ ok: false, error: "slow-down" }, 429, staging);
  await env.MEMBERS.put(rlKey, String(hits + 1), { expirationTtl: 60 });

  const key = "member:" + email;
  if (await env.MEMBERS.get(key)) return reply({ ok: true, already: true }, 200, staging);

  const now = new Date().toISOString();
  const src = data.source && typeof data.source === "object" ? data.source : {};
  const record = {
    email,
    name,
    firstName,
    joinedAt: now,
    consent: { given: true, text: CONSENT_TEXT, at: now, country: (request.cf && request.cf.country) || null },
    source: {
      page: String(src.page || "").slice(0, 300),
      referrer: String(src.referrer || "").slice(0, 300),
      utm_source: String(src.utm_source || "").slice(0, 100),
      utm_medium: String(src.utm_medium || "").slice(0, 100),
      utm_campaign: String(src.utm_campaign || "").slice(0, 100),
    },
  };
  await env.MEMBERS.put(key, JSON.stringify(record));
  return reply({ ok: true }, 200, staging);
}
