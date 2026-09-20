/**
 * Tiny signed-cookie session for the admin dashboard.
 * Uses Web Crypto only, so the same code runs in middleware (Edge) and in
 * route handlers (Node).
 */

export const SESSION_COOKIE = "noir_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const DEFAULT_USERNAME = "noir est creme";
const DEFAULT_PASSWORD = "noir est creme coffe shop";

/**
 * Forgiving comparison for credentials typed on a phone: case, accents and
 * repeated spaces are ignored so "Noir Est Crème" === "noir est creme".
 */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(value: string): Uint8Array {
  const pad = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function secret(): string {
  return process.env.AUTH_SECRET || "noir-et-creme-dev-secret-change-me";
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = normalize(process.env.ADMIN_USERNAME || DEFAULT_USERNAME);
  const expectedPass = normalize(process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD);
  const userOk = safeEqual(normalize(username || ""), expectedUser);
  const passOk = safeEqual(normalize(password || ""), expectedPass);
  return userOk && passOk;
}

export async function createSession(): Promise<string> {
  const payload = b64url(
    new TextEncoder().encode(JSON.stringify({ sub: "admin", exp: Date.now() + SESSION_TTL_MS })),
  );
  return `${payload}.${await sign(payload)}`;
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, await sign(payload))) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return data?.sub === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
