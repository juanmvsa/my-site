// tells analytics.js whether the visitor needs to give cookie consent first.
// uk, eea non-eu members and switzerland have gdpr-equivalent cookie rules.
const EXTRA_CONSENT_COUNTRIES = ["GB", "IS", "LI", "NO", "CH"];

// cloudflare's non-country codes: "XX" is unknown, "T1" is tor.
const NON_COUNTRY_CODES = ["XX", "T1"];

function isKnownCountry(code) {
  return typeof code === "string" && /^[A-Z]{2}$/.test(code) && !NON_COUNTRY_CODES.includes(code);
}

export function onRequestGet({ request }) {
  const cf = request.cf || {};
  const country = cf.country || null;
  // anything that is not a real country code fails closed: ask for consent.
  const consentRequired =
    !isKnownCountry(country) ||
    cf.isEUCountry === "1" ||
    EXTRA_CONSENT_COUNTRIES.includes(country);

  return Response.json(
    { country: country, consent_required: consentRequired },
    { headers: { "Cache-Control": "no-store" } }
  );
}
