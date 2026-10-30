// get /admin/api/metrics?days=7|30|90|all: every dashboard number in one response.
// reads the d1 database VISITS written by functions/api/visits.js; bots are excluded.
const RANGES = { 7: 7, 30: 30, 90: 90, all: null };
const BREAKDOWN_LIMIT = 15;
const RECENT_VISITS_LIMIT = 50;
const SCROLL_DEPTHS = [25, 50, 75, 100];

// every statement is a fixed string; the only interpolated value is a number from
// RANGES or SCROLL_DEPTHS, so no request input reaches the sql.
function buildQueries(days) {
  const since = days === null ? "" : ` and received >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-${days} days')`;
  const views = `is_bot = 0${since}`;
  const joined = `v.is_bot = 0${since.replace("received", "v.received")}`;
  // a person is their persistent id when they have one, else the daily hash.
  const person = "coalesce(visitor_id, visitor, view_id)";

  const viewBreakdown = (expr) => `
    select ${expr} as label, count(distinct ${person}) as n
    from views where ${views}
    group by label order by n desc limit ${BREAKDOWN_LIMIT}`;

  const eventBreakdown = (event, key) => `
    select json_extract(e.data, '$.${key}') as label, count(*) as n
    from events e join views v on v.view_id = e.view_id
    where ${joined} and e.name = '${event}' and json_valid(e.data)
    group by label order by n desc limit ${BREAKDOWN_LIMIT}`;

  return {
    totals: `
      select count(*) as pageviews,
             count(distinct ${person}) as visitors,
             round(avg(duration_ms) / 1000.0) as avg_seconds,
             min(received) as first_seen
      from views where ${views}`,
    returning: `
      select coalesce(sum(days > 1), 0) as returning_visitors, count(*) as identified
      from (
        select visitor_id, count(distinct substr(received, 1, 10)) as days
        from views where ${views} and visitor_id is not null
        group by visitor_id
      )`,
    events: `
      select coalesce(sum(e.name = 'file_downloaded'), 0) as downloads,
             coalesce(sum(e.name = 'outbound_link_clicked'), 0) as outbound_clicks,
             coalesce(sum(e.name = 'language_toggled'), 0) as language_toggles
      from events e join views v on v.view_id = e.view_id where ${joined}`,
    daily: `
      select substr(received, 1, 10) as day, count(*) as pageviews, count(distinct ${person}) as visitors
      from views where ${views}
      group by day order by day`,
    countries: viewBreakdown("country"),
    sources: viewBreakdown("coalesce(utm_source, referrer_host, '$direct')"),
    devices: viewBreakdown("device"),
    browsers: viewBreakdown("browser"),
    downloads: eventBreakdown("file_downloaded", "file"),
    outbound: eventBreakdown("outbound_link_clicked", "label"),
    languages: eventBreakdown("language_toggled", "language"),
    // share of views whose exit beacon reported at least each depth.
    scroll: SCROLL_DEPTHS.map((depth) => `select ${depth} as label, coalesce(sum(scroll >= ${depth}), 0) as n, count(scroll) as measured from views where ${views}`)
      .join(" union all "),
    recent: `
      select v.received as started, v.country, v.city, coalesce(v.utm_source, v.referrer_host, '$direct') as source,
             v.device, v.browser, v.duration_ms, v.scroll, v.visitor_id is not null as identified,
             (select json_group_array(e.name || '|' || coalesce(json_extract(e.data, '$.file'), json_extract(e.data, '$.label'),
                                                                 json_extract(e.data, '$.language'), ''))
              from events e where e.view_id = v.view_id) as actions
      from views v where ${joined}
      order by v.received desc limit ${RECENT_VISITS_LIMIT}`,
  };
}

export async function onRequestGet({ request, env }) {
  if (!env.VISITS) {
    return Response.json({ error: "the VISITS d1 binding is missing" }, { status: 503 });
  }

  const param = new URL(request.url).searchParams.get("days") || "30";
  if (!(param in RANGES)) {
    return Response.json({ error: "days must be 7, 30, 90 or all" }, { status: 400 });
  }

  const queries = buildQueries(RANGES[param]);
  const names = Object.keys(queries);
  let results;
  try {
    results = await env.VISITS.batch(names.map((name) => env.VISITS.prepare(queries[name])));
  } catch (error) {
    console.error("admin metrics:", error.message);
    // 424, not 5xx: cloudflare swaps 5xx bodies for its own error page, which
    // would hide this message from the dashboard.
    return Response.json({ error: error.message }, { status: 424 });
  }

  const body = { range: param, generated_at: new Date().toISOString() };
  names.forEach((name, i) => {
    body[name] = results[i].results;
  });
  // json_group_array returns a json string; hand the page a real array.
  body.recent = body.recent.map((row) => ({ ...row, actions: JSON.parse(row.actions || "[]") }));
  return Response.json(body);
}
