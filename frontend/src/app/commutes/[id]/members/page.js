"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import LiveCommuteMap from "../../../components/LiveCommuteMap";
import {
  getCommute,
  getCommuteParticipants,
  getCurrentUser,
  updateCreatorCommuteLocation,
  updateMyCommuteLocation,
} from "../../../lib/api";
import { useRequireAuth } from "../../../lib/auth";

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

function getDistanceInKm(fromLatitude, fromLongitude, toLatitude, toLongitude) {
  if (!fromLatitude || !fromLongitude || !toLatitude || !toLongitude) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDiff = ((toLatitude - fromLatitude) * Math.PI) / 180;
  const longitudeDiff = ((toLongitude - fromLongitude) * Math.PI) / 180;
  const fromLatitudeRad = (fromLatitude * Math.PI) / 180;
  const toLatitudeRad = (toLatitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDiff / 2) * Math.sin(latitudeDiff / 2) +
    Math.cos(fromLatitudeRad) *
      Math.cos(toLatitudeRad) *
      Math.sin(longitudeDiff / 2) *
      Math.sin(longitudeDiff / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceKm) {
  if (distanceKm === null) {
    return "Location not shared";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m from meeting point`;
  }

  return `${distanceKm.toFixed(1)} km from meeting point`;
}

function formatLocationTime(value) {
  if (!value) {
    return "Not shared yet";
  }

  return `Updated ${new Intl.DateTimeFormat("en-BD", {
    timeStyle: "short",
  }).format(new Date(value))}`;
}

export default function CommuteMembersPage() {
  const params = useParams();
  const commuteId = params.id;
  const isCheckingAuth = useRequireAuth();

  const [commute, setCommute] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const watchIdRef = useRef(null);

  const refreshParticipants = useCallback(async () => {
    const [commuteData, participantData] = await Promise.all([
      getCommute(commuteId),
      getCommuteParticipants(commuteId),
    ]);
    setCommute(commuteData);
    setParticipants(participantData);
  }, [commuteId]);

  useEffect(() => {
    async function loadCommuteMembers() {
      try {
        const [userData, commuteData, participantData] = await Promise.all([
          getCurrentUser(),
          getCommute(commuteId),
          getCommuteParticipants(commuteId),
        ]);

        setCurrentUser(userData);
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

  useEffect(() => {
    if (!isMapOpen) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshParticipants().catch(() => {});
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [commuteId, isMapOpen, refreshParticipants]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const myParticipation = participants.find(
    (participant) => participant.user?.id === currentUser?.id,
  );
  const isCreator = commute?.creator?.id === currentUser?.id;
  const canShareLocation = Boolean(myParticipation || isCreator);

  function updateParticipantLocation(latitude, longitude) {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.user?.id === currentUser?.id
          ? {
              ...participant,
              currentLatitude: latitude,
              currentLongitude: longitude,
              locationUpdatedAt: new Date().toISOString(),
            }
          : participant,
      ),
    );
  }

  function updateCreatorLocation(latitude, longitude) {
    setCommute((currentCommute) => ({
      ...currentCommute,
      creatorCurrentLatitude: latitude,
      creatorCurrentLongitude: longitude,
      creatorLocationUpdatedAt: new Date().toISOString(),
    }));
  }

  function handleStartLocationSharing() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location sharing is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        try {
          if (isCreator) {
            await updateCreatorCommuteLocation(commuteId, {
              latitude,
              longitude,
            });
            updateCreatorLocation(latitude, longitude);
          } else {
            await updateMyCommuteLocation(commuteId, {
              latitude,
              longitude,
            });
            updateParticipantLocation(latitude, longitude);
          }
        } catch (error) {
          setLocationError(error.message);
        }
      },
      () => {
        setLocationError("Allow location access to share live location.");
        setIsSharingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    watchIdRef.current = watchId;
    setIsSharingLocation(true);
  }

  function handleStopLocationSharing() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsSharingLocation(false);
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Loading commute members..."}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] px-4">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] px-4 py-8 text-slate-950">
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
                {formatCommuteCost(commute)}
              </p>
            </div>
          </div>

          {commute.meetingLatitude && commute.meetingLongitude && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsMapOpen((current) => !current)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isMapOpen ? "Hide exact location" : "See exact location"}
                </button>

                {canShareLocation && (
                  <button
                    type="button"
                    onClick={
                      isSharingLocation
                        ? handleStopLocationSharing
                        : handleStartLocationSharing
                    }
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${
                      isSharingLocation
                        ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
                        : "bg-[#003b73] text-white hover:bg-[#002f5c]"
                    }`}
                  >
                    {isSharingLocation
                      ? "Stop sharing location"
                      : "Share my live location"}
                  </button>
                )}
              </div>

              {locationError && (
                <p className="mt-2 text-sm text-red-600">{locationError}</p>
              )}

              {isMapOpen && (
                <div className="mt-3">
                  <LiveCommuteMap
                    meetingLatitude={commute.meetingLatitude}
                    meetingLongitude={commute.meetingLongitude}
                    meetingLabel={commute.meetingLocation}
                    creatorLocation={{
                      latitude: commute.creatorCurrentLatitude,
                      longitude: commute.creatorCurrentLongitude,
                      name: commute.creator?.fullName
                        ? `${commute.creator.fullName} (creator)`
                        : "Creator",
                    }}
                    participants={participants}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-950">Creator</h2>
            <p className="mt-1 text-sm text-slate-600">
              Commute owner and live location status.
            </p>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">
                {commute.creator?.fullName}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              {commute.creator?.aiubId} - {commute.creator?.email}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatDistance(
                getDistanceInKm(
                  commute.creatorCurrentLatitude,
                  commute.creatorCurrentLongitude,
                  commute.meetingLatitude,
                  commute.meetingLongitude,
                ),
              )}
            </p>
            <p className="text-xs text-slate-500">
              {formatLocationTime(commute.creatorLocationUpdatedAt)}
            </p>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {participant.user.fullName}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {participant.user.aiubId} - {participant.user.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDistance(
                        getDistanceInKm(
                          participant.currentLatitude,
                          participant.currentLongitude,
                          commute.meetingLatitude,
                          commute.meetingLongitude,
                        ),
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatLocationTime(participant.locationUpdatedAt)}
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
