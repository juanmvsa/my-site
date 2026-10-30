// session helpers shared by the /admin pages functions.
// a session cookie is "<expiry>.<hmac(expiry)>"; nothing is stored server-side.
const COOKIE_NAME = "admin_session";
const SESSION_SECONDS = 12 * 60 * 60;

const encoder = new TextEncoder();

export function authConfigured(env) {
  return Boolean(env.ADMIN_PASSWORD && env.SESSION_SECRET);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// hashing both sides first gives equal-length inputs for timingSafeEqual.
async function safeEqual(a, b) {
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(left, right);
}

// the password is part of the key, so changing it signs every session out.
async function sign(env, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${env.SESSION_SECRET}:${env.ADMIN_PASSWORD}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export async function passwordMatches(env, candidate) {
  if (!authConfigured(env) || typeof candidate !== "string") return false;
  return safeEqual(candidate, env.ADMIN_PASSWORD);
}

export async function createSessionCookie(env) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const value = `${expires}.${await sign(env, String(expires))}`;
  return `${COOKIE_NAME}=${value}; Path=/admin; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export async function hasValidSession(request, env) {
  if (!authConfigured(env)) return false;
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=(\\d+)\\.([0-9a-f]{64})`));
  if (!match) return false;
  const [, expires, signature] = match;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, await sign(env, expires));
}
