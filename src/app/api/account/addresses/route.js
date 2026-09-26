import { NextResponse } from "next/server";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(addresses).where(eq(addresses.userId, session.id)).orderBy(desc(addresses.isDefault));
  return NextResponse.json({ addresses: rows });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, detailedAddress, district, thana, deliveryArea, altPhone, isDefault } = await req.json();
  if (!detailedAddress?.trim() || !district?.trim() || !thana?.trim()) {
    return NextResponse.json({ error: "Detailed address, district, and thana are required." }, { status: 400 });
  }

  const id = nanoid();
  const makeDefault = !!isDefault;

  if (makeDefault) {
    await db.update(addresses).set({ isDefault: 0 }).where(eq(addresses.userId, session.id));
  }

  await db.insert(addresses).values({
    id,
    userId: session.id,
    label: label?.trim() || "Home",
    detailedAddress: detailedAddress.trim(),
    district: district.trim(),
    thana: thana.trim(),
    deliveryArea: deliveryArea === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
    altPhone: altPhone?.trim() || null,
    isDefault: makeDefault ? 1 : 0,
  });

  // If this is the customer's very first saved address, make it the default
  // automatically so checkout always has something to prefill from.
  const existing = await db.select().from(addresses).where(eq(addresses.userId, session.id));
  if (existing.length === 1 && !makeDefault) {
    await db.update(addresses).set({ isDefault: 1 }).where(eq(addresses.id, id));
  }

  return NextResponse.json({ ok: true, id });
}
