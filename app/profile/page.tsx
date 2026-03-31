import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const sessions = await db.session.findMany({
    where: { userId: session.user.id },
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  const totalExercises = sessions.reduce((sum, s) => sum + s.sessionExercises.length, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent-muted border-2 border-accent/30 flex items-center justify-center text-xl font-bold text-accent-fg">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-ink-primary">
              {user.name ?? "Okänt namn"}
            </h1>
            <p className="text-sm text-ink-muted mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-surface-3 border border-border rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-ink-primary">{sessions.length}</p>
            <p className="text-xs text-ink-muted mt-0.5">Sparade pass</p>
          </div>
          <div className="bg-surface-3 border border-border rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-ink-primary">{totalExercises}</p>
            <p className="text-xs text-ink-muted mt-0.5">Övningar totalt</p>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink-primary">Mina pass</h2>
        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-xs font-medium hover:bg-accent-light transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nytt pass
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-surface-2 border border-border rounded-2xl py-16 text-center">
          <div className="w-10 h-10 rounded-xl bg-surface-3 border border-border flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-ink-secondary text-sm font-medium">Inga pass sparade</p>
          <p className="text-ink-muted text-xs mt-1">Skapa ditt första pass i Planner.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => {
            const img = s.sessionExercises.find((se) => parseImages(se.exercise.images).length > 0)?.exercise;
            const firstImg = img ? parseImages(img.images)[0] : null;
            const date = new Date(s.createdAt).toLocaleDateString("sv-SE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="flex items-center gap-4 bg-surface-2 border border-border rounded-xl p-4 hover:border-border-strong hover:bg-surface-3 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-3 border border-border flex-shrink-0">
                  {firstImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firstImg.startsWith("http") ? firstImg : `/exercises/${firstImg}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                    {" · "}{date}
                  </p>
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
