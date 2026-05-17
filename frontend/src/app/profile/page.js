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

function DefaultProfileAvatar({ gender, initials }) {
  const isFemale = gender === "FEMALE";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-full bg-[linear-gradient(145deg,#18372f,#2f6b58)]">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#ffc857]/18" />
      <div
        className={`absolute left-1/2 top-5 h-11 w-11 -translate-x-1/2 rounded-full ${
          isFemale ? "bg-[#3a241f]" : "bg-[#2b241d]"
        }`}
      />
      {isFemale && (
        <div className="absolute left-1/2 top-8 h-16 w-20 -translate-x-1/2 rounded-t-full bg-[#3a241f]" />
      )}
      <div className="absolute left-1/2 top-8 h-12 w-12 -translate-x-1/2 rounded-full bg-[#f1c7a7]" />
      <div className="absolute left-1/2 top-16 h-4 w-7 -translate-x-1/2 rounded-b-full bg-[#e3b590]" />
      <div
        className={`absolute left-1/2 bottom-2 h-16 w-24 -translate-x-1/2 rounded-t-full ${
          isFemale ? "bg-[#ffc857]" : "bg-[#d7efe3]"
        }`}
      />
      <div className="absolute left-[42%] top-12 h-1.5 w-1.5 rounded-full bg-[#18372f]" />
      <div className="absolute right-[42%] top-12 h-1.5 w-1.5 rounded-full bg-[#18372f]" />
      <div className="absolute left-1/2 top-[62px] h-1 w-4 -translate-x-1/2 rounded-full bg-[#b56f62]" />
      <div className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-[#18372f] text-xs font-black text-[#ffc857] ring-2 ring-white">
        {initials || "AC"}
      </div>
    </div>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,#d7efe3_0%,transparent_30%),linear-gradient(135deg,#f5f7f4_0%,#e9efe8_52%,#f8ead2_100%)] text-[#17211d]">
      <AuthenticatedNav />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-[#18372f]/15 bg-white/72 p-5 shadow-sm backdrop-blur sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-6 border-b border-[#18372f]/10 pb-6 md:flex-row md:items-start">
            <div className="flex items-center gap-5">
              <div
                className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#18372f] bg-cover bg-center text-2xl font-black text-white ring-4 ring-white"
                style={
                  profilePictureSrc
                    ? { backgroundImage: `url(${profilePictureSrc})` }
                    : undefined
                }
              >
                {!profilePictureSrc && (
                  <DefaultProfileAvatar
                    gender={user.gender}
                    initials={getInitials(user.fullName)}
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6b58]">
                  Profile
                </p>
                <h1 className="mt-2 text-3xl font-black text-[#18372f]">
                  My Profile
                </h1>
                <p className="mt-2 text-sm font-semibold text-[#66736d]">
                  Your AIUB Commute Connect account information.
                </p>
                {user.role === "ADMIN" && (
                  <span className="mt-3 inline-flex rounded-full bg-[#18372f]/10 px-3 py-1 text-xs font-black text-[#18372f]">
                    Role: Admin
                  </span>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer rounded-2xl border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black text-[#18372f] hover:border-[#18372f]/35">
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
                      className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-black text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#18372f]/10 bg-white/75 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                Full name
              </p>
              <p className="mt-1 font-black text-[#18372f]">{user.fullName}</p>
            </div>

            <div className="rounded-2xl border border-[#18372f]/10 bg-white/75 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                University ID
              </p>
              <p className="mt-1 font-black text-[#18372f]">{user.aiubId}</p>
            </div>

            <div className="rounded-2xl border border-[#18372f]/10 bg-white/75 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                Email
              </p>
              <p className="mt-1 break-words font-black text-[#18372f]">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-[#18372f]/10 bg-white/75 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                Gender
              </p>
              <p className="mt-1 font-black text-[#18372f]">
                {user.gender === "MALE"
                  ? "Male"
                  : user.gender === "FEMALE"
                    ? "Female"
                    : "Not set"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#18372f]/10 bg-[#f5f7f4] p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                Preferred route
              </p>
              <p className="mt-1 font-black text-[#18372f]">
                {user.preferredFromLocation || "Not set"} to{" "}
                {user.preferredToLocation || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#18372f]/10 bg-[#fff7e4] p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d857f]">
                Community rating
              </p>
              <p className="mt-1 font-black text-[#18372f]">
                {ratingSummary?.ratingCount
                  ? `${ratingSummary.averageRating}/5 from ${ratingSummary.ratingCount} rating`
                  : "No ratings yet"}
              </p>
            </div>

          </div>

          <section className="mt-8 rounded-[24px] border border-[#18372f]/10 bg-white/60 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-[#18372f]">
                  Gender
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#66736d]">
                  Used to match gender-specific commute preferences.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGenderOpen((currentValue) => !currentValue)}
                className="w-fit rounded-2xl border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black text-[#18372f] hover:border-[#18372f]/35"
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
                          ? "border-[#18372f] bg-[#18372f] text-white"
                          : "border-[#18372f]/15 bg-white text-[#18372f] hover:border-[#18372f]/40"
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
                  className="rounded-2xl bg-[#18372f] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingGender ? "Saving..." : "Save gender"}
                </button>
              </form>
            )}
          </section>

          <section className="mt-8 rounded-[24px] border border-[#18372f]/10 bg-white/60 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-[#18372f]">
                  Route preference
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#66736d]">
                  Save your regular route for commute post autofill.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsPreferenceOpen((currentValue) => !currentValue)
                }
                className="w-fit rounded-2xl border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black text-[#18372f] hover:border-[#18372f]/35"
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
                    <label className="mb-1 block text-sm font-black text-[#18372f]">
                      Preferred from
                    </label>
                    <input
                      type="text"
                      name="preferredFromLocation"
                      value={preferenceForm.preferredFromLocation}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none focus:border-[#18372f]"
                      placeholder="Gazipur"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-black text-[#18372f]">
                      Preferred to
                    </label>
                    <input
                      type="text"
                      name="preferredToLocation"
                      value={preferenceForm.preferredToLocation}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none focus:border-[#18372f]"
                      placeholder="AIUB Campus"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPreference}
                  className="rounded-2xl bg-[#18372f] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingPreference ? "Saving..." : "Save preference"}
                </button>
              </form>
            )}
          </section>

          <section className="mt-8 rounded-[24px] border border-[#18372f]/10 bg-white/60 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-[#18372f]">
                  Password
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#66736d]">
                  Change your password only when needed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordOpen((currentValue) => !currentValue)}
                className="w-fit rounded-2xl border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black text-[#18372f] hover:border-[#18372f]/35"
              >
                {isPasswordOpen ? "Close" : "Change password"}
              </button>
            </div>

            {isPasswordOpen && (
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <p className="text-sm font-semibold text-[#66736d]">
                Enter your current password before setting a new one. You will
                be logged out after a successful change.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-black text-[#18372f]">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none focus:border-[#18372f]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-[#18372f]">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none focus:border-[#18372f]"
                    minLength={6}
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-[#18372f]">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-2xl border border-[#18372f]/15 bg-white px-4 py-3 font-semibold text-[#18372f] outline-none focus:border-[#18372f]"
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
                className="rounded-2xl bg-[#18372f] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
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
