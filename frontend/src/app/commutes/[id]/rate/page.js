"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../../components/AuthenticatedNav";
import UserRatingBadge from "../../../components/UserRatingBadge";
import {
  getCommute,
  getCommuteParticipants,
  getCurrentUser,
  submitCommuteRatings,
} from "../../../lib/api";
import { useRequireStudent } from "../../../lib/auth";

const tripExperienceOptions = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Below Avg" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`text-2xl leading-none ${
            rating <= value ? "text-[#003b73]" : "text-slate-300"
          }`}
          aria-label={`${rating} star rating`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function RateCommutePage() {
  const params = useParams();
  const router = useRouter();
  const commuteId = params.id;
  const isCheckingAuth = useRequireStudent();
  const [commute, setCommute] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [overallRating, setOverallRating] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRatingContext() {
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

    loadRatingContext();
  }, [commuteId]);

  const rateableUsers = useMemo(() => {
    if (!commute || !currentUser) {
      return [];
    }

    const usersById = new Map();

    if (commute.creator?.id !== currentUser.id) {
      usersById.set(commute.creator.id, {
        ...commute.creator,
        label: "Creator",
      });
    }

    participants.forEach((participant) => {
      if (participant.user?.id !== currentUser.id) {
        usersById.set(participant.user.id, {
          ...participant.user,
          label: "Co-passenger",
        });
      }
    });

    return Array.from(usersById.values());
  }, [commute, currentUser, participants]);

  async function handleSubmit(skipFeedback = false) {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (!skipFeedback) {
        await submitCommuteRatings(commuteId, {
          overallRating: overallRating || undefined,
          userRatings: Object.entries(userRatings)
            .filter(([, rating]) => rating > 0)
            .map(([ratedUserId, rating]) => ({
              ratedUserId: Number(ratedUserId),
              rating,
            })),
        });
        setMessage("Feedback submitted successfully.");
      }

      router.push("/commutes/joined");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Loading rating form..."}
        </p>
      </main>
    );
  }

  if (error && !commute) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-slate-950">
        <AuthenticatedNav />
        <section className="mx-auto max-w-xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-slate-950">
      <AuthenticatedNav />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-950">
              Rate Your {commute.transportType} Group
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Your ride from{" "}
              <span className="font-semibold text-[#003b73]">
                {commute.fromLocation}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[#003b73]">
                {commute.toLocation}
              </span>{" "}
              is complete. Please rate your group to maintain community
              standards.
            </p>
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

          <div className="mt-6 overflow-hidden rounded-md border border-slate-200">
            <div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <p>Group member</p>
              <p>Rating</p>
            </div>

            {rateableUsers.length === 0 ? (
              <p className="px-4 py-5 text-sm text-slate-500">
                No group members to rate.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {rateableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {user.fullName}
                        </p>
                        <UserRatingBadge userId={user.id} />
                      </div>
                      <p className="text-sm text-slate-500">
                        {user.label} - ID: {user.aiubId}
                      </p>
                    </div>

                    <StarRating
                      value={userRatings[user.id] || 0}
                      onChange={(rating) =>
                        setUserRatings((currentRatings) => ({
                          ...currentRatings,
                          [user.id]: rating,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              Overall Trip Experience
            </h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {tripExperienceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOverallRating(option.value)}
                  className={`rounded-md border px-2 py-3 text-sm font-semibold ${
                    overallRating === option.value
                      ? "border-[#003b73] bg-[#003b73] text-white"
                      : "border-slate-200 text-slate-600 hover:border-[#003b73]/40"
                  }`}
                >
                  <span className="block text-lg">★</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/commutes/joined"
              className="rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
