import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, setSessionCookie } from "@/lib/auth";

const VALID_GENDERS = ["male", "female", "other", ""];

export async function PATCH(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.role === "owner") {
    return NextResponse.json(
      { error: "Owner details are set via environment variables and can't be edited here." },
      { status: 400 }
    );
  }

  const { name, phone, dateOfBirth, gender } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
  }
  if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
    return NextResponse.json({ error: "Invalid gender value." }, { status: 400 });
  }

  const cleanName = name.trim();
  await db
    .update(users)
    .set({
      name: cleanName,
      phone: phone?.trim() || null,
      dateOfBirth: dateOfBirth?.trim() || null,
      gender: gender || null,
    })
    .where(eq(users.id, session.id));

  // Refresh the session cookie so the new name shows up immediately (header, footer, etc.)
  await setSessionCookie({
    id: session.id,
    email: session.email,
    role: session.role,
    adminRole: session.adminRole || null,
    name: cleanName,
  });

  return NextResponse.json({ ok: true });
}
