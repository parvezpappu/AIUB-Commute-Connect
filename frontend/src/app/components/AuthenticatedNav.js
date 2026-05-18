"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getMyCommutes,
  getMyNotifications,
  logoutUser,
} from "../lib/api";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/profile", label: "Profile", icon: "P" },
  { href: "/commutes", label: "Browse", icon: "B" },
  { href: "/commutes/create", label: "Create", icon: "+" },
  { href: "/commutes/my", label: "My posts", icon: "M" },
  { href: "/commutes/joined", label: "My rides", icon: "R" },
  { href: "/notifications", label: "Notifications", icon: "N" },
];

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/admin/commutes", label: "Posts", icon: "P" },
  { href: "/admin/users", label: "Users", icon: "U" },
  { href: "/notifications", label: "Notifications", icon: "N" },
  { href: "/profile", label: "Profile", icon: "A" },
];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileAvatar({ user }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#07131a] text-sm font-black text-[#8ed8ff] ring-2 ring-[#8ed8ff]/30">
      {user?.profilePictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`http://localhost:3000${user.profilePictureUrl}`}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(user?.fullName) || "AC"
      )}
    </div>
  );
}

export default function AuthenticatedNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myPostCount, setMyPostCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const data = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        setUser(data);

        if (data.role === "STUDENT") {
          const myCommutes = await getMyCommutes();
          if (isMounted) {
            setMyPostCount(myCommutes.length);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const notifications = await getMyNotifications();

        if (isMounted) {
          setUnreadNotificationCount(
            notifications.filter((notification) => !notification.isRead).length,
          );
        }
      } catch {
        if (isMounted) {
          setUnreadNotificationCount(0);
        }
      }
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const links = user?.role === "ADMIN" ? adminLinks : studentLinks;

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      router.push("/login");
    }
  }

  return (
    <>
      <header className="acc-auth-shell sticky top-0 z-50 border-b-2 border-white bg-[#405257] text-white shadow-[18px_0_60px_rgba(7,19,26,0.2)] backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-b-0 lg:border-r-4 lg:border-white">
        <nav className="flex h-full flex-col gap-5 px-4 py-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-[#173441]/80"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b6f9e] text-sm font-black text-white shadow-sm shadow-[#0b6f9e]/20 transition group-hover:bg-[#a9dff0] group-hover:text-[#07131a]">
              চ
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black leading-none">
                চলোযাই
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-[#c2e2ec]/82 transition group-hover:text-white/90">
                AIUB Commute
              </p>
            </div>
          </Link>

          <div className="-mx-4 hidden border-t-4 border-white lg:block" />

          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex shrink-0 items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition hover:translate-x-0.5 ${
                    isActive
                      ? "border-[#9ed7ec]/25 bg-[#0b6f9e] text-white shadow-sm shadow-[#0b6f9e]/20"
                      : "border-transparent text-[#dbe6ea]/86 hover:border-[#9ed7ec]/20 hover:bg-[#173441]/85 hover:text-[#b9ecff]"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-md text-xs font-black ${
                      isActive
                        ? "bg-white/16 text-white"
                        : "bg-[#9ed7ec]/10 text-[#e8f8ff] group-hover:bg-[#9ed7ec]/18 group-hover:text-[#b9ecff]"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {link.href === "/commutes/my"
                      ? `My posts (${myPostCount})`
                      : link.label}
                  </span>
                  {link.href === "/notifications" &&
                    unreadNotificationCount > 0 && (
                    <span className="rounded-full bg-[#b9ecff] px-2 py-0.5 text-xs font-black text-[#07131a]">
                      {unreadNotificationCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto flex gap-2 lg:flex-col">
            <button
              type="button"
              onClick={handleLogout}
              className="group flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left text-sm font-semibold text-[#dbe6ea]/86 transition hover:border-[#ff9aa9]/20 hover:bg-[#351a23]/70 hover:text-[#ffd5dc]"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-[#9ed7ec]/10 text-xs font-black group-hover:bg-[#ff9aa9]/15">
                L
              </span>
              Logout
            </button>
          </div>
        </nav>
      </header>

      {pathname === "/dashboard" && (
        <div className="acc-dashboard-topbar hidden lg:fixed lg:left-60 lg:right-0 lg:top-0 lg:z-40 lg:h-20 lg:items-center lg:justify-end lg:border-b-4 lg:border-white lg:bg-[#405257] lg:px-8 lg:text-white lg:shadow-[0_18px_60px_rgba(7,19,26,0.16)] lg:backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-3">
            <div className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-[#173441]/55 px-4 py-3 shadow-sm backdrop-blur transition hover:border-white/70 hover:bg-[#1d4251]/75 hover:shadow-[0_12px_40px_rgba(11,111,158,0.18)]">
              <div className="min-w-0 text-right">
                <p className="max-w-44 truncate text-sm font-black transition group-hover:text-[#b9ecff]">
                  {user?.fullName || "User"}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#c2e2ec]/78 transition group-hover:text-white/85">
                  {user?.aiubId || "AIUB ID"}
                </p>
              </div>
              <ProfileAvatar user={user} />
            </div>
          </div>
        </div>
      )}

    </>
  );
}
