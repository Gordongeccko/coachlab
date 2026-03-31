import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-accent-muted border border-accent/30 flex items-center justify-center">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22A06B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 6.9 17.1M12 2a10 10 0 0 0-6.9 17.1" />
              <path d="M2.5 9h5.5l3-3 3 3h5.5" />
              <path d="M2.5 15h5.5l3 3 3-3h5.5" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
          </div>
        </div>

        <h1 className="text-6xl font-extrabold text-ink-primary mb-4 tracking-tight">
          CoachLab
        </h1>
        <p className="text-xl text-ink-secondary mb-12 leading-relaxed">
          Train smarter. Coach better.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/library"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-accent-fg font-semibold text-base hover:bg-accent-light transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Browse Exercises
          </Link>
          <Link
            href="/planner"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-surface-3 text-ink-primary font-semibold text-base border border-border hover:bg-surface-4 hover:border-border-strong transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Session Planner
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-surface-2 border border-border rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22A06B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-ink-primary font-semibold text-sm mb-1">Exercise Library</h3>
            <p className="text-ink-muted text-xs leading-relaxed">Browse and search SVFF and UEFA coaching exercises with filters.</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22A06B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="text-ink-primary font-semibold text-sm mb-1">Session Planner</h3>
            <p className="text-ink-muted text-xs leading-relaxed">Build and save training sessions by assembling exercises in order.</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22A06B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 className="text-ink-primary font-semibold text-sm mb-1">Verified Content</h3>
            <p className="text-ink-muted text-xs leading-relaxed">All exercises verified by certified coaches from official sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
