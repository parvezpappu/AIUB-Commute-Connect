"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "../lib/api";
import { useRedirectIfAuthenticated } from "../lib/auth";
import { hasValidationErrors, validateLoginForm } from "../lib/validation";

function EyeIcon({ isVisible }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {isVisible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.4A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.6 3.7" />
          <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
        </>
      )}
    </svg>
  );
}

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
      <main className="flex min-h-screen items-center justify-center bg-[#e8eef0] px-4">
        <p className="font-semibold text-[#c4d4d9]">Checking session...</p>
      </main>
    );
  }

  return (
<main className="min-h-screen bg-[#e8eef0] text-[#07131a]">   
     <header className="sticky top-0 z-40 border-b border-[#07131a]/10 bg-[#e8eef0]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#07131a] text-base font-black text-[#8ed8ff] sm:h-10 sm:w-10">
              চ
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black leading-none text-[#07131a] sm:text-lg">
                চলোযাই
              </p>
              <p className="mt-1 hidden text-xs font-bold text-[#6d756f] sm:block">
                AIUB Commute Connect
              </p>
            </div>
          </Link>

          <Link
            href="/register"
            className="shrink-0 rounded-full border border-[#07131a]/15 bg-white px-4 py-2 text-sm font-black text-[#07131a] shadow-sm hover:border-[#07131a]/40 sm:px-5"
          >
            Register
          </Link>
        </nav>
      </header>

      <section className="flex min-h-[calc(100vh-65px)] items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
        <section className="reveal w-full max-w-sm rounded-[22px] border border-[#1d5d82] bg-[#abc9d3] p-4 shadow-2xl shadow-[#07131a]/10 sm:rounded-[24px] sm:p-5">
          <h1 className="text-2xl font-black text-center text-[#07131a]">Login</h1>

          <form
            method="post"
            onSubmit={handleSubmit}
            noValidate
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="aiubId"
                className="mb-1.5 block text-sm font-black text-white"
              >
                University ID
              </label>
              <input
                id="aiubId"
                type="text"
                name="aiubId"
                value={formData.aiubId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
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
                className="mb-1.5 block text-sm font-black text-white"
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
                  className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 pr-12 text-[#07131a] outline-none transition focus:border-[#07131a]"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#07131a] transition hover:bg-[#07131a]/8"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon isVisible={showPassword} />
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
                  className="text-sm font-black text-[#07131a]"
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#07131a] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#07131a]/15 transition hover:bg-[#0b1d25] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-semibold text-[#4f6268]">
            New here?{" "}
            <Link href="/register" className="font-black text-[#07131a]">
              Register
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}


