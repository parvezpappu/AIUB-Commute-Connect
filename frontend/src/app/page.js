import Link from "next/link";

const highlights = [
  ["Route posts", "Share your route, time, seats, and cost in one post."],
  ["Meeting points", "Pick a clear campus-friendly place before the ride."],
  ["Member location", "Accepted members can coordinate before departure."],
  ["Preference", "Creators can set who can request to join."],
];

const steps = [
  ["Register", "Use your AIUB student information to create an account."],
  ["Create or request", "Post your own commute or request a seat from another student."],
  ["Get accepted", "The commute creator reviews requests and confirms members."],
  ["Meet up", "Use the selected meeting point and coordinate before leaving."],
];

const benefits = [
  "Spend less by sharing rides with students on similar routes.",
  "Stop searching manually in chats every time you need a commute.",
  "Keep requests, accepted members, and meeting details organized.",
  "Make pickup easier with a clear mapped meeting point.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#17211d]">
      <header className="sticky top-0 z-40 border-b border-[#17211d]/10 bg-[#f5f7f4]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#18372f] text-lg font-black text-[#ffc857]">
              চ
            </div>
            <div>
              <p className="text-xl font-black leading-none text-[#18372f]">
                চলোযাই
              </p>
              <p className="mt-1 text-xs font-bold text-[#6d756f]">
                AIUB Commute Connect
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-bold text-[#43514a] md:flex">
            <a href="#purpose" className="hover:text-[#123f31]">
              Purpose
            </a>
            <a href="#journey" className="hover:text-[#123f31]">
              Journey
            </a>
            <a href="#features" className="hover:text-[#123f31]">
              Features
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-black text-[#18372f] hover:bg-[#18372f]/8"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#18372f] px-5 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#102720]"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_12%_12%,#d7efe3_0%,transparent_30%),linear-gradient(135deg,#f5f7f4_0%,#e9efe8_52%,#f8ead2_100%)]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[repeating-linear-gradient(115deg,transparent_0,transparent_18px,rgba(24,55,47,0.05)_19px,rgba(24,55,47,0.05)_20px)]" />
      <div className="mx-auto grid min-h-[calc(100vh-77px)] max-w-7xl items-center gap-12 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal">
          <p className="inline-flex rounded-full border border-[#18372f]/15 bg-white px-4 py-2 text-sm font-black text-[#18372f] shadow-sm">
            Built for everyday AIUB commutes
          </p>

          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.97] tracking-normal text-[#18372f] sm:text-7xl">
            চলোযাই
          </h1>
          <p className="mt-5 max-w-3xl text-3xl font-black leading-tight text-[#293d35] sm:text-5xl">
            Find your route people before the ride starts.
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#52615a]">
            Create a commute post, request a seat, split the cost, and meet at a
            selected pickup point with students going the same way.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-[#18372f] px-7 py-4 text-center text-sm font-black text-white shadow-lg shadow-[#18372f]/15 transition hover:bg-[#102720]"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#18372f]/20 bg-white px-7 py-4 text-center text-sm font-black text-[#18372f] transition hover:border-[#18372f]/50"
            >
              Login with University ID
            </Link>
          </div>
        </div>

        <div className="reveal relative">
          <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-[#ffc857]/60 blur-3xl" />
          <div className="absolute -bottom-8 left-8 h-44 w-44 rounded-full bg-[#7fc8a9]/40 blur-3xl" />

          <div className="ride-card relative rounded-[32px] border border-[#18372f]/12 bg-white p-4 shadow-2xl shadow-[#18372f]/12">
            <div className="grid gap-4 md:grid-cols-[1fr_0.82fr]">
              <div className="rounded-[24px] bg-[#18372f] p-6 text-white">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#a8e6c4]">
                  Commute card
                </p>
                <h2 className="mt-5 text-3xl font-black">Kuril to AIUB</h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold text-white/60">Transport</p>
                    <p className="mt-1 font-black">Uber</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold text-white/60">Seats</p>
                    <p className="mt-1 font-black">1 left</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold text-white/60">Cost</p>
                    <p className="mt-1 font-black">Tk 10</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold text-white/60">Join</p>
                    <p className="mt-1 font-black">Request</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#e9efe9] p-4">
                <div className="route-map relative h-full min-h-72 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#d7e4d9_25%,#c7dacb_25%,#c7dacb_50%,#d7e4d9_50%,#d7e4d9_75%,#c7dacb_75%)] bg-[length:34px_34px]">
                  <div className="absolute left-0 top-[42%] h-4 w-full -rotate-[17deg] bg-white/45" />
                  <div className="absolute left-[8%] top-[20%] h-3 w-[90%] rotate-[8deg] bg-white/35" />
                  <div className="absolute bottom-[18%] left-[4%] h-3 w-[88%] -rotate-[4deg] bg-white/35" />
                  <div className="route-line absolute left-[20%] top-[67%] h-1.5 w-[55%] -rotate-[27deg] rounded-full bg-[#18372f]/45" />
                  <div className="route-dot absolute left-[17%] top-[66%] h-5 w-5 rounded-full border-4 border-white bg-[#18372f] shadow-lg" />
                  <div className="route-dot route-dot-destination absolute left-[72%] top-[25%] h-5 w-5 rounded-full border-4 border-white bg-[#ff9f1c] shadow-lg" />
                  <div className="route-car absolute left-[42%] top-[47%] h-6 w-10 -rotate-[27deg] rounded-full bg-[#ff9f1c] shadow-lg">
                    <span className="absolute bottom-[-3px] left-1 h-2 w-2 rounded-full bg-[#18372f]" />
                    <span className="absolute bottom-[-3px] right-1 h-2 w-2 rounded-full bg-[#18372f]" />
                  </div>
                  <div className="absolute left-[7%] top-[74%] rounded-2xl bg-white px-4 py-3 shadow-lg">
                    <p className="text-xs font-black uppercase text-[#6d756f]">
                      Start
                    </p>
                    <p className="mt-1 font-black text-[#18372f]">Kuril</p>
                  </div>
                  <div className="absolute right-4 top-4 rounded-2xl bg-white px-4 py-3 shadow-lg">
                    <p className="text-xs font-black uppercase text-[#6d756f]">
                      Destination
                    </p>
                    <p className="mt-1 font-black text-[#18372f]"></p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white p-4 shadow-lg">
                    <p className="text-xs font-black uppercase text-[#6d756f]">
                      Meeting point
                    </p>
                    <p className="mt-1 font-black text-[#18372f]">
                      
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {highlights.map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#18372f]/10 bg-[#fbfaf6] p-4"
                >
                  <p className="font-black text-[#18372f]">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#617169]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>

      <section id="purpose" className="bg-[#18372f] px-4 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#a8e6c4]">
              Purpose
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              A simpler way to organize campus commute partners.
            </h2>
          </div>

          <div className="reveal rounded-[28px] border border-white/10 bg-white/8 p-6 text-lg leading-8 text-white/72">
            <p>
              চলোযাই helps AIUB students coordinate shared transport around
              matching routes and times. The focus is simple: post a route,
              request a seat, confirm members, and meet at the right point.
            </p>
          </div>
        </div>
      </section>

      <section id="journey" className="bg-[#f5f7f4] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="reveal max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#0f7b52]">
              Journey
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-[#18372f] sm:text-5xl">
              The flow stays close to how students actually commute.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map(([title, text], index) => (
              <article
                key={title}
                className="reveal rounded-[28px] border border-[#18372f]/10 bg-white p-6 shadow-sm"
              >
                <p className="text-5xl font-black text-[#ff9f1c]">
                  {index + 1}
                </p>
                <h3 className="mt-8 text-xl font-black text-[#18372f]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#617169]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#e8efe8] px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="reveal">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#0f7b52]">
              Why it helps
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-[#18372f] sm:text-5xl">
              Less confusion before the ride, more clarity for everyone.
            </h2>
          </div>

          <div className="reveal rounded-[32px] bg-[#18372f] p-6 text-white shadow-xl shadow-[#18372f]/15">
            <ul className="space-y-5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-4">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ffc857] text-sm font-black text-[#18372f]">
                    ✓
                  </span>
                  <p className="text-lg leading-8 text-white/78">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#18372f]/10 bg-[#f5f7f4] px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-black text-[#18372f]">চলোযাই</p>
            <p className="mt-1 text-sm font-semibold text-[#617169]">
              AIUB Commute Connect
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-bold text-[#43514a]">
            <a href="#purpose" className="hover:text-[#18372f]">
              Purpose
            </a>
            <a href="#journey" className="hover:text-[#18372f]">
              Journey
            </a>
            <a href="#features" className="hover:text-[#18372f]">
              Features
            </a>
          </div>

          <p className="text-sm font-semibold text-[#617169]">
            © 2026 চলোযাই. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
