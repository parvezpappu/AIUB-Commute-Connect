"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "../lib/api";
import { hasValidationErrors, validateLoginForm } from "../lib/validation";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    aiubId: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your AIUB ID and password to continue.
          </p>
        </div>

        <form method="post" onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="aiubId"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              AIUB ID
            </label>
            <input
              id="aiubId"
              type="text"
              name="aiubId"
              value={formData.aiubId}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              placeholder="22-49155-3"
              autoComplete="username"
            />
            {fieldErrors.aiubId && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.aiubId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New to AIUB Commute Connect?{" "}
          <Link href="/register" className="font-medium text-slate-900">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
