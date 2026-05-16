"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getMyCommutes, logoutUser } from "../lib/api";
import NotificationBell from "./NotificationBell";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/profile", label: "Profile", icon: "P" },
  { href: "/commutes", label: "Browse", icon: "B" },
  { href: "/commutes/create", label: "Create", icon: "+" },
  { href: "/commutes/my", label: "My posts", icon: "M" },
  { href: "/commutes/joined", label: "Joined", icon: "J" },
];

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/admin/commutes", label: "Posts", icon: "P" },
  { href: "/admin/users", label: "Users", icon: "U" },
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
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#18372f] text-sm font-black text-[#ffc857] ring-2 ring-[#16e676]/35">
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

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);

        if (data.role === "STUDENT") {
          const myCommutes = await getMyCommutes();
          setMyPostCount(myCommutes.length);
        }
      } catch {
        setUser(null);
      }
    }

    loadUser();
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
      <header className="acc-auth-shell sticky top-0 z-50 border-b border-[#18372f]/10 bg-[#18372f] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-b-0 lg:border-r lg:border-white/10">
        <nav className="flex h-full flex-col gap-5 px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffc857] text-sm font-black text-[#18372f]">
              চ
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black leading-none">
                চলোযাই
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-white/65">
                AIUB Commute
              </p>
            </div>
          </Link>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#ffc857] text-[#18372f]"
                      : "text-[#f5f7f4]/86 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-md text-xs font-black ${
                      isActive ? "bg-[#18372f]/10" : "bg-white/10"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span>
                    {link.href === "/commutes/my"
                      ? `My posts (${myPostCount})`
                      : link.label}
                  </span>
                </Link>
              );
            })}

            <NotificationBell
              buttonClassName="relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#f5f7f4]/86 transition hover:bg-white/10 hover:text-white"
              panelClassName="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-lg lg:left-full lg:top-0 lg:ml-2 lg:mt-0"
            />
          </div>

          <div className="mt-auto flex gap-2 lg:flex-col">
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#f5f7f4]/86 transition hover:bg-white/10 hover:text-white"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10 text-xs font-black">
                L
              </span>
              Logout
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`acc-dashboard-topbar hidden lg:fixed lg:left-60 lg:right-0 lg:top-0 lg:z-40 lg:h-20 lg:items-center lg:justify-end lg:border-b lg:border-[#18372f]/10 lg:bg-[#f5f7f4]/95 lg:px-8 lg:text-[#18372f] lg:backdrop-blur ${
          pathname === "/dashboard" ? "lg:flex" : "lg:hidden"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#18372f]/10 bg-white px-4 py-3 shadow-sm">
            <div className="min-w-0 text-right">
              <p className="max-w-44 truncate text-sm font-black">
                {user?.fullName || "User"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#66736d]">
                {user?.aiubId || "AIUB ID"}
              </p>
            </div>
            <ProfileAvatar user={user} />
          </div>
        </div>
      </div>
    </>
  );
}
