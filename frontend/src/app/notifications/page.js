"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../components/AuthenticatedNav";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/api";
import { useRequireAuth } from "../lib/auth";

const pageBackground =
  "radial-gradient(circle at 78% 18%, rgba(160,183,190,0.42) 0%, transparent 34%), linear-gradient(115deg, #07131a 0%, #17303a 32%, #4f6268 70%, #d7dedc 100%)";

const filters = [
  { label: "All", value: "ALL" },
  { label: "Unread", value: "UNREAD" },
  { label: "Requests", value: "REQUESTS" },
  { label: "Decisions", value: "DECISIONS" },
  { label: "Ride updates", value: "RIDES" },
];

function getNotificationHref(notification) {
  if (notification.type === "JOIN_REQUEST") {
    return "/commutes/my";
  }

  return "/commutes/joined";
}

function getNotificationTitle(type) {
  if (type === "JOIN_REQUEST") {
    return "New join request";
  }

  if (type === "REQUEST_ACCEPTED") {
    return "Request accepted";
  }

  if (type === "COMMUTE_COMPLETED") {
    return "Ride completed";
  }

  return "Request rejected";
}

function getNotificationTone(type) {
  if (type === "JOIN_REQUEST") {
    return "border-[#8ed8ff]/40 bg-[#e8eef0] text-[#244b58]";
  }

  if (type === "REQUEST_ACCEPTED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "COMMUTE_COMPLETED") {
    return "border-[#07131a]/15 bg-[#07131a]/10 text-[#07131a]";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function formatNotificationTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function matchesFilter(notification, activeFilter) {
  if (activeFilter === "UNREAD") {
    return !notification.isRead;
  }

  if (activeFilter === "REQUESTS") {
    return notification.type === "JOIN_REQUEST";
  }

  if (activeFilter === "DECISIONS") {
    return (
      notification.type === "REQUEST_ACCEPTED" ||
      notification.type === "REQUEST_REJECTED"
    );
  }

  if (activeFilter === "RIDES") {
    return notification.type === "COMMUTE_COMPLETED";
  }

  return true;
}

export default function NotificationsPage() {
  const isCheckingAuth = useRequireAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setError("");

    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) =>
      matchesFilter(notification, activeFilter),
    );
  }, [activeFilter, notifications]);

  async function handleMarkRead(notification) {
    if (notification.isRead) {
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ),
    );

    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === notification.id ? { ...item, isRead: false } : item,
        ),
      );
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || isMarkingAll) {
      return;
    }

    const previousNotifications = notifications;
    setIsMarkingAll(true);

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previousNotifications);
    } finally {
      setIsMarkingAll(false);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: pageBackground }}
      >
        <p className="font-semibold text-[#4f6268]">
          {isCheckingAuth ? "Checking session..." : "Loading notifications..."}
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

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-[28px] border border-[#07131a]/15 bg-white/80 p-5 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#244b58]">
                Activity center
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#07131a]">
                Notifications
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#4f6268]">
                See all requests, decisions, and completed ride updates.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="w-fit rounded-2xl bg-[#07131a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b1d25] disabled:cursor-not-allowed disabled:bg-[#07131a]/35"
            >
              {isMarkingAll ? "Updating..." : `Mark all read (${unreadCount})`}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-black transition ${
                  isActive
                    ? "bg-[#8ed8ff] text-[#07131a]"
                    : "border border-[#07131a]/15 bg-white/72 text-[#4f6268] hover:bg-white"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#07131a]/20 bg-white/72 p-10 text-center shadow-[0_20px_60px_rgba(24,55,47,0.06)] backdrop-blur">
              <h2 className="text-xl font-black text-[#07131a]">
                No notifications here
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[#4f6268]">
                New ride requests, creator decisions, and completed ride updates
                will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-[24px] border p-4 shadow-[0_18px_50px_rgba(24,55,47,0.07)] backdrop-blur transition ${
                  notification.isRead
                    ? "border-[#07131a]/12 bg-white/76"
                    : "border-[#8ed8ff]/55 bg-[#e8eef0]/82"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${getNotificationTone(
                          notification.type,
                        )}`}
                      >
                        {getNotificationTitle(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="rounded-full bg-[#8ed8ff] px-2.5 py-1 text-xs font-black text-[#07131a]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-base font-black leading-6 text-[#07131a]">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#4f6268]">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification)}
                        className="rounded-2xl border border-[#07131a]/15 bg-white/75 px-4 py-2 text-sm font-black text-[#07131a] transition hover:bg-white"
                      >
                        Mark read
                      </button>
                    )}
                    <Link
                      href={getNotificationHref(notification)}
                      onClick={() => handleMarkRead(notification)}
                      className="rounded-2xl bg-[#07131a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0b1d25]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
