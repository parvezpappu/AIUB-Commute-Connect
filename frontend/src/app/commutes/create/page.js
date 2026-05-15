"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import MapPicker from "../../components/MapPicker";
import { createCommute, getCurrentUser } from "../../lib/api";
import { useRequireStudent } from "../../lib/auth";
import {
  hasValidationErrors,
  validateCreateCommuteForm,
} from "../../lib/validation";

const transportTypes = [
  { value: "UBER", label: "Uber" },
  { value: "BUS", label: "Bus" },
  { value: "BIKE", label: "Bike" },
  { value: "CNG", label: "CNG" },
  { value: "RICKSHAW", label: "Rickshaw" },
  { value: "WALKING", label: "Walking" },
];

export default function CreateCommutePage() {
  const router = useRouter();
  const isCheckingAuth = useRequireStudent();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    transportType: "UBER",
    fromLocation: "",
    toLocation: "",
    meetingLocation: "",
    meetingAddress: "",
    meetingLatitude: null,
    meetingLongitude: null,
    departureTime: "",
    seats: "1",
    costPerPerson: "0",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);
      } catch {
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
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

    if (!currentUser?.isVerified) {
      setError("Please verify your email before creating a commute.");
      return;
    }

    const validationErrors = validateCreateCommuteForm(formData);
    setFieldErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsLoading(true);

    try {
      await createCommute({
        transportType: formData.transportType,
        fromLocation: formData.fromLocation.trim(),
        toLocation: formData.toLocation.trim(),
        meetingLocation: formData.meetingLocation.trim(),
        meetingAddress: formData.meetingAddress.trim(),
        meetingLatitude: formData.meetingLatitude,
        meetingLongitude: formData.meetingLongitude,
        departureTime: new Date(formData.departureTime).toISOString(),
        seats: Number(formData.seats),
        costPerPerson: Number(formData.costPerPerson),
      });

      router.push("/commutes");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-slate-600">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AuthenticatedNav />

      <section className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="w-fit rounded-full bg-[#003b73]/5 px-3 py-1 text-sm font-medium text-[#003b73]">
              Create commute
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Publish a commute post
            </h1>
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
                  placeholder="Kuril Bishwa Road"
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
                  placeholder="AIUB Campus"
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
                placeholder="Example: AIUB main gate or Kuril foot overbridge"
                required
              />
              <p className="mt-1 text-sm text-slate-500">
                Write a short meeting title people should follow. The exact map
                address is saved from the selected point below.
              </p>
              {fieldErrors.meetingLocation && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.meetingLocation}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meeting point on map
              </label>
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

            <div className="grid gap-4 sm:grid-cols-3">
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
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-[#003b73]"
                  required
                />
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

            {currentUser && !currentUser.isVerified && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Verify your email before publishing commute posts.
                <a
                  href={`/verify-email?email=${encodeURIComponent(
                    currentUser.email,
                  )}`}
                  className="ml-1 font-semibold text-[#003b73]"
                >
                  Verify now
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (currentUser && !currentUser.isVerified)}
              className="w-full rounded-md bg-[#003b73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002f5c] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? "Creating commute..." : "Publish commute"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
