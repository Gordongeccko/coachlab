"use client";

import { useState, useEffect, useCallback } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseFilters from "@/components/ExerciseFilters";
import { Exercise } from "@/lib/types";

interface Filters {
  search: string;
  category: string;
  subcategory: string;
  exerciseType: string;
  source: string;
  verified: string;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "",
  subcategory: "",
  exerciseType: "",
  source: "",
  verified: "",
};

export default function LibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const fetchExercises = useCallback(async (f: Filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.search) params.set("search", f.search);
    if (f.category) params.set("category", f.category);
    if (f.subcategory) params.set("subcategory", f.subcategory);
    if (f.exerciseType) params.set("exerciseType", f.exerciseType);
    if (f.source) params.set("source", f.source);
    if (f.verified) params.set("verified", f.verified);

    try {
      const res = await fetch(`/api/exercises?${params.toString()}`);
      const data = await res.json();
      setExercises(data);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, fetchExercises]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-primary mb-2">
          Exercise Library
        </h1>
        <p className="text-ink-secondary text-sm">
          Browse SVFF and UEFA coaching exercises. Filter by category, format, or source.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24 bg-surface-2 border border-border rounded-xl p-5">
          <ExerciseFilters
            filters={filters}
            onChange={setFilters}
            totalCount={loading ? undefined : exercises.length}
          />
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-xl bg-surface-2 border border-border animate-pulse"
                />
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="py-24 text-center">
              <svg
                className="mx-auto mb-4 text-ink-muted"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <p className="text-ink-secondary text-sm font-medium mb-1">
                No exercises found
              </p>
              <p className="text-ink-muted text-xs">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
