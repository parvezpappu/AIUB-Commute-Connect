"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCommute } from "../../lib/api";

const transportTypes = [
  { value: "CNG", label: "CNG" },
  { value: "BIKE", label: "Bike" },
  { value: "RICKSHAW", label: "Rickshaw" },
  { value: "WALKING", label: "Walking" },
];

export default function CreateCommutePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    transportType: "CNG",
    fromLocation: "",
    toLocation: "",
    departureTime: "",
    seats: "1",
    costPerPerson: "0",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await createCommute({
        transportType: formData.transportType,
        fromLocation: formData.fromLocation.trim(),
        toLocation: formData.toLocation.trim(),
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

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/commutes" className="text-sm font-semibold text-[#003b73]">
            Back to commutes
          </Link>
          <Link href="/profile" className="text-sm font-medium text-slate-600">
            Profile
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="w-fit rounded-full bg-[#003b73]/5 px-3 py-1 text-sm font-medium text-[#003b73]">
            Create commute
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Share your route with nearby AIUB students.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Add accurate route, departure time, seats, and cost. Students will
            send join requests, and you can accept them from the commute request
            panel later.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Keep it precise
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Use recognizable pickup points like Kuril, Bashundhara gate, or
                campus entrance.
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Seats close automatically
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Once accepted requests fill all seats, the commute is closed.
              </p>
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transport type
              </label>
              <div className="grid gap-3 sm:grid-cols-4">
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
              </div>
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
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
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
