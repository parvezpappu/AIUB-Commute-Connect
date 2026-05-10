"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { forgotPassword, resetPassword } from "../lib/api";

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
      setMessage("Password reset OTP sent to your email.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSendingOtp(false);
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
      window.alert("Password reset successfully. You can now login.");
      router.push("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your account email to receive a password reset OTP.
          </p>
        </div>

        <form
          onSubmit={isOtpSent ? handleResetPassword : handleSendOtp}
          className="space-y-4"
        >
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
              placeholder="student@example.com"
              required
              disabled={isOtpSent}
            />
          </div>

          {isOtpSent && (
            <>
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
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                  minLength={6}
                  maxLength={20}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
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
            disabled={isSendingOtp || isResetting}
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isOtpSent
              ? isResetting
                ? "Resetting..."
                : "Reset password"
              : isSendingOtp
                ? "Sending OTP..."
                : "Send OTP"}
          </button>
        </form>

        {isOtpSent && (
          <button
            type="button"
            onClick={() => {
              setIsOtpSent(false);
              setMessage("");
              setError("");
            }}
            className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Use another email
          </button>
        )}

        <p className="mt-5 text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-slate-900">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
