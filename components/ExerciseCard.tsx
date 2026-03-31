"use client";

import Link from "next/link";
import clsx from "clsx";
import { Exercise } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToSession?: (exercise: Exercise) => void;
  isAdded?: boolean;
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

export default function ExerciseCard({
  exercise,
  onAddToSession,
  isAdded = false,
}: ExerciseCardProps) {
  const categoryColor = getCategoryColor(exercise.category);
  const categoryLabel = exercise.category || exercise.subcategory || "Övrigt";

  return (
    <div className="relative rounded-xl border border-border bg-surface-2 flex flex-col overflow-hidden hover:border-border-strong transition-colors group">
      <div className="h-1 flex-shrink-0" style={{ backgroundColor: categoryColor }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="category">{categoryLabel}</Badge>
          {exercise.exerciseType && (
            <Badge variant="neutral">{exercise.exerciseType}</Badge>
          )}
          {exercise.source && exercise.source !== "" && (
            <Badge variant="source">{exercise.source}</Badge>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <h3 className="text-ink-primary font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
            {exercise.title}
          </h3>
          <p className="text-ink-muted text-xs leading-relaxed line-clamp-2">
            {exercise.varfor || exercise.vad}
          </p>
        </div>

        <div
          className={clsx(
            "flex items-center gap-2 pt-3 border-t border-border",
            onAddToSession ? "justify-between" : "justify-end"
          )}
        >
          <Link
            href={`/library/${exercise.id}`}
            className="text-xs text-ink-muted hover:text-ink-secondary transition-colors"
          >
            View details
          </Link>

          {onAddToSession && (
            <Button
              variant={isAdded ? "secondary" : "primary"}
              size="sm"
              onClick={() => onAddToSession(exercise)}
              disabled={isAdded}
            >
              {isAdded ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add to Session
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
