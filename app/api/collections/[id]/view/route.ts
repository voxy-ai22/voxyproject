import { NextRequest, NextResponse } from "next/server";
import { incrementProjectViews } from "@/lib/stats";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await incrementProjectViews(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
