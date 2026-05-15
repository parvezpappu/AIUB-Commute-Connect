"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "../lib/api";
import { useRedirectIfAuthenticated } from "../lib/auth";
import { hasValidationErrors, validateRegisterForm } from "../lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const isCheckingAuth = useRedirectIfAuthenticated();

  const [formData, setFormData] = useState({
    fullName: "",
    aiubId: "",
    email: "",
    password: "",
    preferredFromLocation: "",
    preferredToLocation: "",
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

    const validationErrors = validateRegisterForm(formData);
    setFieldErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        fullName: formData.fullName.trim(),
        aiubId: formData.aiubId.trim(),
        email: formData.email.trim(),
        password: formData.password,
        preferredFromLocation: formData.preferredFromLocation.trim(),
        preferredToLocation: formData.preferredToLocation.trim(),
      });

      router.push(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-700">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Register with your AIUB student information.
          </p>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Use your full name and student ID exactly as shown on your
            university ID card. You will verify your email with an OTP after
            registration.
          </p>
        </div>

        <form method="post" onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              placeholder="Md Parvej Mia"
              autoComplete="name"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="aiubId"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              University ID
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
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              placeholder="student@aiub.edu"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
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
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Daily route preference
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Optional. These will auto-fill when you create a commute.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="preferredFromLocation"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Preferred from
                </label>
                <input
                  id="preferredFromLocation"
                  type="text"
                  name="preferredFromLocation"
                  value={formData.preferredFromLocation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                  placeholder="Gazipur"
                />
              </div>

              <div>
                <label
                  htmlFor="preferredToLocation"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Preferred to
                </label>
                <input
                  id="preferredToLocation"
                  type="text"
                  name="preferredToLocation"
                  value={formData.preferredToLocation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
                  placeholder="AIUB Campus"
                />
              </div>
            </div>
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
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
