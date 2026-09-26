import Link from "next/link";

export default async function OrderConfirmationPage({ searchParams }) {
  const sp = await searchParams;
  const orderNumber = sp?.orderNumber;

  return (
    <main className="max-w-[500px] mx-auto px-6 py-16 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="font-serif text-2xl mb-2">Order Placed!</h1>
      <p className="text-sm text-muted mb-1">Thank you for shopping with Fahmida's Fashion.</p>
      {orderNumber && (
        <p className="text-sm font-bold text-pink-deep mb-6">Order No: {orderNumber}</p>
      )}
      <p className="text-xs text-muted mb-8">We'll call you shortly to confirm your order. You can track your order status anytime.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/track-order" className="btn-outline">Track Order</Link>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </main>
  );
}
