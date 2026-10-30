// renders the /admin pages. all data text goes through textContent, never innerHTML,
// because labels (paper titles, referrers, file names) come from visitor events.
const SVG_NS = "http://www.w3.org/2000/svg";
const DAY_MS = 24 * 60 * 60 * 1000;

const LANGUAGE_NAMES = { en: "english", es: "español" };
const ACTION_PREFIX = {
  file_downloaded: "↓ ",
  outbound_link_clicked: "→ ",
  language_toggled: "lang: ",
};

function formatNumber(value) {
  const n = Number(value) || 0;
  if (n >= 10000) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  return n.toLocaleString("en");
}

function formatPercent(part, whole) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "0%";
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svg(tag, attributes) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes || {})) node.setAttribute(name, value);
  return node;
}

function cleanLabel(value) {
  if (value === null || value === undefined || value === "") return "unknown";
  if (value === "$direct") return "direct";
  return String(value);
}

// cloudflare reports iso country codes; show names, keeping the code if unknown.
const regionNames = window.Intl && Intl.DisplayNames ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

function countryName(code) {
  if (!code) return "unknown";
  try {
    return (regionNames && regionNames.of(code)) || code;
  } catch {
    return code;
  }
}

function formatDuration(ms) {
  if (ms === null || ms === undefined) return "—";
  const seconds = Math.round(Number(ms) / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

// tooltip.

const tooltip = document.getElementById("tooltip");

function showTooltip(x, y, lines) {
  tooltip.replaceChildren(...lines.map(([text, strong]) => el(strong ? "strong" : "span", null, text)));
  tooltip.hidden = false;
  const box = tooltip.getBoundingClientRect();
  const left = Math.min(x + 12, window.innerWidth - box.width - 8);
  tooltip.style.left = `${Math.max(8, left)}px`;
  tooltip.style.top = `${Math.max(8, y - box.height - 12)}px`;
}

function hideTooltip() {
  tooltip.hidden = true;
}

// line chart.

function niceStep(max, targetTicks) {
  const raw = Math.max(max, 1) / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw);
  return Math.max(1, step);
}

// pads the daily rows so days with no visits plot as zero instead of vanishing.
function fillDays(rows, range) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const today = new Date(new Date().toISOString().slice(0, 10));
  let start;
  if (range === "all") {
    start = rows.length ? new Date(rows[0].day) : today;
  } else {
    start = new Date(today.getTime() - (Number(range) - 1) * DAY_MS);
  }
  const days = [];
  for (let t = start.getTime(); t <= today.getTime(); t += DAY_MS) {
    const day = new Date(t).toISOString().slice(0, 10);
    const row = byDay.get(day);
    days.push({ day, visitors: row ? row.visitors : 0, pageviews: row ? row.pageviews : 0 });
  }
  return days;
}

