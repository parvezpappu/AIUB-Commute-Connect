"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resendVerificationOtp, verifyEmail } from "../lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsVerifying(true);

    try {
      await verifyEmail({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
      });
      window.alert("Email verified successfully. You can now login.");
      router.push("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      await resendVerificationOtp(formData.email.trim());
      setMessage("A new OTP has been sent.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Verify email
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the 6-digit OTP sent to your email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              placeholder="student@aiub.edu"
            />
          </div>

          <div>
            <label
              htmlFor="otp"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              OTP
            </label>
            <input
              id="otp"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              placeholder="123456"
              maxLength={6}
            />
          </div>

          {message && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isVerifying ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !formData.email.trim()}
          className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {isResending ? "Sending..." : "Resend OTP"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-slate-900">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
