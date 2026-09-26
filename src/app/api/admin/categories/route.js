import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { nanoid } from "nanoid";
import { getSession, requireRole } from "@/lib/auth";
import { getCategoryTree, makeUniqueSlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"]))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tree = await getCategoryTree({ withCounts: true });
  const flat = await db.select().from(categories);

  // `categories` = tree (new UI), `flat` = plain list (old code still works).
  return NextResponse.json({ categories: tree, flat });
}

export async function POST(req) {
  const session = await getSession();
  if (!requireRole(session, ["admin", "owner"]))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body?.name || "").trim();
  const parentId = body?.parentId || null;
  const imageUrl = (body?.imageUrl || "").trim();

  if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });

  const rows = await db.select().from(categories);

  if (parentId) {
    const parent = rows.find((c) => c.id === parentId);
    if (!parent) return NextResponse.json({ error: "Parent category not found." }, { status: 400 });
    if (parent.parentId)
      return NextResponse.json(
        { error: "Only 2 levels are supported — a sub-category cannot have its own sub-category." },
        { status: 400 }
      );
  }

  const duplicate = rows.find(
    (c) => (c.parentId || null) === parentId && c.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (duplicate)
    return NextResponse.json({ error: `"${name}" already exists here.` }, { status: 409 });

  const siblings = rows.filter((c) => (c.parentId || null) === parentId);
  const sortOrder = siblings.length ? Math.max(...siblings.map((c) => c.sortOrder ?? 0)) + 1 : 0;

  const id = nanoid();
  const slug = makeUniqueSlug(rows, name);

  await db.insert(categories).values({ id, name, slug, parentId, sortOrder, imageUrl });
  return NextResponse.json({ ok: true, id, slug });
}
