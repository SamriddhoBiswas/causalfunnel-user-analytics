"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type View = "sessions" | "heatmap";

type Session = {
  sessionId: string;
  eventCount: number;
  latestTimestamp?: string;
};

type AnalyticsEvent = {
  _id: string;
  sessionId: string;
  eventType: "page_view" | "click";
  pageUrl: string;
  timestamp: string;
  x?: number;
  y?: number;
};

type HeatmapClick = {
  sessionId: string;
  pageUrl: string;
  timestamp: string;
  x: number;
  y: number;
};

const PREVIEW_WIDTH = 900;
const PREVIEW_HEIGHT = 520;
const PREVIEW_PADDING = 16;

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function shortSessionId(sessionId: string) {
  return sessionId.length > 18
    ? `${sessionId.slice(0, 10)}…${sessionId.slice(-6)}`
    : sessionId;
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        {label}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-sm">◌</span>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [view, setView] = useState<View>("sessions");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [selectedPageUrl, setSelectedPageUrl] = useState("");
  const [clicks, setClicks] = useState<HeatmapClick[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [heatmapError, setHeatmapError] = useState("");
  const [sessionTimestamps, setSessionTimestamps] = useState<Map<string, string>>(new Map());
  const [heatmapDimensions, setHeatmapDimensions] = useState({
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT
  });
  const heatmapContainerRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError("");

    try {
      const response = await fetch("/api/sessions", { cache: "no-store" });
      const data = (await response.json()) as {
        success: boolean;
        sessions?: Session[];
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load sessions.");
      }

      const nextSessions = data.sessions ?? [];
      setSessions(nextSessions);

      const timestamps = new Map<string, string>();
      nextSessions.forEach((session) => {
        if (session.latestTimestamp) {
          timestamps.set(session.sessionId, session.latestTimestamp);
        }
      });
      setSessionTimestamps(timestamps);

      setSelectedSessionId((current) => {
        if (current && nextSessions.some((session) => session.sessionId === current)) {
          return current;
        }
        return nextSessions[0]?.sessionId ?? "";
      });
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : "Unable to load sessions.");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (view !== "heatmap") return;

    const container = heatmapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (heatmapContainerRef.current) {
        const width = heatmapContainerRef.current.offsetWidth;
        const height = heatmapContainerRef.current.offsetHeight;
        setHeatmapDimensions({ width, height });
      }
    });

    observer.observe(container);

    setTimeout(() => {
      if (heatmapContainerRef.current) {
        const width = heatmapContainerRef.current.offsetWidth;
        const height = heatmapContainerRef.current.offsetHeight;
        setHeatmapDimensions({ width, height });
      }
    }, 0);

    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    if (!selectedSessionId) {
      setEvents([]);
      return;
    }

    const controller = new AbortController();

    async function loadEvents() {
      setEventsLoading(true);
      setEventsError("");

      try {
        const response = await fetch(
          `/api/events/${encodeURIComponent(selectedSessionId)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const data = (await response.json()) as {
          success: boolean;
          events?: AnalyticsEvent[];
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load this journey.");
        }

        const nextEvents = data.events ?? [];
        setEvents(nextEvents);

        if (nextEvents.length > 0) {
          const latestTimestamp = nextEvents[nextEvents.length - 1].timestamp;
          setSessionTimestamps((prev) => new Map(prev).set(selectedSessionId, latestTimestamp));
        }

        const discoveredUrls = Array.from(new Set(nextEvents.map((event) => event.pageUrl)));
        setPageUrls((current) => Array.from(new Set([...current, ...discoveredUrls])).sort());
        setSelectedPageUrl((current) => current || discoveredUrls[0] || "");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setEventsError(error instanceof Error ? error.message : "Unable to load this journey.");
      } finally {
        if (!controller.signal.aborted) setEventsLoading(false);
      }
    }

    void loadEvents();
    return () => controller.abort();
  }, [selectedSessionId]);

  useEffect(() => {
    if (view !== "heatmap" || !selectedPageUrl) return;

    const controller = new AbortController();

    async function loadHeatmap() {
      setHeatmapLoading(true);
      setHeatmapError("");

      try {
        const query = new URLSearchParams({ pageUrl: selectedPageUrl });
        const response = await fetch(`/api/heatmap?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        });
        const data = (await response.json()) as {
          success: boolean;
          clicks?: HeatmapClick[];
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load heatmap data.");
        }

        setClicks(data.clicks ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setHeatmapError(error instanceof Error ? error.message : "Unable to load heatmap data.");
      } finally {
        if (!controller.signal.aborted) setHeatmapLoading(false);
      }
    }

    void loadHeatmap();
    return () => controller.abort();
  }, [selectedPageUrl, view]);

  const totalEvents = useMemo(
    () => sessions.reduce((total, session) => total + session.eventCount, 0),
    [sessions]
  );

  const normalizedHeatmap = useMemo(() => {
    const validClicks = clicks.filter(
      (click) => Number.isFinite(click.x) && Number.isFinite(click.y)
    );
    const sourceWidth = Math.max(
      PREVIEW_WIDTH,
      ...validClicks.map((click) => Math.max(0, click.x))
    );
    const sourceHeight = Math.max(
      PREVIEW_HEIGHT,
      ...validClicks.map((click) => Math.max(0, click.y))
    );
    const drawableWidth = heatmapDimensions.width - PREVIEW_PADDING * 2;
    const drawableHeight = heatmapDimensions.height - PREVIEW_PADDING * 2;

    return {
      sourceWidth,
      sourceHeight,
      points: validClicks.map((click) => ({
        ...click,
        normalizedX:
          PREVIEW_PADDING +
          (Math.min(Math.max(click.x, 0), sourceWidth) / sourceWidth) * drawableWidth,
        normalizedY:
          PREVIEW_PADDING +
          (Math.min(Math.max(click.y, 0), sourceHeight) / sourceHeight) * drawableHeight
      }))
    };
  }, [clicks, heatmapDimensions]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const timeA = sessionTimestamps.get(a.sessionId);
      const timeB = sessionTimestamps.get(b.sessionId);

      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;

      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }, [sessions, sessionTimestamps]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Live
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-xl">
                User Analytics Dashboard
              </h1>
              
            </div>
          </div>
          <a
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            View demo page
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-24px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total sessions</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{sessionsLoading ? "—" : sessions.length}</p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-2.5 text-violet-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v11A2.5 2.5 0 0 1 16.5 20h-9A2.5 2.5 0 0 1 5 17.5z" />
                  <path d="M8 8h8" />
                  <path d="M8 12h5" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">Tracked visitor journeys from the current dataset.</p>
          </div>
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-24px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Events captured</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{sessionsLoading ? "—" : totalEvents}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-2.5 text-sky-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 7h14" />
                  <path d="M8 12h8" />
                  <path d="M10 17h4" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">Page views and clicks recorded across sessions.</p>
          </div>
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-24px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Known pages</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{pageUrls.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h4.1l2.4 2.4H16.5A2.5 2.5 0 0 1 19 9.9v6.6A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">Tracked URLs surfaced from the selected journeys.</p>
          </div>
        </section>

        <nav className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm" aria-label="Dashboard views">
          {(["sessions", "heatmap"] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
                view === item ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {view === "sessions" ? (
          <section className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">Sessions</h2>
                  <p className="text-xs text-slate-500">Recent visitor journeys</p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadSessions()}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  Refresh
                </button>
              </div>

              {sessionsLoading ? (
                <div className="p-4"><LoadingBlock label="Loading sessions…" /></div>
              ) : sessionsError ? (
                <div className="p-5 text-sm text-rose-600">{sessionsError}</div>
              ) : sessions.length === 0 ? (
                <div className="p-4"><EmptyState title="No sessions yet" description="Visit and click around the demo page to create your first session." /></div>
              ) : (
                <div className="max-h-[640px] space-y-2 overflow-y-auto p-2">
                  {sortedSessions.map((session) => {
                    const isSelected = selectedSessionId === session.sessionId;
                    const latestTimestamp = sessionTimestamps.get(session.sessionId);
                    return (
                      <button
                        key={session.sessionId}
                        type="button"
                        onClick={() => setSelectedSessionId(session.sessionId)}
                        className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
                          isSelected
                            ? "border-violet-200 bg-violet-50 shadow-[0_12px_35px_-20px_rgba(124,58,237,0.6)]"
                            : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className={`block text-[11px] font-semibold uppercase tracking-[0.24em] ${isSelected ? "text-violet-700" : "text-slate-400"}`}>
                            Session ID
                          </span>
                          <span className="mt-1 block truncate font-mono text-sm text-slate-900" title={session.sessionId}>{shortSessionId(session.sessionId)}</span>
                          <span className={`mt-2 block text-xs ${isSelected ? "text-violet-700/80" : "text-slate-500"}`}>
                            {latestTimestamp ? formatTimestamp(latestTimestamp) : "No timestamp yet"}
                          </span>
                        </span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${isSelected ? "bg-white text-violet-700 shadow-sm" : "bg-slate-100 text-slate-700"}`}>
                          {session.eventCount} events
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)] sm:p-6">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">Ordered timeline</p>
                  <h2 className="mt-1 break-all font-mono text-lg font-semibold text-slate-950">
                    {selectedSessionId || "Select a session"}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {events.length} event{events.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-6">
                {eventsLoading ? (
                  <LoadingBlock label="Loading user journey…" />
                ) : eventsError ? (
                  <EmptyState title="Journey unavailable" description={eventsError} />
                ) : !selectedSessionId ? (
                  <EmptyState title="No session selected" description="Choose a session to inspect its ordered sequence of page views and clicks." />
                ) : events.length === 0 ? (
                  <EmptyState title="No events found" description="This session does not have any stored events." />
                ) : (
                  <div className="max-h-[660px] overflow-y-auto pl-2 pr-2">
                    <ol className="relative ml-2 border-l border-slate-200">
                      {events.map((event, index) => (
                        <li key={event._id} className="relative pb-4 pl-7 last:pb-0">
                          <span className={`absolute -left-3 top-2 grid h-6 w-6 place-items-center rounded-full text-[10px] font-black text-white ring-4 ring-white ${event.eventType === "click" ? "bg-violet-600" : "bg-sky-500"}`}>
                            {index + 1}
                          </span>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-[0_10px_25px_-20px_rgba(15,23,42,0.4)] transition hover:border-violet-200 hover:bg-white hover:shadow-[0_16px_35px_-20px_rgba(124,58,237,0.35)]">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${event.eventType === "click" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                                {event.eventType === "click" ? "Click" : "Page View"}
                              </span>
                              <time className="text-xs font-medium text-slate-500" dateTime={event.timestamp}>{formatTimestamp(event.timestamp)}</time>
                            </div>
                            <p className="mt-3 break-all text-sm font-medium text-slate-800">{event.pageUrl}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {typeof event.x === "number" && typeof event.y === "number" ? (
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono">x: {event.x} · y: {event.y}</span>
                              ) : (
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">No coordinates recorded</span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">Click visualization</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Page heatmap</h2>
                <p className="mt-1 text-sm text-slate-500">Dots show stored click coordinates on a 900 × 520 preview plane.</p>
              </div>
              <label className="block w-full max-w-xl">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Page URL</span>
                <select
                  value={selectedPageUrl}
                  onChange={(event) => setSelectedPageUrl(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  {pageUrls.length === 0 && <option value="">No page URLs discovered</option>}
                  {pageUrls.map((pageUrl) => <option key={pageUrl} value={pageUrl}>{pageUrl}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-6">
              {!selectedPageUrl ? (
                <EmptyState title="No page selected" description="Open a session journey first so the dashboard can discover its page URLs." />
              ) : heatmapLoading ? (
                <LoadingBlock label="Plotting click positions…" />
              ) : heatmapError ? (
                <EmptyState title="Heatmap unavailable" description={heatmapError} />
              ) : clicks.length === 0 ? (
                <EmptyState title="No clicks on this page" description="Click around this page, then switch views or select the URL again to refresh its heatmap." />
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-medium text-slate-500">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        {clicks.length} click{clicks.length === 1 ? "" : "s"} recorded
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                        Normalized from {Math.ceil(normalizedHeatmap.sourceWidth)} × {Math.ceil(normalizedHeatmap.sourceHeight)}
                      </span>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Preview plane
                    </div>
                  </div>
                  <div className="overflow-auto rounded-2xl border border-slate-300 bg-slate-100 p-3 shadow-inner">
                    <div
                      ref={heatmapContainerRef}
                      className="relative overflow-hidden rounded-xl bg-white shadow-[0_16px_45px_-24px_rgba(15,23,42,0.45)]"
                      style={{ width: "100%", aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
                      aria-label={`Heatmap showing ${normalizedHeatmap.points.length} normalized clicks`}
                    >
                      <div className="absolute inset-x-0 top-0 h-16 border-b border-slate-200 bg-slate-50" />
                      <div className="absolute left-6 top-5 h-6 w-24 rounded-md bg-slate-200" />
                      <div className="absolute right-6 top-5 flex gap-3">
                        <span className="h-6 w-16 rounded-md bg-slate-200" />
                        <span className="h-6 w-16 rounded-md bg-slate-200" />
                      </div>
                      <div className="absolute left-1/2 top-28 h-7 w-72 -translate-x-1/2 rounded-md bg-slate-200" />
                      <div className="absolute left-1/2 top-40 h-4 w-96 -translate-x-1/2 rounded bg-slate-100" />
                      <div className="absolute inset-x-20 bottom-14 grid grid-cols-3 gap-5">
                        <span className="h-44 rounded-xl border border-slate-200 bg-slate-50" />
                        <span className="h-44 rounded-xl border border-slate-200 bg-slate-50" />
                        <span className="h-44 rounded-xl border border-slate-200 bg-slate-50" />
                      </div>

                      {normalizedHeatmap.points.map((click, index) => (
                        <span
                          key={`${click.sessionId}-${click.timestamp}-${index}`}
                          className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose-500/80 shadow-[0_0_0_6px_rgba(244,63,94,0.18)]"
                          style={{ left: click.normalizedX, top: click.normalizedY }}
                          title={`Original click at (${click.x}, ${click.y})`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
