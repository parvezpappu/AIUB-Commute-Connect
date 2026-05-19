"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import CommuteRoomModal from "../../components/CommuteRoomModal";
import MeetingPointTooltip from "../../components/MeetingPointTooltip";
import { useRequireStudent } from "../../lib/auth";
import {
  cancelCommute,
  closeCommute,
  completeCommute,
  getCommuteParticipants,
  getCommuteRequests,
  getMyCommutes,
  updateJoinRequest,
} from "../../lib/api";

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

const genderPreferenceLabels = {
  MALE: "Male only",
  FEMALE: "Female only",
  BOTH: "Male/Female",
};

function isExpired(value) {
  return value ? new Date(value).getTime() <= Date.now() : false;
}

function canFinishJourney(commute) {
  return (
    commute.status !== "COMPLETED" &&
    commute.status !== "CANCELLED" &&
    (commute.status === "CLOSED" || isExpired(commute.expiresAt))
  );
}

const statusStyles = {
  OPEN: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-[#07131a]/10 text-[#07131a]",
  CANCELLED: "bg-rose-50 text-rose-700",
};

export default function MyCommutesPage() {
  const isCheckingAuth = useRequireStudent();
  const [commutes, setCommutes] = useState([]);
  const [requestsByCommute, setRequestsByCommute] = useState({});
  const [participantsByCommute, setParticipantsByCommute] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");
  const [managingId, setManagingId] = useState(null);
  const [roomCommuteId, setRoomCommuteId] = useState(null);

  async function loadData() {
    setError("");

    try {
      const myCommutes = await getMyCommutes();
      setCommutes(myCommutes);

      const requestEntries = await Promise.all(
        myCommutes.map(async (commute) => {
          const requests = await getCommuteRequests(commute.id);
          return [commute.id, requests];
        }),
      );

      setRequestsByCommute(Object.fromEntries(requestEntries));

      const participantEntries = await Promise.all(
        myCommutes.map(async (commute) => {
          const participants = await getCommuteParticipants(commute.id);
          return [commute.id, participants];
        }),
      );

      setParticipantsByCommute(Object.fromEntries(participantEntries));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  async function handleRequest(commuteId, userId, status) {
    setMessage("");
    setError("");
    setUpdatingKey(`${commuteId}-${userId}-${status}`);

    try {
      await updateJoinRequest(commuteId, userId, status);
      setMessage(`Request ${status.toLowerCase()} successfully.`);
      await loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingKey("");
    }
  }

  async function handleCommuteAction(commuteId, action) {
    const actionLabel =
      action === "close"
        ? "closed"
        : action === "finish"
          ? "finished and deleted"
          : "cancelled";
    setMessage("");
    setError("");
    setManagingId(commuteId);

    try {
      if (action === "close") {
        await closeCommute(commuteId);
      } else if (action === "finish") {
        await completeCommute(commuteId);
      } else {
        await cancelCommute(commuteId);
      }

      setMessage(`Commute ${actionLabel} successfully.`);
      await loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setManagingId(null);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)]">
        <p className="text-[#4f6268]">
          {isCheckingAuth ? "Checking session..." : "Loading your commute posts..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-[#07131a]">
      <AuthenticatedNav />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#1d5d82] bg-[#abc9d3] p-5 shadow-sm backdrop-blur sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#244b58]">
              Creator control
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#07131a]">
              My commute posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-[#4f6268]">
              Review pending join requests and manage seat availability.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/commutes"
              className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 text-sm font-black text-[#07131a] transition hover:border-[#07131a]/35"
            >
              Browse
            </Link>
            <Link
              href="/commutes/create"
              className="rounded-2xl bg-[#07131a] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#17303a]"
            >
              Create commute
            </Link>
          </div>
          </div>

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

        {commutes.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#07131a]/20 bg-white/72 p-10 text-center backdrop-blur">
            <h2 className="text-xl font-black text-[#07131a]">
              You have not created a commute yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[#4f6268]">
              Create a commute post first, then incoming join requests will show
              up here.
            </p>
            <Link
              href="/commutes/create"
              className="mt-5 inline-block rounded-2xl bg-[#07131a] px-5 py-3 text-sm font-black text-white"
            >
              Create commute
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {commutes.map((commute) => {
              const requests = requestsByCommute[commute.id] || [];
              const participants = participantsByCommute[commute.id] || [];
              const statusClass =
                statusStyles[commute.status] || "bg-[#dbe6ea] text-[#4f6268]";

              return (
                <article
                  key={commute.id}
                  className="overflow-hidden rounded-[28px] border border-[#1d5d82] bg-[#abc9d3] shadow-sm backdrop-blur"
                >
                  <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black text-[#244b58]">
                          {commute.transportType}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${statusClass}`}
                        >
                          {commute.status}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-black text-[#07131a]">
                        {commute.fromLocation} to {commute.toLocation}
                      </h2>

                      <p className="mt-2 text-sm font-semibold text-[#4f6268]">
                        {formatDateTime(commute.departureTime)}
                      </p>

                      <div className="mt-4 rounded-2xl border border-[#02121b] bg-white/75 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#56696f]">
                          Meeting point
                        </p>
                        <p className="mt-1 text-sm font-black text-[#07131a]">
                          <MeetingPointTooltip
                            label={commute.meetingLocation}
                            tooltip={
                              commute.meetingAddress || commute.meetingLocation
                            }
                          />
                        </p>
                        {commute.meetingAddress && (
                          <p className="mt-1 text-xs leading-5 text-[#4f6268]">
                            {commute.meetingAddress}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Link
                          href={`/commutes/${commute.id}/edit`}
                          className={`rounded-2xl border px-4 py-2.5 text-center text-sm font-black ${
                            commute.status === "OPEN"
                              ? "border-[#07131a]/15 bg-white text-[#07131a]"
                              : "pointer-events-none border-slate-200 text-slate-400"
                          }`}
                        >
                          Edit post
                        </Link>

                        <button
                          type="button"
                          onClick={() => setRoomCommuteId(commute.id)}
                          className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 text-center text-sm font-black text-[#07131a]"
                        >
                          View members & map
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCommuteAction(commute.id, "close")}
                          disabled={
                            managingId === commute.id ||
                            commute.status === "CLOSED" ||
                            commute.status === "CANCELLED"
                          }
                          className="rounded-2xl bg-[#07131a] px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {commute.status === "CLOSED"
                            ? "Closed"
                            : managingId === commute.id
                              ? "Updating..."
                              : "Close post"}
                        </button>

                        {canFinishJourney(commute) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCommuteAction(commute.id, "finish")
                            }
                            disabled={managingId === commute.id}
                            className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {managingId === commute.id
                              ? "Finishing..."
                              : "Finish journey"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            window.confirm(
                              "Cancel this commute post? Students will no longer be able to join it.",
                            ) && handleCommuteAction(commute.id, "cancel")
                          }
                          disabled={
                            managingId === commute.id ||
                            commute.status === "CANCELLED"
                          }
                          className="rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-black text-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:col-span-2"
                        >
                          {commute.status === "CANCELLED"
                            ? "Cancelled"
                            : "Cancel post"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-[#02121b] bg-white/75 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#56696f]">Who can join</p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            {genderPreferenceLabels[
                              commute.participantGenderPreference
                            ] || "Male/Female"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#02121b] bg-white/75 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#56696f]">Total seats</p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            {commute.seats}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#02121b] bg-white/75 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#56696f]">Seats left</p>
                          <p className="mt-1 text-sm font-black text-[#0f6b50]">
                            {commute.availableSeats ?? commute.seats}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#02121b] bg-white/75 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#56696f]">Accepted</p>
                          <p className="mt-1 text-sm font-black text-[#07131a]">
                            {commute.acceptedSeats ?? 0}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#02121b] bg-white/75 p-3 sm:col-span-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#56696f]">Cost</p>
                          <p className="mt-1 text-sm font-black text-[#9a6a00]">
                            {formatCommuteCost(commute)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-[#1d5d82] bg-[#abc9d3]">
                      <div className="border-b border-[#07131a]/10 bg-[#e8eef0]/70 px-4 py-3">
                        <p className="font-black text-[#07131a]">
                          Pending requests
                        </p>
                        <p className="text-sm font-semibold text-[#4f6268]">
                          {requests.length} request waiting
                        </p>
                      </div>

                      {requests.length === 0 ? (
                        <p className="p-4 text-sm font-semibold text-[#4f6268]">
                          No pending requests for this commute.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#07131a]/10">
                          {requests.map((request) => (
                            <div
                              key={request.id}
                              className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black text-[#07131a]">
                                    {request.user.fullName}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-[#4f6268]">
                                  {request.user.aiubId} - {request.user.email}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRequest(
                                      commute.id,
                                      request.user.id,
                                      "ACCEPTED",
                                    )
                                  }
                                  disabled={
                                    updatingKey ===
                                    `${commute.id}-${request.user.id}-ACCEPTED`
                                  }
                                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300"
                                >
                                  Accept
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRequest(
                                      commute.id,
                                      request.user.id,
                                      "REJECTED",
                                    )
                                  }
                                  disabled={
                                    updatingKey ===
                                    `${commute.id}-${request.user.id}-REJECTED`
                                  }
                                  className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2 text-sm font-black text-[#07131a] disabled:text-slate-400"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[#1d5d82] bg-[#abc9d3]">
                      <div className="border-b border-[#07131a]/10 bg-[#dbe6ea]/80 px-4 py-3">
                        <p className="font-black text-[#07131a]">
                          Accepted members
                        </p>
                        <p className="text-sm font-semibold text-[#4f6268]">
                          {participants.length} student joined
                        </p>
                      </div>

                      {participants.length === 0 ? (
                        <p className="p-4 text-sm font-semibold text-[#4f6268]">
                          No accepted members for this commute yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#07131a]/10">
                          {participants.map((participant) => (
                            <div key={participant.id} className="p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black text-[#07131a]">
                                  {participant.user.fullName}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-[#4f6268]">
                                {participant.user.aiubId} -{" "}
                                {participant.user.email}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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





