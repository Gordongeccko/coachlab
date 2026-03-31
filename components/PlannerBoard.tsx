"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Exercise, Session } from "@/lib/types";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseFilters from "@/components/ExerciseFilters";
import { Button } from "@/components/ui/Button";

const PITCH_SIZES = ["Full", "3/4", "Half", "Quarter"] as const;
const DURATION_PRESETS = [45, 60, 75, 90, 105, 120];

type PlayerLevel = "bra" | "bättre" | "bäst";

const LEVELS: { id: PlayerLevel; label: string; color: string; target: number }[] = [
  { id: "bra",    label: "Bra",    color: "bg-sky-500/20 border-sky-500/40 text-sky-300",    target: 25 },
  { id: "bättre", label: "Bättre", color: "bg-amber-500/20 border-amber-500/40 text-amber-300", target: 50 },
  { id: "bäst",   label: "Bäst",   color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300", target: 25 },
];

// Per-exercise state tracked in the session builder
interface SessionItem {
  exercise: Exercise;
  notes: string;
  duration: string; // string so input is controlled; parsed to int on save
  level: PlayerLevel | null;
}

interface SessionState {
  name: string;
  notes: string;
  players: number;
  pitchSize: string;
  duration: string; // empty string = not set
  groupSizeOverride: string; // empty = auto
  levelMode: boolean;
  items: SessionItem[];
}

interface PlannerBoardProps {
  exercises: Exercise[];
  sessions: Session[];
  initialLoad?: Session;
  onSessionSaved: (session: Session) => void;
}

const DEFAULT_SESSION: SessionState = {
  name: "",
  notes: "",
  players: 10,
  pitchSize: "Full",
  duration: "",
  groupSizeOverride: "",
  levelMode: false,
  items: [],
};

interface Filters {
  search: string;
  category: string;
  subcategory: string;
  exerciseType: string;
  source: string;
  verified: string;
}

function matchesFilters(ex: Exercise, filters: Filters): boolean {
  const { search, category, subcategory, exerciseType, source, verified } = filters;
  if (search) {
    const q = search.toLowerCase();
    if (
      !ex.title.toLowerCase().includes(q) &&
      !ex.vad.toLowerCase().includes(q) &&
      !ex.varfor.toLowerCase().includes(q)
    )
      return false;
  }
  if (category && ex.category !== category) return false;
  if (subcategory && ex.subcategory !== subcategory) return false;
  if (exerciseType && ex.exerciseType !== exerciseType) return false;
  if (source && ex.source !== source) return false;
  if (verified !== "") {
    const want = verified === "true";
    if (ex.verified !== want) return false;
  }
  return true;
}

// ─── Custom Exercise Modal ──────────────────────────────────────────────────

interface CustomExerciseForm {
  title: string;
  vad: string;
  varfor: string;
  hur: string;
  organisation: string;
  anvisningar: string;
}

const EMPTY_CUSTOM: CustomExerciseForm = {
  title: "",
  vad: "",
  varfor: "",
  hur: "",
  organisation: "",
  anvisningar: "",
};

interface CustomExerciseModalProps {
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
}

function CustomExerciseModal({ onClose, onAdd }: CustomExerciseModalProps) {
  const [form, setForm] = useState<CustomExerciseForm>(EMPTY_CUSTOM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (field: keyof CustomExerciseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Titel krävs.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          vad: form.vad,
          varfor: form.varfor,
          hur: form.hur,
          organisation: form.organisation,
          anvisningar: form.anvisningar,
          source: "Custom",
          verified: false,
        }),
      });
      if (!res.ok) throw new Error();
      const created: Exercise = await res.json();
      onAdd(created);
      onClose();
    } catch {
      setError("Kunde inte spara övningen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface-1 border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-surface-1 border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-primary">
            Lägg till egen övning
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary transition-colors p-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <ModalField label="Titel" required>
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="Namn på övningen..."
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </ModalField>

          <ModalField label="Vad">
            <input
              type="text"
              value={form.vad}
              onChange={set("vad")}
              placeholder="Kategori / vad tränas..."
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </ModalField>

          <ModalField label="Varför">
            <textarea
              value={form.varfor}
              onChange={set("varfor")}
              placeholder="Syfte med övningen..."
              rows={2}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </ModalField>

          <ModalField label="Hur">
            <textarea
              value={form.hur}
              onChange={set("hur")}
              placeholder="Utförande och rörelse..."
              rows={3}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </ModalField>

          <ModalField label="Organisation">
            <input
              type="text"
              value={form.organisation}
              onChange={set("organisation")}
              placeholder="t.ex. 2 lag om 8 spelare, 30×20m..."
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </ModalField>

          <ModalField label="Anvisningar">
            <textarea
              value={form.anvisningar}
              onChange={set("anvisningar")}
              placeholder="Detaljerade instruktioner, progressioner..."
              rows={4}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </ModalField>

          {error && <p className="text-xs text-intensity-high">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              Avbryt
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Sparar..." : "Lägg till i pass"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
        {label}
        {required && <span className="text-intensity-high ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

function sessionToState(s: Session): SessionState {
  return {
    name: s.name,
    notes: s.notes ?? "",
    players: s.players,
    pitchSize: s.pitchSize,
    duration: s.duration != null ? String(s.duration) : "",
    groupSizeOverride: "",
    levelMode: s.sessionExercises.some((se) => se.level != null),
    items: s.sessionExercises.map((se) => ({
      exercise: se.exercise,
      notes: se.notes ?? "",
      duration: se.duration != null ? String(se.duration) : "",
      level: (se.level as PlayerLevel | null) ?? null,
    })),
  };
}

export default function PlannerBoard({
  exercises,
  sessions: initialSessions,
  initialLoad,
  onSessionSaved,
}: PlannerBoardProps) {
  const [session, setSession] = useState<SessionState>(
    initialLoad ? sessionToState(initialLoad) : DEFAULT_SESSION
  );
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    subcategory: "",
    exerciseType: "",
    source: "",
    verified: "",
  });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSessions, setSavedSessions] =
    useState<Session[]>(initialSessions);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredExercises = exercises.filter((ex) =>
    matchesFilters(ex, filters)
  );

  const loadSession = useCallback((s: Session) => {
    setSession(sessionToState(s));
    setExpandedIdx(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const addedIds = new Set(session.items.map((item) => item.exercise.id));

  const addExercise = useCallback((exercise: Exercise) => {
    setSession((prev) => {
      if (prev.items.some((i) => i.exercise.id === exercise.id)) return prev;
      return {
        ...prev,
        items: [...prev.items, { exercise, notes: "", duration: "", level: null }],
      };
    });
  }, []);

  const removeExercise = useCallback((idx: number) => {
    setSession((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
    setExpandedIdx((e) =>
      e === idx ? null : e !== null && e > idx ? e - 1 : e
    );
  }, []);

  const moveExercise = useCallback((from: number, to: number) => {
    setSession((prev) => {
      const items = [...prev.items];
      const [item] = items.splice(from, 1);
      items.splice(to, 0, item);
      return { ...prev, items };
    });
    setExpandedIdx((e) => {
      if (e === from) return to;
      if (e === to) return from;
      return e;
    });
  }, []);

  const updateItem = useCallback(
    (idx: number, patch: Partial<Pick<SessionItem, "notes" | "duration" | "level">>) => {
      setSession((prev) => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === idx ? { ...item, ...patch } : item
        ),
      }));
    },
    []
  );

  // Station group suggestion
  const suggestedGroupSize =
    session.items.length >= 2
      ? Math.round(session.players / session.items.length)
      : null;

  const effectiveGroupSize =
    session.groupSizeOverride !== "" && !isNaN(parseInt(session.groupSizeOverride))
      ? parseInt(session.groupSizeOverride)
      : suggestedGroupSize;

  const totalAllocatedMinutes = session.items.reduce((sum, item) => {
    const d = parseInt(item.duration);
    return sum + (isNaN(d) ? 0 : d);
  }, 0);

  const sessionDurationNum = parseInt(session.duration);
  const durationSet = !isNaN(sessionDurationNum) && sessionDurationNum > 0;

  // Level time breakdown (only meaningful when levelMode + duration set)
  const levelMinutes = (level: PlayerLevel): number =>
    session.items
      .filter((item) => item.level === level)
      .reduce((sum, item) => {
        const d = parseInt(item.duration);
        return sum + (isNaN(d) ? 0 : d);
      }, 0);

  const levelTarget = (level: PlayerLevel): number | null => {
    if (!durationSet) return null;
    const pct = LEVELS.find((l) => l.id === level)!.target;
    return Math.round((sessionDurationNum * pct) / 100);
  };

  // Suggested time per exercise
  const suggestedTimePerExercise =
    durationSet && session.items.length > 0
      ? Math.floor(sessionDurationNum / session.items.length)
      : null;

  const distributeTimeEvenly = () => {
    if (!suggestedTimePerExercise) return;
    setSession((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        duration: item.duration === "" ? String(suggestedTimePerExercise) : item.duration,
      })),
    }));
  };

  const distributeTimeAll = () => {
    if (!suggestedTimePerExercise) return;
    setSession((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        duration: String(suggestedTimePerExercise),
      })),
    }));
  };

  const saveSession = async () => {
    if (!session.name.trim()) {
      setSaveError("Ange ett namn för passet.");
      return;
    }
    if (session.items.length === 0) {
      setSaveError("Lägg till minst en övning.");
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.name,
          notes: session.notes || null,
          players: session.players,
          pitchSize: session.pitchSize,
          duration: durationSet ? sessionDurationNum : null,
          exercises: session.items.map((item) => {
            const d = parseInt(item.duration);
            return {
              id: item.exercise.id,
              notes: item.notes || null,
              duration: isNaN(d) ? null : d,
              level: item.level ?? null,
            };
          }),
        }),
      });
      if (!res.ok) throw new Error("Failed to save session");
      const saved: Session = await res.json();
      onSessionSaved(saved);
      setSavedSessions((prev) => [saved, ...prev]);
      setSession(DEFAULT_SESSION);
      setExpandedIdx(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Kunde inte spara. Försök igen.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSession = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      {showCustomModal && (
        <CustomExerciseModal
          onClose={() => setShowCustomModal(false)}
          onAdd={(ex) => {
            addExercise(ex);
          }}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: Exercise grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink-primary mb-1">
                Övningar
              </h2>
              <p className="text-ink-muted text-sm">
                Välj övningar att bygga ditt pass med.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCustomModal(true)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Egen övning
            </Button>
          </div>

          <ExerciseFilters
            filters={filters}
            onChange={setFilters}
            totalCount={filteredExercises.length}
          />

          {filteredExercises.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-ink-muted text-sm">
                Inga övningar matchar filtren.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onAddToSession={addExercise}
                  isAdded={addedIds.has(ex.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Session builder */}
        <div className="xl:sticky xl:top-20 space-y-4">
          <div className="bg-surface-2 border border-border rounded-xl overflow-hidden xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h2 className="text-base font-bold text-ink-primary mb-3">
                Sessionsbyggaren
              </h2>
              <input
                type="text"
                placeholder="Namn på passet..."
                value={session.name}
                onChange={(e) =>
                  setSession((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {/* Stats bar */}
            <div className="px-4 py-2 border-b border-border flex items-center gap-4 bg-surface-3/40">
              <span className="text-xs text-ink-muted">{session.items.length} övning{session.items.length !== 1 ? "ar" : ""}</span>
              <span className="text-xs text-ink-muted">{session.players} spelare</span>
              {durationSet && <span className="text-xs text-ink-muted">{sessionDurationNum} min</span>}
            </div>

            {/* ── Three suggestion blocks ── */}
            {session.items.length > 0 && (
              <div className="border-b border-accent/40">
                <div className="h-1 bg-accent w-full" />
                <div className="grid grid-cols-3 divide-x divide-accent/30 bg-accent-muted">


                {/* Block 1: Players per group */}
                <div className="p-3 flex flex-col gap-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-accent-fg/70">Spel/grupp</p>
                  {session.items.length >= 2 ? (
                    <>
                      <p className="text-2xl font-bold text-accent-fg leading-none">{effectiveGroupSize}</p>
                      <p className="text-[10px] text-accent-fg/60 leading-tight">
                        {session.players} spel.<br />÷ {session.items.length} stationer
                        {session.groupSizeOverride !== "" && (
                          <button
                            onClick={() => setSession((p) => ({ ...p, groupSizeOverride: "" }))}
                            className="block text-accent-fg mt-0.5 hover:underline"
                          >
                            återställ auto
                          </button>
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-auto pt-1">
                        <button
                          onClick={() => {
                            const cur = effectiveGroupSize ?? 1;
                            if (cur > 1) setSession((p) => ({ ...p, groupSizeOverride: String(cur - 1) }));
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-accent/30 border border-accent/40 text-accent-fg hover:bg-accent/50 transition-colors font-bold text-sm"
                        >−</button>
                        <span className="text-xs font-semibold text-ink-primary w-6 text-center">{effectiveGroupSize}</span>
                        <button
                          onClick={() => {
                            const cur = effectiveGroupSize ?? 1;
                            setSession((p) => ({ ...p, groupSizeOverride: String(cur + 1) }));
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-accent/30 border border-accent/40 text-accent-fg hover:bg-accent/50 transition-colors font-bold text-sm"
                        >+</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-accent-fg/25 leading-none">—</p>
                      <p className="text-[10px] text-accent-fg/50 leading-tight">Lägg till minst<br />2 övningar</p>
                    </>
                  )}
                </div>

                {/* Block 2: Time per exercise */}
                <div className="p-3 flex flex-col gap-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-accent-fg/70">Min/övning</p>
                  {suggestedTimePerExercise !== null ? (
                    <>
                      <p className="text-2xl font-bold text-accent-fg leading-none">~{suggestedTimePerExercise}</p>
                      <p className="text-[10px] text-accent-fg/60 leading-tight">
                        {sessionDurationNum} min<br />÷ {session.items.length} övningar
                      </p>
                      <div className="flex flex-col gap-1 mt-auto pt-1">
                        <button
                          onClick={distributeTimeEvenly}
                          className="w-full py-1 rounded text-[10px] font-medium bg-accent/30 border border-accent/40 text-accent-fg hover:bg-accent/50 transition-colors"
                        >
                          Fyll tomma
                        </button>
                        <button
                          onClick={distributeTimeAll}
                          className="w-full py-1 rounded text-[10px] font-medium bg-accent text-accent-fg hover:bg-accent-light transition-colors"
                        >
                          Fördela jämnt
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-accent-fg/25 leading-none">—</p>
                      <p className="text-[10px] text-accent-fg/50 leading-tight">Ange tränings-<br />tid nedan</p>
                    </>
                  )}
                </div>

                {/* Block 3: Time allocated progress */}
                <div className="p-3 flex flex-col gap-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-accent-fg/70">Fördelat</p>
                  {durationSet ? (
                    <>
                      <p className="text-2xl font-bold text-accent-fg leading-none">{totalAllocatedMinutes}<span className="text-sm font-normal text-accent-fg/60">/{sessionDurationNum}</span></p>
                      <p className="text-[10px] text-accent-fg/60 leading-tight">
                        {totalAllocatedMinutes > 0
                          ? `${sessionDurationNum - totalAllocatedMinutes > 0 ? `${sessionDurationNum - totalAllocatedMinutes} min kvar` : totalAllocatedMinutes > sessionDurationNum ? `${totalAllocatedMinutes - sessionDurationNum} min över` : "Exakt!"}`
                          : "Öppna övningar\nnedan för att sätta tid"}
                      </p>
                      <div className="mt-auto pt-1">
                        <div className="h-2 bg-surface-3 rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full rounded-full transition-all ${
                              totalAllocatedMinutes > sessionDurationNum
                                ? "bg-intensity-medium"
                                : totalAllocatedMinutes === sessionDurationNum
                                ? "bg-emerald-500"
                                : "bg-accent"
                            }`}
                            style={{ width: `${Math.min(100, durationSet ? (totalAllocatedMinutes / sessionDurationNum) * 100 : 0)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                          {durationSet ? Math.round((totalAllocatedMinutes / sessionDurationNum) * 100) : 0}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-accent-fg/25 leading-none">—</p>
                      <p className="text-[10px] text-accent-fg/50 leading-tight">Ange tränings-<br />tid nedan</p>
                    </>
                  )}
                </div>

                </div>
              </div>
            )}

            {/* Exercise queue */}
            <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
              {session.items.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-ink-muted text-xs">
                    Inga övningar ännu. Klicka &quot;Lägg till&quot; på en
                    övning.
                  </p>
                </div>
              ) : (
                session.items.map((item, i) => {
                  const isExpanded = expandedIdx === i;
                  return (
                    <div
                      key={item.exercise.id}
                      className="bg-surface-3 rounded-lg border border-border overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 group">
                        <span className="text-ink-muted text-xs w-4 flex-shrink-0 text-center">
                          {i + 1}
                        </span>
                        <span className="text-ink-secondary text-xs flex-1 min-w-0 truncate">
                          {item.exercise.title}
                        </span>
                        {item.level && session.levelMode && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${LEVELS.find(l => l.id === item.level)?.color}`}>
                            {LEVELS.find(l => l.id === item.level)?.label}
                          </span>
                        )}
                        {item.duration && (
                          <span className="text-xs text-accent-fg bg-accent-muted px-1.5 py-0.5 rounded flex-shrink-0">
                            {item.duration}m
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setExpandedIdx(isExpanded ? null : i)
                            }
                            className={`p-0.5 transition-colors ${
                              isExpanded
                                ? "text-accent"
                                : "text-ink-muted hover:text-ink-primary"
                            }`}
                            title="Justera"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {i > 0 && (
                            <button
                              onClick={() => moveExercise(i, i - 1)}
                              className="p-0.5 text-ink-muted hover:text-ink-primary transition-colors"
                              title="Flytta upp"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                            </button>
                          )}
                          {i < session.items.length - 1 && (
                            <button
                              onClick={() => moveExercise(i, i + 1)}
                              className="p-0.5 text-ink-muted hover:text-ink-primary transition-colors"
                              title="Flytta ner"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => removeExercise(i)}
                            className="p-0.5 text-ink-muted hover:text-intensity-high transition-colors"
                            title="Ta bort"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Expanded: per-exercise adjustments */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-2 border-t border-border space-y-2.5 bg-surface-2/60">
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] uppercase tracking-wider text-ink-muted font-medium">
                                  Tid (min)
                                </label>
                                {suggestedTimePerExercise !== null && item.duration === "" && (
                                  <button
                                    onClick={() => updateItem(i, { duration: String(suggestedTimePerExercise) })}
                                    className="text-[10px] text-accent-fg bg-accent-muted px-1.5 py-0.5 rounded hover:bg-accent/20 transition-colors"
                                  >
                                    förslag: {suggestedTimePerExercise} min →
                                  </button>
                                )}
                              </div>
                              <input
                                type="number"
                                min={1}
                                max={120}
                                placeholder={suggestedTimePerExercise ? `förslag: ${suggestedTimePerExercise}` : "t.ex. 15"}
                                value={item.duration}
                                onChange={(e) =>
                                  updateItem(i, { duration: e.target.value })
                                }
                                className="w-full bg-surface-3 border border-border rounded-lg px-2 py-1.5 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
                              />
                            </div>
                            {totalAllocatedMinutes > 0 && durationSet && (
                              <div className="text-[10px] text-ink-muted pb-2 flex-shrink-0">
                                {totalAllocatedMinutes}/{sessionDurationNum} min
                                fördelat
                              </div>
                            )}
                          </div>
                          {session.levelMode && (
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-ink-muted font-medium mb-1.5">
                                Spelargrupp
                              </label>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateItem(i, { level: null })}
                                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                                    item.level === null
                                      ? "bg-surface-2 border-border-strong text-ink-primary"
                                      : "bg-surface-3 border-border text-ink-muted hover:text-ink-secondary"
                                  }`}
                                >
                                  Alla
                                </button>
                                {LEVELS.map((lv) => (
                                  <button
                                    key={lv.id}
                                    onClick={() => updateItem(i, { level: item.level === lv.id ? null : lv.id })}
                                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                                      item.level === lv.id
                                        ? lv.color
                                        : "bg-surface-3 border-border text-ink-muted hover:text-ink-secondary"
                                    }`}
                                  >
                                    {lv.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-ink-muted font-medium mb-1">
                              Justeringar / anteckningar
                            </label>
                            <textarea
                              placeholder="Egna anpassningar för laget..."
                              value={item.notes}
                              onChange={(e) =>
                                updateItem(i, { notes: e.target.value })
                              }
                              rows={2}
                              className="w-full bg-surface-3 border border-border rounded-lg px-2 py-1.5 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Add custom exercise */}
              <button
                onClick={() => setShowCustomModal(true)}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-ink-muted hover:text-ink-secondary hover:border-border-strong transition-colors text-xs"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Lägg till egen övning
              </button>
            </div>

            {/* Settings */}
            <div className="p-4 border-t border-border space-y-4">
              {/* Players */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-ink-muted uppercase tracking-wider font-medium">
                    Spelare
                  </label>
                  <span className="text-xs font-semibold text-ink-primary bg-surface-3 px-2 py-0.5 rounded">
                    {session.players}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={session.players}
                  onChange={(e) =>
                    setSession((p) => ({
                      ...p,
                      players: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-accent"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-ink-muted">2</span>
                  <span className="text-xs text-ink-muted">40</span>
                </div>
              </div>


              {/* Session duration */}
              <div>
                <label className="text-xs text-ink-muted uppercase tracking-wider font-medium block mb-2">
                  Träningstid
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DURATION_PRESETS.map((min) => (
                    <button
                      key={min}
                      onClick={() =>
                        setSession((p) => ({
                          ...p,
                          duration:
                            p.duration === String(min) ? "" : String(min),
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        session.duration === String(min)
                          ? "bg-accent-muted border-accent/50 text-accent-fg"
                          : "bg-surface-3 border-border text-ink-secondary hover:text-ink-primary hover:border-border-strong"
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={300}
                  placeholder="Annan tid (min)..."
                  value={
                    DURATION_PRESETS.includes(parseInt(session.duration))
                      ? ""
                      : session.duration
                  }
                  onChange={(e) =>
                    setSession((p) => ({ ...p, duration: e.target.value }))
                  }
                  className="w-full bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              {/* Level mode */}
              <div className="bg-surface-3 border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setSession((p) => ({ ...p, levelMode: !p.levelMode }))}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <span className="text-xs font-semibold text-ink-primary">Nivåanpassning</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${session.levelMode ? "bg-accent" : "bg-surface-2 border border-border"}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${session.levelMode ? "left-4" : "left-0.5"}`} />
                  </div>
                </button>

                {session.levelMode && (
                  <div className="border-t border-border p-3 space-y-3">
                    <p className="text-[11px] text-ink-muted leading-relaxed">
                      Tagga varje övning med en spelargrupp. Målfördelning: <span className="text-sky-300 font-medium">Bra 25%</span> · <span className="text-amber-300 font-medium">Bättre 50%</span> · <span className="text-emerald-300 font-medium">Bäst 25%</span>
                    </p>

                    {/* Per-level progress bars */}
                    <div className="space-y-2">
                      {LEVELS.map((lv) => {
                        const mins = levelMinutes(lv.id);
                        const target = levelTarget(lv.id);
                        const pct = target ? Math.min(100, Math.round((mins / target) * 100)) : null;
                        const taggedCount = session.items.filter(item => item.level === lv.id).length;
                        return (
                          <div key={lv.id}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${lv.color}`}>
                                  {lv.label}
                                </span>
                                <span className="text-[10px] text-ink-muted">
                                  {taggedCount} övning{taggedCount !== 1 ? "ar" : ""}
                                  {mins > 0 && ` · ${mins} min`}
                                </span>
                              </div>
                              <span className="text-[10px] text-ink-muted">
                                {target !== null ? (
                                  <span className={mins >= target ? "text-emerald-400" : ""}>
                                    mål: {target} min ({lv.target}%)
                                  </span>
                                ) : `mål: ${lv.target}%`}
                              </span>
                            </div>
                            {target !== null && (
                              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pct! >= 100
                                      ? "bg-emerald-500"
                                      : pct! >= 70
                                      ? "bg-amber-500"
                                      : "bg-surface-4"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!durationSet && (
                      <p className="text-[10px] text-ink-muted italic">
                        Ange träningstid ovan för att se minutmål.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pitch size */}
              <div>
                <label className="text-xs text-ink-muted uppercase tracking-wider font-medium block mb-2">
                  Planstorlek
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PITCH_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSession((p) => ({ ...p, pitchSize: size }))
                      }
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        session.pitchSize === size
                          ? "bg-accent-muted border-accent/50 text-accent-fg"
                          : "bg-surface-3 border-border text-ink-secondary hover:text-ink-primary hover:border-border-strong"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-ink-muted uppercase tracking-wider font-medium block mb-2">
                  Anteckningar
                </label>
                <textarea
                  placeholder="Anteckningar om passet..."
                  value={session.notes}
                  onChange={(e) =>
                    setSession((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={3}
                  className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
                />
              </div>

              {saveError && (
                <p className="text-xs text-intensity-high">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="text-xs text-accent-fg">Passet sparades!</p>
              )}

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={saveSession}
                disabled={isSaving}
              >
                {isSaving ? (
                  "Sparar..."
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Spara pass
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Saved sessions */}
          {savedSessions.length > 0 && (
            <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-ink-primary">
                  Sparade pass
                </h3>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {savedSessions.map((s) => (
                  <div
                    key={s.id}
                    className="px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/sessions/${s.id}`}
                        className="text-sm font-medium text-ink-primary hover:text-accent-fg transition-colors truncate block"
                      >
                        {s.name}
                      </Link>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {s.sessionExercises.length} övning
                        {s.sessionExercises.length !== 1 ? "ar" : ""}
                        {" · "}
                        {s.players} spel.
                        {s.duration ? ` · ${s.duration} min` : ""}
                        {" · "}
                        {s.pitchSize}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => loadSession(s)}
                        className="text-ink-muted hover:text-accent-fg transition-colors p-1"
                        title="Ladda pass"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSession(s.id)}
                        className="flex-shrink-0 text-ink-muted hover:text-intensity-high transition-colors p-1"
                        title="Ta bort"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatChip({
  icon,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${highlight ? "text-accent-fg" : "text-ink-secondary"}`}
    >
      <span className={highlight ? "text-accent" : "text-ink-muted"}>
        {icon}
      </span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
