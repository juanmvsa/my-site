// post /admin/login: checks the password and starts a session.
// get requests fall through to the static login page.
import { authConfigured, createSessionCookie, passwordMatches } from "../../lib/admin_auth.js";

// slows down password guessing; parallel guesses are still only as fast as the
// password is weak, so ADMIN_PASSWORD should be long and random.
const FAILED_LOGIN_DELAY_MS = 1500;

function seeOther(location, cookie) {
  const headers = new Headers({ Location: location });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export async function onRequestPost({ request, env }) {
  if (!authConfigured(env)) {
    return new Response("admin login is not configured", { status: 503 });
  }

  let password = null;
  try {
    password = (await request.formData()).get("password");
  } catch {
    // not a form body: treated as a failed attempt.
  }

  if (!(await passwordMatches(env, password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return seeOther("/admin/login?error=1");
  }
  return seeOther("/admin/", await createSessionCookie(env));
}
