// post /api/visits: stores the views, exits and events sent by scripts/analytics.js in d1.
// binding: VISITS, the d1 database my-site-visits (schema in db/visits.sql).
// the ip is never stored: location comes from request.cf, and the anonymous visitor
// is a daily salted hash whose salt is deleted the next day.
const MAX_BODY = 8192;
const VIEW_ID = /^[0-9a-f-]{16,40}$/;
const VISITOR_ID = /^[0-9a-f-]{32,36}$/;
const EVENT_NAME = /^[a-z_]{1,40}$/;
const CONSENT = ["granted", "denied", "pending", "not_required"];
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|curl|wget|python|httpclient|monitor/i;

function empty(status) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

// trimmed text or null, so neither empty strings nor huge values are stored.
function text(value, max) {
  if (value === undefined || value === null) return null;
  const clean = String(value).replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().slice(0, max);
  return clean || null;
}

function integer(value, min, max) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(n, min), max);
}

function hex(bytes) {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

function hostOf(address) {
  try {
    return new URL(address).host || null;
  } catch {
    return null;
  }
}

// the first view of a utc day creates that day's salt and deletes every older one.
async function saltOfDay(db, day) {
  const select = db.prepare("select value from salts where day = ?").bind(day);
  const row = await select.first();
  if (row) return row.value;
  await db.batch([
    db.prepare("insert or ignore into salts (day, value) values (?, ?)").bind(day, hex(crypto.getRandomValues(new Uint8Array(32)))),
    db.prepare("delete from salts where day < ?").bind(day),
  ]);
  return (await select.first()).value;
}

async function dailyVisitor(db, ip, userAgent) {
  if (!ip) return null;
  const salt = await saltOfDay(db, new Date().toISOString().slice(0, 10));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}|${ip}|${userAgent}`));
  return hex(digest).slice(0, 16);
}

// a light user-agent read; the raw string is kept too for later review.
function parseUserAgent(ua, touchPoints) {
  const browsers = [
    ["Edge", /Edg(?:A|iOS)?\/([\d.]+)/],
    ["Opera", /OPR\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
  ];
  let browser = null;
  let version = null;
  for (const [name, pattern] of browsers) {
    const match = ua.match(pattern);
    if (match) {
      browser = name;
      version = match[1].split(".")[0];
      break;
    }
  }

  let os = null;
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "desktop";
  if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = "tablet";
  else if (/Mobi|iPhone|iPod/.test(ua)) device = "mobile";
  // ipados reports itself as macos; the touch screen gives it away.
  if (os === "macOS" && touchPoints > 1) {
    os = "iPadOS";
    device = "tablet";
  }
  return { browser, version, os, device };
}

async function saveView(db, data, request) {
  const cf = request.cf || {};
  const ua = request.headers.get("User-Agent") || "";
  const parsed = parseUserAgent(ua, integer(data.touch_points, 0, 20) || 0);
  const referrer = text(data.referrer, 500);
  const referrerHost = hostOf(referrer);
  // navigation inside the site is not an external referrer.
  const external = referrerHost && referrerHost !== new URL(request.url).host;
  const visitorId = VISITOR_ID.test(String(data.visitor_id || "")) ? data.visitor_id : null;

  const columns = [
    "view_id", "received", "visitor", "visitor_id", "consent", "is_bot", "path", "title", "referrer", "referrer_host",
    "utm_source", "utm_medium", "utm_campaign", "country", "region", "city", "continent", "timezone", "asn", "as_org",
    "browser", "browser_version", "os", "device", "user_agent", "language", "screen", "viewport", "theme",
  ];
  await db.prepare(
    `insert or ignore into views (${columns.join(", ")}) values (${columns.map(() => "?").join(", ")})`
  ).bind(
    data.view_id,
    new Date().toISOString(),
    await dailyVisitor(db, request.headers.get("CF-Connecting-IP"), ua),
    visitorId,
    CONSENT.includes(data.consent) ? data.consent : null,
    BOT.test(ua) || Boolean(cf.botManagement && cf.botManagement.verifiedBot) ? 1 : 0,
    text(data.path, 300) || "/",
    text(data.title, 200),
    external ? referrer : null,
    external ? referrerHost : null,
    text(data.utm_source, 100),
    text(data.utm_medium, 100),
    text(data.utm_campaign, 100),
    text(cf.country, 8),
    text(cf.region, 100),
    text(cf.city, 100),
    text(cf.continent, 8),
    text(cf.timezone, 64),
    integer(cf.asn, 0, 4294967295),
    text(cf.asOrganization, 120),
    parsed.browser,
    parsed.version,
    parsed.os,
    parsed.device,
    text(ua, 400),
    text(data.language, 35),
    text(data.screen, 20),
    text(data.viewport, 20),
    text(data.theme, 10),
  ).run();
}

// the exit beacon can arrive several times (each time the tab is hidden); keep the largest values.
async function saveExit(db, data) {
  await db.prepare(
    "update views set duration_ms = max(coalesce(duration_ms, 0), ?), scroll = max(coalesce(scroll, 0), ?)," +
    " load_ms = coalesce(load_ms, ?) where view_id = ?"
  ).bind(
    integer(data.duration_ms, 0, 86400000) || 0,
    integer(data.scroll, 0, 100) || 0,
    integer(data.load_ms, 0, 600000),
    data.view_id,
  ).run();
}

// accepting the banner after the view was sent attaches the new id to that view.
async function saveIdentify(db, data) {
  if (!VISITOR_ID.test(String(data.visitor_id || ""))) return false;
  await db.prepare("update views set visitor_id = ?, consent = 'granted' where view_id = ? and visitor_id is null")
    .bind(data.visitor_id, data.view_id)
    .run();
  return true;
}

async function saveEvent(db, data) {
  const name = String(data.name || "");
  if (!EVENT_NAME.test(name)) return false;
  // the detail is rebuilt from a few flat keys with short values, so it is always valid json.
  let detail = null;
  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    const clean = {};
    for (const [key, value] of Object.entries(data.data).slice(0, 8)) {
      if (!/^[a-z_]{1,30}$/.test(key)) continue;
      if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
      else if (typeof value === "string" && text(value, 300)) clean[key] = text(value, 300);
    }
    if (Object.keys(clean).length) detail = JSON.stringify(clean);
  }
  await db.prepare("insert into events (view_id, received, name, data) values (?, ?, ?, ?)")
    .bind(data.view_id, new Date().toISOString(), name, detail)
    .run();
  return true;
}

export async function onRequestPost({ request, env }) {
  // only accept data sent from this site's own pages.
  const origin = request.headers.get("Origin");
  if (origin && hostOf(origin) !== new URL(request.url).host) return empty(403);
  if (!env.VISITS) return empty(204);

  let data;
  try {
    const body = await request.text();
    if (body.length > MAX_BODY) return empty(413);
    data = JSON.parse(body);
  } catch {
    return empty(400);
  }
  if (!data || typeof data !== "object" || !VIEW_ID.test(String(data.view_id || ""))) return empty(400);

  try {
    let ok = true;
    if (data.type === "view") await saveView(env.VISITS, data, request);
    else if (data.type === "exit") await saveExit(env.VISITS, data);
    else if (data.type === "identify") ok = await saveIdentify(env.VISITS, data);
    else if (data.type === "event") ok = await saveEvent(env.VISITS, data);
    else ok = false;
    if (!ok) return empty(400);
  } catch (error) {
    console.error("visits:", error.message);
    return empty(500);
  }
  return empty(204);
}
