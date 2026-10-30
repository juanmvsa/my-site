// first-party visit analytics: sends each view, its exit and a few actions to
// functions/api/visits.js, which stores them in d1. no third party is involved.
//
// every visit is counted anonymously (the server keys it to a daily salted hash).
// on top of that, a random id in localStorage recognises returning visitors:
// set straight away outside the eu/eea/uk/ch, and only after consent inside them.
//
// to stop counting your own visits, open the site once with ?no-count
// (and ?count to undo). opening /admin/ does the same automatically.
const ENDPOINT = "/api/visits";
const GEO_ENDPOINT = "/geo";
const CONSENT_KEY = "analytics_consent";
const VISITOR_KEY = "visitor_id";
const NO_COUNT_KEY = "no_count";

const CONSENT_TEXT = {
  en: {
    message: "visits are counted anonymously. may this site also store a random id to recognise you when you come back?",
    accept: "accept",
    decline: "decline",
  },
  es: {
    message: "las visitas se cuentan de forma anónima. ¿puede este sitio guardar además un id aleatorio para reconocerte cuando vuelvas?",
    accept: "aceptar",
    decline: "rechazar",
  },
};

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked: the value only lasts for this page load.
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage blocked: nothing was stored to remove.
  }
}

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function trackingAllowed() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("no-count")) storageSet(NO_COUNT_KEY, "1");
  if (params.has("count")) storageRemove(NO_COUNT_KEY);
  if (storageGet(NO_COUNT_KEY)) return false;

  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return false;

  // local `make serve` / `wrangler pages dev` sessions only count with ?track-local.
  const host = window.location.hostname;
  if ((host === "127.0.0.1" || host === "localhost") && !params.has("track-local")) return false;
  return true;
}

// sendBeacon survives the tab closing; fetch with keepalive is the fallback.
function send(body) {
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([json], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch.
  }
  fetch(ENDPOINT, { method: "POST", body: json, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

// consent.

async function consentRequired() {
  try {
    const response = await fetch(GEO_ENDPOINT, { cache: "no-store" });
    if (!response.ok) return true;
    const geo = await response.json();
    return geo.consent_required !== false;
  } catch {
    // if the location is unknown, ask rather than assume.
    return true;
  }
}

// one of: granted, denied (a stored choice), pending (must ask), not_required.
async function resolveConsent() {
  const stored = storageGet(CONSENT_KEY);
  if (stored === "granted" || stored === "denied") return stored;
  return (await consentRequired()) ? "pending" : "not_required";
}

function persistentVisitorId(consent) {
  if (consent !== "granted" && consent !== "not_required") return null;
  let id = storageGet(VISITOR_KEY);
  if (!id) {
    id = newId();
    storageSet(VISITOR_KEY, id);
  }
  return id;
}

// view state.

let viewId = newId();
let visibleMs = 0;
let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
let maxScroll = 0;
let consent = "pending";
let visitorId = null;

function viewPayload() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: "view",
    view_id: viewId,
    visitor_id: visitorId,
    consent: consent,
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    touch_points: navigator.maxTouchPoints || 0,
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  };
}

// milliseconds until the page finished loading, if it has.
function loadMs() {
  const navigation = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  return navigation && navigation.loadEventEnd > 0 ? Math.round(navigation.loadEventEnd) : null;
}

// only time with the tab in view counts.
function sendExit() {
  if (visibleSince !== null) {
    visibleMs += performance.now() - visibleSince;
    visibleSince = null;
  }
  send({ type: "exit", view_id: viewId, duration_ms: Math.round(visibleMs), scroll: maxScroll, load_ms: loadMs() });
}

function measureScroll() {
  const height = document.documentElement.scrollHeight;
  if (!height) return;
  const seen = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / height) * 100));
  if (seen > maxScroll) maxScroll = seen;
}

function track(name, data) {
  send({ type: "event", view_id: viewId, name: name, data: data || null });
}

function trackClicks() {
  // delegated at document level so it runs after the button's inline onclick,
  // which means the language has already switched when we read it.
  document.addEventListener("click", (event) => {
    if (event.target.closest("#language-toggle")) {
      track("language_toggled", { language: document.documentElement.lang });
      return;
    }

    const link = event.target.closest("a[href]");
    if (!link || link.id === "analytics-preferences") return;
    const url = new URL(link.href, window.location.href);
    const label = link.textContent.trim();

    if (url.origin === window.location.origin && url.pathname.startsWith("/files/")) {
      track("file_downloaded", { file: url.pathname.replace("/files/", ""), label: label });
    } else if (url.origin !== window.location.origin) {
      track("outbound_link_clicked", { url: url.origin + url.pathname, domain: url.hostname, label: label, section: sectionOf(link) });
    }
  });
}

// nearest preceding heading, so paper clicks can be grouped by section.
function sectionOf(element) {
  let node = element;
  while (node && node !== document.body) {
    let sibling = node.previousElementSibling;
    while (sibling) {
      if (/^H[1-6]$/.test(sibling.tagName)) return sibling.textContent.trim();
      sibling = sibling.previousElementSibling;
    }
    node = node.parentElement;
  }
  return null;
}

function trackLifecycle() {
  let scheduled = false;
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      measureScroll();
    });
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendExit();
    else if (visibleSince === null) visibleSince = performance.now();
  });
  window.addEventListener("pagehide", sendExit);

  // coming back through the back/forward cache is a new view.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    viewId = newId();
    visibleMs = 0;
    visibleSince = performance.now();
    maxScroll = 0;
    measureScroll();
    send(viewPayload());
  });
}

// banner.

function whenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function consentLanguage() {
  return document.documentElement.lang === "es" ? "es" : "en";
}

function showConsentBanner() {
  if (document.querySelector(".consent-banner")) return;

  const banner = document.createElement("div");
  banner.className = "consent-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "analytics consent");

  const message = document.createElement("p");
  const accept = document.createElement("button");
  const decline = document.createElement("button");
  const actions = document.createElement("div");
  actions.className = "consent-banner__actions";
  actions.append(accept, decline);
  banner.append(message, actions);

  function render() {
    const text = CONSENT_TEXT[consentLanguage()];
    message.textContent = text.message;
    accept.textContent = text.accept;
    decline.textContent = text.decline;
  }

  // follow the en/es toggle while the banner is open.
  function onToggle(event) {
    if (event.target.closest("#language-toggle")) render();
  }
  document.addEventListener("click", onToggle);

  function close() {
    document.removeEventListener("click", onToggle);
    banner.remove();
  }

  accept.addEventListener("click", () => {
    storageSet(CONSENT_KEY, "granted");
    consent = "granted";
    visitorId = persistentVisitorId(consent);
    send({ type: "identify", view_id: viewId, visitor_id: visitorId });
    close();
  });
  decline.addEventListener("click", () => {
    storageSet(CONSENT_KEY, "denied");
    storageRemove(VISITOR_KEY);
    consent = "denied";
    visitorId = null;
    close();
  });

  render();
  document.body.appendChild(banner);
}

// the footer link lets visitors in consent regions change their mind later.
function revealPreferencesLink() {
  const link = document.getElementById("analytics-preferences");
  if (!link) return;
  link.hidden = false;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showConsentBanner();
  });
}

async function initAnalytics() {
  consent = await resolveConsent();
  visitorId = persistentVisitorId(consent);
  send(viewPayload());
  measureScroll();
  trackClicks();
  trackLifecycle();

  if (consent !== "not_required") whenReady(revealPreferencesLink);
  if (consent === "pending") whenReady(showConsentBanner);
}

if (trackingAllowed()) {
  initAnalytics();
}
