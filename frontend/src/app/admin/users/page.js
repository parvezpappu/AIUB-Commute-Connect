"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import { deleteAdminUser, getAdminUsers } from "../../lib/api";
import { useRequireAdmin } from "../../lib/auth";

const pageBackgroundClass =
  "bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)]";

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminUsersPage() {
  const isCheckingAuth = useRequireAdmin();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function loadUsers() {
    setError("");

    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Delete ${user.fullName} (${user.aiubId})? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(user.id);

    try {
      await deleteAdminUser(user.id);
      setMessage("User deleted successfully.");
      await loadUsers();
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${pageBackgroundClass}`}
      >
        <p className="font-semibold text-[#4f6268]">
          {isCheckingAuth ? "Checking admin access..." : "Loading users..."}
        </p>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen text-[#07131a] ${pageBackgroundClass}`}
    >
      <AuthenticatedNav />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-[#1d5d82] bg-[#abc9d3] p-6 shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#244b58]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#07131a]">
              Users
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#4f6268]">
              View registered users and remove accounts when needed.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-[#07131a]/15 bg-white px-4 py-2.5 text-sm font-black text-[#07131a] transition hover:border-[#07131a]/35"
          >
            Dashboard
          </Link>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[#1d5d82] bg-[#abc9d3] shadow-[0_20px_60px_rgba(24,55,47,0.08)] backdrop-blur">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#07131a]/10 text-sm">
              <thead className="bg-[#e8eef0] text-left text-xs font-black uppercase tracking-[0.12em] text-[#4f6268]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">University ID</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#07131a]/10">
                {users.map((user) => (
                  <tr key={user.id} className="align-middle hover:bg-[#e8eef0]/70">
                    <td className="px-4 py-3 font-black text-[#07131a]">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 font-black text-[#07131a]">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#4f6268]">
                      {user.aiubId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#4f6268]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {user.gender === "MALE"
                        ? "Male"
                        : user.gender === "FEMALE"
                          ? "Female"
                          : "Not set"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black text-[#07131a]">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isVerified ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                        className="rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        {deletingId === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <p className="p-6 text-center text-sm font-semibold text-[#4f6268]">
              No users found.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}


