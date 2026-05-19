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

  return type === "COMMUTE_COMPLETED" ? "Ride completed" : "Request rejected";
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
          <span className="ml-auto rounded-full bg-[#8ed8ff] px-2 py-0.5 text-xs font-black text-[#07131a]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={panelClassName}>
          <div className="border-b border-[#07131a]/10 bg-[#e8eef0] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#07131a]">Notifications</p>
                <p className="text-xs font-semibold text-[#4f6268]">
                  Requests, decisions, and ride updates
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="rounded-full border border-[#07131a]/15 bg-white px-3 py-1 text-xs font-black text-[#07131a] transition hover:bg-[#e8eef0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMarkingAll ? "..." : "Read all"}
                </button>
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex rounded-full border border-[#07131a]/15 bg-white px-3 py-1 text-xs font-black text-[#07131a] transition hover:bg-[#e8eef0]"
            >
              View all notifications
            </Link>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-5 text-sm font-semibold text-[#4f6268]">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-96 divide-y divide-[#07131a]/10 overflow-y-auto bg-white">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationHref(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 text-sm transition hover:bg-[#e8eef0] ${
                    notification.isRead ? "bg-white" : "bg-[#e8eef0]/70"
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
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8ed8ff]" />
                    )}
                  </div>
                  <p className="mt-2 font-semibold leading-5 text-[#07131a]">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#56696f]">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                    {(notification.type === "JOIN_REQUEST" ||
                      notification.type === "REQUEST_ACCEPTED" ||
                      notification.type === "COMMUTE_COMPLETED") && (
                      <span className="rounded-full bg-[#07131a] px-3 py-1 text-xs font-black text-white">
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

