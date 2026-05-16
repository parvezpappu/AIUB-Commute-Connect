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
  updateGender,
  updateRoutePreference,
  uploadProfilePicture,
} from "../lib/api";
import { useRequireAuth } from "../lib/auth";

const backendUrl = "http://localhost:3000";

function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
  const [genderForm, setGenderForm] = useState({
    gender: "",
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
  const [isSavingGender, setIsSavingGender] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPreferenceOpen, setIsPreferenceOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUser();
        const summary = await getUserRatingSummary(data.id);
        setUser(data);
        setRatingSummary(summary);
        setPreferenceForm({
          preferredFromLocation: data.preferredFromLocation || "",
          preferredToLocation: data.preferredToLocation || "",
        });
        setGenderForm({
          gender: data.gender || "",
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

  function handleGenderChange(event) {
    setGenderForm({
      gender: event.target.value,
    });
  }

  async function handleGenderSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!genderForm.gender) {
      setError("Select your gender first.");
      return;
    }

    setIsSavingGender(true);

    try {
      const updatedUser = await updateGender({
        gender: genderForm.gender,
      });
      setUser(updatedUser);
      setMessage("Gender updated.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSavingGender(false);
    }
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
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-700">
          {isCheckingAuth ? "Checking session..." : "Loading profile..."}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <section className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Session expired
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Back to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <AuthenticatedNav />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-start">
            <div className="flex items-center gap-5">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#003b73] bg-cover bg-center text-2xl font-semibold text-white"
                style={
                  profilePictureSrc
                    ? { backgroundImage: `url(${profilePictureSrc})` }
                    : undefined
                }
              >
                {!profilePictureSrc && (getInitials(user.fullName) || "AC")}
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  My Profile
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Your AIUB Commute Connect account information.
                </p>
                {user.role === "ADMIN" && (
                  <span className="mt-3 inline-flex rounded-full bg-[#003b73]/10 px-3 py-1 text-xs font-semibold text-[#003b73]">
                    Role: Admin
                  </span>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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
                      className="rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Full name
              </p>
              <p className="mt-1 text-slate-900">{user.fullName}</p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                University ID
              </p>
              <p className="mt-1 text-slate-900">{user.aiubId}</p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Email
              </p>
              <p className="mt-1 text-slate-900">{user.email}</p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Gender
              </p>
              <p className="mt-1 text-slate-900">
                {user.gender === "MALE"
                  ? "Male"
                  : user.gender === "FEMALE"
                    ? "Female"
                    : "Not set"}
              </p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Preferred route
              </p>
              <p className="mt-1 text-slate-900">
                {user.preferredFromLocation || "Not set"} to{" "}
                {user.preferredToLocation || "Not set"}
              </p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Community rating
              </p>
              <p className="mt-1 text-slate-900">
                {ratingSummary?.ratingCount
                  ? `${ratingSummary.averageRating}/5 from ${ratingSummary.ratingCount} rating`
                  : "No ratings yet"}
              </p>
            </div>

          </div>

          <section className="mt-8 rounded-lg border border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Gender
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Used to match gender-specific commute preferences.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGenderOpen((currentValue) => !currentValue)}
                className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isGenderOpen ? "Close" : "Update gender"}
              </button>
            </div>

            {isGenderOpen && (
              <form onSubmit={handleGenderSubmit} className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-md border p-3 text-center text-sm font-semibold transition ${
                        genderForm.gender === option.value
                          ? "border-[#003b73] bg-[#003b73] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#003b73]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={genderForm.gender === option.value}
                        onChange={handleGenderChange}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSavingGender}
                  className="rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingGender ? "Saving..." : "Save gender"}
                </button>
              </form>
            )}
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Route preference
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Save your regular route for commute post autofill.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsPreferenceOpen((currentValue) => !currentValue)
                }
                className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isPreferenceOpen ? "Close" : "Edit preference"}
              </button>
            </div>

            {isPreferenceOpen && (
              <form
                onSubmit={handleRoutePreferenceSubmit}
                className="mt-5 space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Preferred from
                    </label>
                    <input
                      type="text"
                      name="preferredFromLocation"
                      value={preferenceForm.preferredFromLocation}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003b73]"
                      placeholder="Gazipur"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Preferred to
                    </label>
                    <input
                      type="text"
                      name="preferredToLocation"
                      value={preferenceForm.preferredToLocation}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003b73]"
                      placeholder="AIUB Campus"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPreference}
                  className="rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingPreference ? "Saving..." : "Save preference"}
                </button>
              </form>
            )}
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Password
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Change your password only when needed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordOpen((currentValue) => !currentValue)}
                className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isPasswordOpen ? "Close" : "Change password"}
              </button>
            </div>

            {isPasswordOpen && (
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <p className="text-sm text-slate-600">
                Enter your current password before setting a new one. You will
                be logged out after a successful change.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003b73]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003b73]"
                    minLength={6}
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003b73]"
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
                className="rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
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
