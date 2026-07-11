"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "../lib/api";
import { useRedirectIfAuthenticated } from "../lib/auth";
import { hasValidationErrors, validateRegisterForm } from "../lib/validation";

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export default function RegisterPage() {
  const router = useRouter();
  const isCheckingAuth = useRedirectIfAuthenticated();

  const [formData, setFormData] = useState({
    fullName: "",
    aiubId: "",
    email: "",
    gender: "",
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
        gender: formData.gender,
        password: formData.password,
        preferredFromLocation: formData.preferredFromLocation.trim(),
        preferredToLocation: formData.preferredToLocation.trim(),
      });

      router.push(
        `/verify-email?email=${encodeURIComponent(formData.email.trim())}`,
      );
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
            href="/login"
            className="shrink-0 rounded-full border border-[#07131a]/15 bg-white px-4 py-2 text-sm font-black text-[#07131a] shadow-sm hover:border-[#07131a]/40 sm:px-5"
          >
            Login
          </Link>
        </nav>
      </header>

      <section className="flex min-h-[calc(100vh-65px)] items-center justify-center px-3 py-6 sm:px-4 sm:py-8">        <aside className="reveal hidden lg:block">
          
        </aside>

            <section className="reveal w-full max-w-md rounded-[22px] border border-[#1d5d82] bg-[#abc9d3] p-4 shadow-xl sm:rounded-2xl sm:p-5">          <div className="mb-5 lg:hidden">
            <Link href="/" className="flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#07131a] text-lg font-black text-[#8ed8ff]">
                চ
              </div>
              <div>
                <p className="font-black leading-none text-[#07131a]">
                  চলোযাই
                </p>
                <p className="mt-1 text-xs font-bold text-[#6d756f]">
                  AIUB Commute Connect
                </p>
              </div>
            </Link>
          </div>

          <div>
            <h2 className="text-center text-2xl font-black text-[#07131a]">
              Create account
            </h2>
          </div>

          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            <p>Currently, email verification is not working.</p>
            <p className="mt-1">
              Please log in with ID: <strong>22-49154-3</strong> and password:{" "}
              <strong>654321</strong>.
            </p>
          </div>

          <form
            method="post"
            onSubmit={handleSubmit}
            noValidate
            className="mt-5 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-black text-white"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
                  placeholder="Your Name"
                  autoComplete="name"
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

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
                  placeholder="xx-xxxxx-x"
                  autoComplete="username"
                />
                {fieldErrors.aiubId && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {fieldErrors.aiubId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-black text-white"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
                  placeholder="student@aiub.edu"
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {fieldErrors.email}
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
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#07131a]/15 bg-[#eef3f4] px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
                  placeholder="Letter, number, special character"
                  autoComplete="new-password"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-black text-white">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-black transition ${
                      formData.gender === option.value
                        ? "border-[#07131a] bg-[#07131a] text-white"
                        : "border-[#07131a]/15 bg-[#eef3f4] text-[#4f6268] hover:border-[#07131a]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {fieldErrors.gender && (
                <p className="mt-1 text-sm font-semibold text-red-600">
                  {fieldErrors.gender}
                </p>
              )}
            </div>

            <div className="rounded-[20px] border border-[#1d5d82] bg-[#abc9d3] p-3.5">
              <p className="font-black text-[#07131a]">Daily route preference</p>
              <p className="mt-1 text-sm leading-5 text-[#4f6268]">
                Optional. These locations will auto-fill when you create a
                commute post.
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="preferredFromLocation"
                    className="mb-1.5 block text-sm font-black text-white"
                  >
                    Preferred from
                  </label>
                  <input
                    id="preferredFromLocation"
                    type="text"
                    name="preferredFromLocation"
                    value={formData.preferredFromLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
                    placeholder="Gazipur"
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredToLocation"
                    className="mb-1.5 block text-sm font-black text-white"
                  >
                    Preferred to
                  </label>
                  <input
                    id="preferredToLocation"
                    type="text"
                    name="preferredToLocation"
                    value={formData.preferredToLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3.5 py-2.5 text-[#07131a] outline-none transition focus:border-[#07131a]"
                    placeholder="AIUB Campus"
                  />
                </div>
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
              className="flex w-full items-center cursor-pointer justify-center gap-2 rounded-full bg-[#07131a] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#07131a]/15 transition hover:bg-[#0b1d25] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-semibold text-[#4f6268]">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-[#07131a]">
              Login
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}

