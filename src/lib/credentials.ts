/**
 * Admin credentials. They live in the database (bcrypt-hashed) so they can be
 * changed from the dashboard rather than by redeploying.
 *
 * Kept out of lib/auth.ts on purpose: that module is imported by the
 * middleware, which runs on the Edge runtime and must stay free of the
 * Supabase client.
 */

import { normalize } from "./auth";
import { adminToken, getSupabase } from "./supabase";

export type CredentialResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unavailable" | "current" | "short_username" | "short_password" };

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<CredentialResult> {
  const supabase = getSupabase();
  const token = adminToken();
  if (!supabase || !token) return { ok: false, reason: "unavailable" };

  const { data, error } = await supabase.rpc("noir_admin_check_credentials", {
    p_token: token,
    p_username_norm: normalize(username || ""),
    p_password_norm: normalize(password || ""),
  });

  if (error) return { ok: false, reason: "unavailable" };
  return data === true ? { ok: true } : { ok: false, reason: "invalid" };
}

export async function currentUsername(): Promise<string> {
  const supabase = getSupabase();
  const token = adminToken();
  if (!supabase || !token) return "";
  try {
    const { data, error } = await supabase.rpc("noir_admin_get_username", { p_token: token });
    return error ? "" : String(data ?? "");
  } catch {
    return "";
  }
}

export async function changeCredentials(input: {
  currentPassword: string;
  username: string;
  newPassword: string;
}): Promise<CredentialResult> {
  const supabase = getSupabase();
  const token = adminToken();
  if (!supabase || !token) return { ok: false, reason: "unavailable" };

  const usernameNorm = normalize(input.username || "");
  const newPasswordNorm = normalize(input.newPassword || "");

  if (usernameNorm.length < 3) return { ok: false, reason: "short_username" };
  if (newPasswordNorm.length < 8) return { ok: false, reason: "short_password" };

  const { error } = await supabase.rpc("noir_admin_set_credentials", {
    p_token: token,
    p_current_norm: normalize(input.currentPassword || ""),
    p_username: input.username.trim(),
    p_username_norm: usernameNorm,
    p_new_password_norm: newPasswordNorm,
  });

  if (error) {
    const message = error.message || "";
    if (message.includes("bad_current_password")) return { ok: false, reason: "current" };
    if (message.includes("username_too_short")) return { ok: false, reason: "short_username" };
    if (message.includes("password_too_short")) return { ok: false, reason: "short_password" };
    return { ok: false, reason: "unavailable" };
  }

  return { ok: true };
}
