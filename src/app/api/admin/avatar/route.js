import { NextResponse } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { db } from "@/db";
import { users, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be smaller than 5MB." }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filename = `${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  const url = `/api/uploads/${filename}`;

  // The env-based Owner account has no row in the DB (see /api/auth/login),
  // so its avatar is stored as a key in the generic settings table instead.
  if (session.role === "owner") {
    await db
      .insert(settings)
      .values({ key: "owner_avatar_url", value: url })
      .onConflictDoUpdate({ target: settings.key, set: { value: url } });
  } else {
    await db.update(users).set({ avatarUrl: url }).where(eq(users.id, session.id));
  }

  return NextResponse.json({ url });
}
