import { NextResponse } from "next/server";
import { callAdminRpc, readJson, requireAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SettingsPayload = {
  shop_name?: string;
  slogan?: string;
  subtitle?: string;
  address?: string;
  hours?: string;
  phone?: string;
};

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await readJson<SettingsPayload>(request);
  if (!body) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  return callAdminRpc("noir_admin_save_settings", {
    p_shop: body.shop_name ?? "",
    p_slogan: body.slogan ?? "",
    p_subtitle: body.subtitle ?? "",
    p_address: body.address ?? "",
    p_hours: body.hours ?? "",
    p_phone: body.phone ?? "",
  });
}
