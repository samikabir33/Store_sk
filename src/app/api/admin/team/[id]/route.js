import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { canManageAdmins } from "@/lib/permissions";

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!canManageAdmins(session)) return NextResponse.json({ error: "You don't have permission to remove admins." }, { status: 403 });

  const { id } = await params;
  const target = await db.select().from(users).where(eq(users.id, id)).get();
  if (target?.role === "owner") {
    return NextResponse.json({ error: "Owner accounts cannot be removed." }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
