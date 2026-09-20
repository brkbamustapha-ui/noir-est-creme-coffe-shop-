import { NextResponse } from "next/server";
import { callAdminRpc, readJson, requireAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ItemPayload = {
  id?: string | null;
  category_id?: string;
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  is_available?: boolean;
  sort_order?: number;
};

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await readJson<ItemPayload>(request);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }
  if (!body.id && !body.category_id) {
    return NextResponse.json({ error: "Catégorie manquante." }, { status: 400 });
  }

  return callAdminRpc("noir_admin_save_item", {
    p_id: body.id || null,
    p_category_id: body.category_id ?? null,
    p_name: body.name,
    p_description: body.description ?? "",
    p_price: body.price ?? "",
    p_image_url: body.image_url ?? "",
    p_available: body.is_available ?? true,
    p_sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
  });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  return callAdminRpc("noir_admin_delete_item", { p_id: id });
}
