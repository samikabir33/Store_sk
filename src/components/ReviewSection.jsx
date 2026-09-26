"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function Stars({ value, size = "text-sm" }) {
  return (
    <span className={`${size} text-gold`}>
      {"★".repeat(Math.round(value))}
      <span className="text-line">{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export default function ReviewSection({ productId, isLoggedIn, hasPurchased, alreadyReviewed }) {
  const [data, setData] = useState({ reviews: [], count: 0, average: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(alreadyReviewed);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/reviews?productId=${productId}`).then((r) => r.json());
    setData(r);
    setLoading(false);
  }
  useEffect(() => { load(); }, [productId]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });
    const result = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(result.error);
      return;
    }
    setPosted(true);
    setComment("");
    load();
  }

  return (
    <section className="mt-10 pt-8 border-t border-line">
      <h2 className="font-serif text-xl mb-4">Customer Reviews</h2>

      {!loading && (
        <div className="flex items-center gap-3 mb-6">
          <Stars value={data.average} size="text-lg" />
          <span className="text-sm font-bold">{data.average.toFixed(1)} / 5</span>
          <span className="text-xs text-muted">({data.count} review{data.count === 1 ? "" : "s"})</span>
        </div>
      )}

      <div className="card p-4 mb-6 max-w-lg">
        {posted ? (
          <p className="text-sm text-green-700">✓ Thanks — your review has been posted.</p>
        ) : !isLoggedIn ? (
          <p className="text-sm text-muted">
            <Link href="/login" className="text-pink-deep font-semibold">Login</Link> to write a review — only customers who purchased this item can review it.
          </p>
        ) : !hasPurchased ? (
          <p className="text-sm text-muted">Only customers who have purchased this product can write a review.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="text-xs font-sans font-semibold">Verified Buyer — Write a Review</div>
            <div className="flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className={n <= rating ? "text-gold" : "text-line"}
                  aria-label={`${n} star`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="input h-20 resize-none"
              placeholder="Share your experience with this product (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {error && <p className="text-xs text-pink-deep">{error}</p>}
            <button className="btn-primary !py-2 !px-5 !text-xs" disabled={submitting}>
              {submitting ? "Posting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {!loading && data.reviews.length === 0 && (
          <p className="text-sm text-muted">No reviews yet — be the first buyer to review this product.</p>
        )}
        {data.reviews.map((r) => (
          <div key={r.id} className="border-b border-line pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold">{r.customerName}</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Verified Buyer</span>
            </div>
            <Stars value={r.rating} />
            {r.comment && <p className="text-sm text-muted mt-1.5">{r.comment}</p>}
            <div className="text-[11px] text-muted mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}