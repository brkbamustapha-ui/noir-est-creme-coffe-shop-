import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("noir_photo_get", { p_id: id });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.base64) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const bytes = Buffer.from(row.base64, "base64");

  // A photo's bytes never change: a replacement gets a fresh id, so this is
  // safe to cache hard at the edge and in the browser.
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
