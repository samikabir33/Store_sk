export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Fahmida's Fashion. Reach us via WhatsApp, phone, or our contact form for order support, product inquiries, or any assistance you need.",
};

export default function ContactPage() {
  return (
    <main className="max-w-[500px] mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl mb-4">Contact Us</h1>
      <div className="space-y-3 text-sm">
        <div className="card p-4"><strong>Phone:</strong> 01622132041</div>
        <div className="card p-4"><strong>WhatsApp:</strong> 01622132041</div>
        <div className="card p-4"><strong>Email:</strong> fahmidaselegance@gmail.com</div>
        <div className="card p-4"><strong>Facebook:</strong> facebook.com/1fahmidasfashion</div>
        <div className="card p-4"><strong>Instagram:</strong> instagram.com/fahmida.s_fashion</div>
        <div className="card p-4"><strong>Address:</strong> Dhaka, Bangladesh</div>
      </div>
    </main>
  );
}
