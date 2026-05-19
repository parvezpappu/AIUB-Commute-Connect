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

const genderPreferenceOptions = [
  { value: "BOTH", label: "Male/Female" },
  { value: "MALE", label: "Male only" },
  { value: "FEMALE", label: "Female only" },
];

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm font-semibold text-red-600">{message}</p>;
}

export default function CreateCommutePage() {
  const router = useRouter();
  const isCheckingAuth = useRequireStudent();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    transportType: "UBER",
    participantGenderPreference: "BOTH",
    fromLocation: "",
    toLocation: "",
    meetingLocation: "",
    meetingAddress: "",
    meetingLatitude: null,
    meetingLongitude: null,
    departureTime: "",
    expiresAt: "",
    seats: "1",
    costPerPerson: "0",
    costToBeDecided: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);
        setFormData((currentFormData) => ({
          ...currentFormData,
          fromLocation:
            currentFormData.fromLocation || data.preferredFromLocation || "",
          toLocation: currentFormData.toLocation || data.preferredToLocation || "",
        }));
      } catch {
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "costPerPerson" ? { costToBeDecided: false } : {}),
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

  function handleCostModeChange(costToBeDecided) {
    setFormData({
      ...formData,
      costToBeDecided,
      costPerPerson: costToBeDecided ? "" : formData.costPerPerson || "0",
    });

    setFieldErrors({
      ...fieldErrors,
      costPerPerson: "",
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

      router.push("/commutes");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)]">
        <p className="text-slate-600">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-[#07131a]">
      <AuthenticatedNav />

      <section className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="mb-3 text-2xl font-black text-[#07131a]">
          Create post
        </h1>
        <section className="rounded-[24px] border border-[#07131a]/15 bg-white/72 p-4 shadow-sm backdrop-blur">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="max-w-2xl space-y-4"
          >
            <section className="rounded-2xl border border-[#07131a]/10 bg-white/70 p-4">
              <h2 className="mb-3 text-lg font-black text-[#07131a]">
                Transport
              </h2>

              <div className="grid gap-2 sm:grid-cols-3">
                {transportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-black transition ${
                      formData.transportType === type.value
                        ? "border-[#07131a] bg-[#07131a] text-white"
                        : "border-[#07131a]/15 bg-white text-[#07131a] hover:border-[#07131a]/40"
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
            </section>

            <section className="rounded-2xl border border-[#07131a]/10 bg-white/70 p-4">
              <h2 className="mb-3 text-lg font-black text-[#07131a]">
                Who can join
              </h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {genderPreferenceOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-black transition ${
                      formData.participantGenderPreference === option.value
                        ? "border-[#07131a] bg-[#07131a] text-white"
                        : "border-[#07131a]/15 bg-white text-[#07131a] hover:border-[#07131a]/40"
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
              <FieldError message={fieldErrors.participantGenderPreference} />
            </section>

            <section className="rounded-2xl border border-[#07131a]/10 bg-white/70 p-4">
              <h2 className="mb-3 text-lg font-black text-[#07131a]">Route</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-black text-[#07131a]">
                    From
                  </label>
                  <input
                    type="text"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                    placeholder="Kuril Bishwa Road"
                  />
                  <FieldError message={fieldErrors.fromLocation} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-[#07131a]">
                    To
                  </label>
                  <input
                    type="text"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                    placeholder="AIUB Campus"
                  />
                  <FieldError message={fieldErrors.toLocation} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#07131a]/10 bg-white/70 p-4">
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-lg font-black text-[#07131a]">
                    Meeting point
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[#4f6268]">
                    Add a short visible name and choose the exact map point.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapOpen((current) => !current)}
                  className="w-fit rounded-xl border border-[#07131a]/15 bg-white px-3 py-2 text-sm font-black text-[#07131a] hover:border-[#07131a]/35"
                >
                  {isMapOpen
                    ? "Hide map"
                    : formData.meetingLatitude && formData.meetingLongitude
                      ? "Change map location"
                      : "Choose on map"}
                </button>
              </div>

              <input
                type="text"
                name="meetingLocation"
                value={formData.meetingLocation}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                placeholder="Example: AIUB main gate or Kuril foot overbridge"
              />
              {formData.meetingAddress && (
                <p className="mt-2 rounded-xl border border-[#07131a]/10 bg-[#e8eef0] px-3 py-2 text-sm font-semibold text-[#4f6268]">
                  Exact address: {formData.meetingAddress}
                </p>
              )}
              <FieldError message={fieldErrors.meetingLocation} />

              {isMapOpen && (
                <div className="mt-3 overflow-hidden rounded-xl border border-[#07131a]/10">
                  <MapPicker
                    value={{
                      latitude: formData.meetingLatitude,
                      longitude: formData.meetingLongitude,
                    }}
                    onChange={handleMeetingPointChange}
                    onUseDetectedAddress={handleUseDetectedAddress}
                  />
                </div>
              )}
              <FieldError
                message={
                  fieldErrors.meetingLatitude || fieldErrors.meetingLongitude
                }
              />
            </section>

            <section className="rounded-2xl border border-[#07131a]/10 bg-white/70 p-4">
              <h2 className="mb-3 text-lg font-black text-[#07131a]">
                Schedule and cost
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-black text-[#07131a]">
                    Departure time
                  </label>
                  <input
                    type="datetime-local"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                  />
                  <FieldError message={fieldErrors.departureTime} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-[#07131a]">
                    Request closes at
                  </label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                  />
                  <FieldError message={fieldErrors.expiresAt} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-[#07131a]">
                    Seats
                  </label>
                  <input
                    type="number"
                    name="seats"
                    min="1"
                    max="10"
                    value={formData.seats}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a]"
                  />
                  <FieldError message={fieldErrors.seats} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-black text-[#07131a]">
                    Cost per person
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      type="number"
                      name="costPerPerson"
                      min="0"
                      value={formData.costPerPerson}
                      onChange={handleChange}
                      disabled={formData.costToBeDecided}
                      className="w-full rounded-xl border border-[#07131a]/15 bg-white px-3 py-2.5 font-semibold text-[#07131a] outline-none focus:border-[#07131a] disabled:bg-[#e8eef0] disabled:text-[#56696f]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCostModeChange(false)}
                      className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                        !formData.costToBeDecided
                          ? "border-[#07131a] bg-[#07131a] text-white"
                          : "border-[#07131a]/15 bg-white text-[#07131a] hover:border-[#07131a]/35"
                      }`}
                    >
                      Tk
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCostModeChange(true)}
                    className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm font-black transition ${
                      formData.costToBeDecided
                        ? "border-[#07131a] bg-[#07131a] text-white"
                        : "border-[#07131a]/15 bg-[#e8eef0] text-[#07131a] hover:border-[#07131a]/35"
                    }`}
                  >
                    Will be decided
                  </button>
                  <FieldError message={fieldErrors.costPerPerson} />
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {currentUser && !currentUser.isVerified && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                Verify your email before publishing commute posts.
                <a
                  href={`/verify-email?email=${encodeURIComponent(
                    currentUser.email,
                  )}`}
                  className="ml-1 font-black text-[#07131a]"
                >
                  Verify now
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (currentUser && !currentUser.isVerified)}
              className="w-full rounded-xl bg-[#07131a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#17303a] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? "Creating commute..." : "Publish commute"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

