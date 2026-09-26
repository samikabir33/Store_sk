import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  const { name, email, phone, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const id = nanoid();
  const passwordHash = bcrypt.hashSync(password, 10);

  await db.insert(users).values({
    id,
    name,
    email,
    phone: phone || null,
    passwordHash,
    role: "customer",
    createdAt: Date.now(),
  });

  await setSessionCookie({ id, name, email, role: "customer" });

  return NextResponse.json({ ok: true, user: { id, name, email, role: "customer" } });
}
