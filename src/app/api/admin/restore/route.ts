import { NextResponse } from "next/server";
import { callAdminRpc, requireAdmin } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Puts back products present in the reference snapshot but missing from the card. */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return callAdminRpc("noir_admin_restore_menu", {});
}
