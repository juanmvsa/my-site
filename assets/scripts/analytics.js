// posthog analytics: pageviews, autocapture, and the custom events below.
// the project key is public by design (it can only write events), so it lives here.
const POSTHOG_KEY = "phc_pcyyHtMq9KfbHRPuBQMBs32WjupankRCf7MEfDLjRzdK";
// requests go through functions/ingest on this domain, which forwards to posthog eu.
const POSTHOG_HOST = "/ingest";
const POSTHOG_UI_HOST = "https://eu.posthog.com";

// visitors in the eu/eea/uk/ch must opt in before any cookie is set or event
// is sent. everyone else is tracked with persistent cookies straight away.
const CONSENT_KEY = "analytics_consent";
const GEO_ENDPOINT = "/geo";

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

const CONSENT_TEXT = {
  en: {
    message: "this site uses cookies to recognise returning visitors and see which papers get read.",
    accept: "accept",
    decline: "decline",
  },
  es: {
    message: "este sitio usa cookies para reconocer visitas recurrentes y ver qué artículos se leen.",
    accept: "aceptar",
    decline: "rechazar",
  },
};

function analyticsEnabled() {
  if (POSTHOG_KEY === "phc_REPLACE_ME") return false;
  // never record local `make serve` sessions.
  const host = window.location.hostname;
  return host !== "127.0.0.1" && host !== "localhost";
}

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function writeConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // storage blocked: the choice only lasts for this page load.
  }
}

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

function whenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

// official posthog loader stub: queues calls until array.js arrives.
function loadPosthog() {
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: POSTHOG_UI_HOST,
    // cookie + localStorage keeps one distinct id per visitor across visits.
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
    respect_dnt: true,
    capture_pageleave: true,
  });
}

let trackingStarted = false;

function startTracking() {
  if (trackingStarted) return;
  trackingStarted = true;
  loadPosthog();
  trackClicks();
  trackScrollDepth();
}

// removes everything posthog stored, then reloads so no listener keeps sending.
function stopTracking() {
  const domains = ["", window.location.hostname, "." + window.location.hostname];
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("ph_")) return;
    domains.forEach((domain) => {
      document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" +
        (domain ? "; domain=" + domain : "");
    });
  });
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("ph_"))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // storage blocked: posthog could not have written there either.
  }
  window.location.reload();
}

function consentLanguage() {
  return document.documentElement.lang === "es" ? "es" : "en";
}

function showConsentBanner() {
  if (document.querySelector(".consent-banner")) return;

  const banner = document.createElement("div");
  banner.className = "consent-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "cookie consent");

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
    writeConsent("granted");
    close();
    startTracking();
  });
  decline.addEventListener("click", () => {
    const wasTracking = trackingStarted;
    writeConsent("denied");
    close();
    if (wasTracking) stopTracking();
  });

  render();
  document.body.appendChild(banner);
}

// the footer link lets eu visitors change their mind later.
function revealPreferencesLink() {
  const link = document.getElementById("analytics-preferences");
  if (!link) return;
  link.hidden = false;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showConsentBanner();
  });
}

function trackClicks() {
  // delegated at document level so it runs after the button's inline onclick,
  // which means the language has already switched when we read it.
  document.addEventListener("click", (event) => {
    if (event.target.closest("#language-toggle")) {
      window.posthog.capture("language_toggled", {
        language: document.documentElement.lang,
      });
      return;
    }

    const link = event.target.closest("a[href]");
    if (!link || link.id === "analytics-preferences") return;
    const url = new URL(link.href, window.location.href);
    const label = link.textContent.trim();

    if (url.origin === window.location.origin && url.pathname.startsWith("/files/")) {
      window.posthog.capture("file_downloaded", {
        file: url.pathname.replace("/files/", ""),
        label: label,
      });
    } else if (url.origin !== window.location.origin) {
      // the page may unload on same-tab navigation, so send via beacon.
      window.posthog.capture(
        "outbound_link_clicked",
        {
          url: url.href,
          domain: url.hostname,
          label: label,
          section: sectionOf(link),
        },
        { transport: "sendBeacon" }
      );
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

function trackScrollDepth() {
  const reached = new Set();

  function check() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable <= 0 ? 100 : (window.scrollY / scrollable) * 100;
    SCROLL_THRESHOLDS.forEach((threshold) => {
      if (percent >= threshold && !reached.has(threshold)) {
        reached.add(threshold);
        window.posthog.capture("scroll_depth_reached", { percent: threshold });
      }
    });
    if (reached.size === SCROLL_THRESHOLDS.length) {
      window.removeEventListener("scroll", check);
    }
  }

  window.addEventListener("scroll", check, { passive: true });
}

async function initAnalytics() {
  const stored = readConsent();
  if (stored === "granted") {
    startTracking();
    whenReady(revealPreferencesLink);
    return;
  }
  if (stored === "denied") {
    whenReady(revealPreferencesLink);
    return;
  }

  if (await consentRequired()) {
    whenReady(() => {
      revealPreferencesLink();
      showConsentBanner();
    });
  } else {
    startTracking();
  }
}

if (analyticsEnabled()) {
  initAnalytics();
}
