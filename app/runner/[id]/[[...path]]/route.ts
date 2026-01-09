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
  const { id, path: filePathSegments } = await params;
  
  // 1. Fetch project to get storagePath
  const project = await db.query.collections.findFirst({
    where: eq(collections.id, id)
  });

  if (!project || project.type !== "run" || !project.storagePath) {
    return new NextResponse("Project not found or not a runner project", { status: 404 });
  }

  const storageRoot = process.env.STORAGE_PATH || "./storage";
  const storagePath = project.storagePath;
  
  // Default to index.html if path is empty
  const targetPath = filePathSegments && filePathSegments.length > 0 
    ? filePathSegments.join("/") 
    : "index.html";
    
  const absolutePath = path.join(process.cwd(), storageRoot, "run", storagePath, targetPath);

  if (!fs.existsSync(absolutePath)) {
    // If it's a directory, try adding index.html
    const indexPath = path.join(absolutePath, "index.html");
    if (fs.existsSync(indexPath)) {
      return serveFile(indexPath);
    }
    return new NextResponse("File not found", { status: 404 });
  }

  // Safety check: ensure the path is within the storageRoot
  const normalizedPath = path.normalize(absolutePath);
  const normalizedStorageRoot = path.normalize(path.join(process.cwd(), storageRoot, "run", storagePath));
  
  if (!normalizedPath.startsWith(normalizedStorageRoot)) {
    return new NextResponse("Access denied", { status: 403 });
  }

  // If absolutePath is a directory, Next.js fs.readFileSync might fail or return content of dir
  if (fs.statSync(absolutePath).isDirectory()) {
    const indexPath = path.join(absolutePath, "index.html");
    if (fs.existsSync(indexPath)) {
      return serveFile(indexPath);
    }
    return new NextResponse("File not found", { status: 404 });
  }

  return serveFile(absolutePath);
}

function serveFile(absolutePath: string) {
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
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
