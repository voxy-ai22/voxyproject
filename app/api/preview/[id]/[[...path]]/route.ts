import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/server/db";
import { collections } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path?: string[] }> }
) {
  const { id, path: filePath } = await params;
  
  const storageRoot = process.env.STORAGE_PATH || "./storage";
  const runId = id; // This is the storagePath stored in DB
  
  const targetPath = filePath ? filePath.join("/") : "index.html";
  const absolutePath = path.join(process.cwd(), storageRoot, "run", runId, targetPath);

  if (!fs.existsSync(absolutePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".json": "application/json",
  };

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    },
  });
}

