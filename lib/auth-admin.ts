import { getAdminSession } from "./auth-jwt";
import { cookies } from "next/headers";

export async function isAdmin() {
  const session = await getAdminSession();
  return session?.role === "admin";
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("voxy_session");
}

// Keep setAdminSession but it's now handled in the login API with JWT
// This is just for backward compatibility if used elsewhere
export async function setAdminSession() {
  // Logic moved to API login for better control over JWT payload
}
