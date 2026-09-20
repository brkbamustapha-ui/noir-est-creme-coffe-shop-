import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { changeCredentials } from "@/lib/credentials";
import { SESSION_COOKIE, createSession, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  current: "Mot de passe actuel incorrect.",
  short_username: "L'identifiant doit faire au moins 3 caractères.",
  short_password: "Le mot de passe doit faire au moins 8 caractères.",
  unavailable: "Base de données injoignable. Réessayez.",
  invalid: "Identifiants refusés.",
};

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { currentPassword?: string; username?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await changeCredentials({
    currentPassword: body.currentPassword ?? "",
    username: body.username ?? "",
    newPassword: body.newPassword ?? "",
  });

  if (!result.ok) {
    const status = result.reason === "unavailable" ? 503 : result.reason === "current" ? 401 : 400;
    return NextResponse.json({ error: MESSAGES[result.reason] }, { status });
  }

  // Refresh this session so changing the password doesn't sign the owner out.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions);
  return response;
}
