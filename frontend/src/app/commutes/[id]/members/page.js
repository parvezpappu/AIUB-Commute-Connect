"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MapPreview from "../../../components/MapPreview";
import { getCommute, getCommuteParticipants } from "../../../lib/api";
import { useRequireAuth } from "../../../lib/auth";

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CommuteMembersPage() {
  const params = useParams();
  const commuteId = params.id;
  const isCheckingAuth = useRequireAuth();

  const [commute, setCommute] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCommuteMembers() {
      try {
        const [commuteData, participantData] = await Promise.all([
          getCommute(commuteId),
          getCommuteParticipants(commuteId),
        ]);

        setCommute(commuteData);
        setParticipants(participantData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCommuteMembers();
  }, [commuteId]);

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Loading commute members..."}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Members unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            href="/commutes/joined"
            className="mt-5 inline-block rounded-md bg-[#003b73] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to joined commutes
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#003b73]">
                Accepted commute
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {commute.fromLocation} to {commute.toLocation}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {commute.transportType} - {formatDateTime(commute.departureTime)}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Dashboard
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-md bg-slate-50 p-4 sm:col-span-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Meeting point
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {commute.meetingLocation || "Not specified"}
              </p>
              {commute.meetingAddress && (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {commute.meetingAddress}
                </p>
              )}
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Status
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {commute.status}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Seats
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {commute.acceptedSeats ?? participants.length}/{commute.seats}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Seats left
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {commute.availableSeats ?? commute.seats - participants.length}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Cost/person
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Tk {commute.costPerPerson}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <MapPreview
              latitude={commute.meetingLatitude}
              longitude={commute.meetingLongitude}
              label={commute.meetingLocation}
            />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-950">
              Joined members
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Students accepted into this commute.
            </p>
          </div>

          {participants.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No accepted members yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {participant.user.fullName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {participant.user.aiubId} - {participant.user.email}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {participant.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
