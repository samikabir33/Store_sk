"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  async function handleResend() {
    setResendMsg("");
    setResending(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setResendMsg("A new code has been sent.");
  }

  if (success) {
    return (
      <main className="max-w-[420px] mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="font-serif text-xl mb-2">Password Reset!</h1>
        <p className="text-sm text-muted">Redirecting you to login...</p>
      </main>
    );
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl mb-1">Enter Code</h1>
      <p className="text-sm text-muted mb-6">
        We emailed a 5-digit code to your address. Enter it below along with your new password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
        </div>
        <div>
          <label className="label">5-Digit Code</label>
          <input
            className="input tracking-[6px] text-center font-bold"
            required
            maxLength={5}
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="00000"
          />
        </div>
        <div>
          <label className="label">New Password</label>
          <input className="input" type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input className="input" type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-pink-deep">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="text-center mt-5 space-y-2">
        <button onClick={handleResend} disabled={resending} className="text-sm text-pink-deep font-semibold underline">
          {resending ? "Sending..." : "Didn't get a code? Resend"}
        </button>
        {resendMsg && <p className="text-xs text-muted">{resendMsg}</p>}
        <p className="text-sm text-muted">
          <Link href="/login" className="text-pink-deep font-semibold">Back to Login</Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}