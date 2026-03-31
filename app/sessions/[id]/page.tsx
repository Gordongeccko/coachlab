import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function generateSummary(session: {
  name: string;
  players: number;
  pitchSize: string;
  duration: number | null;
  sessionExercises: Array<{
    duration: number | null;
    level: string | null;
    exercise: {
      category: string;
      subcategory: string;
      exerciseType: string;
      vad: string;
    };
  }>;
}): string {
  const exercises = session.sessionExercises;
  if (exercises.length === 0) return "Det här passet har inga övningar ännu.";

  const parts: string[] = [];

  // Intro
  const reducedMins = exercises.reduce((sum, se) => sum + (se.duration ?? 0), 0);
  const totalMins = session.duration ?? (reducedMins > 0 ? reducedMins : null);
  const timeStr = totalMins ? ` under ${totalMins} minuter` : "";
  parts.push(
    `Det här passet innehåller ${exercises.length} övning${exercises.length !== 1 ? "ar" : ""}${timeStr} med ${session.players} spelare på ${session.pitchSize.toLowerCase()}plan.`
  );

  // Categories
  const catCount: Record<string, number> = {};
  for (const se of exercises) {
    const c = se.exercise.category || "Okänd";
    catCount[c] = (catCount[c] ?? 0) + 1;
  }
  const catsSorted = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
  if (catsSorted.length === 1) {
    parts.push(`Träningen fokuserar helt på ${catsSorted[0][0]}.`);
  } else if (catsSorted.length > 1) {
    const catStr = catsSorted
      .map(([c, n]) => `${c} (${n} övning${n !== 1 ? "ar" : ""})`)
      .join(", ");
    parts.push(`Träningen täcker ${catStr}.`);
  }

  // Subcategories
  const subCount: Record<string, number> = {};
  for (const se of exercises) {
    const s = se.exercise.subcategory;
    if (s) subCount[s] = (subCount[s] ?? 0) + 1;
  }
  const topSubs = Object.entries(subCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);
  if (topSubs.length > 0) {
    parts.push(
      `Övningarna fokuserar på: ${topSubs.join(", ")}.`
    );
  }

  // Exercise types
  const typeCount: Record<string, number> = {};
  for (const se of exercises) {
    const t = se.exercise.exerciseType;
    if (t) typeCount[t] = (typeCount[t] ?? 0) + 1;
  }
  const typeParts = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${n} ${t.toLowerCase()}${n !== 1 ? "ar" : ""}`);
  if (typeParts.length > 0) {
    parts.push(`Passet består av ${typeParts.join(", ")}.`);
  }

  // Levels
  const hasLevels = exercises.some((se) => se.level != null);
  if (hasLevels) {
    const levelCount: Record<string, number> = { bra: 0, bättre: 0, bäst: 0 };
    for (const se of exercises) {
      if (se.level) levelCount[se.level] = (levelCount[se.level] ?? 0) + 1;
    }
    const levelParts = Object.entries(levelCount)
      .filter(([, n]) => n > 0)
      .map(([l, n]) => `${n} övning${n !== 1 ? "ar" : ""} för nivå ${l}`);
    if (levelParts.length > 0) {
      parts.push(`Nivåanpassning: ${levelParts.join(", ")}.`);
    }
  }

  return parts.join(" ");
}

const CATEGORY_COLORS: Record<string, string> = {
  anfallsspel: "#F97316",
  försvarsspel: "#8B5CF6",
  fotbollsfys: "#3B82F6",
  "fotbollsuppvärmning": "#EAB308",
};

function getCategoryColor(category: string): string {
  const lower = (category ?? "").toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "#1C7C54";
}

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await db.session.findUnique({
    where: { id: params.id },
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!session) notFound();

  const count = session.sessionExercises.length;
  const summary = generateSummary(session);

  // Planner-style stats
  const suggestedGroupSize = count >= 2 ? Math.round(session.players / count) : null;
  const suggestedTimePerExercise =
    session.duration && count > 0 ? Math.floor(session.duration / count) : null;
  const totalAllocated = session.sessionExercises.reduce(
    (sum, se) => sum + (se.duration ?? 0),
    0
  );
  const hasLevels = session.sessionExercises.some((se) => se.level != null);
  const LEVEL_TARGETS: Record<string, number> = { bra: 25, bättre: 50, bäst: 25 };
  const LEVEL_COLORS: Record<string, string> = {
    bra: "bg-sky-500",
    bättre: "bg-amber-500",
    bäst: "bg-emerald-500",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back + Edit */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-secondary transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Alla pass
        </Link>
        <Link
          href={`/planner?load=${session.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Redigera i Planner
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-primary mb-3">{session.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {session.players} spelare
          </Badge>
          {session.duration && (
            <Badge variant="neutral">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {session.duration} min
            </Badge>
          )}
          <Badge variant="neutral">{session.pitchSize}</Badge>
          <Badge variant="neutral">{count} övningar</Badge>
        </div>
      </div>

      <div className="h-px bg-border mb-6" />

      {/* Stats blocks */}
      {(suggestedGroupSize || suggestedTimePerExercise) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {suggestedGroupSize && (
            <div className="bg-accent-muted border-t-2 border-accent rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-fg mb-1">
                Spel / grupp
              </p>
              <p className="text-2xl font-bold text-ink-primary">{suggestedGroupSize}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {session.players} spel. ÷ {count} stationer
              </p>
            </div>
          )}
          {suggestedTimePerExercise && (
            <div className="bg-accent-muted border-t-2 border-accent rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-fg mb-1">
                Min / övning
              </p>
              <p className="text-2xl font-bold text-ink-primary">{suggestedTimePerExercise} min</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {session.duration} min ÷ {count} övningar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Time allocated progress */}
      {session.duration && totalAllocated > 0 && (
        <div className="bg-accent-muted border-t-2 border-accent rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-fg">
              Fördelat
            </p>
            <p className="text-xs text-ink-muted">
              {totalAllocated} / {session.duration} min
            </p>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((totalAllocated / session.duration) * 100))}%`,
                backgroundColor: totalAllocated > session.duration ? "#EF4444" : "#22A06B",
              }}
            />
          </div>
        </div>
      )}

      {/* Level breakdown */}
      {hasLevels && session.duration && (
        <div className="bg-accent-muted border-t-2 border-accent rounded-xl p-4 mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-fg mb-3">
            Nivåfördelning
          </p>
          <div className="space-y-2">
            {(["bra", "bättre", "bäst"] as const).map((lvl) => {
              const mins = session.sessionExercises
                .filter((se) => se.level === lvl)
                .reduce((sum, se) => sum + (se.duration ?? 0), 0);
              const target = Math.round((session.duration! * LEVEL_TARGETS[lvl]) / 100);
              const pct = target > 0 ? Math.min(100, Math.round((mins / target) * 100)) : 0;
              return (
                <div key={lvl}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink-secondary capitalize">{lvl}</span>
                    <span className="text-xs text-ink-muted">{mins} / {target} min (mål {LEVEL_TARGETS[lvl]}%)</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${LEVEL_COLORS[lvl]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surface-2 border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Sammanfattning
          </span>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">{summary}</p>
        {session.notes && (
          <p className="text-sm text-ink-muted mt-2 pt-2 border-t border-border italic">
            {session.notes}
          </p>
        )}
      </div>

      {/* Exercise list */}
      <h2 className="text-lg font-semibold text-ink-primary mb-4">Övningar</h2>
      <div className="space-y-3">
        {session.sessionExercises.map((se, i) => {
          const images = parseImages(se.exercise.images);
          const firstImg = images[0] ?? null;
          const color = getCategoryColor(se.exercise.category);
          const suggestedMin = suggestedTimePerExercise;
          const actualMin = se.duration;
          return (
            <Link
              key={se.id}
              href={`/library/${se.exercise.id}?from=${session.id}`}
              className="block bg-surface-2 border border-border rounded-xl overflow-hidden hover:border-border-strong hover:bg-surface-3 transition-colors group"
            >
              <div className="h-1" style={{ backgroundColor: color }} />
              <div className="p-4 flex gap-4 items-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-3 border border-border flex items-center justify-center text-xs font-bold text-ink-muted">
                  {i + 1}
                </div>

                {firstImg && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-3 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={firstImg.startsWith("http") ? firstImg : `/exercises/${firstImg}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {se.exercise.category && <Badge variant="category">{se.exercise.category}</Badge>}
                    {se.exercise.exerciseType && <Badge variant="neutral">{se.exercise.exerciseType}</Badge>}
                    {se.level && <Badge variant="neutral">Nivå: {se.level}</Badge>}
                    {actualMin ? (
                      <Badge variant="neutral">{actualMin} min</Badge>
                    ) : suggestedMin ? (
                      <Badge variant="neutral">~{suggestedMin} min</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-ink-primary group-hover:text-accent-fg transition-colors">
                    {se.exercise.title}
                  </p>
                  {se.exercise.subcategory && (
                    <p className="text-xs text-ink-muted mt-0.5">{se.exercise.subcategory}</p>
                  )}
                  {se.exercise.varfor && (
                    <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
                      {se.exercise.varfor}
                    </p>
                  )}
                  {se.notes && (
                    <p className="text-xs text-accent-fg mt-1.5 italic">
                      Anteckning: {se.notes}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 self-center text-ink-muted group-hover:text-ink-secondary transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
