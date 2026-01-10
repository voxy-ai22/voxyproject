import { NextRequest, NextResponse } from "next/server";
import { 
  getF2WStatus, 
  recordFailedAttempt, 
  resetAttempts, 
  signJWT 
} from "@/lib/auth-jwt";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { key } = await request.json();

    // Check F2W Status
    const status = await getF2WStatus(ip);
    if (status.locked) {
      return NextResponse.json({
        ok: false,
        error: "locked",
        remaining: status.remaining,
      }, { status: 429 });
    }

    const ADMIN_KEY = process.env.ADMIN_KEY || "";
    const F2W_KEY = process.env.F2W_KEY || "";

    if (key === ADMIN_KEY || key === F2W_KEY) {
      // Success
      await resetAttempts(ip);
      
      const token = await signJWT({
        role: "admin",
        loginAt: Date.now()
      });

      const cookieStore = await cookies();
      cookieStore.set("voxy_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 // 1 day default matching SESSION_EXPIRES=1d
      });

      return NextResponse.json({ ok: true });
    }

    // Failure
    const failureResult = await recordFailedAttempt(ip);
    
    if (failureResult.locked) {
      return NextResponse.json({
        ok: false,
        error: "locked",
        remaining: failureResult.remaining,
      }, { status: 429 });
    }

    return NextResponse.json({
      ok: false,
      error: "wrong-key",
      attempts: failureResult.failedAttempts,
    }, { status: 401 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      ok: false,
      error: "server-error",
    }, { status: 500 });
  }
}
