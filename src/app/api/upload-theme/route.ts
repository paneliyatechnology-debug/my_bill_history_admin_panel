import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import * as path from "path";

export const dynamic = "force-dynamic";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: `Invalid file type "${file.type}". Allowed: JPG, PNG, WebP` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 5MB` },
        { status: 400 }
      );
    }

    // Generate a unique filename: timestamp_originalname
    const ext = path.extname(file.name) || ".jpg";
    const baseName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50);
    const uniqueName = `${baseName}_${Date.now()}${ext}`;

    // Read file bytes buffer once
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to all relevant project locations (superadmin, client frontend, backend)
    const targetDirs = [
      path.join(process.cwd(), "public", "themes"),
      path.resolve(process.cwd(), "..", "Billing_frontend", "public", "themes"),
      path.resolve(process.cwd(), "..", "Billing_backend", "public", "themes"),
    ];

    for (const dir of targetDirs) {
      try {
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, uniqueName), buffer);
      } catch (writeErr) {
        console.warn(`[upload-theme] Could not write to ${dir}:`, writeErr);
      }
    }

    // Generate Data URL for serverless/Vercel zero-404 compatibility
    const mime = file.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

    // Return both Data URL and public URL path
    const publicUrl = `/themes/${uniqueName}`;

    return Response.json({
      success: true,
      url: dataUrl,
      dataUrl,
      publicUrl,
      fileName: uniqueName,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Theme upload error:", error);
    return Response.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
