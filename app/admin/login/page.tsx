import { getAdminSession } from "@/lib/auth-jwt";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  // Redirect if session active
  if (session?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Selamat Datang di Voxy Project!
            </h1>
            <p className="text-blue-600">
              Masukkan Admin Key untuk melanjutkan.
            </p>
          </div>

          <AdminLoginForm />

          <div className="mt-8 text-center text-sm text-blue-400">
            © 2026 Voxy Project — All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
