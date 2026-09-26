import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { active } = await req.json();
  await db.update(coupons).set({ active: active ? 1 : 0 }).where(eq(coupons.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(coupons).where(eq(coupons.id, id));
  return NextResponse.json({ ok: true });
}
