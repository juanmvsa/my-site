// post /admin/logout: drops the session cookie.
import { clearSessionCookie } from "../../lib/admin_auth.js";

export function onRequestPost() {
  return new Response(null, {
    status: 303,
    headers: { Location: "/admin/login", "Set-Cookie": clearSessionCookie() },
  });
}
