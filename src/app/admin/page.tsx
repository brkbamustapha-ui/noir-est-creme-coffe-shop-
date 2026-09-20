import { fetchMenu } from "@/lib/menu";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration — Noir et Crème",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { sections, settings, offline } = await fetchMenu();
  return <AdminDashboard sections={sections} settings={settings} offline={offline} />;
}
