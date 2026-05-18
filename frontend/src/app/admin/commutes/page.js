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
  COMPLETED: "bg-[#07131a]/10 text-[#07131a]",
  CANCELLED: "bg-[#dbe6ea] text-[#4f6268]",
};

const pageBackground =
  "radial-gradient(circle at 78% 18%, rgba(160,183,190,0.42) 0%, transparent 34%), linear-gradient(115deg, #07131a 0%, #17303a 32%, #4f6268 70%, #d7dedc 100%)";

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

function formatCommuteCost(commute) {
  return commute.costToBeDecided
    ? "Will be decided"
    : `Tk ${commute.costPerPerson}`;
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
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: pageBackground }}
      >
        <p className="font-semibold text-[#4f6268]">
          {isCheckingAuth
            ? "Checking admin access..."
            : "Loading commute posts..."}
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen text-[#07131a]"
      style={{ background: pageBackground }}
    >
      <AuthenticatedNav />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-[#07131a]/15 bg-white/80 p-6 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#244b58]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07131a]">
              Commute posts
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#4f6268]">
              Review every commute post and take action when a post is invalid
              or already completed.
            </p>
          </div>

          <Link
            href="/admin/users"
            className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 text-sm font-black text-[#07131a] transition hover:border-[#07131a]/35"
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
              className="rounded-[22px] border border-[#07131a]/15 bg-white/80 p-4 shadow-[0_16px_40px_rgba(24,55,47,0.06)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#56696f]">
                {label}
              </p>
              <p className="mt-1 text-2xl font-black text-[#07131a]">
                {value}
              </p>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                activeStatus === status
                  ? "border-[#07131a] bg-[#07131a] text-white"
                  : "border-[#07131a]/15 bg-white/80 text-[#4f6268] hover:bg-white"
              }`}
            >
              {status === "ALL" ? "All" : status}
            </button>
          ))}
        </div>

        {visibleCommutes.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#07131a]/20 bg-white/72 p-10 text-center">
            <h2 className="text-xl font-black text-[#07131a]">
              No commute posts found
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#4f6268]">
              Try another status filter.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#07131a]/15 bg-white/82 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#07131a]/10 text-sm">
                <thead className="bg-[#e8eef0] text-left text-xs font-black uppercase tracking-[0.12em] text-[#4f6268]">
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
                <tbody className="divide-y divide-[#07131a]/10">
                  {visibleCommutes.map((commute) => (
                    <tr key={commute.id} className="align-top hover:bg-[#e8eef0]/70">
                      <td className="px-4 py-4">
                        <p className="font-black text-[#07131a]">
                          {commute.fromLocation} to {commute.toLocation}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#4f6268]">
                          {commute.transportType} - {formatCommuteCost(commute)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#4f6268]">
                          Meeting: {commute.meetingLocation || "Not specified"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-black text-[#07131a]">
                          {commute.creator?.fullName}
                        </p>
                        <p className="text-xs font-semibold text-[#4f6268]">
                          {commute.creator?.aiubId}
                        </p>
                        <p className="text-xs font-semibold text-[#4f6268]">
                          {commute.creator?.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-black text-[#07131a]">
                          {formatDateTime(commute.departureTime)}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            isExpired(commute.expiresAt)
                              ? "text-rose-600"
                              : "text-[#4f6268]"
                          }`}
                        >
                          Request closes: {formatDateTime(commute.expiresAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-black text-[#07131a]">
                          {commute.acceptedSeats ?? 0}/{commute.seats}
                        </p>
                        <p className="text-xs font-semibold text-[#4f6268]">
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
                            className="rounded-2xl border border-[#07131a]/15 bg-white px-3 py-2 text-xs font-black text-[#07131a] hover:bg-[#e8eef0]"
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
                            className="rounded-2xl border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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
                            className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(commute, "delete")}
                            disabled={updatingId === commute.id}
                            className="rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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
