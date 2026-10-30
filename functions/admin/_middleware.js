// gates every /admin request, static pages included, behind a valid session.
import { hasValidSession } from "../../lib/admin_auth.js";

const PUBLIC_PATHS = ["/admin/login", "/admin/login/", "/admin/login.html"];

const ADMIN_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; form-action 'self'; base-uri 'none'",
};

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  let response;

  if (PUBLIC_PATHS.includes(url.pathname) || (await hasValidSession(request, env))) {
    response = await next();
  } else if (url.pathname.startsWith("/admin/api/")) {
    response = Response.json({ error: "unauthorized" }, { status: 401 });
  } else {
    response = new Response(null, { status: 302, headers: { Location: "/admin/login" } });
  }

  // copy so headers are mutable even on asset and redirect responses.
  response = new Response(response.body, response);
  for (const [name, value] of Object.entries(ADMIN_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}
