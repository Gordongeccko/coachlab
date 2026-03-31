"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PlannerBoard from "@/components/PlannerBoard";
import { Exercise, Session } from "@/lib/types";

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [initialLoad, setInitialLoad] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requests: Promise<unknown>[] = [
      fetch("/api/exercises").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
    ];
    if (loadId) {
      requests.push(fetch(`/api/sessions/${loadId}`).then((r) => r.json()));
    }

    Promise.all(requests)
      .then(([exs, sess, loadedSession]) => {
        setExercises(exs as Exercise[]);
        setSessions(sess as Session[]);
        if (loadedSession) setInitialLoad(loadedSession as Session);
      })
      .catch(() => setError("Failed to load data. Please refresh."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-surface-2 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-surface-2 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
          <div className="h-96 rounded-xl bg-surface-2 border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="py-24 text-center">
          <p className="text-intensity-high text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-primary mb-2">Session Planner</h1>
        <p className="text-ink-secondary text-sm">
          Build training sessions by adding exercises, setting players, pitch size, and notes.
        </p>
      </div>

      <PlannerBoard
        exercises={exercises}
        sessions={sessions}
        initialLoad={initialLoad ?? undefined}
        onSessionSaved={(s) => setSessions((prev) => [s, ...prev])}
      />
    </div>
  );
}
