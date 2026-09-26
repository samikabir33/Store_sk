import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendOtpEmail } from "@/lib/email";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get();

  // Always respond the same way, whether or not the account exists,
  // so people can't use this to check which emails are registered.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const otp = String(Math.floor(10000 + Math.random() * 90000)); // 5-digit code

  await db.insert(passwordResets).values({
    id: nanoid(),
    userId: user.id,
    email: user.email,
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    used: 0,
    createdAt: Date.now(),
  });

  await sendOtpEmail({ to: user.email, name: user.name, otp });

  return NextResponse.json({ ok: true });
}