"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/api";

function getNotificationHref(notification) {
  if (notification.type === "JOIN_REQUEST") {
    return "/commutes/my";
  }

  if (notification.type === "REQUEST_ACCEPTED") {
    return "/commutes/joined";
  }

  if (notification.type === "COMMUTE_COMPLETED") {
    return `/commutes/${notification.commute.id}/rate`;
  }

  return "/commutes/joined";
}

function formatNotificationTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getNotificationTitle(type) {
  if (type === "JOIN_REQUEST") {
    return "New join request";
  }

  if (type === "REQUEST_ACCEPTED") {
    return "Request accepted";
  }

  if (type === "COMMUTE_COMPLETED") {
    return "Rate completed ride";
  }

  return "Request rejected";
}

function getNotificationTone(type) {
  if (type === "JOIN_REQUEST") {
    return "border-[#ffc857]/40 bg-[#fff7e4] text-[#8b6400]";
  }

  if (type === "REQUEST_ACCEPTED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "COMMUTE_COMPLETED") {
    return "border-[#18372f]/15 bg-[#18372f]/10 text-[#18372f]";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

export default function NotificationBell({
  buttonClassName = "relative rounded-md border border-white/20 px-3 py-2 text-slate-100 hover:bg-white/10",
  panelClassName = "absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-lg",
}) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getMyNotifications();
        setNotifications(data);
      } catch {
        setNotifications([]);
      }
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  async function handleNotificationClick(notification) {
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

    setIsMarkingAll(true);
    const previousNotifications = notifications;

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={buttonClassName}
      >
        Notifications
        {unreadCount > 0 && (
          <span className="ml-auto rounded-full bg-[#ffc857] px-2 py-0.5 text-xs font-black text-[#18372f]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={panelClassName}>
          <div className="border-b border-[#18372f]/10 bg-[#f5f7f4] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#18372f]">Notifications</p>
                <p className="text-xs font-semibold text-[#66736d]">
                  Requests, decisions, and ride updates
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="rounded-full border border-[#18372f]/15 bg-white px-3 py-1 text-xs font-black text-[#18372f] transition hover:bg-[#fff7e4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMarkingAll ? "..." : "Read all"}
                </button>
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex rounded-full border border-[#18372f]/15 bg-white px-3 py-1 text-xs font-black text-[#18372f] transition hover:bg-[#fff7e4]"
            >
              View all notifications
            </Link>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-5 text-sm font-semibold text-[#66736d]">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-96 divide-y divide-[#18372f]/10 overflow-y-auto bg-white">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationHref(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 text-sm transition hover:bg-[#f5f7f4] ${
                    notification.isRead ? "bg-white" : "bg-[#fff7e4]/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${getNotificationTone(
                        notification.type,
                      )}`}
                    >
                      {getNotificationTitle(notification.type)}
                    </span>
                    {!notification.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ffc857]" />
                    )}
                  </div>
                  <p className="mt-2 font-semibold leading-5 text-[#18372f]">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#7d857f]">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                    {(notification.type === "JOIN_REQUEST" ||
                      notification.type === "REQUEST_ACCEPTED" ||
                      notification.type === "COMMUTE_COMPLETED") && (
                      <span className="rounded-full bg-[#18372f] px-3 py-1 text-xs font-black text-white">
                        View
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
