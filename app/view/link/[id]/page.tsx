import { db } from "@/server/db";
import { collections } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { incrementProjectViews } from "@/lib/stats";

export default async function ViewLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.query.collections.findFirst({
    where: eq(collections.id, id),
  });

  if (!project) {
    notFound();
  }

  if (project.type !== "link") {
    redirect(`/view/run/${id}`);
  }

  if (!project.link) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 border rounded-lg bg-card">
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-muted-foreground">This project does not have a valid link.</p>
        </div>
      </div>
    );
  }

  // Increment view count
  await incrementProjectViews(id);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background">
      <iframe
        src={project.link}
        className="w-full h-full border-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      />
    </div>
  );
}
