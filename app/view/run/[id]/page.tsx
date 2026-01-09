import { db } from "@/server/db";
import { collections } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { incrementProjectViews } from "@/lib/stats";

export default async function ViewRunPage({
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

  if (project.type !== "run") {
    redirect(`/view/link/${id}`);
  }

  // Increment view count
  await incrementProjectViews(id);

  // The runner will serve index.html by default if no path is specified
  // but we explicitly point to it to be safe
  const runnerUrl = `/runner/${id}/index.html`;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background">
      <iframe
        src={runnerUrl}
        className="w-full h-full border-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      />
    </div>
  );
}
