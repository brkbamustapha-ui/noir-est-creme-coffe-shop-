import { NextResponse } from "next/server";
import { callAdminRpc, readJson, requireAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CategoryPayload = {
  id?: string | null;
  slug?: string;
  name?: string;
  tagline?: string;
  layout?: "list" | "cards";
  sort_order?: number;
  is_visible?: boolean;
};

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await readJson<CategoryPayload>(request);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }

  return callAdminRpc("noir_admin_save_category", {
    p_id: body.id || null,
    p_slug: body.slug ?? "",
    p_name: body.name,
    p_tagline: body.tagline ?? "",
    p_layout: body.layout === "cards" ? "cards" : "list",
    p_sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
    p_visible: body.is_visible ?? true,
  });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  return callAdminRpc("noir_admin_delete_category", { p_id: id });
}
