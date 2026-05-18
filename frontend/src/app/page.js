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
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_18%,rgba(160,183,190,0.42)_0%,transparent_34%),linear-gradient(115deg,#07131a_0%,#17303a_32%,#4f6268_70%,#d7dedc_100%)] text-[#07131a]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07131a]/82 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-black text-[#8ed8ff] ring-1 ring-white/15 sm:h-11 sm:w-11">
              চ
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-none text-white sm:text-xl">
                চলোযাই
              </p>
              <p className="mt-1 hidden text-xs font-bold text-white/58 sm:block">
                AIUB Commute Connect
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-bold text-white/70 md:flex">
            <a href="#purpose" className="hover:text-white">
              Purpose
            </a>
            <a href="#journey" className="hover:text-white">
              Journey
            </a>
            <a href="#features" className="hover:text-white">
              Features
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="rounded-full border bg-[#071016] px-5 py-1.5 text-center text-sm font-black text-[#07131a] shadow-lg shadow-[#07131a]/15 transition hover:border-white hover:bg-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full border bg-[#071016] px-5 py-1.5 text-center text-sm font-black text-[#07131a] shadow-lg shadow-[#07131a]/15 transition hover:border-white hover:bg-white"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-transparent">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(93,139,150,0.18)_0%,transparent_28%),linear-gradient(90deg,rgba(7,19,26,0.18)_0%,transparent_58%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-70px)] max-w-7xl items-start gap-8 px-4 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal">
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.97] tracking-normal text-[#07131a] sm:mt-7 sm:text-7xl">
            চলোযাই
          </h1>
          <p className="mt-4 max-w-3xl text-2xl font-black leading-tight text-[#122832] sm:mt-5 sm:text-5xl">
            Find your route people before the ride starts.
          </p>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#c4d4d9] sm:mt-6 sm:text-lg sm:leading-8">
            Create a commute post, request a seat, split the cost, and meet at a
            selected pickup point with students going the same way.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full border bg-[#071016] px-5 py-2.5 text-center text-sm font-black text-white shadow-lg shadow-[#07131a]/15 transition hover:border-white hover:bg-white hover:text-[#07131a] sm:py-2"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded-full border bg-[#071016] px-5 py-2.5 text-center text-sm font-black text-white shadow-lg shadow-[#07131a]/15 transition hover:border-white hover:bg-white hover:text-[#07131a] sm:py-2"
            >
              Login 
            </Link>
          </div>
        </div>

        <div className="reveal relative">
          <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-[#8ed8ff]/60 blur-3xl" />
          <div className="absolute -bottom-8 left-8 h-44 w-44 rounded-full bg-[#8aa0a8]/40 blur-3xl" />

          <div className="ride-card relative rounded-[24px] border border-[#07131a]/12 bg-white p-3 shadow-2xl shadow-[#07131a]/12 sm:rounded-[32px] sm:p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_0.82fr]">
              <div className="rounded-[20px] bg-[#071016] p-4 text-white sm:rounded-[24px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ed8ff] sm:text-sm">
                 Sample Commute card
                </p>
                <h2 className="mt-4 text-2xl font-black sm:mt-5 sm:text-3xl">Kuril to AIUB</h2>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
                  <div className="rounded-2xl border border-white/70 bg-white/10 p-3 sm:border-2 sm:p-4">
                    <p className="text-xs font-bold text-white/60">Transport</p>
                    <p className="mt-1 font-black">Uber</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/10 p-3 sm:border-2 sm:p-4">
                    <p className="text-xs font-bold text-white/60">Seats</p>
                    <p className="mt-1 font-black">1 left</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/10 p-3 sm:border-2 sm:p-4">
                    <p className="text-xs font-bold text-white/60">Cost</p>
                    <p className="mt-1 font-black">Tk 10</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/10 p-3 sm:border-2 sm:p-4">
                    <p className="text-xs font-bold text-white/60">Join</p>
                    <p className="mt-1 font-black">Request</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#dbe6ea] p-3 sm:rounded-[24px] sm:p-4">
                <div className="route-map relative h-64 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#d7e4e7_25%,#c5d4d8_25%,#c5d4d8_50%,#d7e4e7_50%,#d7e4e7_75%,#c5d4d8_75%)] bg-[length:34px_34px] sm:h-full sm:min-h-72 sm:rounded-[20px]">
                  <div className="absolute left-0 top-[42%] h-4 w-full -rotate-[17deg] bg-white/45" />
                  <div className="absolute left-[8%] top-[20%] h-3 w-[90%] rotate-[8deg] bg-white/35" />
                  <div className="absolute bottom-[18%] left-[4%] h-3 w-[88%] -rotate-[4deg] bg-white/35" />
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="20"
                      y1="70"
                      x2="65"
                      y2="36"
                      stroke="#07131a"
                      strokeWidth="2.2"
                      strokeDasharray="1 5"
                      strokeLinecap="round"
                      opacity="0.68"
                    />
                  </svg>
                  <div className="route-dot absolute left-[20%] top-[70%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#07131a] shadow-lg" />
                  <div className="route-dot route-dot-destination absolute left-[65%] top-[36%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#0b83c9] shadow-lg" />
                  <div className="map-pin-travel absolute h-14 w-10 sm:h-16 sm:w-12">
                    <svg
                      viewBox="0 0 64 76"
                      className="h-full w-full drop-shadow-xl"
                      aria-hidden="true"
                    >
                      <path
                        d="M32 4C18.2 4 7 15.2 7 29c0 19.8 25 43 25 43s25-23.2 25-43C57 15.2 45.8 4 32 4Z"
                        fill="#34A853"
                      />
                      <path
                        d="M32 4C18.2 4 7 15.2 7 29c0 7.1 3.2 14.7 7.3 21.4L32 29V4Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M32 4v25l18.2-15.8A24.9 24.9 0 0 0 32 4Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M14.3 50.4C21.8 62.2 32 72 32 72V29L14.3 50.4Z"
                        fill="#FBBC05"
                      />
                      <circle cx="32" cy="29" r="11" fill="white" />
                    </svg>
                    <span className="absolute bottom-0 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-[#07131a]/25 blur-[1px]" />
                  </div>
                  
                  <div className="absolute right-3 top-2 rounded-2xl bg-white px-3 py-2 shadow-lg sm:right-4 sm:top-0 sm:px-4 sm:py-3">
                    <p className="text-[10px] font-black uppercase text-[#6d756f] sm:text-xs">
                      Destination
                    </p>
                    <p className="mt-1 font-black text-[#07131a]"></p>
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-2xl bg-white px-3 py-2 shadow-lg sm:bottom-4 sm:left-4 sm:w-35 sm:p-4">
                    <p className="text-[10px] font-black uppercase text-[#6d756f] sm:text-xs">
                      Pickup Point
                    </p>
                    <p className="mt-1 font-black text-[#07131a]">
                      
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {highlights.map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#07131a]/10 bg-[#e8eef0] p-4"
                >
                  <p className="font-black text-[#07131a]">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#4f6268]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>

      <section id="purpose" className="relative overflow-hidden bg-[#07131a] px-4 py-24 text-white">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#8ed8ff]/18 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal">
            <p className="inline-flex rounded-full border border-[#8ed8ff]/30 bg-[#8ed8ff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#8ed8ff]">
              Purpose
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              A simpler way to organize campus commute partners.
            </h2>
          </div>

<div className="reveal rounded-[28px] border border-white bg-white/8 p-6 text-white/80 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur flex items-center justify-center text-center min-h-[160px]">             <p>
              চলোযাই helps AIUB students coordinate shared transport around
              matching routes and times. The focus is simple: post a route,
              request a seat, confirm members, and meet at the right point.
            </p>
          </div>
        </div>
      </section>

      <section id="journey" className="bg-[linear-gradient(135deg,#e8eef0_0%,#cdd9dd_52%,#8aa0a8_100%)] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="reveal max-w-3xl">
            <p className="inline-flex rounded-full border border-[#07131a]/10 bg-white/54 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#244b58] shadow-sm backdrop-blur">
              Journey
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-[#07131a] sm:text-5xl">
              The flow stays close to how students actually commute.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map(([title, text], index) => (
              <article
                key={title}
                className="reveal rounded-[28px] border border-white/55 bg-white/76 p-6 shadow-[0_20px_60px_rgba(7,19,26,0.12)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/88"
              >
                <p className="grid h-16 w-16 place-items-center rounded-2xl bg-[#07131a] text-3xl font-black text-[#8ed8ff] shadow-lg shadow-[#07131a]/20">
                  {index + 1}
                </p>
                <h3 className="mt-8 text-xl font-black text-[#07131a]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#465a62]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden bg-[linear-gradient(135deg,#122832_0%,#2f4851_52%,#56696f_100%)] px-4 py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[38rem] -translate-x-1/2 rounded-full bg-[#8ed8ff]/12 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="reveal">
            <p className="inline-flex rounded-full border border-[#8ed8ff]/30 bg-[#8ed8ff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#8ed8ff]">
              Why it helps
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Less confusion before the ride, more clarity for everyone.
            </h2>
          </div>

          <div className="reveal rounded-[32px] border border-white/10 bg-[#07131a]/78 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur">
            <ul className="space-y-5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-4">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#8ed8ff] text-sm font-black text-[#07131a]">
                    ✓
                  </span>
                  <p className="text-lg leading-8 text-white/78">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#07131a] px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-black text-white">চলোযাই</p>
            <p className="mt-1 text-sm font-semibold text-white/60">
              AIUB Commute Connect
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-bold text-white/66">
            <a href="#purpose" className="hover:text-white">
              Purpose
            </a>
            <a href="#journey" className="hover:text-white">
              Journey
            </a>
            <a href="#features" className="hover:text-white">
              Features
            </a>
          </div>

          <p className="text-sm font-semibold text-white/55">
            © 2026 চলোযাই. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
