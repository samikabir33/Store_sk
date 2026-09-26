"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("done");
      setMessage(data.alreadySubscribed ? "You're already subscribed!" : "Thanks for joining!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section className="px-5 md:px-8 pb-8 md:pb-10 max-w-[1280px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-blush px-6 md:px-10 py-9 md:py-12 text-center">
        <div className="relative z-10 max-w-[480px] mx-auto">
          <div className="font-script text-4xl md:text-5xl text-rose-deep mb-2">
            Fahmida's Fashion
          </div>
          <p className="font-sans text-[12.5px] md:text-sm text-ink/80 mb-5">
            Subscribe to get the latest updates and new coupons.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-[420px] mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 px-4 py-3 rounded-md border-none text-xs text-ink outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-charcoal text-white px-6 rounded-md text-xs font-bold tracking-wide disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Join"}
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-[11.5px] ${status === "error" ? "text-rose-deep font-semibold" : "text-ink/70"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
