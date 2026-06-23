const features = [
  {
    title: "Instant event capture",
    description: "Page views and clicks are collected automatically as visitors explore the page.",
    accent: "bg-violet-100 text-violet-700"
  },
  {
    title: "Session-based insights",
    description: "A persistent browser session ID connects individual actions into a useful journey.",
    accent: "bg-sky-100 text-sky-700"
  },
  {
    title: "Heatmap-ready data",
    description: "Click coordinates reveal which parts of your experience attract the most attention.",
    accent: "bg-amber-100 text-amber-700"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#top" className="flex items-center gap-3 font-semibold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white">CF</span>
          CausalFunnel
        </a>
        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#features" className="hidden text-sm font-medium text-slate-600 hover:text-violet-700 sm:block">
            Features
          </a>
          <a href="#playground" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-violet-400 hover:text-violet-700">
            Try the demo
          </a>
        </div>
      </nav>

      <section id="top" className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center sm:pt-24">
        <div className="absolute left-1/2 top-12 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/60 blur-3xl" />
        <span className="inline-flex rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm">
          User analytics, made tangible
        </span>
        <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Discover what your users actually do.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          This interactive page is a testing ground for CausalFunnel. Every click helps demonstrate how real behavior becomes useful product insight.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="#playground" className="rounded-full bg-violet-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">
            Start clicking
          </a>
          <a href="#features" className="rounded-full bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-violet-300">
            See how it works
          </a>
        </div>
      </section>

      <section id="features" className="border-y border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">Built for exploration</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Small interactions, meaningful signals.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className="group rounded-3xl border border-slate-200 p-7 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl">
                <span className={`inline-grid h-11 w-11 place-items-center rounded-2xl font-bold ${feature.accent}`}>
                  {index + 1}
                </span>
                <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                <button type="button" className="mt-6 text-sm font-bold text-violet-700 group-hover:underline">
                  Explore feature →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="playground" className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-[2rem] bg-slate-950 px-6 py-14 text-center text-white sm:px-12">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-300">Interaction playground</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Give the tracker something to see.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Click a few actions below. Each one creates a coordinate-aware event tied to your current session.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button type="button" className="rounded-xl bg-violet-500 px-5 py-3 font-semibold hover:bg-violet-400">Primary action</button>
            <button type="button" className="rounded-xl bg-sky-500 px-5 py-3 font-semibold hover:bg-sky-400">Secondary action</button>
            <button type="button" className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300">Bright idea</button>
            <button type="button" className="rounded-xl border border-slate-600 px-5 py-3 font-semibold hover:border-white">Quiet action</button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 CausalFunnel. Analytics demo.</p>
          <div className="flex gap-5">
            <a href="#top" className="hover:text-violet-700">Back to top</a>
            <a href="mailto:hello@example.com" className="hover:text-violet-700">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
