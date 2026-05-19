"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resendVerificationOtp, verifyEmail } from "../lib/api";

const OTP_EXPIRY_SECONDS = 5 * 60;

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

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
  const [remainingSeconds, setRemainingSeconds] = useState(OTP_EXPIRY_SECONDS);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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
      window.alert("Registration successful");
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
      setRemainingSeconds(OTP_EXPIRY_SECONDS);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] px-4 py-10 text-[#07131a]">
      <section className="mx-auto max-w-md rounded-[24px] border border-[#1d5d82] bg-[#abc9d3] p-6 shadow-2xl shadow-[#07131a]/10">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#07131a]">
            Verify email
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#4f6268]">
            Enter the 6-digit OTP sent to your email address.
          </p>
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-black ${
              remainingSeconds > 0
                ? "border-[#8ed8ff]/40 bg-[#e8eef0] text-[#244b58]"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {remainingSeconds > 0
              ? `Remaining: ${formatCountdown(remainingSeconds)}`
              : "OTP expired. Please resend OTP."}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-black text-[#244b58]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
              placeholder="student@aiub.edu"
            />
          </div>

          <div>
            <label
              htmlFor="otp"
              className="mb-1.5 block text-sm font-black text-[#244b58]"
            >
              OTP
            </label>
            <input
              id="otp"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
              placeholder="123456"
              maxLength={6}
            />
          </div>

          {message && (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying || remainingSeconds === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#07131a] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#07131a]/15 transition hover:bg-[#0b1d25] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isVerifying ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !formData.email.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#07131a]/15 bg-white px-5 py-3 text-sm font-black text-[#07131a] transition hover:border-[#07131a]/40 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {isResending ? "Sending..." : "Resend OTP"}
        </button>

        <p className="mt-5 text-center text-sm font-semibold text-[#4f6268]">
          Already verified?{" "}
          <Link href="/login" className="font-black text-[#07131a]">
            Login
          </Link>
        </p>
      </section>

    </main>
  );
}



