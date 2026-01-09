import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-jwt";
import { getAdminStats } from "@/lib/stats";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
