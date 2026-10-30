// /ingest/* reverse proxy to posthog eu, so the tracker loads and sends from
// juan-vasquez.com instead of a posthog domain that blockers recognise.
const API_HOST = "eu.i.posthog.com";
const ASSET_HOST = "eu-assets.i.posthog.com";
const ASSET_CACHE_SECONDS = 3600;

// headers that must not travel upstream: this site's cookies are none of
// posthog's business, and host/cf-* describe the hop to us, not to posthog.
const DROPPED_HEADERS = ["cookie", "host", "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "x-forwarded-for", "x-real-ip"];

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/ingest/, "") || "/";
  const isAsset = path.startsWith("/static/");
  const upstream = new URL(`https://${isAsset ? ASSET_HOST : API_HOST}${path}${url.search}`);

  const headers = new Headers(request.headers);
  DROPPED_HEADERS.forEach((name) => headers.delete(name));
  // posthog geolocates from this header; without it every visit would look
  // like it came from a cloudflare data centre.
  const clientIp = request.headers.get("CF-Connecting-IP");
  if (clientIp) headers.set("X-Forwarded-For", clientIp);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    cf: isAsset ? { cacheEverything: true, cacheTtl: ASSET_CACHE_SECONDS } : { cacheTtl: 0 },
  });

  // drop upstream cookies too, so posthog cannot set any on this domain.
  const proxied = new Response(response.body, response);
  proxied.headers.delete("set-cookie");
  return proxied;
}
