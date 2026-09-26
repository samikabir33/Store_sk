import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // The Owner account lives only in environment variables (see /api/auth/login),
  // so there's no DB row to update its password on.
  if (session.role === "owner") {
    return NextResponse.json(
      { error: "The Owner password is set via environment variables and can't be changed here." },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  }

  const user = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, session.id));

  return NextResponse.json({ ok: true });
}
