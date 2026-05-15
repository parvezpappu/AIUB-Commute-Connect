"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import { useRequireStudent } from "../../lib/auth";
import {
  cancelCommute,
  closeCommute,
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
    const actionLabel = action === "close" ? "closed" : "cancelled";
    setMessage("");
    setError("");
    setManagingId(commuteId);

    try {
      if (action === "close") {
        await closeCommute(commuteId);
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
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Loading your commute posts..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#003b73]">
              Creator dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              My commute posts
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review pending join requests and manage seat availability.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/commutes"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Browse
            </Link>
            <Link
              href="/commutes/create"
              className="rounded-md bg-[#003b73] px-4 py-2 text-sm font-semibold text-white"
            >
              Create commute
            </Link>
          </div>
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

        {commutes.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              You have not created a commute yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Create a commute post first, then incoming join requests will show
              up here.
            </p>
            <Link
              href="/commutes/create"
              className="mt-5 inline-block rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white"
            >
              Create commute
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {commutes.map((commute) => {
              const requests = requestsByCommute[commute.id] || [];
              const participants = participantsByCommute[commute.id] || [];

              return (
                <article
                  key={commute.id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#003b73]/10 px-3 py-1 text-xs font-semibold text-[#003b73]">
                          {commute.transportType}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {commute.status}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold text-slate-950">
                        {commute.fromLocation} to {commute.toLocation}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatDateTime(commute.departureTime)}
                      </p>

                      <div className="mt-4 rounded-md border border-slate-200 p-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Meeting point
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {commute.meetingLocation || "Not specified"}
                        </p>
                        {commute.meetingAddress && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {commute.meetingAddress}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCommuteAction(commute.id, "close")}
                          disabled={
                            managingId === commute.id ||
                            commute.status === "CLOSED" ||
                            commute.status === "CANCELLED"
                          }
                          className="rounded-md bg-[#003b73] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {commute.status === "CLOSED"
                            ? "Closed"
                            : managingId === commute.id
                              ? "Updating..."
                              : "Close post"}
                        </button>

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
                          className="rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                        >
                          {commute.status === "CANCELLED"
                            ? "Cancelled"
                            : "Cancel post"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Total seats</p>
                          <p className="text-lg font-semibold">
                            {commute.seats}
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Seats left</p>
                          <p className="text-lg font-semibold">
                            {commute.availableSeats ?? commute.seats}
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Accepted</p>
                          <p className="text-lg font-semibold">
                            {commute.acceptedSeats ?? 0}
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Cost</p>
                          <p className="text-lg font-semibold">
                            Tk {commute.costPerPerson}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                    <div className="rounded-md border border-slate-200">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          Pending requests
                        </p>
                        <p className="text-sm text-slate-500">
                          {requests.length} request waiting
                        </p>
                      </div>

                      {requests.length === 0 ? (
                        <p className="p-4 text-sm text-slate-500">
                          No pending requests for this commute.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {requests.map((request) => (
                            <div
                              key={request.id}
                              className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                            >
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {request.user.fullName}
                                </p>
                                <p className="text-sm text-slate-500">
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
                                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
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
                                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:text-slate-400"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border border-slate-200">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          Accepted members
                        </p>
                        <p className="text-sm text-slate-500">
                          {participants.length} student joined
                        </p>
                      </div>

                      {participants.length === 0 ? (
                        <p className="p-4 text-sm text-slate-500">
                          No accepted members for this commute yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {participants.map((participant) => (
                            <div key={participant.id} className="p-4">
                              <p className="font-semibold text-slate-900">
                                {participant.user.fullName}
                              </p>
                              <p className="text-sm text-slate-500">
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
    </main>
  );
}
