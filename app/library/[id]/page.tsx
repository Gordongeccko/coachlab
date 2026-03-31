import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import ExerciseDetail from "@/components/ExerciseDetail";
import { Exercise } from "@/lib/types";

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const raw = await db.exercise.findUnique({ where: { id: params.id } });

  if (!raw) {
    notFound();
  }

  const exercise: Exercise = {
    id: raw.id,
    title: raw.title,
    vad: raw.vad,
    varfor: raw.varfor,
    hur: raw.hur,
    organisation: raw.organisation,
    anvisningar: raw.anvisningar,
    images: parseImages(raw.images),
    videoUrl: raw.videoUrl,
    source: raw.source,
    verified: raw.verified,
    category: raw.category,
    subcategory: raw.subcategory,
    exerciseType: raw.exerciseType,
    createdAt: raw.createdAt.toISOString(),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={searchParams.from ? `/sessions/${searchParams.from}` : "/library"}
          className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {searchParams.from ? "Tillbaka till pass" : "Tillbaka till bibliotek"}
        </Link>
      </div>

      <ExerciseDetail exercise={exercise} />
    </div>
  );
}
