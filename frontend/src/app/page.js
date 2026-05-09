import Link from "next/link";

const commuteTypes = ["Bike", "CNG", "Rickshaw", "Walking"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#003b73] text-sm font-bold text-white">
              AC
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#003b73]">
                AIUB Commute Connect
              </p>
              <p className="text-xs text-slate-500">
                Smart shared commute platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[#003b73] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002f5c]"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up">
          <p className="w-fit rounded-full border border-[#003b73]/20 bg-white px-4 py-2 text-sm font-medium text-[#003b73]">
            For verified AIUB students
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Find safer, smarter, shared commutes around campus.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Register with your AIUB ID, login securely, view your profile, and
            get ready to create or join shared commute groups based on route,
            time, transport type, and available seats.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-md bg-[#003b73] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#002f5c]"
            >
              Create student account
            </Link>

            <Link
              href="/login"
              className="rounded-md border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-[#003b73]/40"
            >
              Login with AIUB ID
            </Link>

            <Link
              href="/profile"
              className="rounded-md px-6 py-3 text-center text-sm font-semibold text-[#003b73] transition hover:bg-white"
            >
              My profile
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-2xl font-semibold text-[#003b73]">JWT</p>
              <p className="mt-1 text-sm text-slate-600">
                Secure login with HttpOnly cookie.
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-2xl font-semibold text-[#003b73]">AIUB ID</p>
              <p className="mt-1 text-sm text-slate-600">
                Student identity format is verified.
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-2xl font-semibold text-[#003b73]">Roles</p>
              <p className="mt-1 text-sm text-slate-600">
                Student and admin access controlled.
              </p>
            </div>
          </div>
        </div>

        <div className="animate-float rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-md bg-[#003b73] p-5 text-white">
            <p className="text-sm font-medium text-blue-100">
              Today&apos;s commute board
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Kuril to AIUB Campus
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Example preview of the commute experience we will build next.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {commuteTypes.map((type, index) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-md border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{type}</p>
                  <p className="text-sm text-slate-500">
                    {index + 1} route option available
                  </p>
                </div>
                <span className="rounded-full bg-[#f7c948]/20 px-3 py-1 text-xs font-semibold text-[#8a6500]">
                  Open
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-md bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Next module: Commutes
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Students will create commute posts, join rides, and track their
              own commute groups from the profile area.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
