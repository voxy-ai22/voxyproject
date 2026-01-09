import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { collections } from "@/server/db/schema";
import { isAdmin } from "@/lib/auth-admin";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { incrementGlobalHits } from "@/lib/stats";

const LinkSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url(),
  tags: z.string().optional(),
});

export async function GET() {
  try {
    // Increment total hits on every browse
    await incrementGlobalHits();
    
    const all = await db.select().from(collections).orderBy(desc(collections.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, name, description, tags, link, thumbnail, storagePath } = body;

    const id = nanoid();
    const [newItem] = await db.insert(collections).values({
      id,
      type,
      name,
      description,
      tags,
      link,
      thumbnail,
      storagePath,
    }).returning();

    return NextResponse.json(newItem);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
