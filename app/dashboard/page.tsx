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
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(new Date(value));
}

function shortSessionId(sessionId: string) {
  return sessionId.length > 18
    ? `${sessionId.slice(0, 10)}…${sessionId.slice(-6)}`
    : sessionId;
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        {label}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl">◇</span>
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
      
      // Populate sessionTimestamps from API response immediately
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

    // Trigger initial measurement
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

        // Capture latest event timestamp for this session
        if (nextEvents.length > 0) {
          const latestTimestamp = nextEvents[nextEvents.length - 1].timestamp;
          setSessionTimestamps(prev => new Map(prev).set(selectedSessionId, latestTimestamp));
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

      // Sessions with timestamps come first, sorted by most recent
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;

      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }, [sessions, sessionTimestamps]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <a href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500 font-black shadow-lg shadow-violet-950/30">
              CF
            </a>
            <div>
              <p className="text-lg font-bold tracking-tight">Analytics dashboard</p>
              <p className="text-sm text-slate-400">Live interaction intelligence</p>
            </div>
          </div>
          <a href="/" className="w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-violet-400 hover:text-white">
            View demo page
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total sessions</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{sessionsLoading ? "—" : sessions.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Events captured</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{sessionsLoading ? "—" : totalEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Known pages</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{pageUrls.length}</p>
          </div>
        </section>

        <nav className="mt-8 inline-flex rounded-xl bg-slate-200/70 p-1" aria-label="Dashboard views">
          {(["sessions", "heatmap"] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold capitalize transition ${
                view === item ? "bg-white text-violet-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {view === "sessions" ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-950">Sessions</h2>
                  <p className="text-xs text-slate-500">Select a visitor journey</p>
                </div>
                <button type="button" onClick={() => void loadSessions()} className="rounded-lg px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50">
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
                <div className="max-h-[620px] space-y-1 overflow-y-auto p-2">
                  {sortedSessions.map((session) => (
                    <button
                      key={session.sessionId}
                      type="button"
                      onClick={() => setSelectedSessionId(session.sessionId)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition ${
                        selectedSessionId === session.sessionId
                          ? "bg-violet-600 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-medium opacity-70">Session ID</span>
                        <span className="block truncate font-mono text-sm" title={session.sessionId}>{shortSessionId(session.sessionId)}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${selectedSessionId === session.sessionId ? "bg-white/15" : "bg-slate-200 text-slate-700"}`}>
                        {session.eventCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Ordered timeline</p>
                <h2 className="mt-2 break-all font-mono text-lg font-bold text-slate-950">
                  {selectedSessionId || "Select a session"}
                </h2>
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
                  <ol className="relative ml-3 border-l border-slate-200">
                    {events.map((event, index) => (
                      <li key={event._id} className="relative pb-8 pl-8 last:pb-0">
                        <span className={`absolute -left-3 grid h-6 w-6 place-items-center rounded-full text-[10px] font-black text-white ring-4 ring-white ${event.eventType === "click" ? "bg-violet-600" : "bg-sky-500"}`}>
                          {index + 1}
                        </span>
                        <div className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:shadow-sm">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${event.eventType === "click" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                              {event.eventType}
                            </span>
                            <time className="text-xs font-medium text-slate-500" dateTime={event.timestamp}>{formatTimestamp(event.timestamp)}</time>
                          </div>
                          <p className="mt-3 break-all text-sm font-medium text-slate-800">{event.pageUrl}</p>
                          {typeof event.x === "number" && typeof event.y === "number" && (
                            <p className="mt-2 font-mono text-xs text-slate-500">x: {event.x} · y: {event.y}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Click visualization</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Page heatmap</h2>
                <p className="mt-1 text-sm text-slate-500">Dots show stored click coordinates on a 900 × 520 preview plane.</p>
              </div>
              <label className="block w-full max-w-xl">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Page URL</span>
                <select
                  value={selectedPageUrl}
                  onChange={(event) => setSelectedPageUrl(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
                    <span>{clicks.length} click{clicks.length === 1 ? "" : "s"} recorded</span>
                    <span>
                      Normalized from {Math.ceil(normalizedHeatmap.sourceWidth)} × {Math.ceil(normalizedHeatmap.sourceHeight)}
                    </span>
                  </div>
                  <div className="overflow-auto rounded-2xl border border-slate-300 bg-slate-100 p-3">
                    <div
                      ref={heatmapContainerRef}
                      className="relative overflow-hidden rounded-xl bg-white shadow-inner"
                      style={{ width: '100%', aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
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
