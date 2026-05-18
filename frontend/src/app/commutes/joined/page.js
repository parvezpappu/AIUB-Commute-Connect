"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import CommuteRoomModal from "../../components/CommuteRoomModal";
import MeetingPointTooltip from "../../components/MeetingPointTooltip";
import UserRatingBadge from "../../components/UserRatingBadge";
import {
  deleteParticipationHistory,
  getMyCommutes,
  getMyParticipations,
  leaveCommute,
} from "../../lib/api";
import { useRequireStudent } from "../../lib/auth";

const statusStyles = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-600",
};

const genderPreferenceLabels = {
  MALE: "Male only",
  FEMALE: "Female only",
  BOTH: "Male/Female",
};

const pageBackground =
  "radial-gradient(circle at 78% 18%, rgba(160,183,190,0.42) 0%, transparent 34%), linear-gradient(115deg, #07131a 0%, #17303a 32%, #4f6268 70%, #d7dedc 100%)";

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

export default function JoinedCommutesPage() {
  const isCheckingAuth = useRequireStudent();
  const [participations, setParticipations] = useState([]);
  const [myCommutes, setMyCommutes] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [leavingId, setLeavingId] = useState(null);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
  const [openHistoryId, setOpenHistoryId] = useState(null);
  const [roomCommuteId, setRoomCommuteId] = useState(null);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  async function loadParticipations() {
    setError("");

    try {
      const [participationData, commuteData] = await Promise.all([
        getMyParticipations(),
        getMyCommutes(),
      ]);
      setParticipations(participationData);
      setMyCommutes(commuteData);
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  function getCountdown(value) {
    const target = new Date(value).getTime();

    if (!value || Number.isNaN(target)) {
      return "No close time set";
    }

    const diff = target - now;

    if (diff <= 0) {
      return "Request window closed";
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

  const acceptedParticipations = useMemo(() => {
    return participations.filter(
      (item) =>
        item.status === "ACCEPTED" &&
        item.commute.status !== "CLOSED" &&
        item.commute.status !== "COMPLETED",
    );
  }, [participations]);

  const currentCreatedCommutes = useMemo(() => {
    return myCommutes
      .filter(
        (commute) => commute.status === "OPEN" || commute.status === "CLOSED",
      )
      .sort(
        (firstCommute, secondCommute) =>
          new Date(firstCommute.departureTime).getTime() -
          new Date(secondCommute.departureTime).getTime(),
      );
  }, [myCommutes]);

  const pendingParticipations = useMemo(() => {
    return participations.filter((item) => item.status === "PENDING");
  }, [participations]);

  const historyParticipations = useMemo(() => {
    return participations.filter(
      (item) =>
        item.status === "REJECTED" ||
        item.status === "CANCELLED" ||
        item.commute.status === "CLOSED" ||
        item.commute.status === "COMPLETED",
    );
  }, [participations]);

  const isAllHistorySelected =
    historyParticipations.length > 0 &&
    selectedHistoryIds.length === historyParticipations.length;

  function handleHistorySelection(participationId) {
    setSelectedHistoryIds((currentIds) =>
      currentIds.includes(participationId)
        ? currentIds.filter((id) => id !== participationId)
        : [...currentIds, participationId],
    );
  }

  function handleSelectAllHistory() {
    if (isAllHistorySelected) {
      setSelectedHistoryIds([]);
      return;
    }

    setSelectedHistoryIds(
      historyParticipations.map((participation) => participation.id),
    );
  }

  async function handleDeleteSelectedHistory() {
    if (selectedHistoryIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedHistoryIds.length} selected history record?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsDeletingHistory(true);

    try {
      await Promise.all(
        selectedHistoryIds.map((id) => deleteParticipationHistory(id)),
      );
      setMessage("Selected history deleted successfully.");
      setSelectedHistoryIds([]);
      setOpenHistoryId(null);
      await loadParticipations();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeletingHistory(false);
    }
  }

  function renderParticipationCard(participation) {
    const commute = participation.commute;
    const statusClass =
      statusStyles[participation.status] || statusStyles.CANCELLED;
    const isAccepted = participation.status === "ACCEPTED";

    return (
      <article
        key={participation.id}
        className="overflow-hidden rounded-[24px] border border-[#07131a]/15 bg-white/82 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black text-[#07131a]">
              {commute.transportType}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
            >
              {participation.status}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black text-[#07131a]">
            {commute.fromLocation} to {commute.toLocation}
          </h2>

          {isAccepted ? (
            <div className="mt-3 space-y-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f4f7f4] p-3">
                  <p className="text-xs font-bold uppercase text-[#56696f]">From</p>
                  <p className="mt-1 text-sm font-black text-[#07131a]">
                    {commute.fromLocation}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f4f7f4] p-3">
                  <p className="text-xs font-bold uppercase text-[#56696f]">
                    Destination
                  </p>
                  <p className="mt-1 text-sm font-black text-[#07131a]">
                    {commute.toLocation}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f4f7f4] p-3">
                <p className="text-xs font-bold uppercase text-[#56696f]">
                  Meeting point
                </p>
                <p className="mt-1 text-sm font-black text-[#07131a]">
                  <MeetingPointTooltip
                    label={commute.meetingLocation}
                    tooltip={commute.meetingAddress || commute.meetingLocation}
                  />
                </p>
              </div>

              <div className="rounded-2xl border border-[#8ed8ff]/35 bg-[#e8eef0] p-3">
                <p className="text-xs font-black uppercase text-[#244b58]">
                  Countdown
                </p>
                <p className="mt-1 text-base font-black text-[#07131a]">
                  {getCountdown(commute.expiresAt || commute.departureTime)}
                </p>
              </div>
            </div>
          ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f4f7f4] p-3 sm:col-span-2">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Meeting point
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                <MeetingPointTooltip
                  label={commute.meetingLocation}
                  tooltip={
                    participation.status === "ACCEPTED"
                      ? commute.meetingAddress || commute.meetingLocation
                      : commute.meetingLocation
                  }
                />
              </p>
              {participation.status === "ACCEPTED" &&
                commute.meetingAddress && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {commute.meetingAddress}
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-[#f4f7f4] p-3">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Departure
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                {formatDateTime(commute.departureTime)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f7f4] p-3">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Cost/person
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                {formatCommuteCost(commute)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f7f4] p-3">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Requested
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                {formatDateTime(participation.joinedAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f7f4] p-3">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Commute status
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                {commute.status}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f7f4] p-3">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Who can join
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                {genderPreferenceLabels[commute.participantGenderPreference] ||
                  "Male/Female"}
              </p>
            </div>
          </div>
          )}

          <div className="mt-3 rounded-2xl border border-[#07131a]/15 bg-white/70 p-3">
            <p className="text-xs font-bold uppercase text-[#56696f]">
              Creator
            </p>
            <p className="mt-1 text-sm font-black text-[#07131a]">
              {commute.creator?.fullName}
            </p>
            <UserRatingBadge userId={commute.creator?.id} className="mt-2" />
            <p className="text-xs text-slate-500">{commute.creator?.aiubId}</p>
          </div>

          {participation.status === "ACCEPTED" && (
            <button
              type="button"
              onClick={() => setRoomCommuteId(commute.id)}
              className="mt-3 block rounded-2xl bg-[#07131a] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#0b1d25]"
            >
              View commute members
            </button>
          )}

          {participation.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => handleLeave(commute.id)}
              disabled={leavingId === commute.id}
              className="mt-3 w-full rounded-md border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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

  function renderCreatedCommuteCard(commute) {
    return (
      <article
        key={commute.id}
        className="overflow-hidden rounded-[24px] border border-[#07131a]/15 bg-white/82 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black text-[#07131a]">
              Created by you
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {commute.status}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black text-[#07131a]">
            {commute.fromLocation} to {commute.toLocation}
          </h2>

          <div className="mt-3 space-y-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f4f7f4] p-3">
                <p className="text-xs font-bold uppercase text-[#56696f]">From</p>
                <p className="mt-1 text-sm font-black text-[#07131a]">
                  {commute.fromLocation}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f4f7f4] p-3">
                <p className="text-xs font-bold uppercase text-[#56696f]">
                  Destination
                </p>
                <p className="mt-1 text-sm font-black text-[#07131a]">
                  {commute.toLocation}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f7f4] p-3">
              <p className="text-xs font-bold uppercase text-[#56696f]">
                Meeting point
              </p>
              <p className="mt-1 text-sm font-black text-[#07131a]">
                <MeetingPointTooltip
                  label={commute.meetingLocation}
                  tooltip={commute.meetingAddress || commute.meetingLocation}
                />
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#8ed8ff]/35 bg-[#e8eef0] p-3">
                <p className="text-xs font-black uppercase text-[#244b58]">
                  Countdown
                </p>
                <p className="mt-1 text-base font-black text-[#07131a]">
                  {getCountdown(commute.expiresAt || commute.departureTime)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f4f7f4] p-3">
                <p className="text-xs font-bold uppercase text-[#56696f]">Seats</p>
                <p className="mt-1 text-sm font-black text-[#07131a]">
                  {commute.acceptedSeats ?? 0}/{commute.seats}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f4f7f4] p-3">
                <p className="text-xs font-bold uppercase text-[#56696f]">
                  Cost/person
                </p>
                <p className="mt-1 text-sm font-black text-[#07131a]">
                  {formatCommuteCost(commute)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRoomCommuteId(commute.id)}
              className="block rounded-2xl bg-[#07131a] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#0b1d25]"
            >
              View members and map
            </button>
            <Link
              href="/commutes/my"
              className="block rounded-2xl border border-[#07131a]/20 bg-white/60 px-4 py-3 text-center text-sm font-black text-[#07131a] transition hover:bg-white"
            >
              Manage post
            </Link>
          </div>
        </div>
      </article>
    );
  }

  function renderCreatedCommutesSection() {
    return (
      <section className="mt-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
          <h2 className="text-2xl font-black text-[#07131a]">
            Created/current commutes
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#4f6268]">
            Commutes you created that are still active for members and map
            tracking.
          </p>
          </div>
          <Link
            href="/commutes/my"
            className="w-fit rounded-2xl border border-[#07131a]/15 bg-white/80 px-4 py-2.5 text-sm font-black text-[#07131a] shadow-sm transition hover:bg-white"
          >
            Manage posts
          </Link>
        </div>

        {currentCreatedCommutes.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-[#07131a]/20 bg-white/72 p-6 text-sm font-semibold text-[#4f6268] backdrop-blur">
            Nothing here yet.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {currentCreatedCommutes.map((commute) =>
              renderCreatedCommuteCard(commute),
            )}
          </div>
        )}
      </section>
    );
  }

  function renderParticipationSection(title, description, items) {
    return (
      <section className="mt-6">
        <div className="mb-4">
          <h2 className="text-2xl font-black text-[#07131a]">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-[#4f6268]">
            {description}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-[#07131a]/20 bg-white/72 p-6 text-sm font-semibold text-[#4f6268] backdrop-blur">
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

  function renderHistorySection() {
    return (
      <section className="mt-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black text-[#07131a]">History</h2>
            <p className="mt-1 text-sm font-semibold text-[#4f6268]">
              Closed, rejected, and cancelled participation records.
            </p>
          </div>

          {historyParticipations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSelectAllHistory}
                className="rounded-2xl border border-[#07131a]/20 bg-white/70 px-4 py-2 text-sm font-black text-[#07131a] hover:bg-white"
              >
                {isAllHistorySelected ? "Clear selection" : "Select all"}
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedHistory}
                disabled={selectedHistoryIds.length === 0 || isDeletingHistory}
                className="rounded-2xl border border-rose-200 bg-white/70 px-4 py-2 text-sm font-black text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                {isDeletingHistory
                  ? "Deleting..."
                  : `Delete selected (${selectedHistoryIds.length})`}
              </button>
            </div>
          )}
        </div>

        {historyParticipations.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-[#07131a]/20 bg-white/72 p-6 text-sm font-semibold text-[#4f6268] backdrop-blur">
            Nothing here yet.
          </p>
        ) : (
          <div className="space-y-3">
            {historyParticipations.map((participation) => {
              const commute = participation.commute;
              const isOpen = openHistoryId === participation.id;
              const isSelected = selectedHistoryIds.includes(participation.id);

              return (
                <article
                  key={participation.id}
                  className="rounded-[24px] border border-[#07131a]/15 bg-white/82 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleHistorySelection(participation.id)}
                        className="mt-1 h-4 w-4"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHistoryId(isOpen ? null : participation.id)
                        }
                        className="text-left"
                      >
                        <p className="font-black text-[#07131a]">
                          {commute.fromLocation} to {commute.toLocation}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#4f6268]">
                          {formatDateTime(commute.departureTime)}
                        </p>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black text-[#07131a]">
                        {commute.status === "CLOSED"
                          ? "CLOSED"
                          : participation.status}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHistoryId(isOpen ? null : participation.id)
                        }
                        className="rounded-2xl border border-[#07131a]/20 bg-white/70 px-3 py-2 text-sm font-black text-[#07131a]"
                      >
                        {isOpen ? "Hide" : "Details"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-[#07131a]/10 p-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-[#f4f7f4] p-3">
                          <p className="text-xs font-bold uppercase text-[#56696f]">
                            Meeting point
                          </p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            <MeetingPointTooltip
                              label={commute.meetingLocation}
                              tooltip={
                                commute.meetingAddress ||
                                commute.meetingLocation
                              }
                            />
                          </p>
                          {participation.status === "ACCEPTED" &&
                            commute.meetingAddress && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {commute.meetingAddress}
                            </p>
                          )}
                        </div>
                        <div className="rounded-2xl bg-[#f4f7f4] p-3">
                          <p className="text-xs font-bold uppercase text-[#56696f]">
                            Transport
                          </p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            {commute.transportType}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#f4f7f4] p-3">
                          <p className="text-xs font-bold uppercase text-[#56696f]">
                            Cost/person
                          </p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            {formatCommuteCost(commute)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#f4f7f4] p-3">
                          <p className="text-xs font-bold uppercase text-[#56696f]">
                            Requested
                          </p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            {formatDateTime(participation.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: pageBackground }}
      >
        <p className="font-semibold text-[#4f6268]">
          {isCheckingAuth ? "Checking session..." : "Loading your rides..."}
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
      <section className="mx-auto max-w-6xl px-4 py-6">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {participations.length === 0 && currentCreatedCommutes.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#07131a]/20 bg-white/75 p-10 text-center shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur">
            <h2 className="text-xl font-black text-[#07131a]">
              No rides yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[#4f6268]">
              Browse available commute posts or create your own ride when you
              are ready.
            </p>
            <Link
              href="/commutes"
              className="mt-5 inline-block rounded-2xl bg-[#07131a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b1d25]"
            >
              Browse commutes
            </Link>
          </div>
        ) : (
          <>
            {renderCreatedCommutesSection()}
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
            {renderHistorySection()}
          </>
        )}
      </section>

      {roomCommuteId && (
        <CommuteRoomModal
          commuteId={roomCommuteId}
          onClose={() => setRoomCommuteId(null)}
        />
      )}
    </main>
  );
}
