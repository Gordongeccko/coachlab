import Link from "next/link";
import { db } from "@/lib/db";

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export default async function SessionsPage() {
  const sessions = await db.session.findMany({
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink-primary mb-2">Sparade pass</h1>
          <p className="text-ink-secondary text-sm">
            {sessions.length} {sessions.length === 1 ? "pass sparat" : "pass sparade"}
          </p>
        </div>
        <Link
          href="/planner"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nytt pass
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-ink-secondary text-sm font-medium mb-1">Inga pass sparade ännu</p>
          <p className="text-ink-muted text-xs">Gå till Planner för att skapa ditt första pass.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const catSet = new Set(s.sessionExercises.map((se) => se.exercise.category).filter(Boolean));
            const cats = Array.from(catSet);
            const img = s.sessionExercises.find((se) => parseImages(se.exercise.images).length > 0)
              ?.exercise;
            const firstImg = img ? parseImages(img.images)[0] : null;
            return (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="flex items-center gap-4 bg-surface-2 border border-border rounded-xl p-4 hover:border-border-strong hover:bg-surface-3 transition-colors group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-3 border border-border flex-shrink-0">
                  {firstImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firstImg.startsWith("http") ? firstImg : `/exercises/${firstImg}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-primary group-hover:text-accent-fg transition-colors truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {s.sessionExercises.length} övningar
                    {s.duration ? ` · ${s.duration} min` : ""}
                    {" · "}{s.players} spelare
                    {" · "}{s.pitchSize}
                  </p>
                  {cats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cats.map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-4 border border-border text-ink-muted">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-ink-muted group-hover:text-ink-secondary transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
