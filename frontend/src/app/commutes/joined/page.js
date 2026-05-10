"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import { getMyParticipations, leaveCommute } from "../../lib/api";
import { useRequireStudent } from "../../lib/auth";

const statusStyles = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-600",
};

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function JoinedCommutesPage() {
  const isCheckingAuth = useRequireStudent();
  const [participations, setParticipations] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [leavingId, setLeavingId] = useState(null);

  async function loadParticipations() {
    setError("");

    try {
      const data = await getMyParticipations();
      setParticipations(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadParticipations();
  }, []);

  async function handleLeave(commuteId) {
    const confirmed = window.confirm(
      "Cancel your participation for this commute?",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setLeavingId(commuteId);

    try {
      await leaveCommute(commuteId);
      setMessage("Participation cancelled successfully.");
      await loadParticipations();
    } catch (error) {
      setError(error.message);
    } finally {
      setLeavingId(null);
    }
  }

  const stats = useMemo(() => {
    return participations.reduce(
      (summary, item) => {
        summary.total += 1;
        summary[item.status] += 1;
        return summary;
      },
      {
        total: 0,
        PENDING: 0,
        ACCEPTED: 0,
        REJECTED: 0,
        CANCELLED: 0,
      },
    );
  }, [participations]);

  const acceptedParticipations = useMemo(() => {
    return participations.filter((item) => item.status === "ACCEPTED");
  }, [participations]);

  const pendingParticipations = useMemo(() => {
    return participations.filter((item) => item.status === "PENDING");
  }, [participations]);

  const historyParticipations = useMemo(() => {
    return participations.filter(
      (item) => item.status === "REJECTED" || item.status === "CANCELLED",
    );
  }, [participations]);

  function renderParticipationCard(participation) {
    const commute = participation.commute;
    const statusClass =
      statusStyles[participation.status] || statusStyles.CANCELLED;

    return (
      <article
        key={participation.id}
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-[#003b73]/10 px-3 py-1 text-xs font-semibold text-[#003b73]">
              {commute.transportType}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
            >
              {participation.status}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            {commute.fromLocation} to {commute.toLocation}
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Departure</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDateTime(commute.departureTime)}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Cost/person</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Tk {commute.costPerPerson}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Requested</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDateTime(participation.joinedAt)}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Commute status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {commute.status}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-slate-200 p-3">
            <p className="text-xs font-medium uppercase text-slate-500">
              Creator
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {commute.creator?.fullName}
            </p>
            <p className="text-xs text-slate-500">{commute.creator?.aiubId}</p>
          </div>

          {participation.status === "ACCEPTED" && (
            <Link
              href={`/commutes/${commute.id}/members`}
              className="mt-4 block rounded-md bg-[#003b73] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              View commute members
            </Link>
          )}

          {participation.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => handleLeave(commute.id)}
              disabled={leavingId === commute.id}
              className="mt-4 w-full rounded-md border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              {leavingId === commute.id
                ? "Cancelling..."
                : "Cancel participation"}
            </button>
          )}
        </div>
      </article>
    );
  }

  function renderParticipationSection(title, description, items) {
    return (
      <section className="mt-6">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            Nothing here yet.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((participation) => renderParticipationCard(participation))}
          </div>
        )}
      </section>
    );
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Loading joined commutes..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#003b73]">
                Participation tracker
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                My joined commutes
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Track your join requests, accepted seats, and cancelled commute
                participation in one place.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/commutes"
                className="rounded-md bg-[#003b73] px-4 py-2 text-sm font-semibold text-white"
              >
                Browse commutes
              </Link>
              <Link
                href="/profile"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Profile
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#003b73]">
                {stats.total}
              </p>
            </div>
            <div className="rounded-md bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase text-amber-700">
                Pending
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">
                {stats.PENDING}
              </p>
            </div>
            <div className="rounded-md bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase text-emerald-700">
                Accepted
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {stats.ACCEPTED}
              </p>
            </div>
            <div className="rounded-md bg-rose-50 p-4">
              <p className="text-xs font-medium uppercase text-rose-700">
                Rejected
              </p>
              <p className="mt-1 text-2xl font-semibold text-rose-700">
                {stats.REJECTED}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Cancelled
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-700">
                {stats.CANCELLED}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {participations.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No join requests yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Browse available commute posts and request to join one that
              matches your route.
            </p>
            <Link
              href="/commutes"
              className="mt-5 inline-block rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white"
            >
              Browse commutes
            </Link>
          </div>
        ) : (
          <>
            {renderParticipationSection(
              "Accepted/current commutes",
              "Commutes where the creator accepted your seat.",
              acceptedParticipations,
            )}
            {renderParticipationSection(
              "Pending requests",
              "Requests still waiting for the creator decision.",
              pendingParticipations,
            )}
            {renderParticipationSection(
              "History",
              "Rejected and cancelled participation records.",
              historyParticipations,
            )}
          </>
        )}
      </section>
    </main>
  );
}
