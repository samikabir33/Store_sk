import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(settings);
  const map = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return NextResponse.json({ settings: map });
}

export async function PUT(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json(); // { key: value, key2: value2, ... }

  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(settings)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(value) } });
  }

  return NextResponse.json({ ok: true });
}
