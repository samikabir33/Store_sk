"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl mb-1">Welcome Back</h1>
      <p className="text-sm text-muted mb-6">Login to your Fahmida's Fashion account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="label">Password</label>
            <Link href="/forgot-password" className="text-xs text-pink-deep font-semibold">Forgot Password?</Link>
          </div>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-pink-deep">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-muted mt-5 text-center">
        Don't have an account? <Link href="/signup" className="text-pink-deep font-semibold">Sign up</Link>
      </p>
    </main>
  );
}