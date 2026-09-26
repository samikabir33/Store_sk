"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl mb-1">Forgot Password?</h1>
      <p className="text-sm text-muted mb-6">
        Enter your account email and we'll send you a 5-digit code to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        {error && <p className="text-sm text-pink-deep">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Code"}
        </button>
      </form>

      <p className="text-sm text-muted mt-5 text-center">
        Remembered your password? <Link href="/login" className="text-pink-deep font-semibold">Login</Link>
      </p>
    </main>
  );
}