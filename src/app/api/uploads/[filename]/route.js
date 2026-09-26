import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(req, { params }) {
  const { filename } = await params;

  // Basic safety: only allow simple filenames (no path traversal like ../../).
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "data", "uploads", filename);

  try {
    const file = await readFile(filePath);
    const ext = filename.split(".").pop().toLowerCase();
    return new Response(file, {
      headers: {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
