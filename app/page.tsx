const features = [
  {
    title: "Instant event capture",
    description: "Page views and clicks are collected automatically as visitors explore the page.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14" strokeLinecap="round" />
        <path d="M12 5v14" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: "Session-based insights",
    description: "A persistent browser session ID connects individual actions into a useful journey.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 7h12" strokeLinecap="round" />
        <path d="M8 12h8" strokeLinecap="round" />
        <path d="M10 17h4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: "Heatmap-ready data",
    description: "Click coordinates reveal which parts of your experience attract the most attention.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4v16" strokeLinecap="round" />
        <path d="M16 4v16" strokeLinecap="round" />
        <path d="M4 8h16" strokeLinecap="round" />
        <path d="M4 16h16" strokeLinecap="round" />
      </svg>
    )
  }
];

const trackedItems = [
  {
    label: "Page Views",
    description: "Track page navigation and visitor flow through your application."
  },
  {
    label: "Click Events",
    description: "Capture every button press and element interaction with coordinates."
  },
  {
    label: "Session Journeys",
    description: "Group events by visitor session for complete user behavior understanding."
  },
  {
    label: "Heatmaps",
    description: "Visualize click patterns and interaction density across your pages."
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <a href="#top" className="text-base font-semibold tracking-tight text-slate-950">
            User Analytics Dashboard
          </a>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#features" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline-flex">
              Features
            </a>
            <a
              href="#playground"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:border-slate-400 hover:bg-slate-50"
            >
              Try the demo
            </a>
          </div>
        </div>
      </nav>

      <section id="top" className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_38%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Analytics platform</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Understand how users move, click, and convert.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Capture page views, track clicks, understand sessions, and generate heatmaps in one polished analytics experience built for product teams.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#playground"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Try the demo
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:border-slate-400 hover:bg-slate-50"
                >
                  Learn more
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  Page views
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  Click events
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  Session-aware
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  Heatmap-ready
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold">Analytics overview</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">Live demo</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                    Active
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Sessions</p>
                    <p className="mt-2 text-2xl font-semibold">24</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Events</p>
                    <p className="mt-2 text-2xl font-semibold">128</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Recent activity</p>
                    <p className="text-xs text-slate-400">Updated now</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-sm text-slate-200">Homepage click</span>
                      <span className="text-xs text-slate-400">2m ago</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-sm text-slate-200">Session started</span>
                      <span className="text-xs text-slate-400">5m ago</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-sm text-slate-200">Heatmap point</span>
                      <span className="text-xs text-slate-400">7m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Core capabilities</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Everything needed for modern product analytics.
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                <div className="mt-5 text-sm font-semibold text-slate-700">0{index + 1}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">What is being tracked</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Comprehensive behavior insights.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {trackedItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="playground" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
          <div className="rounded-[24px] bg-slate-950 px-6 py-12 text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] sm:px-10 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Interactive demo</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Generate a real session right now.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Click any button below to create a tracked event. Then open the analytics dashboard to see your session in real time.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Primary action
              </button>
              <button type="button" className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-400">
                Secondary action
              </button>
              <button type="button" className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300">
                Bright idea
              </button>
              <button type="button" className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-white hover:border-slate-500 hover:bg-slate-900/50">
                Quiet action
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:px-8">
          <p>© 2026 User Analytics Dashboard. Demo experience.</p>
          <div className="flex gap-6">
            <a href="#top" className="hover:text-slate-950">Back to top</a>
            <a href="mailto:hello@example.com" className="hover:text-slate-950">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
