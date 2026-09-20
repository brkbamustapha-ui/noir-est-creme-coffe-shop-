import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { adminToken, getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/webp", "image/jpeg", "image/png"]);
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = getSupabase();
  const token = adminToken();
  if (!supabase || !token) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envoi invalide." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format non accepté. Utilisez JPG, PNG ou WebP." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Photo trop lourde (3 Mo maximum après compression)." },
      { status: 413 },
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const { data, error } = await supabase.rpc("noir_admin_save_photo", {
    p_token: token,
    p_mime: file.type,
    p_base64: base64,
  });

  if (error) {
    const message = error.message || "";
    if (message.includes("unauthorized")) {
      return NextResponse.json({ error: "Jeton serveur refusé." }, { status: 403 });
    }
    if (message.includes("image_too_large")) {
      return NextResponse.json({ error: "Photo trop lourde." }, { status: 413 });
    }
    if (message.includes("bad_image_type") || message.includes("empty_image")) {
      return NextResponse.json({ error: "Fichier image invalide." }, { status: 400 });
    }
    return NextResponse.json({ error: message || "Envoi impossible." }, { status: 500 });
  }

  // Housekeeping: drop photos no product points at any more. Never fatal, so
  // the returned error is deliberately ignored.
  await supabase.rpc("noir_admin_prune_photos", { p_token: token });

  return NextResponse.json({ url: `/api/photo/${data}` });
}
