import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const email = (body?.email || "").trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .get();

  if (existing) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  await db.insert(newsletterSubscribers).values({
    id: nanoid(),
    email,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
