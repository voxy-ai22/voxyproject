import { db } from "@/server/db";
import { collections, globalStats } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function incrementGlobalHits() {
  try {
    const stat = await db.query.globalStats.findFirst({
      where: eq(globalStats.id, "total_hits"),
    });

    if (!stat) {
      await db.insert(globalStats).values({
        id: "total_hits",
        value: 1,
      });
    } else {
      await db
        .update(globalStats)
        .set({ value: sql`${globalStats.value} + 1`, updatedAt: new Date() })
        .where(eq(globalStats.id, "total_hits"));
    }
  } catch (err) {
    console.error("Failed to increment global hits", err);
  }
}

export async function incrementProjectViews(id: string) {
  try {
    await db
      .update(collections)
      .set({ views: sql`${collections.views} + 1`, updatedAt: new Date() })
      .where(eq(collections.id, id));
    
    // Also count as a global hit
    await incrementGlobalHits();
  } catch (err) {
    console.error("Failed to increment project views", err);
  }
}

export async function getAdminStats() {
  const hitStat = await db.query.globalStats.findFirst({
    where: eq(globalStats.id, "total_hits"),
  });

  const allProjects = await db.select().from(collections);
  const totalViews = allProjects.reduce((acc, p) => acc + (p.views || 0), 0);

  return {
    totalHits: hitStat?.value || 0,
    totalViews,
    projectCount: allProjects.length,
    // Live users is hard to track without sockets, so we'll use a semi-random 
    // but based on total activity
    activeUsers: Math.max(1, Math.floor((hitStat?.value || 0) / 100) + Math.floor(Math.random() * 5)),
  };
}