function formatDay(day) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function renderLineChart(container, days) {
  container.replaceChildren();
  const width = Math.max(container.clientWidth, 280);
  const height = 220;
  const margin = { top: 16, right: 48, bottom: 28, left: 40 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(...days.map((d) => d.visitors), 0);
  const step = niceStep(maxValue, 4);
  const yMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const x = (i) => margin.left + (days.length === 1 ? plotWidth / 2 : (i / (days.length - 1)) * plotWidth);
  const y = (v) => margin.top + plotHeight - (v / yMax) * plotHeight;

  const chart = svg("svg", {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    class: "admin-line__svg",
    role: "img",
    tabindex: "0",
    "aria-label": `unique visitors per day, ${days.length} days, peak ${maxValue}`,
  });

  for (let v = 0; v <= yMax; v += step) {
    chart.append(svg("line", { x1: margin.left, x2: width - margin.right, y1: y(v), y2: y(v), class: "admin-line__grid" }));
    const tick = svg("text", { x: margin.left - 8, y: y(v), class: "admin-line__tick", "text-anchor": "end", "dominant-baseline": "middle" });
    tick.textContent = formatNumber(v);
    chart.append(tick);
  }

  const labelIndexes = [...new Set([0, Math.floor((days.length - 1) / 2), days.length - 1])];
  labelIndexes.forEach((i) => {
    const anchor = i === 0 ? "start" : i === days.length - 1 ? "end" : "middle";
    const label = svg("text", { x: x(i), y: height - 8, class: "admin-line__tick", "text-anchor": days.length === 1 ? "middle" : anchor });
    label.textContent = formatDay(days[i].day);
    chart.append(label);
  });

  const points = days.map((d, i) => `${x(i)},${y(d.visitors)}`);
  const baseline = y(0);
  chart.append(svg("path", {
    d: `M${x(0)},${baseline} L${points.join(" L")} L${x(days.length - 1)},${baseline} Z`,
    class: "admin-line__area",
  }));
  chart.append(svg("path", { d: `M${points.join(" L")}`, class: "admin-line__path" }));

  // one direct label: the latest value at the line's end.
  const last = days.length - 1;
  chart.append(svg("circle", { cx: x(last), cy: y(days[last].visitors), r: 4, class: "admin-line__dot" }));
  const endLabel = svg("text", { x: x(last) + 10, y: y(days[last].visitors), class: "admin-line__end", "dominant-baseline": "middle" });
  endLabel.textContent = formatNumber(days[last].visitors);
  chart.append(endLabel);

  // crosshair + tooltip, snapping to the nearest day; arrow keys do the same.
  const crosshair = svg("line", { y1: margin.top, y2: margin.top + plotHeight, class: "admin-line__crosshair", visibility: "hidden" });
  const focusDot = svg("circle", { r: 4, class: "admin-line__dot", visibility: "hidden" });
  chart.append(crosshair, focusDot);

  let active = last;
  function highlight(i, clientX, clientY) {
    active = i;
    const d = days[i];
    crosshair.setAttribute("x1", x(i));
    crosshair.setAttribute("x2", x(i));
    focusDot.setAttribute("cx", x(i));
    focusDot.setAttribute("cy", y(d.visitors));
    crosshair.setAttribute("visibility", "visible");
    focusDot.setAttribute("visibility", "visible");
    showTooltip(clientX, clientY, [
      [formatDay(d.day), false],
      [`${formatNumber(d.visitors)} visitors`, true],
      [`${formatNumber(d.pageviews)} pageviews`, false],
    ]);
  }
  function clear() {
    crosshair.setAttribute("visibility", "hidden");
    focusDot.setAttribute("visibility", "hidden");
    hideTooltip();
  }

  chart.addEventListener("pointermove", (event) => {
    const box = chart.getBoundingClientRect();
    const px = event.clientX - box.left;
    const ratio = days.length === 1 ? 0 : (px - margin.left) / plotWidth;
    const i = Math.min(days.length - 1, Math.max(0, Math.round(ratio * (days.length - 1))));
    highlight(i, event.clientX, event.clientY);
  });
  chart.addEventListener("pointerleave", clear);
  chart.addEventListener("blur", clear);
  chart.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const i = Math.min(days.length - 1, Math.max(0, active + (event.key === "ArrowRight" ? 1 : -1)));
    const box = chart.getBoundingClientRect();
    highlight(i, box.left + x(i), box.top + y(days[i].visitors));
  });

  container.append(chart);
}

function renderDailyTable(table, days) {
  const head = el("tr");
  ["day", "unique visitors", "pageviews"].forEach((h) => head.append(el("th", null, h)));
  const rows = days
    .slice()
    .reverse()
    .map((d) => {
      const tr = el("tr");
      tr.append(el("td", null, d.day), el("td", "num", formatNumber(d.visitors)), el("td", "num", formatNumber(d.pageviews)));
      return tr;
    });
  table.replaceChildren(head, ...rows);
}

// ranked bars.

