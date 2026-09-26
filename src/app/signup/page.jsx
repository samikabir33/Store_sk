"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Signup failed.");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl mb-1">Create Account</h1>
      <p className="text-sm text-muted mb-6">Join Fahmida's Fashion for faster checkout and order tracking.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter your full name" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 6 characters" />
        </div>
        {error && <p className="text-sm text-pink-deep">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-muted mt-5 text-center">
        Already have an account? <Link href="/login" className="text-pink-deep font-semibold">Login</Link>
      </p>
    </main>
  );
}
