import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(settings);
  const map = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return NextResponse.json({
    deliveryFeeInsideDhaka: Number(map.delivery_fee_inside_dhaka || 80),
    deliveryFeeOutsideDhaka: Number(map.delivery_fee_outside_dhaka || 120),
    freeShippingThreshold: Number(map.free_shipping_threshold || 2000),
    bkashNumber: map.bkash_number || "",
    nagadNumber: map.nagad_number || "",
  });
}