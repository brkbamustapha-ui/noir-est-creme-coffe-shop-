import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./auth";
import { adminToken, getSupabase } from "./supabase";

export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies();
  const ok = await verifySession(store.get(SESSION_COOKIE)?.value);
  return ok ? null : NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

/** Calls a SECURITY DEFINER admin RPC, injecting the server-only secret. */
export async function callAdminRpc(
  fn: string,
  args: Record<string, unknown>,
): Promise<NextResponse> {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Base de données non configurée (variables Supabase manquantes)." },
      { status: 503 },
    );
  }

  const token = adminToken();
  if (!token) {
    return NextResponse.json(
      { error: "SUPABASE_ADMIN_TOKEN manquant côté serveur." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc(fn, { p_token: token, ...args });

  if (error) {
    const message = error.message || "";
    if (message.includes("unauthorized")) {
      return NextResponse.json({ error: "Jeton serveur refusé." }, { status: 403 });
    }
    if (message.includes("name_required")) {
      return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
    }
    if (message.includes("bad_image_url")) {
      return NextResponse.json(
        { error: "Lien de photo invalide : utilisez /menu/... ou une adresse https." },
        { status: 400 },
      );
    }
    if (message.includes("not_found")) {
      return NextResponse.json({ error: "Élément introuvable." }, { status: 404 });
    }
    if (message.includes("duplicate key")) {
      return NextResponse.json({ error: "Ce nom de catégorie existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ error: message || "Erreur base de données." }, { status: 500 });
  }

  // push the change to the public menu without waiting for the 30s window
  revalidatePath("/");
  return NextResponse.json({ data });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
