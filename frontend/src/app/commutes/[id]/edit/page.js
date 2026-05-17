"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthenticatedNav from "../../../components/AuthenticatedNav";
import MapPicker from "../../../components/MapPicker";
import { getCommute, updateCommute } from "../../../lib/api";
import { useRequireStudent } from "../../../lib/auth";
import {
  hasValidationErrors,
  validateCreateCommuteForm,
} from "../../../lib/validation";

const transportTypes = [
  { value: "UBER", label: "Uber" },
  { value: "BUS", label: "Bus" },
  { value: "BIKE", label: "Bike" },
  { value: "CNG", label: "CNG" },
  { value: "RICKSHAW", label: "Rickshaw" },
  { value: "WALKING", label: "Walking" },
];

const genderPreferenceOptions = [
  { value: "BOTH", label: "Male/Female" },
  { value: "MALE", label: "Male only" },
  { value: "FEMALE", label: "Female only" },
];

function toDateTimeLocal(value) {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export default function EditCommutePage() {
  const params = useParams();
  const router = useRouter();
  const commuteId = params.id;
  const isCheckingAuth = useRequireStudent();
  const [formData, setFormData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    async function loadCommute() {
      try {
        const commute = await getCommute(commuteId);
        setFormData({
          transportType: commute.transportType || "UBER",
          participantGenderPreference:
            commute.participantGenderPreference || "BOTH",
          fromLocation: commute.fromLocation || "",
          toLocation: commute.toLocation || "",
          meetingLocation: commute.meetingLocation || "",
          meetingAddress: commute.meetingAddress || "",
          meetingLatitude: commute.meetingLatitude ?? null,
          meetingLongitude: commute.meetingLongitude ?? null,
          departureTime: commute.departureTime
            ? toDateTimeLocal(commute.departureTime)
            : "",
          expiresAt: commute.expiresAt ? toDateTimeLocal(commute.expiresAt) : "",
          seats: String(commute.seats ?? 1),
          costPerPerson: String(commute.costPerPerson ?? 0),
          costToBeDecided: Boolean(commute.costToBeDecided),
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCommute();
  }, [commuteId]);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setFieldErrors({
      ...fieldErrors,
      [name]: "",
    });
  }

  function handleMeetingPointChange(point) {
    const shouldAutofillMeetingName =
      !formData.meetingLocation.trim() && point.locationName;

    setFormData({
      ...formData,
      meetingLatitude: point.latitude,
      meetingLongitude: point.longitude,
      meetingAddress: point.locationName || "",
      meetingLocation: shouldAutofillMeetingName
        ? point.locationName
        : formData.meetingLocation,
    });

    setFieldErrors({
      ...fieldErrors,
      meetingLocation: "",
      meetingAddress: "",
      meetingLatitude: "",
      meetingLongitude: "",
    });
  }

  function handleUseDetectedAddress(address) {
    setFormData({
      ...formData,
      meetingLocation: address,
    });

    setFieldErrors({
      ...fieldErrors,
      meetingLocation: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateCreateCommuteForm(formData);
    setFieldErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsSaving(true);

    try {
      await updateCommute(commuteId, {
        transportType: formData.transportType,
        participantGenderPreference: formData.participantGenderPreference,
        fromLocation: formData.fromLocation.trim(),
        toLocation: formData.toLocation.trim(),
        meetingLocation: formData.meetingLocation.trim(),
        meetingAddress: formData.meetingAddress.trim(),
        meetingLatitude: formData.meetingLatitude,
        meetingLongitude: formData.meetingLongitude,
        departureTime: new Date(formData.departureTime).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        seats: Number(formData.seats),
        costPerPerson: formData.costToBeDecided
          ? 0
          : Number(formData.costPerPerson),
        costToBeDecided: formData.costToBeDecided,
      });

      router.push("/commutes/my");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">
          {isCheckingAuth ? "Checking session..." : "Loading commute post..."}
        </p>
      </main>
    );
  }

  if (!formData) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
        <AuthenticatedNav />
        <section className="mx-auto max-w-xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error || "Commute post could not be loaded."}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />

      <section className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="w-fit rounded-full bg-[#003b73]/5 px-3 py-1 text-sm font-medium text-[#003b73]">
                Edit commute
              </p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Update commute post
              </h1>
            </div>
            <Link
              href="/commutes/my"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to my posts
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transport type
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {transportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`cursor-pointer rounded-md border p-3 text-center text-sm font-semibold transition ${
                      formData.transportType === type.value
                        ? "border-[#003b73] bg-[#003b73] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#003b73]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transportType"
                      value={type.value}
                      checked={formData.transportType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Who can join?
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {genderPreferenceOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-md border p-3 text-center text-sm font-semibold transition ${
                      formData.participantGenderPreference === option.value
                        ? "border-[#003b73] bg-[#003b73] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#003b73]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="participantGenderPreference"
                      value={option.value}
                      checked={
                        formData.participantGenderPreference === option.value
                      }
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {fieldErrors.participantGenderPreference && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.participantGenderPreference}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  From
                </label>
                <input
                  type="text"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
                {fieldErrors.fromLocation && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.fromLocation}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  To
                </label>
                <input
                  type="text"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
                {fieldErrors.toLocation && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.toLocation}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meeting location
              </label>
              <input
                type="text"
                name="meetingLocation"
                value={formData.meetingLocation}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                required
              />
              {formData.meetingAddress && (
                <p className="mt-1 text-sm text-slate-500">
                  Exact map address: {formData.meetingAddress}
                </p>
              )}
              {fieldErrors.meetingLocation && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.meetingLocation}
                </p>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsMapOpen((current) => !current)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isMapOpen ? "Hide map" : "Change exact map location"}
              </button>

              {isMapOpen && (
                <div className="mt-3">
                  <MapPicker
                    value={{
                      latitude: formData.meetingLatitude,
                      longitude: formData.meetingLongitude,
                    }}
                    onChange={handleMeetingPointChange}
                    onUseDetectedAddress={handleUseDetectedAddress}
                  />
                  {(fieldErrors.meetingLatitude ||
                    fieldErrors.meetingLongitude) && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.meetingLatitude ||
                        fieldErrors.meetingLongitude}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Departure time
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
                {fieldErrors.departureTime && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.departureTime}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Request closes at
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
                {fieldErrors.expiresAt && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.expiresAt}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Seats
                </label>
                <input
                  type="number"
                  name="seats"
                  min="1"
                  max="10"
                  value={formData.seats}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
                {fieldErrors.seats && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.seats}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Cost per person
                </label>
                <input
                  type="number"
                  name="costPerPerson"
                  min="0"
                  value={formData.costPerPerson}
                  onChange={handleChange}
                  disabled={formData.costToBeDecided}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
                <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    name="costToBeDecided"
                    checked={formData.costToBeDecided}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#003b73]"
                  />
                  Will be decided
                </label>
                {fieldErrors.costPerPerson && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.costPerPerson}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002f5c] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? "Saving changes..." : "Save changes"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
