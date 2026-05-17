"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../components/AuthenticatedNav";
import {
  getCommutes,
  getCurrentUser,
  getMyParticipations,
  joinCommute,
} from "../lib/api";
import { useRequireAuth } from "../lib/auth";

const transportTheme = {
  UBER: {
    label: "Uber",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "from-violet-500 to-indigo-600",
  },
  BUS: {
    label: "Bus",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    accent: "from-cyan-500 to-blue-600",
  },
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

const genderPreferenceLabels = {
  MALE: "Male only",
  FEMALE: "Female only",
  BOTH: "Male/Female",
};

const transportOptions = [
  "UBER",
  "BUS",
  "BIKE",
  "CNG",
  "RICKSHAW",
  "WALKING",
];

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatCommuteCost(commute) {
  return commute.costToBeDecided
    ? "Will be decided"
    : `Tk ${commute.costPerPerson}`;
}

function getTimeLeft(value) {
  const diff = new Date(value).getTime() - Date.now();

  if (diff <= 0) {
    return "Closed";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
  }

  return `${hours}h ${minutes}m ${seconds}s left`;
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
  const isCheckingAuth = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commutes, setCommutes] = useState([]);
  const [, setNow] = useState(() => Date.now());
  const [currentUser, setCurrentUser] = useState(null);
  const [participationStatusByCommute, setParticipationStatusByCommute] =
    useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    time: searchParams.get("time") || "",
    transportType: searchParams.get("transportType") || "",
    genderPreference: searchParams.get("genderPreference") || "",
    sortBy: searchParams.get("sortBy") || "earliest",
  }));

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const browseCommutes = useMemo(() => {
    if (currentUser?.role === "ADMIN") {
      return commutes;
    }

    return commutes.filter((commute) => commute.creator?.id !== currentUser?.id);
  }, [commutes, currentUser]);

  const filteredCommutes = useMemo(() => {
    const selectedTime = filters.time
      ? new Date(filters.time).getTime()
      : null;
    const normalizedFrom = filters.from.trim().toLowerCase();
    const normalizedTo = filters.to.trim().toLowerCase();

    return browseCommutes
      .filter((commute) => {
      const fromMatches =
          !normalizedFrom ||
          commute.fromLocation?.toLowerCase().includes(normalizedFrom);
      const toMatches =
          !normalizedTo ||
          commute.toLocation?.toLowerCase().includes(normalizedTo);
      const timeMatches =
        !selectedTime ||
        new Date(commute.departureTime).getTime() >= selectedTime;
        const transportMatches =
          !filters.transportType ||
          commute.transportType === filters.transportType;
        const genderMatches =
          !filters.genderPreference ||
          commute.participantGenderPreference === filters.genderPreference;

        return (
          fromMatches &&
          toMatches &&
          timeMatches &&
          transportMatches &&
          genderMatches
        );
      })
      .sort((firstCommute, secondCommute) => {
        if (filters.sortBy === "cost") {
          if (firstCommute.costToBeDecided !== secondCommute.costToBeDecided) {
            return firstCommute.costToBeDecided ? 1 : -1;
          }

          return firstCommute.costPerPerson - secondCommute.costPerPerson;
        }

        if (filters.sortBy === "seats") {
          return (
            (secondCommute.availableSeats ?? secondCommute.seats) -
            (firstCommute.availableSeats ?? firstCommute.seats)
          );
        }

        return (
          new Date(firstCommute.departureTime).getTime() -
          new Date(secondCommute.departureTime).getTime()
        );
      });
  }, [browseCommutes, filters]);

  const hasRouteFilters =
    filters.from ||
    filters.to ||
    filters.time ||
    filters.transportType ||
    filters.genderPreference;

  const isAdmin = currentUser?.role === "ADMIN";

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

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleFilterSubmit(event) {
    event.preventDefault();

    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && !(key === "sortBy" && value === "earliest")) {
        nextParams.set(key, value);
      }
    });

    const queryString = nextParams.toString();
    setIsFilterOpen(false);
    router.push(queryString ? `/commutes?${queryString}` : "/commutes");
  }

  function handleClearFilters() {
    setFilters({
      from: "",
      to: "",
      time: "",
      transportType: "",
      genderPreference: "",
      sortBy: "earliest",
    });
    setIsFilterOpen(false);
    router.push("/commutes");
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-10">
        <section className="mx-auto max-w-6xl">
          {isCheckingAuth ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <p className="text-slate-600">Checking session...</p>
            </div>
          ) : (
            <>
              <div className="h-48 animate-pulse rounded-lg bg-white" />
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-lg bg-white"
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,#d7efe3_0%,transparent_30%),linear-gradient(135deg,#f5f7f4_0%,#e9efe8_52%,#f8ead2_100%)] text-[#17211d]">
      <AuthenticatedNav />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#18372f]/15 bg-white/72 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6b58]">
                Browse commutes
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#18372f]">
                Find an open commute that fits.
              </h1>
            </div>
            <p className="text-sm font-bold text-[#66736d]">
              Showing {filteredCommutes.length} open commute
              {filteredCommutes.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="rounded-2xl bg-[#18372f] px-6 py-3 font-black text-white shadow-sm transition hover:bg-[#244d42]"
            >
              Filter commutes
            </button>
            {hasRouteFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-2xl border border-[#18372f]/15 bg-white px-6 py-3 font-black text-[#18372f] transition hover:border-[#18372f]/35"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {hasRouteFilters && (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#18372f]/15 bg-white/72 px-4 py-3 text-sm text-[#66736d] backdrop-blur sm:flex-row sm:items-center">
            <p>
              Showing matches
              {filters.from && (
                <>
                  {" "}
                  from <span className="font-semibold">{filters.from}</span>
                </>
              )}
              {filters.to && (
                <>
                  {" "}
                  to <span className="font-semibold">{filters.to}</span>
                </>
              )}
              {filters.time && (
                <>
                  {" "}
                  after{" "}
                  <span className="font-semibold">
                    {formatDateTime(filters.time)}
                  </span>
                </>
              )}
              .
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="font-black text-[#18372f]"
            >
              Clear filters
            </button>
          </div>
        )}

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18372f]/45 px-4 py-6 backdrop-blur-sm">
            <form
              onSubmit={handleFilterSubmit}
              className="w-full max-w-3xl rounded-[28px] border border-[#18372f]/15 bg-[#f5f7f4] p-5 text-[#18372f] shadow-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6b58]">
                    Filter
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Refine commute results
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-full border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black">From</span>
                  <input
                    type="text"
                    name="from"
                    value={filters.from}
                    onChange={handleFilterChange}
                    placeholder="Kuril"
                    className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-[#7d857f]/60 focus:border-[#18372f]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black">To</span>
                  <input
                    type="text"
                    name="to"
                    value={filters.to}
                    onChange={handleFilterChange}
                    placeholder="AIUB Campus"
                    className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-[#7d857f]/60 focus:border-[#18372f]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black">Time</span>
                  <input
                    type="datetime-local"
                    name="time"
                    value={filters.time}
                    onChange={handleFilterChange}
                    className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#18372f]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black">Type</span>
                  <select
                    name="transportType"
                    value={filters.transportType}
                    onChange={handleFilterChange}
                    className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#18372f]"
                  >
                    <option value="">Type</option>
                    {transportOptions.map((option) => (
                      <option key={option} value={option}>
                        {transportTheme[option]?.label || option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black">Gender</span>
                  <select
                    name="genderPreference"
                    value={filters.genderPreference}
                    onChange={handleFilterChange}
                    className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#18372f]"
                  >
                    <option value="">Gender</option>
                    <option value="MALE">Male only</option>
                    <option value="FEMALE">Female only</option>
                    <option value="BOTH">Male/Female</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black">Sort</span>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold outline-none transition focus:border-[#18372f]"
                  >
                    <option value="earliest">Earliest</option>
                    <option value="cost">Lowest cost</option>
                    <option value="seats">Most seats</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#18372f] px-6 py-3 font-black text-white shadow-sm transition hover:bg-[#244d42]"
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-2xl border border-[#18372f]/15 bg-white px-6 py-3 font-black text-[#18372f] transition hover:border-[#18372f]/35"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredCommutes.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#18372f]/25 bg-white/72 p-10 text-center backdrop-blur">
            <h2 className="text-xl font-black text-[#18372f]">
              {hasRouteFilters
                ? "No commute matches this search"
                : isAdmin
                  ? "No open commute posts yet"
                  : "No commute posts from other students yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[#66736d]">
              {hasRouteFilters
                ? "Try changing the route or time from the dashboard search."
                : isAdmin
                  ? "When students create open commute posts, they will appear here."
                  : "Your own posts live in My posts. Browse will show open commute posts created by other students."}
            </p>
            <Link
              href={isAdmin ? "/admin/users" : "/commutes/my"}
              className="mt-5 inline-block rounded-2xl bg-[#18372f] px-5 py-3 text-sm font-black text-white"
            >
              {isAdmin ? "Manage users" : "View my posts"}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredCommutes.map((commute) => {
              const theme = transportTheme[commute.transportType] || {
                label: commute.transportType,
              };
              const noSeatsLeft = (commute.availableSeats ?? commute.seats) <= 0;
              const seatsLeft = commute.availableSeats ?? commute.seats;
              const creator = commute.creator;
              const participationStatus =
                participationStatusByCommute[commute.id];
              const hasRequested =
                participationStatus === "PENDING" ||
                participationStatus === "ACCEPTED";
              const needsVerification =
                currentUser?.role === "STUDENT" && !currentUser?.isVerified;
              const genderMismatch =
                currentUser?.role === "STUDENT" &&
                commute.participantGenderPreference &&
                commute.participantGenderPreference !== "BOTH" &&
                commute.participantGenderPreference !== currentUser?.gender;

              return (
                <article
                  key={commute.id}
                  className="flex h-full min-h-[430px] flex-col rounded-3xl border border-[#18372f]/15 bg-white/82 p-5 text-[#18372f] shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#18372f] text-sm font-black text-[#ffc857]">
                        {creator?.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`http://localhost:3000${creator.profilePictureUrl}`}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(creator?.fullName) || "AC"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-black">
                          {creator?.fullName || "Commute creator"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#66736d]">
                          {creator?.aiubId || "AIUB ID"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-[#0f6b50]">
                        {formatCommuteCost(commute)}
                      </p>
                      <p className="text-[10px] font-black uppercase text-[#7d857f]">
                        Per person
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#0f6b50]" />
                      <p className="truncate text-sm font-semibold">
                        {commute.fromLocation}
                      </p>
                    </div>
                    <div className="ml-1 h-4 w-px bg-[#18372f]/15" />
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#003b73]" />
                      <p className="truncate text-sm font-semibold">
                        {commute.toLocation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm">
                    <div className="rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
                        Departure
                      </p>
                      <p className="mt-1 font-black text-[#18372f]">
                        {formatDateTime(commute.departureTime)}
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#18372f]/10 bg-[#fff7e4] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
                          Countdown
                        </p>
                        <p className="mt-1 font-black text-[#b57a00]">
                          {getTimeLeft(commute.expiresAt || commute.departureTime)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#18372f]/10 bg-[#edf7f1] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
                          Seats left
                        </p>
                        <p className="mt-1 font-black text-[#0f6b50]">
                          {seatsLeft}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
                          Type
                        </p>
                        <p className="mt-1 font-black text-[#18372f]">
                          {theme.label}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
                          Who can join
                        </p>
                        <p className="mt-1 font-black text-[#18372f]">
                          {genderPreferenceLabels[
                            commute.participantGenderPreference
                          ] || "Male/Female"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      isAdmin ||
                      needsVerification ||
                      genderMismatch ||
                      noSeatsLeft ||
                      hasRequested ||
                      joiningId === commute.id
                    }
                    onClick={() => handleJoin(commute.id)}
                    className={`mt-auto w-full rounded-2xl px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed ${
                      isAdmin
                        ? "bg-slate-100 text-slate-600"
                        : needsVerification
                          ? "bg-amber-50 text-amber-700"
                        : hasRequested
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#18372f] text-white hover:bg-[#244d42] disabled:bg-slate-300"
                    }`}
                  >
                    {isAdmin
                      ? "Admin view"
                      : needsVerification
                        ? "Verify email to join"
                        : genderMismatch
                          ? "Gender preference does not match"
                          : getJoinButtonLabel(
                              participationStatus,
                              noSeatsLeft,
                              joiningId === commute.id,
                            )}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
