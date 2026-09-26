import { NextResponse } from "next/server";
import { db, sqlite } from "@/db";
import { orders, orderItems, products, settings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";
import { genOrderNumber } from "@/lib/utils";

export async function POST(req) {
  const body = await req.json();
  const {
    items, // [{productId, name, price, qty, size, color}]
    customerName,
    phone,
    email,
    detailedAddress,
    district,
    thana,
    deliveryArea, // inside_dhaka | outside_dhaka
    altPhone,
    deliveryNote,
    paymentMethod,
    transactionId,
    senderNumberLast4,
    couponCode,
    discount = 0,
  } = body;

  if (!items?.length || !customerName || !phone || !detailedAddress || !district || !thana || !deliveryArea || !paymentMethod) {
    return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
  }

  if (paymentMethod !== "cod") {
    if (!transactionId?.trim() || !senderNumberLast4?.trim()) {
      return NextResponse.json(
        { error: "Transaction ID and the sender number's last 4 digits are required for bKash/Nagad payments." },
        { status: 400 }
      );
    }
    if (!/^\d{4}$/.test(senderNumberLast4.trim())) {
      return NextResponse.json({ error: "Sender number's last 4 digits must be exactly 4 numbers." }, { status: 400 });
    }
  }

  // Validate stock
  for (const item of items) {
    const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
    if (!product || product.stock < item.qty) {
      return NextResponse.json(
        { error: `${item.name} doesn't have enough stock available.` },
        { status: 409 }
      );
    }
  }

  const settingRows = await db.select().from(settings);
  const settingsMap = {};
  settingRows.forEach((r) => (settingsMap[r.key] = r.value));
  const feeInside = Number(settingsMap.delivery_fee_inside_dhaka || 80);
  const feeOutside = Number(settingsMap.delivery_fee_outside_dhaka || 120);
  const freeThreshold = Number(settingsMap.free_shipping_threshold || 2000);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  let deliveryFee = deliveryArea === "inside_dhaka" ? feeInside : feeOutside;
  if (subtotal >= freeThreshold) deliveryFee = 0;
  const total = subtotal + deliveryFee - (discount || 0);

  const session = await getSession();
  const orderId = nanoid();
  const orderNumber = genOrderNumber();

  const runTxn = sqlite.transaction(() => {
    db.insert(orders)
      .values({
        id: orderId,
        orderNumber,
        userId: session?.id || null,
        customerName,
        phone,
        email: email || null,
        detailedAddress,
        district,
        thana,
        deliveryArea,
        altPhone: altPhone || null,
        deliveryNote: deliveryNote || null,
        paymentMethod,
        transactionId: paymentMethod !== "cod" ? transactionId.trim() : null,
        senderNumberLast4: paymentMethod !== "cod" ? senderNumberLast4.trim() : null,
        paymentVerified: 0,
        couponCode: couponCode || null,
        subtotal,
        deliveryFee,
        discount: discount || 0,
        total,
        status: "pending",
        createdAt: Date.now(),
      })
      .run();

    for (const item of items) {
      db.insert(orderItems)
        .values({
          id: nanoid(),
          orderId,
          productId: item.productId,
          productName: item.name,
          price: item.price,
          qty: item.qty,
          size: item.size || null,
          color: item.color || null,
        })
        .run();

      sqlite
        .prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
        .run(item.qty, item.productId);
    }
  });

  runTxn();

  return NextResponse.json({ ok: true, orderNumber, orderId, total });
}

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const order = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).get();
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return NextResponse.json({ order, items });
  }

  if (["admin", "owner"].includes(session.role)) {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return NextResponse.json({ orders: rows });
  }

  const rows = await db.select().from(orders).where(eq(orders.userId, session.id)).orderBy(desc(orders.createdAt));
  return NextResponse.json({ orders: rows });
}