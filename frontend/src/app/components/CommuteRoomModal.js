"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LiveCommuteMap from "./LiveCommuteMap";
import {
  getCommute,
  getCommuteParticipants,
  getCurrentUser,
  updateCreatorCommuteLocation,
  updateMyCommuteLocation,
} from "../lib/api";

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

function isLocationPromptTime(departureTime, now) {
  const departureTimestamp = new Date(departureTime).getTime();

  if (!departureTime || Number.isNaN(departureTimestamp)) {
    return false;
  }

  const diff = departureTimestamp - now;
  return diff > 0 && diff <= 10 * 60 * 1000;
}

export default function CommuteRoomModal({ commuteId, onClose }) {
  const [commute, setCommute] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [isLocationPromptDismissed, setIsLocationPromptDismissed] =
    useState(false);
  const [now, setNow] = useState(() => Date.now());
  const watchIdRef = useRef(null);
  const mapSectionRef = useRef(null);

  const refreshParticipants = useCallback(async () => {
    const [commuteData, participantData] = await Promise.all([
      getCommute(commuteId),
      getCommuteParticipants(commuteId),
    ]);
    setCommute(commuteData);
    setParticipants(participantData);
  }, [commuteId]);

  useEffect(() => {
    async function loadCommuteRoom() {
      setIsLoading(true);
      setError("");

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

    loadCommuteRoom();
  }, [commuteId]);

  useEffect(() => {
    if (!isMapOpen) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshParticipants().catch(() => {});
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isMapOpen, refreshParticipants]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const myParticipation = participants.find(
    (participant) => participant.user?.id === currentUser?.id,
  );
  const isCreator = commute?.creator?.id === currentUser?.id;
  const canShareLocation = Boolean(myParticipation || isCreator);
  const shouldPromptLocation =
    commute &&
    canShareLocation &&
    !isSharingLocation &&
    !isLocationPromptDismissed &&
    isLocationPromptTime(commute.departureTime, now);

  function openMeetingPointOnMap() {
    setIsMapOpen(true);
    window.requestAnimationFrame(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

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
    setIsMapOpen(true);
    setIsLocationPromptDismissed(true);

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

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/60 px-4 py-5 backdrop-blur-sm">
      <section className="mx-auto flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#07131a]/15 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#07131a]/10 px-5 py-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#244b58]">
              Commute room
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#07131a]">
              {commute
                ? `${commute.fromLocation} to ${commute.toLocation}`
                : "Loading commute"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#07131a]/15 px-4 py-2 text-sm font-black text-[#07131a]"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {isLoading ? (
            <p className="rounded-2xl border border-[#1d5d82] bg-[#abc9d3] p-5 text-sm font-semibold text-[#4f6268]">
              Loading members and map...
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : (
            <div className="space-y-5">
              {shouldPromptLocation && (
                <div className="rounded-2xl border border-[#1d5d82] bg-[#abc9d3] p-4 shadow-sm">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-[#9a6a00]">
                        Departure soon
                      </p>
                      <h3 className="mt-1 text-lg font-black text-[#07131a]">
                        Share live location for this ride?
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#4f6268]">
                        Your commute starts within 10 minutes. Share location so
                        the group can see how far everyone is from the meeting
                        point.
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={handleStartLocationSharing}
                        className="rounded-2xl bg-[#07131a] px-4 py-2 text-sm font-black text-white"
                      >
                        Share location
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLocationPromptDismissed(true)}
                        className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2 text-sm font-black text-[#07131a]"
                      >
                        Not now
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-[#1d5d82] bg-[#abc9d3] p-4">
                <div className="rounded-2xl border border-[#1d5d82] bg-[#abc9d3] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                    Meeting point
                  </p>
                  <p className="mt-1 text-xl font-black text-[#07131a]">
                    {commute.meetingLocation || "Not specified"}
                  </p>
                  {commute.meetingAddress && (
                    <button
                      type="button"
                      onClick={openMeetingPointOnMap}
                      className="mt-2 block text-left text-sm font-semibold leading-6 text-[#244b58] underline decoration-[#244b58]/30 underline-offset-4 hover:text-[#07131a]"
                    >
                      {commute.meetingAddress}
                    </button>
                  )}
                </div>
                {commute.meetingLatitude && commute.meetingLongitude && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMapOpen((current) => !current)}
                        className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2 text-sm font-black text-[#07131a]"
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
                          className={`rounded-2xl px-4 py-2 text-sm font-black ${
                            isSharingLocation
                              ? "border border-rose-200 bg-white text-rose-700"
                              : "bg-[#07131a] text-white"
                          }`}
                        >
                          {isSharingLocation
                            ? "Stop sharing location"
                            : "Share my live location"}
                        </button>
                      )}
                    </div>

                    {locationError && (
                      <p className="mt-2 text-sm font-semibold text-red-600">
                        {locationError}
                      </p>
                    )}

                    {isMapOpen && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-[#07131a]/10">
                        <div ref={mapSectionRef} />
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

              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-[#1d5d82] bg-[#abc9d3] p-5">
                  <h3 className="text-lg font-black text-[#07131a]">Creator</h3>
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-[#07131a]">
                        {commute.creator?.fullName}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#4f6268]">
                      {commute.creator?.aiubId} · {commute.creator?.email}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#07131a]">
                      {formatDistance(
                        getDistanceInKm(
                          commute.creatorCurrentLatitude,
                          commute.creatorCurrentLongitude,
                          commute.meetingLatitude,
                          commute.meetingLongitude,
                        ),
                      )}
                    </p>
                    <p className="text-xs font-semibold text-[#4f6268]">
                      {formatLocationTime(commute.creatorLocationUpdatedAt)}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#1d5d82] bg-[#abc9d3]">
                  <div className="border-b border-[#07131a]/10 px-5 py-4">
                    <h3 className="text-lg font-black text-[#07131a]">
                      Joined members
                    </h3>
                    <p className="text-sm font-semibold text-[#4f6268]">
                      Students accepted into this commute.
                    </p>
                  </div>

                  {participants.length === 0 ? (
                    <p className="p-5 text-sm font-semibold text-[#4f6268]">
                      No accepted members yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#07131a]/10">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black text-[#07131a]">
                                {participant.user.fullName}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-[#4f6268]">
                              {participant.user.aiubId} ·{" "}
                              {participant.user.email}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#07131a]">
                              {formatDistance(
                                getDistanceInKm(
                                  participant.currentLatitude,
                                  participant.currentLongitude,
                                  commute.meetingLatitude,
                                  commute.meetingLongitude,
                                ),
                              )}
                            </p>
                            <p className="text-xs font-semibold text-[#4f6268]">
                              {formatLocationTime(participant.locationUpdatedAt)}
                            </p>
                          </div>
                          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            {participant.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


