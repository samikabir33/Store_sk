import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession, requireRole } from "@/lib/auth";

const VALID_POSITIONS = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];
function cleanPosition(v, fallback = "middle-left") {
  return VALID_POSITIONS.includes(v) ? v : fallback;
}

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(banners).orderBy(asc(banners.sortOrder));
  return NextResponse.json({ banners: rows });
}

export async function POST(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { placement, eyebrow, title, subtitle, imageUrl, linkUrl, buttonText, sortOrder, textPosition, buttonPosition } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Banner image URL is required." }, { status: 400 });
  }

  await db.insert(banners).values({
    id: nanoid(),
    placement: ["promo", "about"].includes(placement) ? placement : "hero",
    eyebrow: eyebrow || "",
    title: title || "",
    subtitle: subtitle || "",
    imageUrl,
    linkUrl: linkUrl || "/shop",
    buttonText: buttonText || "Shop Now",
    sortOrder: Number(sortOrder) || 0,
    active: 1,
    textPosition: cleanPosition(textPosition),
    buttonPosition: cleanPosition(buttonPosition, "bottom-left"),
  });

  return NextResponse.json({ ok: true });
}
