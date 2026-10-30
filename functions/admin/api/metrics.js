// get /admin/api/metrics?days=7|30|90|all: every dashboard number in one response.
// queries run server-side so the posthog personal api key never reaches the browser.
const POSTHOG_API_HOST = "https://eu.posthog.com";
const RANGES = { 7: 7, 30: 30, 90: 90, all: null };
const BREAKDOWN_LIMIT = 15;
const RECENT_VISITS_LIMIT = 50;
const CACHE_SECONDS = 300;

// every query below is a fixed string; the only interpolated value is a number
// from RANGES, so no request input reaches the sql.
function buildQueries(days) {
  const range = days === null ? "1 = 1" : `timestamp >= now() - INTERVAL ${days} DAY`;
  const pageviews = `event = '$pageview' AND ${range}`;

  const visitorBreakdown = (expr) => `
    SELECT ${expr} AS label, count(DISTINCT distinct_id) AS n
    FROM events WHERE ${pageviews}
    GROUP BY label ORDER BY n DESC LIMIT ${BREAKDOWN_LIMIT}`;

  const eventBreakdown = (event, expr) => `
    SELECT ${expr} AS label, count() AS n
    FROM events WHERE event = '${event}' AND ${range}
    GROUP BY label ORDER BY n DESC LIMIT ${BREAKDOWN_LIMIT}`;

  return {
    totals: `
      SELECT count() AS pageviews,
             count(DISTINCT distinct_id) AS visitors,
             count(DISTINCT properties.$session_id) AS sessions,
             min(timestamp) AS first_seen
      FROM events WHERE ${pageviews}`,
    returning: `
      SELECT countIf(days > 1) AS returning, count() AS visitors
      FROM (
        SELECT distinct_id, count(DISTINCT toDate(timestamp)) AS days
        FROM events WHERE ${pageviews}
        GROUP BY distinct_id
      )`,
    events: `
      SELECT countIf(event = 'file_downloaded') AS downloads,
             countIf(event = 'outbound_link_clicked') AS outbound_clicks,
             countIf(event = 'language_toggled') AS language_toggles
      FROM events WHERE ${range}`,
    daily: `
      SELECT toDate(timestamp) AS day, count() AS pageviews, count(DISTINCT distinct_id) AS visitors
      FROM events WHERE ${pageviews}
      GROUP BY day ORDER BY day LIMIT 1000`,
    countries: visitorBreakdown("properties.$geoip_country_name"),
    sources: visitorBreakdown("coalesce(properties.utm_source, properties.$referring_domain)"),
    devices: visitorBreakdown("properties.$device_type"),
    browsers: visitorBreakdown("properties.$browser"),
    downloads: eventBreakdown("file_downloaded", "properties.file"),
    outbound: eventBreakdown("outbound_link_clicked", "properties.label"),
    languages: eventBreakdown("language_toggled", "properties.language"),
    scroll: `
      SELECT properties.percent AS label, count(DISTINCT properties.$session_id) AS n
      FROM events WHERE event = 'scroll_depth_reached' AND ${range}
      GROUP BY label`,
    recent: `
      SELECT properties.$session_id AS session,
             min(timestamp) AS started,
             argMin(properties.$geoip_country_name, timestamp) AS country,
             argMin(properties.$referring_domain, timestamp) AS source,
             argMin(properties.$device_type, timestamp) AS device,
             countIf(event = '$pageview') AS pageviews,
             maxIf(toFloat(properties.percent), event = 'scroll_depth_reached') AS max_scroll,
             groupArrayIf(
               concat(event, '|', coalesce(properties.file, properties.label, properties.language, '')),
               event IN ('file_downloaded', 'outbound_link_clicked', 'language_toggled')
             ) AS actions
      FROM events
      WHERE properties.$session_id IS NOT NULL AND ${range}
      GROUP BY session ORDER BY started DESC LIMIT ${RECENT_VISITS_LIMIT}`,
  };
}

async function runQuery(env, name, sql) {
  const project = env.POSTHOG_PROJECT_ID || "@current";
  const response = await fetch(`${POSTHOG_API_HOST}/api/projects/${project}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: `admin_${name}`, query: { kind: "HogQLQuery", query: sql } }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${name}: posthog ${response.status} ${detail.slice(0, 300)}`);
  }
  const { columns, results } = await response.json();
  // rows as objects keyed by column name, so the page does not depend on column order.
  return results.map((row) => Object.fromEntries(columns.map((column, i) => [column, row[i]])));
}

export async function onRequestGet({ request, env }) {
  if (!env.POSTHOG_PERSONAL_API_KEY) {
    return Response.json({ error: "POSTHOG_PERSONAL_API_KEY is not set" }, { status: 503 });
  }

  const param = new URL(request.url).searchParams.get("days") || "30";
  if (!(param in RANGES)) {
    return Response.json({ error: "days must be 7, 30, 90 or all" }, { status: 400 });
  }

  // posthog rate-limits its query api, so one result per range is reused for a
  // few minutes. the cache is edge-internal and only read after the session check.
  const cacheKey = new Request(`https://admin-metrics.internal/${param}`);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const queries = buildQueries(RANGES[param]);
  let body;
  try {
    const entries = await Promise.all(
      Object.entries(queries).map(async ([name, sql]) => [name, await runQuery(env, name, sql)])
    );
    body = { range: param, generated_at: new Date().toISOString(), ...Object.fromEntries(entries) };
  } catch (error) {
    console.error("admin metrics:", error.message);
    // 424, not 502: cloudflare swaps 5xx bodies for its own error page, which
    // would hide this message from the dashboard.
    return Response.json({ error: error.message }, { status: 424 });
  }

  await caches.default.put(
    cacheKey,
    Response.json(body, { headers: { "Cache-Control": `max-age=${CACHE_SECONDS}` } })
  );
  return Response.json(body);
}
