import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { nanoid } from "nanoid";
import { getSession, requireRole } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(coupons);
  return NextResponse.json({ coupons: rows });
}

export async function POST(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, type, value } = await req.json();
  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: "Code, type and value are required." }, { status: 400 });
  }

  await db.insert(coupons).values({
    id: nanoid(),
    code: code.toUpperCase(),
    type,
    value: Number(value),
    active: 1,
    expiresAt: null,
  });

  return NextResponse.json({ ok: true });
}
