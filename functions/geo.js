// tells analytics.js whether the visitor needs to give cookie consent first.
// uk, eea non-eu members and switzerland have gdpr-equivalent cookie rules.
const EXTRA_CONSENT_COUNTRIES = ["GB", "IS", "LI", "NO", "CH"];

export function onRequestGet({ request }) {
  const cf = request.cf || {};
  const country = cf.country || null;
  // unknown location fails closed: ask for consent.
  const consentRequired =
    country === null ||
    cf.isEUCountry === "1" ||
    EXTRA_CONSENT_COUNTRIES.includes(country);

  return Response.json(
    { country: country, consent_required: consentRequired },
    { headers: { "Cache-Control": "no-store" } }
  );
}
