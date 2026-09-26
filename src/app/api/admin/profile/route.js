import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, setSessionCookie } from "@/lib/auth";

export async function PATCH(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Owner details (name/email) live in environment variables, not the DB.
  if (session.role === "owner") {
    return NextResponse.json(
      { error: "Owner details are set via environment variables and can't be edited here." },
      { status: 400 }
    );
  }

  const { name, phone } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ name: name.trim(), phone: phone?.trim() || null })
    .where(eq(users.id, session.id));

  // Refresh the session cookie so the new name shows up immediately (sidebar, topbar, etc.)
  await setSessionCookie({
    id: session.id,
    email: session.email,
    role: session.role,
    adminRole: session.adminRole || null,
    name: name.trim(),
  });

  return NextResponse.json({ ok: true, name: name.trim(), phone: phone?.trim() || null });
}
