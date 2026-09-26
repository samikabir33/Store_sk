import StarRating from "@/components/StarRating";

// `items` = [{ id, rating, comment, customerName }]
export default function Testimonials({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-5 md:px-8 py-8 md:py-10 max-w-[1280px] mx-auto">
      <h2 className="font-sans text-[11px] md:text-xs font-extrabold tracking-[0.2em] text-center text-muted mb-6">
        WHAT OUR CUSTOMERS SAY
      </h2>
      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {items.map((r) => (
          <div key={r.id} className="bg-white border border-line rounded-xl p-5">
            <StarRating rating={r.rating} size={13} />
            <p className="text-[13px] text-ink leading-relaxed my-3">
              “{r.comment?.trim() || "Beautiful quality and fast delivery. Highly recommended!"}”
            </p>
            <div className="text-[11.5px] font-bold text-muted">{r.customerName}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
