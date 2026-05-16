"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../components/AuthenticatedNav";
import {
  getCommuteRequests,
  getCommutes,
  getCurrentUser,
  getAdminUsers,
  getMyCommutes,
  getMyParticipations,
} from "../lib/api";
import { useRequireAuth } from "../lib/auth";

function formatTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusTone(status) {
  if (status === "ACCEPTED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "REJECTED") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function DashboardPage() {
  const isCheckingAuth = useRequireAuth();

  const [user, setUser] = useState(null);
  const [openCommutes, setOpenCommutes] = useState([]);
  const [myCommutes, setMyCommutes] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [pendingCreatorRequests, setPendingCreatorRequests] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const userData = await getCurrentUser();
        const isAdminUser = userData.role === "ADMIN";

        if (isAdminUser) {
          const [commuteData, userDataList] = await Promise.all([
            getCommutes(),
            getAdminUsers(),
          ]);

          setUser(userData);
          setOpenCommutes(commuteData);
          setUserCount(userDataList.length);
          setMyCommutes([]);
          setParticipations([]);
          setPendingCreatorRequests(0);
          return;
        }

        const [commuteData, createdData, participationData] =
          await Promise.all([
            getCommutes(),
            getMyCommutes(),
            getMyParticipations(),
          ]);

        setUser(userData);
        setOpenCommutes(commuteData);
        setMyCommutes(createdData);
        setParticipations(participationData);

        const requestCounts = await Promise.all(
          createdData.map(async (commute) => {
            const requests = await getCommuteRequests(commute.id);
            return requests.length;
          }),
        );

        setPendingCreatorRequests(
          requestCounts.reduce((total, count) => total + count, 0),
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const participationStats = useMemo(() => {
    return participations.reduce(
      (summary, item) => {
        summary[item.status] += 1;
        return summary;
      },
      {
        PENDING: 0,
        ACCEPTED: 0,
        REJECTED: 0,
        CANCELLED: 0,
      },
    );
  }, [participations]);

  const nextAcceptedCommute = useMemo(() => {
    return participations
      .filter((item) => item.status === "ACCEPTED")
      .sort(
        (a, b) =>
          new Date(a.commute.departureTime).getTime() -
          new Date(b.commute.departureTime).getTime(),
      )[0];
  }, [participations]);

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Preparing your dashboard..."}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-md bg-[#003b73] px-4 py-2 text-sm font-semibold text-white"
          >
            Login again
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-[#003b73]">
              {isAdmin ? "Admin access" : "Welcome back"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {user?.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {user?.aiubId} · {user?.email}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#003b73]/10 px-3 py-1 text-xs font-semibold text-[#003b73]">
                {user?.role}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user?.isVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {user?.isVerified ? "Verified" : "Verification pending"}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href={isAdmin ? "/admin/commutes" : "/commutes"}
                className="rounded-md bg-[#003b73] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {isAdmin ? "View commute posts" : "Find a commute"}
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin/users"
                  className="rounded-md border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                >
                  Manage users
                </Link>
              ) : (
                <Link
                  href="/commutes/create"
                  className="rounded-md border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                >
                  Create commute post
                </Link>
              )}
            </div>
          </aside>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Open commutes
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#003b73]">
                {openCommutes.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                {isAdmin ? "Users" : "My posts"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#003b73]">
                {isAdmin ? userCount : myCommutes.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                {isAdmin ? "Student posts" : "Pending requests"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">
                {isAdmin ? openCommutes.length : participationStats.PENDING}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                {isAdmin ? "Admin tools" : "Creator approvals"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">
                {isAdmin ? 2 : pendingCreatorRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {isAdmin ? "Open commute posts" : "Available commutes"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {isAdmin
                    ? "Open student commute posts visible in Browse."
                    : "Recent open posts around campus routes."}
                </p>
              </div>
              <Link
                href={isAdmin ? "/admin/commutes" : "/commutes"}
                className="text-sm font-semibold text-[#003b73]"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {openCommutes.slice(0, 4).map((commute) => (
                <div
                  key={commute.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {commute.fromLocation} to {commute.toLocation}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {commute.transportType} ·{" "}
                        {formatTime(commute.departureTime)}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-[#003b73]">
                      {commute.availableSeats ?? commute.seats} seats left
                    </div>
                  </div>
                </div>
              ))}

              {openCommutes.length === 0 && (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                  No open commute posts yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {isAdmin ? "User management" : "My request status"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {isAdmin
                    ? "Review registered accounts and remove users if needed."
                    : "Latest commute participation updates."}
                </p>
              </div>
              <Link
                href={isAdmin ? "/admin/users" : "/commutes/joined"}
                className="text-sm font-semibold text-[#003b73]"
              >
                Details
              </Link>
            </div>

            {isAdmin ? (
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  Admin can view all registered users from the Users page.
                  Student commute actions like Create, My posts, and Joined are
                  hidden for admin accounts.
                </p>
              </div>
            ) : nextAcceptedCommute ? (
              <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  Next accepted commute
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {nextAcceptedCommute.commute.fromLocation} to{" "}
                  {nextAcceptedCommute.commute.toLocation}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatTime(nextAcceptedCommute.commute.departureTime)}
                </p>
              </div>
            ) : null}

            {!isAdmin && (
            <div className="mt-5 space-y-3">
              {participations.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {item.commute.fromLocation} to {item.commute.toLocation}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.commute.transportType}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}

              {participations.length === 0 && (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                  You have not requested to join any commute yet.
                </p>
              )}
            </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
