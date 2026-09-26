import { NextResponse } from "next/server";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// Ensures a customer can only ever touch their own saved addresses.
async function ownedAddress(id, userId) {
  return db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId))).get();
}

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAddress(id, session.id);
  if (!existing) return NextResponse.json({ error: "Address not found." }, { status: 404 });

  const body = await req.json();
  const update = {};
  if (body.label !== undefined) update.label = body.label.trim() || "Home";
  if (body.detailedAddress !== undefined) update.detailedAddress = body.detailedAddress.trim();
  if (body.district !== undefined) update.district = body.district.trim();
  if (body.thana !== undefined) update.thana = body.thana.trim();
  if (body.deliveryArea !== undefined) update.deliveryArea = body.deliveryArea === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka";
  if (body.altPhone !== undefined) update.altPhone = body.altPhone?.trim() || null;

  if (body.isDefault !== undefined) {
    if (body.isDefault) {
      // Only one default at a time.
      await db.update(addresses).set({ isDefault: 0 }).where(eq(addresses.userId, session.id));
      update.isDefault = 1;
    } else {
      update.isDefault = 0;
    }
  }

  await db.update(addresses).set(update).where(eq(addresses.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAddress(id, session.id);
  if (!existing) return NextResponse.json({ error: "Address not found." }, { status: 404 });

  await db.delete(addresses).where(eq(addresses.id, id));

  // If the deleted address was the default and other addresses remain,
  // promote the most recently added one so there's always a default.
  if (existing.isDefault === 1) {
    const remaining = await db.select().from(addresses).where(eq(addresses.userId, session.id));
    if (remaining.length > 0) {
      await db.update(addresses).set({ isDefault: 1 }).where(eq(addresses.id, remaining[0].id));
    }
  }

  return NextResponse.json({ ok: true });
}
