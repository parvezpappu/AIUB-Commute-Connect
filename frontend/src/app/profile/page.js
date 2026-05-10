"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedNav from "../components/AuthenticatedNav";
import { getCurrentUser, logoutUser } from "../lib/api";
import { useRequireAuth } from "../lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const isCheckingAuth = useRequireAuth();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      router.push("/login");
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-700">
          {isCheckingAuth ? "Checking session..." : "Loading profile..."}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <section className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Session expired
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Back to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <AuthenticatedNav />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your AIUB Commute Connect account information.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-md bg-[#003b73] px-4 py-2 text-sm font-medium text-white"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/commutes"
            className="rounded-md bg-[#003b73] px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Browse available commutes
          </Link>
          <Link
            href="/commutes/create"
            className="rounded-md border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
          >
            Create a commute
          </Link>
          <Link
            href="/commutes/my"
            className="rounded-md border border-[#003b73]/30 px-4 py-3 text-center text-sm font-semibold text-[#003b73]"
          >
            My commute posts
          </Link>
          <Link
            href="/commutes/joined"
            className="rounded-md border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
          >
            Joined commutes
          </Link>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Full name
            </p>
            <p className="mt-1 text-slate-900">{user.fullName}</p>
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              University ID
            </p>
            <p className="mt-1 text-slate-900">{user.aiubId}</p>
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Email
            </p>
            <p className="mt-1 text-slate-900">{user.email}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Role
              </p>
              <p className="mt-1 text-slate-900">{user.role}</p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Verification
              </p>
              <p className="mt-1 text-slate-900">
                {user.isVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
