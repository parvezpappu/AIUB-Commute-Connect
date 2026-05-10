"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCommutes,
  getCurrentUser,
  getMyParticipations,
  joinCommute,
} from "../lib/api";

const transportTheme = {
  BIKE: {
    label: "Bike",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "from-emerald-500 to-teal-600",
  },
  CNG: {
    label: "CNG",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "from-amber-500 to-orange-600",
  },
  RICKSHAW: {
    label: "Rickshaw",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    accent: "from-rose-500 to-pink-600",
  },
  WALKING: {
    label: "Walking",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    accent: "from-sky-500 to-blue-600",
  },
};

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTimeLeft(value) {
  const diff = new Date(value).getTime() - Date.now();

  if (diff <= 0) {
    return "Departing soon";
  }

  const minutes = Math.round(diff / 60000);

  if (minutes < 60) {
    return `${minutes} min left`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hr left`;
  }

  return `${Math.round(hours / 24)} days left`;
}

function getJoinButtonLabel(participationStatus, noSeatsLeft, isJoining) {
  if (participationStatus === "ACCEPTED") {
    return "Accepted";
  }

  if (participationStatus === "PENDING") {
    return "Requested";
  }

  if (noSeatsLeft) {
    return "No seats left";
  }

  if (isJoining) {
    return "Sending request...";
  }

  return "Request to join";
}

export default function CommutesPage() {
  const [commutes, setCommutes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [participationStatusByCommute, setParticipationStatusByCommute] =
    useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCommutes() {
      try {
        const [userData, commuteData, participationData] = await Promise.all([
          getCurrentUser(),
          getCommutes(),
          getMyParticipations(),
        ]);
        setCurrentUser(userData);
        setCommutes(commuteData);
        setParticipationStatusByCommute(
          Object.fromEntries(
            participationData.map((participation) => [
              participation.commute.id,
              participation.status,
            ]),
          ),
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCommutes();
  }, []);

  const browseCommutes = useMemo(() => {
    return commutes.filter((commute) => commute.creator?.id !== currentUser?.id);
  }, [commutes, currentUser]);

  const stats = useMemo(() => {
    const openCount = browseCommutes.length;
    const seats = browseCommutes.reduce(
      (total, commute) => total + commute.seats,
      0,
    );
    const lowestCost = browseCommutes.reduce((lowest, commute) => {
      if (lowest === null) {
        return commute.costPerPerson;
      }

      return Math.min(lowest, commute.costPerPerson);
    }, null);

    return {
      openCount,
      seats,
      lowestCost: lowestCost ?? 0,
    };
  }, [browseCommutes]);

  async function handleJoin(commuteId) {
    setError("");
    setJoiningId(commuteId);

    try {
      await joinCommute(commuteId);
      setParticipationStatusByCommute((currentStatuses) => ({
        ...currentStatuses,
        [commuteId]: "PENDING",
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setJoiningId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-10">
        <section className="mx-auto max-w-6xl">
          <div className="h-48 animate-pulse rounded-lg bg-white" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-lg bg-white"
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#003b73] text-sm font-bold text-white">
              AC
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#003b73]">
                AIUB Commute Connect
              </p>
              <p className="text-xs text-slate-500">Available commute board</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Profile
            </Link>
            <Link
              href="/commutes/create"
              className="rounded-md bg-[#003b73] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002f5c]"
            >
              Create commute
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <p className="w-fit rounded-full border border-[#003b73]/20 bg-[#003b73]/5 px-4 py-2 text-sm font-medium text-[#003b73]">
                Live commute marketplace
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Choose a commute that matches your route, time, and budget.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Every request goes to the commute creator first. You will appear
                as pending until the creator accepts your seat.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Open posts
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#003b73]">
                  {stats.openCount}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Listed seats
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#003b73]">
                  {stats.seats}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Lowest cost
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#003b73]">
                  Tk {stats.lowestCost}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {browseCommutes.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No commute posts from other students yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Your own posts live in My posts. Browse will show open commute
              posts created by other students.
            </p>
            <Link
              href="/commutes/my"
              className="mt-5 inline-block rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white"
            >
              View my posts
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {browseCommutes.map((commute) => {
              const theme = transportTheme[commute.transportType];
              const noSeatsLeft = (commute.availableSeats ?? commute.seats) <= 0;
              const participationStatus =
                participationStatusByCommute[commute.id];
              const hasRequested =
                participationStatus === "PENDING" ||
                participationStatus === "ACCEPTED";

              return (
                <article
                  key={commute.id}
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`h-2 bg-gradient-to-r ${theme.accent}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.color}`}
                      >
                        {theme.label}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {commute.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">
                          From
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {commute.fromLocation}
                        </p>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">
                          To
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {commute.toLocation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Departure</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDateTime(commute.departureTime)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Time left</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {getTimeLeft(commute.departureTime)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Seats left</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {commute.availableSeats ?? commute.seats}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Cost/person</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          Tk {commute.costPerPerson}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-md border border-slate-200 p-3">
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Created by
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {commute.creator?.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {commute.creator?.aiubId}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        noSeatsLeft || hasRequested || joiningId === commute.id
                      }
                      onClick={() => handleJoin(commute.id)}
                      className={`mt-5 w-full rounded-md px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${
                        hasRequested
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#003b73] text-white hover:bg-[#002f5c] disabled:bg-slate-300"
                      }`}
                    >
                      {getJoinButtonLabel(
                        participationStatus,
                        noSeatsLeft,
                        joiningId === commute.id,
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
