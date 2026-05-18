"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  forgotPassword,
  resetPassword,
  verifyPasswordResetOtp,
} from "../lib/api";

const OTP_EXPIRY_SECONDS = 5 * 60;

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(OTP_EXPIRY_SECONDS);

  useEffect(() => {
    if (!isOtpSent || isOtpVerified) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOtpSent, isOtpVerified]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSendingOtp(true);

    try {
      await forgotPassword(formData.email.trim());
      setIsOtpSent(true);
      setIsOtpVerified(false);
      setRemainingSeconds(OTP_EXPIRY_SECONDS);
      setMessage("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsVerifyingOtp(true);

    try {
      await verifyPasswordResetOtp({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
      });
      setIsOtpVerified(true);
      setMessage("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsResetting(true);

    try {
      await resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      window.alert("Password reset successful");
      router.push("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsResetting(false);
    }
  }

  function getFormHandler() {
    if (!isOtpSent) {
      return handleSendOtp;
    }

    if (!isOtpVerified) {
      return handleVerifyOtp;
    }

    return handleResetPassword;
  }

  function getSubmitLabel() {
    if (!isOtpSent) {
      return isSendingOtp ? "Sending OTP..." : "Send OTP";
    }

    if (!isOtpVerified) {
      return isVerifyingOtp ? "Verifying..." : "Verify OTP";
    }

    return isResetting ? "Resetting..." : "Reset password";
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] px-3 py-6 sm:px-4 sm:py-10">
      <section className="mx-auto w-full max-w-md rounded-[24px] border border-white/20 bg-white/76 p-5 shadow-sm backdrop-blur sm:rounded-[28px] sm:p-6">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl font-semibold text-[#07131a]">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-[#4f6268]">
            Use your account email to receive a password reset OTP.
          </p>
        </div>

        <form onSubmit={getFormHandler()} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[#244b58]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#a0b7be] bg-white/82 px-3 py-2 text-[#07131a] outline-none focus:border-[#17303a]"
              placeholder="student@example.com"
              required
              disabled={isOtpSent}
            />
          </div>

          {isOtpSent && !isOtpVerified && (
            <>
              <div>
                <label
                  htmlFor="otp"
                  className="mb-1 block text-sm font-medium text-[#244b58]"
                >
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#a0b7be] bg-white/82 px-3 py-2 text-[#07131a] outline-none focus:border-[#17303a]"
                  maxLength={6}
                  required
                />
              </div>

              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-black ${
                  remainingSeconds > 0
                    ? "border-[#8ed8ff]/40 bg-[#e8eef0] text-[#244b58]"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {remainingSeconds > 0
                  ? `Remaining: ${formatCountdown(remainingSeconds)}`
                  : "OTP expired. Please request a new OTP."}
              </div>
            </>
          )}

          {isOtpVerified && (
            <>
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-[#244b58]"
                >
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#a0b7be] bg-white/82 px-3 py-2 text-[#07131a] outline-none focus:border-[#17303a]"
                  minLength={6}
                  maxLength={20}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-[#244b58]"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#a0b7be] bg-white/82 px-3 py-2 text-[#07131a] outline-none focus:border-[#17303a]"
                  required
                />
              </div>
            </>
          )}

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
            disabled={
              isSendingOtp ||
              isVerifyingOtp ||
              isResetting ||
              (isOtpSent && !isOtpVerified && remainingSeconds === 0)
            }
            className="w-full rounded-xl bg-[#07131a] px-4 py-2 font-medium text-white transition hover:bg-[#17303a] disabled:cursor-not-allowed disabled:bg-[#8aa0a8]"
          >
            {getSubmitLabel()}
          </button>
        </form>

        {isOtpSent && (
          <button
            type="button"
            onClick={() => {
              setIsOtpSent(false);
              setIsOtpVerified(false);
              setMessage("");
              setError("");
              setRemainingSeconds(OTP_EXPIRY_SECONDS);
            }}
            className="mt-3 w-full rounded-xl border border-[#a0b7be] px-4 py-2 text-sm font-medium text-[#244b58] transition hover:bg-white/60"
          >
            Use another email
          </button>
        )}

        <p className="mt-5 text-center text-sm text-[#4f6268]">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-[#07131a]">
            Login
          </Link>
        </p>
      </section>

    </main>
  );
}
