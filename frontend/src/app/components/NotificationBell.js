"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMyNotifications, markNotificationRead } from "../lib/api";

function getNotificationHref(notification) {
  if (notification.type === "JOIN_REQUEST") {
    return "/commutes/my";
  }

  if (notification.type === "REQUEST_ACCEPTED") {
    return `/commutes/${notification.commute.id}/members`;
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

  return "Request rejected";
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative rounded-md border border-white/20 px-3 py-2 text-slate-100 hover:bg-white/10"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-lg">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="font-semibold">Notifications</p>
            <p className="text-xs text-slate-500">
              Join requests and commute decisions
            </p>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-5 text-sm text-slate-500">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationHref(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 text-sm transition hover:bg-slate-50 ${
                    notification.isRead ? "bg-white" : "bg-[#003b73]/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {getNotificationTitle(notification.type)}
                    </p>
                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <p className="mt-1 text-slate-600">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                    {(notification.type === "JOIN_REQUEST" ||
                      notification.type === "REQUEST_ACCEPTED") && (
                      <span className="rounded-md bg-[#003b73] px-3 py-1 text-xs font-semibold text-white">
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
