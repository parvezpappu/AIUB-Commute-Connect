"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getMyCommutes, logoutUser } from "../lib/api";
import NotificationBell from "./NotificationBell";

const studentLinks = [
  { href: "/commutes", label: "Browse" },
  { href: "/commutes/create", label: "Create" },
  { href: "/commutes/my", label: "My posts" },
  { href: "/commutes/joined", label: "Joined" },
  { href: "/profile", label: "Profile" },
];

const adminLinks = [
  { href: "/commutes", label: "Posts" },
  { href: "/admin/users", label: "Users" },
  { href: "/profile", label: "Profile" },
];

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
    <header className="border-b border-slate-200 bg-[#111718] text-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#003b73] text-sm font-bold">
            AC
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide">
              AIUB Commute Connect
            </p>
            <p className="text-xs text-slate-300">
              {user?.role === "ADMIN"
                ? "Admin control dashboard"
                : "Student commute dashboard"}
            </p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 hover:bg-white/10 ${
                pathname === link.href ? "bg-white/10 text-white" : "text-slate-200"
              }`}
            >
              {link.href === "/commutes/my"
                ? `My posts (${myPostCount})`
                : link.label}
            </Link>
          ))}
          <NotificationBell />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-white/20 px-3 py-2 text-slate-100 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
