import { fetchMenu, fetchMissingCount } from "@/lib/menu";
import { currentUsername } from "@/lib/credentials";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration — Noir et Crème",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [{ sections, settings, offline }, missingCount, username] = await Promise.all([
    fetchMenu(),
    fetchMissingCount(),
    currentUsername(),
  ]);
  return (
    <AdminDashboard
      sections={sections}
      settings={settings}
      offline={offline}
      missingCount={missingCount}
      username={username}
    />
  );
}
