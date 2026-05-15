"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import UserRatingBadge from "../../components/UserRatingBadge";
import { deleteAdminUser, getAdminUsers } from "../../lib/api";
import { useRequireAdmin } from "../../lib/auth";

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
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking admin access..." : "Loading users..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#003b73]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Users
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              View registered users and remove accounts when needed.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Dashboard
          </Link>
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

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">University ID</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.id}
                    </td>
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">{user.aiubId}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <UserRatingBadge userId={user.id} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#003b73]/10 px-3 py-1 text-xs font-semibold text-[#003b73]">
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
                        className="rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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
            <p className="p-6 text-center text-sm text-slate-500">
              No users found.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
