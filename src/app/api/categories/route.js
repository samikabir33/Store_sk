import { NextResponse } from "next/server";
import { getCategoryTree } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getCategoryTree();
  return NextResponse.json({ categories });
}
