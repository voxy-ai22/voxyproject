import { getAdminSession } from "@/lib/auth-jwt";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  // Protect route
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminDashboardClient />
    </div>
  );
}
