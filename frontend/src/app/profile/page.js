"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedNav from "../components/AuthenticatedNav";
import {
  changePassword,
  clearProfilePicture,
  getCurrentUser,
  getUserRatingSummary,
  updateRoutePreference,
  uploadProfilePicture,
} from "../lib/api";
import { useRequireAuth } from "../lib/auth";

const backendUrl = "http://localhost:3000";

function getInitials(fullName = "") {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function DefaultProfileAvatar({ fullName }) {
  return (
    <span className="text-base font-black text-[#8ed8ff]">
      {getInitials(fullName) || "AC"}
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const isCheckingAuth = useRequireAuth();

  const [user, setUser] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferenceForm, setPreferenceForm] = useState({
    preferredFromLocation: "",
    preferredToLocation: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearingPicture, setIsClearingPicture] = useState(false);
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPreferenceOpen, setIsPreferenceOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUser();
        const summary =
          data.role === "ADMIN" ? null : await getUserRatingSummary(data.id);
        setUser(data);
        setRatingSummary(summary);
        setPreferenceForm({
          preferredFromLocation: data.preferredFromLocation || "",
          preferredToLocation: data.preferredToLocation || "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const profilePictureSrc = useMemo(() => {
    if (!user?.profilePictureUrl) {
      return "";
    }

    return `${backendUrl}${user.profilePictureUrl}`;
  }, [user]);

  const isAdmin = user?.role === "ADMIN";

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  }

  function handlePreferenceChange(event) {
    const { name, value } = event.target;

    setPreferenceForm({
      ...preferenceForm,
      [name]: value,
    });
  }

  async function handleRoutePreferenceSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSavingPreference(true);

    try {
      const updatedUser = await updateRoutePreference({
        preferredFromLocation: preferenceForm.preferredFromLocation.trim(),
        preferredToLocation: preferenceForm.preferredToLocation.trim(),
      });
      setUser(updatedUser);
      setMessage("Route preference updated.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSavingPreference(false);
    }
  }

  async function handleProfilePictureChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");
    setMessage("");
    setIsUploading(true);

    try {
      const updatedUser = await uploadProfilePicture(file);
      setUser(updatedUser);
      setMessage("Profile picture updated.");
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleClearProfilePicture() {
    setUploadError("");
    setMessage("");
    setIsClearingPicture(true);

    try {
      const updatedUser = await clearProfilePicture();
      setUser(updatedUser);
      setMessage("Profile picture removed.");
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsClearingPicture(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(passwordForm);
      window.alert("Password changed successfully. Please login again.");
      router.push("/login");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] px-4">
        <p className="rounded-2xl border border-white/15 bg-white/72 px-5 py-3 text-[#244b58] shadow-sm backdrop-blur">
          {isCheckingAuth ? "Checking session..." : "Loading profile..."}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] px-4">
        <section className="w-full max-w-md rounded-[28px] border border-white/20 bg-white/76 p-6 text-center shadow-sm backdrop-blur">
          <h1 className="text-xl font-semibold text-[#07131a]">
            Session expired
          </h1>
          <p className="mt-2 text-sm text-[#4f6268]">{error}</p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-[#07131a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#17303a]"
          >
            Back to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-[#07131a]">
      <AuthenticatedNav />
      <section className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="mb-3 text-2xl font-black text-[#07131a]">Profile</h1>
        <div className="rounded-[24px] border border-[#07131a]/15 bg-white/72 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="border-b border-[#07131a]/10 pb-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#07131a] bg-cover bg-center text-xl font-black text-white ring-2 ring-white"
                style={
                  profilePictureSrc
                    ? { backgroundImage: `url(${profilePictureSrc})` }
                    : undefined
                }
              >
                {!profilePictureSrc && (
                  <DefaultProfileAvatar fullName={user.fullName} />
                )}
              </div>

              <div>
                <h1 className="text-lg font-black leading-5 text-[#07131a]">
                  {user.fullName}
                </h1>
                {user.role === "ADMIN" && (
                  <span className="mt-2 inline-flex rounded-full bg-[#07131a]/10 px-3 py-1 text-xs font-black text-[#07131a]">
                    Role: Admin
                  </span>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-[#07131a]/15 bg-white px-3 py-1.5 text-xs font-black text-[#07131a] hover:border-[#07131a]/35">
                    {isUploading ? "Uploading..." : "Upload picture"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      disabled={isUploading}
                      className="sr-only"
                    />
                  </label>

                  {profilePictureSrc && (
                    <button
                      type="button"
                      onClick={handleClearProfilePicture}
                      disabled={isClearingPicture}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      {isClearingPicture ? "Removing..." : "Clear picture"}
                    </button>
                  )}
                </div>
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
              </div>
            </div>

          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {message}
            </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#07131a]/10 bg-white/75 px-3.5 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                Full name
              </p>
              <p className="mt-0.5 text-sm font-black leading-5 text-[#07131a]">{user.fullName}</p>
            </div>

            <div className="rounded-lg border border-[#07131a]/10 bg-white/75 px-3.5 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                University ID
              </p>
              <p className="mt-0.5 text-sm font-black leading-5 text-[#07131a]">{user.aiubId}</p>
            </div>

            <div className="rounded-lg border border-[#07131a]/10 bg-white/75 px-3.5 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                Email
              </p>
              <p className="mt-0.5 break-words text-sm font-black leading-5 text-[#07131a]">
                {user.email}
              </p>
            </div>

            <div className="rounded-lg border border-[#07131a]/10 bg-white/75 px-3.5 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                Gender
              </p>
              <p className="mt-0.5 text-sm font-black leading-5 text-[#07131a]">
                {user.gender === "MALE"
                  ? "Male"
                  : user.gender === "FEMALE"
                    ? "Female"
                    : "Not set"}
              </p>
            </div>

            {!isAdmin && (
              <>
                <div className="rounded-lg border border-[#07131a]/10 bg-[#e8eef0] px-3.5 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                    Preferred route
                  </p>
                  <p className="mt-0.5 text-sm font-black leading-5 text-[#07131a]">
                    {user.preferredFromLocation || "Not set"} to{" "}
                    {user.preferredToLocation || "Not set"}
                  </p>
                </div>

                <div className="rounded-lg border border-[#07131a]/10 bg-[#e8eef0] px-3.5 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#56696f]">
                    Community rating
                  </p>
                  <p className="mt-0.5 text-sm font-black leading-5 text-[#07131a]">
                    {ratingSummary?.ratingCount
                      ? `${ratingSummary.averageRating}/5 from ${ratingSummary.ratingCount} rating`
                      : "No ratings yet"}
                  </p>
                </div>
              </>
            )}

          </div>

          {!isAdmin && (
          <section className="mt-5 rounded-xl border border-[#07131a]/10 bg-white/60 px-4 py-3">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-black text-[#07131a]">
                  Route preference
                </h2>
                <p className="mt-1 text-xs font-semibold text-[#4f6268]">
                  Save your regular route for commute post autofill.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsPreferenceOpen((currentValue) => !currentValue)
                }
                className="w-fit rounded-lg border border-[#07131a]/15 bg-white px-3 py-1.5 text-xs font-black text-[#07131a] hover:border-[#07131a]/35"
              >
                {isPreferenceOpen ? "Close" : "Edit preference"}
              </button>
            </div>

            {isPreferenceOpen && (
              <form
                onSubmit={handleRoutePreferenceSubmit}
                className="mt-4 space-y-3"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-black text-[#07131a]">
                      Preferred from
                    </label>
                    <input
                      type="text"
                      name="preferredFromLocation"
                      value={preferenceForm.preferredFromLocation}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2 text-sm font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                      placeholder="Gazipur"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-black text-[#07131a]">
                      Preferred to
                    </label>
                    <input
                      type="text"
                      name="preferredToLocation"
                      value={preferenceForm.preferredToLocation}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2 text-sm font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                      placeholder="AIUB Campus"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPreference}
                  className="rounded-xl bg-[#07131a] px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingPreference ? "Saving..." : "Save preference"}
                </button>
              </form>
            )}
          </section>
          )}

          <section className="mt-4 rounded-xl border border-[#07131a]/10 bg-white/60 px-4 py-3">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-black text-[#07131a]">
                  Password
                </h2>
                <p className="mt-1 text-xs font-semibold text-[#4f6268]">
                  Change your password only when needed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordOpen((currentValue) => !currentValue)}
                className="w-fit rounded-lg border border-[#07131a]/15 bg-white px-3 py-1.5 text-xs font-black text-[#07131a] hover:border-[#07131a]/35"
              >
                {isPasswordOpen ? "Close" : "Change password"}
              </button>
            </div>

            {isPasswordOpen && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-[#4f6268]">
                Enter your current password before setting a new one. You will
                be logged out after a successful change.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-black text-[#07131a]">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2 text-sm font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black text-[#07131a]">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2 text-sm font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                    minLength={6}
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black text-[#07131a]">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2 text-sm font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                    required
                  />
                </div>
              </div>

              {passwordError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="rounded-xl bg-[#07131a] px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isChangingPassword ? "Updating..." : "Update password"}
              </button>
            </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

