"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../components/AuthenticatedNav";
import { getCommutes, getCurrentUser } from "../lib/api";
import { useRequireAuth } from "../lib/auth";

function formatTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
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

function RecommendedCommuteCard({ commute, now }) {
  const seatsLeft = commute.availableSeats ?? commute.seats;
  const creator = commute.creator;
  const timeLeft = getTimeLeft(commute.expiresAt || commute.departureTime, now);
  const genderPreferenceLabels = {
    MALE: "Male only",
    FEMALE: "Female only",
    BOTH: "Male/Female",
  };

  return (
    <article className="flex h-full min-h-[430px] flex-col rounded-3xl border border-[#18372f]/15 bg-white/82 p-5 text-[#18372f] shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
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
            Tk {commute.costPerPerson}
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
          <p className="truncate text-sm font-semibold">{commute.toLocation}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <div className="rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
            Departure
          </p>
          <p className="mt-1 font-black text-[#18372f]">
            {formatTime(commute.departureTime)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#18372f]/10 bg-[#fff7e4] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
              Countdown
            </p>
            <p className="mt-1 font-black text-[#b57a00]">{timeLeft}</p>
          </div>
          <div className="rounded-2xl border border-[#18372f]/10 bg-[#edf7f1] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
              Seats left
            </p>
            <p className="mt-1 font-black text-[#0f6b50]">{seatsLeft}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d857f]">
            Who can join
          </p>
          <p className="mt-1 font-black text-[#18372f]">
            {genderPreferenceLabels[commute.participantGenderPreference] ||
              "Male/Female"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const query = new URLSearchParams({
            from: commute.fromLocation,
            to: commute.toLocation,
          }).toString();
          window.location.href = `/commutes?${query}`;
        }}
        className="mt-auto w-full rounded-2xl bg-[#18372f] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#244d42]"
      >
        Join Ride
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
    time: "",
  });
  const [commutes, setCommutes] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [isLoadingPreference, setIsLoadingPreference] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [user, commuteData] = await Promise.all([
          getCurrentUser(),
          getCommutes(),
        ]);
        setFormData((currentData) => ({
          ...currentData,
          from: user.preferredFromLocation || "",
          to: user.preferredToLocation || "",
        }));
        setCommutes(commuteData);
      } catch {
        setFormData({
          from: "",
          to: "",
          time: "",
        });
        setCommutes([]);
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const searchParams = new URLSearchParams();

    if (formData.from.trim()) {
      searchParams.set("from", formData.from.trim());
    }

    if (formData.to.trim()) {
      searchParams.set("to", formData.to.trim());
    }

    if (formData.time) {
      searchParams.set("time", formData.time);
    }

    const queryString = searchParams.toString();
    router.push(queryString ? `/commutes?${queryString}` : "/commutes");
  }

  if (isCheckingAuth || isLoadingPreference) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Preparing dashboard..."}
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_12%,#d7efe3_0%,transparent_30%),linear-gradient(135deg,#f5f7f4_0%,#e9efe8_52%,#f8ead2_100%)] text-[#17211d]">
      <AuthenticatedNav />

      <section className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#18372f]/15 bg-white/72 p-5 shadow-sm backdrop-blur sm:p-6 lg:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6b58]">
              Quick route
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#18372f]">
              Find a commute from your route.
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,0.75fr)_auto] lg:items-end"
          >
            <label className="block">
              <span className="text-sm font-black text-[#18372f]">From</span>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Kuril"
                className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none transition placeholder:text-[#7d857f]/60 focus:border-[#18372f]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#18372f]">To</span>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="AIUB Campus"
                className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none transition placeholder:text-[#7d857f]/60 focus:border-[#18372f]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#18372f]">Time</span>
              <input
                type="datetime-local"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none transition focus:border-[#18372f]"
              />
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-[#18372f] px-6 py-3 font-black text-white shadow-sm transition hover:bg-[#244d42]"
            >
              Search
            </button>
          </form>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-[#18372f]">
              Recommended Commutes
            </h2>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-sm font-black text-[#18372f] hover:text-[#244d42]"
            >
              View All
            </button>
          </div>

          {recommendedCommutes.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-[#18372f]/10 bg-white/72 p-5 text-sm font-semibold text-[#66736d] backdrop-blur">
              No open commute posts are available right now.
            </p>
          ) : (
            <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {recommendedCommutes.map((commute) => (
                <RecommendedCommuteCard
                  key={commute.id}
                  commute={commute}
                  now={now}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
