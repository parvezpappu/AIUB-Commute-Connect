"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import {
  cancelCommute,
  closeCommute,
  completeCommute,
  getAdminCommutes,
} from "../../lib/api";
import { useRequireAdmin } from "../../lib/auth";

const statusFilters = ["ALL", "OPEN", "CLOSED", "COMPLETED"];

const statusStyles = {
  OPEN: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-[#003b73]/10 text-[#003b73]",
  CANCELLED: "bg-slate-100 text-slate-700",
};

const genderPreferenceLabels = {
  MALE: "Male only",
  FEMALE: "Female only",
  BOTH: "Male/Female",
};

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isExpired(value) {
  return value ? new Date(value).getTime() <= Date.now() : false;
}

export default function AdminCommutesPage() {
  const isCheckingAuth = useRequireAdmin();
  const [commutes, setCommutes] = useState([]);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadCommutes() {
    setError("");

    try {
      const data = await getAdminCommutes();
      setCommutes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCommutes();
  }, []);

  const stats = useMemo(() => {
    return commutes.reduce(
      (summary, commute) => {
        summary.total += 1;
        summary[commute.status] = (summary[commute.status] || 0) + 1;
        if (commute.status === "OPEN" && isExpired(commute.expiresAt)) {
          summary.expired += 1;
        }
        return summary;
      },
      {
        total: 0,
        OPEN: 0,
        CLOSED: 0,
        COMPLETED: 0,
        expired: 0,
      },
    );
  }, [commutes]);

  const visibleCommutes = useMemo(() => {
    if (activeStatus === "ALL") {
      return commutes;
    }

    return commutes.filter((commute) => commute.status === activeStatus);
  }, [activeStatus, commutes]);

  async function handleAction(commute, action) {
    const actionLabel =
      action === "close"
        ? "close"
        : action === "complete"
          ? "mark complete"
          : "delete";
    const confirmed = window.confirm(
      `${actionLabel} this commute from ${commute.fromLocation} to ${commute.toLocation}?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setUpdatingId(commute.id);

    try {
      if (action === "close") {
        await closeCommute(commute.id);
        setMessage("Commute closed successfully.");
      } else if (action === "complete") {
        await completeCommute(commute.id);
        setMessage("Commute marked completed successfully.");
      } else {
        await cancelCommute(commute.id);
        setMessage("Commute deleted successfully.");
      }

      await loadCommutes();
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth
            ? "Checking admin access..."
            : "Loading commute posts..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#003b73]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Commute posts
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review every commute post and take action when a post is invalid
              or already completed.
            </p>
          </div>

          <Link
            href="/admin/users"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Manage users
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total", stats.total],
            ["Open", stats.OPEN],
            ["Closed", stats.CLOSED],
            ["Completed", stats.COMPLETED],
            ["Expired open", stats.expired],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#003b73]">
                {value}
              </p>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-md border px-4 py-2 text-sm font-semibold ${
                activeStatus === status
                  ? "border-[#003b73] bg-[#003b73] text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {status === "ALL" ? "All" : status}
            </button>
          ))}
        </div>

        {visibleCommutes.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No commute posts found
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try another status filter.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Creator</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Preference</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleCommutes.map((commute) => (
                    <tr key={commute.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">
                          {commute.fromLocation} to {commute.toLocation}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {commute.transportType} · Tk {commute.costPerPerson}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Meeting: {commute.meetingLocation || "Not specified"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {commute.creator?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {commute.creator?.aiubId}
                        </p>
                        <p className="text-xs text-slate-500">
                          {commute.creator?.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {formatDateTime(commute.departureTime)}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            isExpired(commute.expiresAt)
                              ? "text-rose-600"
                              : "text-slate-500"
                          }`}
                        >
                          Request closes: {formatDateTime(commute.expiresAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {commute.acceptedSeats ?? 0}/{commute.seats}
                        </p>
                        <p className="text-xs text-slate-500">
                          {commute.availableSeats ?? commute.seats} left
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {genderPreferenceLabels[
                          commute.participantGenderPreference
                        ] || "Male/Female"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[commute.status] || statusStyles.CANCELLED
                          }`}
                        >
                          {commute.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            href={`/commutes/${commute.id}/members`}
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleAction(commute, "close")}
                            disabled={
                              updatingId === commute.id ||
                              commute.status !== "OPEN"
                            }
                            className="rounded-md border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(commute, "complete")}
                            disabled={
                              updatingId === commute.id ||
                              commute.status === "COMPLETED"
                            }
                            className="rounded-md border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(commute, "delete")}
                            disabled={updatingId === commute.id}
                            className="rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
