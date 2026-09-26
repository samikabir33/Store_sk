import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, requireRole } from "@/lib/auth";

const VALID_POSITIONS = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];
function cleanPosition(v, fallback = "middle-left") {
  return VALID_POSITIONS.includes(v) ? v : fallback;
}

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const update = {};
  if (body.placement !== undefined) update.placement = ["promo", "about"].includes(body.placement) ? body.placement : "hero";
  if (body.eyebrow !== undefined) update.eyebrow = body.eyebrow;
  if (body.title !== undefined) update.title = body.title;
  if (body.subtitle !== undefined) update.subtitle = body.subtitle;
  if (body.imageUrl !== undefined) update.imageUrl = body.imageUrl;
  if (body.linkUrl !== undefined) update.linkUrl = body.linkUrl;
  if (body.buttonText !== undefined) update.buttonText = body.buttonText;
  if (body.sortOrder !== undefined) update.sortOrder = Number(body.sortOrder) || 0;
  if (body.active !== undefined) update.active = body.active ? 1 : 0;
  if (body.textPosition !== undefined) update.textPosition = cleanPosition(body.textPosition);
  if (body.buttonPosition !== undefined) update.buttonPosition = cleanPosition(body.buttonPosition, "bottom-left");

  await db.update(banners).set(update).where(eq(banners.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(banners).where(eq(banners.id, id));
  return NextResponse.json({ ok: true });
}
