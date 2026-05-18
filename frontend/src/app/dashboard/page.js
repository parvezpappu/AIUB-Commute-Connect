"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../components/AuthenticatedNav";
import {
  getCommutes,
  getCurrentUser,
  getMyCommutes,
  getMyParticipations,
  joinCommute,
} from "../lib/api";
import { useRequireAuth } from "../lib/auth";

function formatTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatExpectedTime(commute) {
  const startTime = formatTime(commute.departureTime);
  const endTime = commute.expiresAt ? formatTime(commute.expiresAt) : startTime;

  return `${startTime} - ${endTime}`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCommuteCost(commute) {
  return commute.costToBeDecided
    ? "Will be decided"
    : `Tk ${commute.costPerPerson}`;
}

function getTimeLeft(value, now) {
  const diff = new Date(value).getTime() - now;

  if (diff <= 0) {
    return "Closed";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
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

  return "Join Ride";
}

function RecommendedCommuteCard({
  commute,
  currentUser,
  joiningId,
  now,
  onJoin,
  participationStatus,
}) {
  const seatsLeft = commute.availableSeats ?? commute.seats;
  const creator = commute.creator;
  const timeLeft = getTimeLeft(commute.expiresAt || commute.departureTime, now);
  const costLabel = formatCommuteCost(commute);
  const isCostToBeDecided = commute.costToBeDecided;
  const noSeatsLeft = seatsLeft <= 0;
  const hasRequested =
    participationStatus === "PENDING" || participationStatus === "ACCEPTED";
  const isJoining = joiningId === commute.id;
  const needsVerification =
    currentUser?.role === "STUDENT" && !currentUser?.isVerified;
  const genderMismatch =
    currentUser?.role === "STUDENT" &&
    commute.participantGenderPreference &&
    commute.participantGenderPreference !== "BOTH" &&
    commute.participantGenderPreference !== currentUser?.gender;
  const genderPreferenceLabels = {
    MALE: "Male only",
    FEMALE: "Female only",
    BOTH: "Male/Female",
  };

  return (
    <article className="flex h-full min-h-[300px] flex-col rounded-2xl border border-[#3E4D52]/15 bg-white/82 p-3 text-[#07131a] shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#07131a] text-[11px] font-black text-[#8ed8ff]">
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
            <p className="break-words text-[13px] font-black leading-4">
              {creator?.fullName || "Commute creator"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-black text-[#07131a]">
            Cost:
          </p>
          <p
            className={`font-black text-[#0f6b50] ${
              isCostToBeDecided ? "max-w-24 text-sm leading-4" : "text-lg"
            }`}
          >
            {costLabel}
          </p>
          {!isCostToBeDecided && (
            <p className="text-[10px] font-black uppercase text-[#56696f]">
              Per person
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#0f6b50]" />
          <p className="truncate text-[13px] font-semibold">
            {commute.fromLocation}
          </p>
        </div>
        <div className="ml-1 h-3 w-px bg-[#07131a]/15" />
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#003b73]" />
          <p className="truncate text-[13px] font-semibold">{commute.toLocation}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[#07131a]/10 bg-[#e8eef0] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
              Expected time
            </p>
            <p className="mt-0.5 text-[13px] font-black leading-4 text-[#07131a]">
              {formatExpectedTime(commute)}
            </p>
          </div>
          <div className="rounded-xl border border-[#07131a]/10 bg-[#e8eef0] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
              Who can join
            </p>
            <p className="mt-0.5 text-[13px] font-black leading-4 text-[#07131a]">
              {genderPreferenceLabels[commute.participantGenderPreference] ||
                "Male/Female"}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[#07131a]/10 bg-[#e8eef0] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
              Remaining
            </p>
            <p className="mt-0.5 text-[13px] font-black leading-4 text-[#b57a00]">{timeLeft}</p>
          </div>
          <div className="rounded-xl border border-[#07131a]/10 bg-[#dbe6ea] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
              Seats left
            </p>
            <p className="mt-0.5 text-[13px] font-black leading-4 text-[#0f6b50]">{seatsLeft}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={
          needsVerification ||
          genderMismatch ||
          noSeatsLeft ||
          hasRequested ||
          isJoining
        }
        onClick={() => onJoin(commute.id)}
        className={`mt-3 w-full rounded-xl px-4 py-2 text-sm font-black shadow-sm transition disabled:cursor-not-allowed ${
          needsVerification
            ? "bg-amber-50 text-amber-700"
            : genderMismatch
              ? "bg-rose-50 text-rose-700"
              : hasRequested
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[#07131a] text-white hover:bg-[#17303a] disabled:bg-slate-300"
        }`}
      >
        {needsVerification
          ? "Verify email to join"
          : genderMismatch
            ? "Gender preference does not match"
            : getJoinButtonLabel(participationStatus, noSeatsLeft, isJoining)}
      </button>
    </article>
  );
}

function CurrentRideCard({ ride, count, now, onOpen }) {
  const commute = ride.commute;
  const seatsLeft = commute.availableSeats ?? commute.seats;
  const timeLeft = getTimeLeft(commute.expiresAt || commute.departureTime, now);
  const label = ride.role === "CREATOR" ? "Created by you" : "Accepted ride";

  return (
    <article className="flex h-full min-h-[430px] flex-col rounded-3xl border border-[#07131a]/15 bg-white/82 p-5 text-[#07131a] shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#244b58]">
            Current rides
          </p>
          <h3 className="mt-3 text-xl font-black">
            {commute.fromLocation} to {commute.toLocation}
          </h3>
          <p className="mt-1 text-xs font-semibold text-[#4f6268]">{label}</p>
        </div>

        <div className="rounded-2xl bg-[#e8eef0] px-4 py-3 text-center">
          <p className="text-2xl font-black text-[#9a6a00]">{count}</p>
          <p className="text-[10px] font-black uppercase text-[#56696f]">
            Active
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
        <div className="ml-1 h-4 w-px bg-[#07131a]/15" />
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#003b73]" />
          <p className="truncate text-sm font-semibold">{commute.toLocation}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <div className="rounded-2xl border border-[#07131a]/10 bg-[#e8eef0] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#56696f]">
            Departure
          </p>
          <p className="mt-1 font-black text-[#07131a]">
            {formatTime(commute.departureTime)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#07131a]/10 bg-[#e8eef0] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#56696f]">
              Countdown
            </p>
            <p className="mt-1 font-black text-[#b57a00]">{timeLeft}</p>
          </div>
          <div className="rounded-2xl border border-[#07131a]/10 bg-[#dbe6ea] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#56696f]">
              Seats left
            </p>
            <p className="mt-1 font-black text-[#0f6b50]">{seatsLeft}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#07131a]/10 bg-[#e8eef0] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#56696f]">
            Status
          </p>
          <p className="mt-1 font-black text-[#07131a]">{commute.status}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-auto w-full rounded-2xl bg-[#07131a] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#17303a]"
      >
        View in My rides
      </button>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const isCheckingAuth = useRequireAuth();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: getTodayDateInputValue(),
    time: "",
  });
  const [commutes, setCommutes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [myCommutes, setMyCommutes] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [participationStatusByCommute, setParticipationStatusByCommute] =
    useState({});
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [isLoadingPreference, setIsLoadingPreference] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [user, commuteData, myCommuteData, participationData] = await Promise.all([
          getCurrentUser(),
          getCommutes(),
          getMyCommutes(),
          getMyParticipations(),
        ]);
        setFormData((currentData) => ({
          ...currentData,
          from: user.preferredFromLocation || "",
          to: user.preferredToLocation || "",
        }));
        setCommutes(commuteData);
        setCurrentUser(user);
        setMyCommutes(myCommuteData);
        setParticipations(participationData);
        setParticipationStatusByCommute(
          Object.fromEntries(
            participationData.map((participation) => [
              participation.commute.id,
              participation.status,
            ]),
          ),
        );
      } catch {
        setFormData({
          from: "",
          to: "",
          date: getTodayDateInputValue(),
          time: "",
        });
        setCommutes([]);
        setCurrentUser(null);
        setMyCommutes([]);
        setParticipations([]);
        setParticipationStatusByCommute({});
      } finally {
        setIsLoadingPreference(false);
      }
    }

    if (!isCheckingAuth) {
      loadDashboardData();
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const recommendedCommutes = useMemo(() => {
    const from = formData.from.trim().toLowerCase();
    const to = formData.to.trim().toLowerCase();

    return [...commutes]
      .sort((firstCommute, secondCommute) => {
        const firstMatches =
          (from &&
            firstCommute.fromLocation?.toLowerCase().includes(from)) ||
          (to && firstCommute.toLocation?.toLowerCase().includes(to));
        const secondMatches =
          (from &&
            secondCommute.fromLocation?.toLowerCase().includes(from)) ||
          (to && secondCommute.toLocation?.toLowerCase().includes(to));

        if (firstMatches !== secondMatches) {
          return firstMatches ? -1 : 1;
        }

        return (
          new Date(firstCommute.departureTime).getTime() -
          new Date(secondCommute.departureTime).getTime()
        );
      })
      .slice(0, 3);
  }, [commutes, formData.from, formData.to]);

  const currentRides = useMemo(() => {
    const rideById = new Map();

    myCommutes
      .filter(
        (commute) => commute.status === "OPEN" || commute.status === "CLOSED",
      )
      .forEach((commute) => {
        rideById.set(`creator-${commute.id}`, {
          commute,
          role: "CREATOR",
        });
      });

    participations
      .filter(
        (participation) =>
          participation.status === "ACCEPTED" &&
          participation.commute?.status !== "CANCELLED" &&
          participation.commute?.status !== "COMPLETED",
      )
      .forEach((participation) => {
        rideById.set(`participant-${participation.commute.id}`, {
          commute: participation.commute,
          role: "PARTICIPANT",
        });
      });

    return [...rideById.values()].sort(
      (firstRide, secondRide) =>
        new Date(firstRide.commute.departureTime).getTime() -
        new Date(secondRide.commute.departureTime).getTime(),
    );
  }, [myCommutes, participations]);

  function handleChange(event) {
    const { name, value } = event.target;

    setSearchError("");
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const from = formData.from.trim();
    const to = formData.to.trim();
    const date = formData.date;

    if (!from || !to || !date) {
      setSearchError("Enter from, to, and date before searching.");
      return;
    }

    const searchParams = new URLSearchParams();

    searchParams.set("from", from);
    searchParams.set("to", to);

    const selectedTime = formData.time || "00:00";
    searchParams.set("time", `${date}T${selectedTime}`);

    const queryString = searchParams.toString();
    router.push(queryString ? `/commutes?${queryString}` : "/commutes");
  }

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

  if (isCheckingAuth || isLoadingPreference) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Preparing dashboard..."}
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-[#07131a]">
      <AuthenticatedNav />

      <section className="relative mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#07131a]/15 bg-white/72 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#244b58]">
              Quick route
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_130px_auto] lg:items-end"
          >
            <label className="block">
              <span className="text-sm font-black text-[#07131a]">From</span>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Kuril"
                className="mt-2 w-full rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 font-semibold text-[#07131a] outline-none transition placeholder:text-[#56696f]/60 focus:border-[#07131a]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#07131a]">To</span>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="AIUB Campus"
                className="mt-2 w-full rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 font-semibold text-[#07131a] outline-none transition placeholder:text-[#56696f]/60 focus:border-[#07131a]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#07131a]">Date</span>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 font-semibold text-[#07131a] outline-none transition focus:border-[#07131a]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#07131a]">Time</span>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 font-semibold text-[#07131a] outline-none transition focus:border-[#07131a]"
              />
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-[#07131a] px-6 py-2.5 cursor-pointer font-black text-white shadow-sm transition hover:bg-[#17303a]"
            >
              Search
            </button>
          </form>
          {searchError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              {searchError}
            </p>
          )}
        </div>

        {currentRides.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-[#07131a]">
                Your Current Ride
              </h2>
              <button
                type="button"
                onClick={() => router.push("/commutes/joined")}
                className="text-sm font-black text-[#07131a] hover:text-[#17303a] cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
              <CurrentRideCard
                ride={currentRides[0]}
                count={currentRides.length}
                now={now}
                onOpen={() => router.push("/commutes/joined")}
              />
            </div>
          </section>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-[#07131a]">
              Recommended Commutes
            </h2>
            <button
              type="button"
              onClick={() => router.push("/commutes")}
              className="text-sm font-black text-[#07131a] hover:text-[#17303a] cursor-pointer"
            >
              View All
            </button>
          </div>

          {recommendedCommutes.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-[#07131a]/10 bg-white/72 p-5 text-sm font-semibold text-[#4f6268] backdrop-blur">
              No open commute posts are available right now.
            </p>
          ) : (
            <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {recommendedCommutes.map((commute) => (
                <RecommendedCommuteCard
                  key={commute.id}
                  commute={commute}
                  currentUser={currentUser}
                  joiningId={joiningId}
                  now={now}
                  onJoin={handleJoin}
                  participationStatus={participationStatusByCommute[commute.id]}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
