import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });

  const coupon = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).get();
  if (!coupon || coupon.active !== 1) {
    return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    return NextResponse.json({ error: "This coupon has expired." }, { status: 404 });
  }

  const discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;

  return NextResponse.json({ code: coupon.code, discount });
}
