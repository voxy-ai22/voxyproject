import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-admin";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const storageRoot = process.env.STORAGE_PATH || "./storage";
    const runId = nanoid();
    const runDir = path.join(storageRoot, "run", runId);

    if (!fs.existsSync(runDir)) {
      fs.mkdirSync(runDir, { recursive: true });
    }

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      if (files.length === 1 && file.name.endsWith(".zip")) {
        const zip = new AdmZip(buffer);
        zip.extractAllTo(runDir, true);
      } else {
        // Support folder structure if webkitRelativePath is sent (often via filename in some implementations)
        // or just save the file. If multiple files are uploaded via 'webkitdirectory', 
        // some clients send the path in the name.
        const filePath = path.join(runDir, file.name);
        const fileDir = path.dirname(filePath);
        
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, buffer);
      }
    }

    return NextResponse.json({ 
      storagePath: runId,
      message: "Uploaded successfully" 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
