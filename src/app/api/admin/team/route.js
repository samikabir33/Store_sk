import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";
import { canManageAdmins, ADMIN_ROLES } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  if (!canManageAdmins(session)) return NextResponse.json({ error: "You don't have permission to view this." }, { status: 403 });

  const rows = await db.select().from(users).where(inArray(users.role, ["admin", "owner"]));
  return NextResponse.json({ team: rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, adminRole: u.adminRole })) });
}

export async function POST(req) {
  const session = await getSession();
  if (!canManageAdmins(session)) return NextResponse.json({ error: "You don't have permission to add admins." }, { status: 403 });

  const { name, email, password, adminRole } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }
  if (!ADMIN_ROLES.includes(adminRole)) {
    return NextResponse.json({ error: "Please choose a valid admin role." }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) return NextResponse.json({ error: "This email is already in use." }, { status: 409 });

  await db.insert(users).values({
    id: nanoid(),
    name,
    email,
    phone: null,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "admin",
    adminRole,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
