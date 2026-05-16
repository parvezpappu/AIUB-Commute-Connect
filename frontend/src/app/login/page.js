"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "../lib/api";
import { useRedirectIfAuthenticated } from "../lib/auth";
import { hasValidationErrors, validateLoginForm } from "../lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const isCheckingAuth = useRedirectIfAuthenticated();

  const [formData, setFormData] = useState({
    aiubId: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setFieldErrors({
      ...fieldErrors,
      [name]: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateLoginForm(formData);
    setFieldErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsLoading(true);

    try {
      await loginUser(formData);
      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-4">
        <p className="font-semibold text-[#52615a]">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,#d7efe3_0%,transparent_30%),linear-gradient(135deg,#f5f7f4_0%,#e9efe8_52%,#f8ead2_100%)] text-[#17211d]">
      <header className="sticky top-0 z-40 border-b border-[#17211d]/10 bg-[#f5f7f4]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#18372f] text-base font-black text-[#ffc857]">
              চ
            </div>
            <div>
              <p className="text-lg font-black leading-none text-[#18372f]">
                চলোযাই
              </p>
              <p className="mt-1 text-xs font-bold text-[#6d756f]">
                AIUB Commute Connect
              </p>
            </div>
          </Link>

          <Link
            href="/register"
            className="rounded-full border border-[#18372f]/15 bg-white px-5 py-2 text-sm font-black text-[#18372f] shadow-sm hover:border-[#18372f]/40"
          >
            Register
          </Link>
        </nav>
      </header>

      <section className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8">
        <section className="reveal w-full max-w-sm rounded-[24px] border border-[#18372f]/10 bg-white p-5 shadow-2xl shadow-[#18372f]/10">
          <h1 className="text-2xl font-black text-[#18372f]">Login</h1>

          <form
            method="post"
            onSubmit={handleSubmit}
            noValidate
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="aiubId"
                className="mb-1.5 block text-sm font-black text-[#33443d]"
              >
                University ID
              </label>
              <input
                id="aiubId"
                type="text"
                name="aiubId"
                value={formData.aiubId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#18372f]/15 bg-[#f8faf7] px-3.5 py-2.5 text-[#17211d] outline-none transition focus:border-[#18372f]"
                placeholder="22-49155-3"
                autoComplete="username"
              />
              {fieldErrors.aiubId && (
                <p className="mt-1 text-sm font-semibold text-red-600">
                  {fieldErrors.aiubId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-black text-[#33443d]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#18372f]/15 bg-[#f8faf7] px-3.5 py-2.5 pr-20 text-[#17211d] outline-none transition focus:border-[#18372f]"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-black text-[#18372f] hover:bg-[#18372f]/8"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm font-semibold text-red-600">
                  {fieldErrors.password}
                </p>
              )}
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-black text-[#18372f]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#18372f] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#18372f]/15 transition hover:bg-[#102720] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-semibold text-[#617169]">
            New here?{" "}
            <Link href="/register" className="font-black text-[#18372f]">
              Register
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
