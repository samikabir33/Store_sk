import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  const { email, password, requireStaff } = await req.json();

  // --- Owner login is NOT stored in the database at all. ---
  // Its credentials live only in Railway's environment variables
  // (OWNER_EMAIL / OWNER_PASSWORD), so they never touch git or the DB,
  // and changing them just means updating the env var + redeploy.
  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (ownerEmail && email === ownerEmail) {
    if (!ownerPassword || password !== ownerPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await setSessionCookie({ id: "env-owner", name: "Owner", email: ownerEmail, role: "owner" });
    return NextResponse.json({
      ok: true,
      user: { id: "env-owner", name: "Owner", email: ownerEmail, role: "owner" },
    });
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // The "owner" role may only authenticate via the env-based branch above.
  // Any leftover "owner" row in the DB (e.g. from an old seed) is not usable.
  if (user.role === "owner") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // requireStaff = true means this login attempt came from the Admin/Owner login page
  if (requireStaff && !["admin", "owner"].includes(user.role)) {
    return NextResponse.json({ error: "This account does not have staff access." }, { status: 403 });
  }

  await setSessionCookie({ id: user.id, name: user.name, email: user.email, role: user.role, adminRole: user.adminRole || null });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, adminRole: user.adminRole || null },
  });
}
