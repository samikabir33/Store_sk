import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, otp, newPassword } = await req.json();

  if (!email || !otp || !newPassword) {
    return NextResponse.json({ error: "Email, code and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const record = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.email, email), eq(passwordResets.otp, otp), eq(passwordResets.used, 0)))
    .orderBy(desc(passwordResets.createdAt))
    .get();

  if (!record) {
    return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });
  }
  if (record.expiresAt < Date.now()) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);

  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
  await db.update(passwordResets).set({ used: 1 }).where(eq(passwordResets.id, record.id));

  return NextResponse.json({ ok: true });
}