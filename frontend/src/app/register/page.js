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
            href="/login"
            className="rounded-full border border-[#18372f]/15 bg-white px-5 py-2 text-sm font-black text-[#18372f] shadow-sm hover:border-[#18372f]/40"
          >
            Login
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-4xl items-center gap-6 px-4 py-4 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="reveal hidden lg:block">
          <h1 className="max-w-sm text-3xl font-black leading-tight text-[#18372f]">
            Create your commute account before the next ride.
          </h1>

          <div className="mt-6 rounded-[24px] border border-[#18372f]/10 bg-[#18372f] p-5 text-white shadow-xl shadow-[#18372f]/12">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a8e6c4]">
                Account setup
              </p>
              <div className="mt-4 space-y-3">
              {[
                "Register with AIUB information",
                "Verify your email with OTP",
                "Save preferred route for faster posting",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ffc857] text-xs font-black text-[#18372f]">
                    ✓
                  </span>
                  <p className="text-sm font-semibold text-white/80">{item}</p>
                </div>
              ))}
              </div>
          </div>
        </aside>

        <section className="reveal rounded-[24px] border border-[#18372f]/10 bg-white p-4 shadow-2xl shadow-[#18372f]/10 sm:p-5">
          <div className="mb-7 lg:hidden">
            <Link href="/" className="flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#18372f] text-lg font-black text-[#ffc857]">
                চ
              </div>
              <div>
                <p className="font-black leading-none text-[#18372f]">
                  চলোযাই
                </p>
                <p className="mt-1 text-xs font-bold text-[#6d756f]">
                  AIUB Commute Connect
                </p>
              </div>
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#18372f]">
              Create account
            </h2>
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
                  className="mb-1.5 block text-sm font-black text-[#33443d]"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#18372f]/15 bg-[#f8faf7] px-3.5 py-2.5 text-[#17211d] outline-none transition focus:border-[#18372f]"
                  placeholder="Md Parvej Mia"
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-black text-[#33443d]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#18372f]/15 bg-[#f8faf7] px-3.5 py-2.5 text-[#17211d] outline-none transition focus:border-[#18372f]"
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
                  className="mb-1.5 block text-sm font-black text-[#33443d]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#18372f]/15 bg-[#f8faf7] px-3.5 py-2.5 text-[#17211d] outline-none transition focus:border-[#18372f]"
                  placeholder="Minimum 6 characters"
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
              <label className="mb-1.5 block text-sm font-black text-[#33443d]">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-black transition ${
                      formData.gender === option.value
                        ? "border-[#18372f] bg-[#18372f] text-white"
                        : "border-[#18372f]/15 bg-[#f8faf7] text-[#43514a] hover:border-[#18372f]/40"
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

            <div className="rounded-[20px] border border-[#18372f]/10 bg-[#f8faf7] p-3.5">
              <p className="font-black text-[#18372f]">Daily route preference</p>
              <p className="mt-1 text-sm leading-5 text-[#617169]">
                Optional. These locations will auto-fill when you create a
                commute post.
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="preferredFromLocation"
                    className="mb-1.5 block text-sm font-black text-[#33443d]"
                  >
                    Preferred from
                  </label>
                  <input
                    id="preferredFromLocation"
                    type="text"
                    name="preferredFromLocation"
                    value={formData.preferredFromLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#18372f]/15 bg-white px-3.5 py-2.5 text-[#17211d] outline-none transition focus:border-[#18372f]"
                    placeholder="Gazipur"
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredToLocation"
                    className="mb-1.5 block text-sm font-black text-[#33443d]"
                  >
                    Preferred to
                  </label>
                  <input
                    id="preferredToLocation"
                    type="text"
                    name="preferredToLocation"
                    value={formData.preferredToLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#18372f]/15 bg-white px-3.5 py-2.5 text-[#17211d] outline-none transition focus:border-[#18372f]"
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
              className="w-full rounded-full bg-[#18372f] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#18372f]/15 transition hover:bg-[#102720] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-semibold text-[#617169]">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-[#18372f]">
              Login
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
