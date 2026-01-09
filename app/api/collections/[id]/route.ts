import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { collections } from "@/server/db/schema";
import { isAdmin } from "@/lib/auth-admin";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await db.query.collections.findFirst({
    where: eq(collections.id, id),
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(collections).where(eq(collections.id, id));

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(collections)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(collections.id, id))
    .returning();

  return NextResponse.json(updated);
}
