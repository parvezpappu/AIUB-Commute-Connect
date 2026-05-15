"use client";

import { useEffect, useState } from "react";
import { getUserRatingSummary } from "../lib/api";

export default function UserRatingBadge({ userId, className = "" }) {
  const [ratingState, setRatingState] = useState(null);

  useEffect(() => {
    let isActive = true;

    if (!userId) {
      return undefined;
    }

    async function loadRatingSummary() {
      try {
        const data = await getUserRatingSummary(userId);
        if (isActive) {
          setRatingState({ userId, summary: data });
        }
      } catch {
        if (isActive) {
          setRatingState({
            userId,
            summary: { averageRating: null, ratingCount: 0 },
          });
        }
      }
    }

    loadRatingSummary();

    return () => {
      isActive = false;
    };
  }, [userId]);

  if (!userId) {
    return null;
  }

  const summary =
    ratingState?.userId === userId ? ratingState.summary : null;

  const baseClass =
    "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  if (!summary) {
    return (
      <span
        className={`${baseClass} border-slate-200 bg-slate-50 text-slate-500 ${className}`}
      >
        Rating...
      </span>
    );
  }

  if (!summary.ratingCount) {
    return (
      <span
        className={`${baseClass} border-slate-200 bg-slate-50 text-slate-500 ${className}`}
      >
        No rating
      </span>
    );
  }

  return (
    <span
      className={`${baseClass} border-amber-200 bg-amber-50 text-amber-700 ${className}`}
    >
      Rating {summary.averageRating}/5 ({summary.ratingCount})
    </span>
  );
}