function renderBars(container, items, options = {}) {
  container.replaceChildren();
  if (!items.length) {
    container.append(el("p", "admin-empty", "no data yet"));
    return;
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  items.forEach((item) => {
    const row = el("div", "admin-bar");
    const label = el("span", "admin-bar__label", item.label);
    label.title = item.label;
    const track = el("span", "admin-bar__track");
    const bar = el("span", "admin-bar__fill");
    bar.style.width = `${(item.value / max) * 100}%`;
    track.append(bar);
    const value = el("span", "admin-bar__value", options.format ? options.format(item) : formatNumber(item.value));
    row.append(label, track, value);
    container.append(row);
  });
}

function breakdown(rows, mapLabel = cleanLabel) {
  return rows.map((row) => ({ label: mapLabel(row.label), value: Number(row.n) || 0 }));
}

// recent visits.

function describeAction(raw) {
  const [event, ...rest] = String(raw).split("|");
  const detail = rest.join("|");
  const shown = event === "language_toggled" ? LANGUAGE_NAMES[detail] || detail : detail;
  return `${ACTION_PREFIX[event] || ""}${shown || event}`;
}

function renderRecent(table, rows) {
  const head = el("tr");
  ["started", "location", "source", "device", "time", "scroll", "actions"].forEach((h) => head.append(el("th", null, h)));
  if (!rows.length) {
    const empty = el("tr");
    const cell = el("td", "admin-empty", "no visits yet");
    cell.colSpan = 7;
    empty.append(cell);
    table.replaceChildren(head, empty);
    return;
  }
  const body = rows.map((row) => {
    const tr = el("tr");
    const started = new Date(row.started).toLocaleString("en", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const actions = el("td", "admin-table__actions");
    (row.actions || []).forEach((action) => actions.append(el("span", null, describeAction(action))));
    if (!actions.childElementCount) actions.textContent = "—";
    const location = [row.city, countryName(row.country)].filter(Boolean).join(", ");
    // ↺ marks visitors with a persistent id, i.e. ones that can show up as returning.
    const device = `${cleanLabel(row.device)} · ${cleanLabel(row.browser)}${row.identified ? " ↺" : ""}`;
    tr.append(
      el("td", "nowrap", started),
      el("td", null, location),
      el("td", null, cleanLabel(row.source)),
      el("td", "nowrap", device),
      el("td", "num", formatDuration(row.duration_ms)),
      el("td", "num", row.scroll ? `${row.scroll}%` : "—"),
      actions
    );
    return tr;
  });
  table.replaceChildren(head, ...body);
}

// dashboard.

let currentData = null;

function render(data) {
  const totals = data.totals[0] || {};
  const returning = data.returning[0] || {};
  const events = data.events[0] || {};
  const visitors = Number(totals.visitors) || 0;

  document.getElementById("tile-visitors").textContent = formatNumber(visitors);
  document.getElementById("tile-pageviews").textContent = formatNumber(totals.pageviews);
  document.getElementById("tile-time").textContent = formatDuration(totals.avg_seconds === null ? null : totals.avg_seconds * 1000);
  // returning is only knowable for visitors with a persistent id, so the share is of those.
  document.getElementById("tile-returning").textContent =
    `${formatNumber(returning.returning_visitors)} · ${formatPercent(Number(returning.returning_visitors) || 0, Number(returning.identified) || 0)}`;
  document.getElementById("tile-downloads").textContent = formatNumber(events.downloads);
  document.getElementById("tile-outbound").textContent = formatNumber(events.outbound_clicks);

  const days = fillDays(data.daily, data.range);
  renderLineChart(document.getElementById("daily-chart"), days);
  renderDailyTable(document.getElementById("daily-table"), days);

  renderBars(document.getElementById("bars-countries"), breakdown(data.countries, countryName));
  renderBars(document.getElementById("bars-sources"), breakdown(data.sources));
  renderBars(document.getElementById("bars-devices"), breakdown(data.devices));
  renderBars(document.getElementById("bars-browsers"), breakdown(data.browsers));
  renderBars(document.getElementById("bars-downloads"), breakdown(data.downloads));
  renderBars(document.getElementById("bars-outbound"), breakdown(data.outbound));
  renderBars(
    document.getElementById("bars-languages"),
    breakdown(data.languages, (label) => LANGUAGE_NAMES[label] || cleanLabel(label))
  );

  // scroll depth is ordered, so it keeps 25 → 100 order instead of ranking.
  const measured = Number((data.scroll[0] || {}).measured) || 0;
  const scroll = measured
    ? data.scroll
        .map((row) => ({ label: `${row.label}%`, value: Number(row.n) || 0, depth: Number(row.label) }))
        .sort((a, b) => a.depth - b.depth)
    : [];
  renderBars(document.getElementById("bars-scroll"), scroll, {
    format: (item) => `${formatPercent(item.value, measured)} · ${formatNumber(item.value)}`,
  });

  renderRecent(document.getElementById("recent-table"), data.recent);

  const first = totals.first_seen ? new Date(totals.first_seen).toLocaleDateString("en", { dateStyle: "medium" }) : "—";
  document.getElementById("generated").textContent =
    `first visit in range: ${first} · data as of ${new Date(data.generated_at).toLocaleTimeString("en")} · bots excluded`;
}

async function load(days) {
  const status = document.getElementById("status");
  const dashboard = document.getElementById("dashboard");
  // refetch keeps the previous render, dimmed, instead of blanking the page.
  dashboard.classList.add("is-loading");
  if (dashboard.hidden) status.textContent = "loading…";

  let response;
  try {
    response = await fetch(`/admin/api/metrics?days=${encodeURIComponent(days)}`, { credentials: "same-origin" });
  } catch {
    status.textContent = "could not reach the server.";
    dashboard.classList.remove("is-loading");
    return;
  }
  if (response.status === 401) {
    window.location.href = "/admin/login";
    return;
  }
  const data = await response.json().catch(() => ({ error: "unreadable response" }));
  dashboard.classList.remove("is-loading");
  if (!response.ok) {
    status.textContent = `error: ${data.error || response.status}`;
    status.hidden = false;
    return;
  }

  currentData = data;
  status.hidden = true;
  dashboard.hidden = false;
  render(data);
}

function initDashboard() {
  // whoever opens the dashboard is the owner: stop counting this browser's visits.
  // analytics.js reads this key; ?count on the public site undoes it.
  try {
    localStorage.setItem("no_count", "1");
  } catch {
    // storage blocked: visits from this browser keep being counted.
  }

  const buttons = document.querySelectorAll(".admin-ranges button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      load(button.dataset.days);
    });
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentData) renderLineChart(document.getElementById("daily-chart"), fillDays(currentData.daily, currentData.range));
    }, 150);
  });

  load("30");
}

function initLogin() {
  if (new URLSearchParams(window.location.search).has("error")) {
    document.getElementById("login-error").hidden = false;
  }
}

if (document.body.dataset.page === "dashboard") initDashboard();
if (document.body.dataset.page === "login") initLogin();
