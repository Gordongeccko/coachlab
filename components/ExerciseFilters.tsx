"use client";

import clsx from "clsx";

const CATEGORIES = [
  "Anfallsspel",
  "Försvarsspel",
  "Fotbollsfys",
  "Fotbollsuppvärmning – förberedelseträning",
];

const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  Anfallsspel: ["Speluppbyggnad", "Komma till avslut och göra mål", "Kontring"],
  Försvarsspel: ["Återerövring av bollen", "Förhindra speluppbyggnad", "Förhindra och rädda avslut"],
  Fotbollsfys: [
    "Explosiv träning",
    "Fotbollskoordination",
    "Fotbollsrörlighet",
    "Fotbollsstyrka",
    "Förbättra och behålla återhämtningsförmågan mellan fotbollsaktioner",
    "Lek",
  ],
  "Fotbollsuppvärmning – förberedelseträning": [
    "Aktivering",
    "Fotarbete",
    "Fotbollsrörlighet",
    "Hoppa-landa-löp",
    "Löpteknik",
  ],
};

const EXERCISE_TYPES = ["Spelövning", "Färdighetsövning", "Fysövning"];

interface Filters {
  search: string;
  category: string;
  subcategory: string;
  exerciseType: string;
  source: string;
  verified: string;
}

interface ExerciseFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalCount?: number;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
        active
          ? "bg-accent-muted border-accent/50 text-accent-fg"
          : "bg-surface-3 border-border text-ink-secondary hover:text-ink-primary hover:border-border-strong"
      )}
    >
      {label}
    </button>
  );
}

export default function ExerciseFilters({
  filters,
  onChange,
  totalCount,
}: ExerciseFiltersProps) {
  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const toggle = (key: keyof Filters, value: string) =>
    set(key, filters[key] === value ? "" : value);

  const selectCategory = (cat: string) => {
    const next = filters.category === cat ? "" : cat;
    // Clear subcategory if it doesn't belong to the new category
    const validSubs = next ? SUBCATEGORIES_BY_CATEGORY[next] ?? [] : [];
    const subcategory = validSubs.includes(filters.subcategory) ? filters.subcategory : "";
    onChange({ ...filters, category: next, subcategory });
  };

  const subcategories = filters.category ? SUBCATEGORIES_BY_CATEGORY[filters.category] ?? [] : [];
  const hasActiveFilter = !!(filters.search || filters.category || filters.subcategory || filters.exerciseType || filters.source || filters.verified);

  return (
    <div className="space-y-6">
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Sök övningar..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        {totalCount !== undefined && (
          <p className="mt-2 text-xs text-ink-muted">{totalCount} övningar hittade</p>
        )}
      </div>

      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-2.5">
          Kategori
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={filters.category === cat}
              onClick={() => selectCategory(cat)}
            />
          ))}
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-2.5">
            Underkategori
          </p>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Chip
                key={sub}
                label={sub}
                active={filters.subcategory === sub}
                onClick={() => toggle("subcategory", sub)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-2.5">
          Övningstyp
        </p>
        <div className="flex flex-wrap gap-2">
          {EXERCISE_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              active={filters.exerciseType === type}
              onClick={() => toggle("exerciseType", type)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-2.5">
          Källa
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="SVFF"
            active={filters.source === "SVFF"}
            onClick={() => toggle("source", "SVFF")}
          />
          <Chip
            label="UEFA"
            active={filters.source === "UEFA"}
            onClick={() => toggle("source", "UEFA")}
          />
        </div>
      </div>

      {hasActiveFilter && (
        <button
          onClick={() =>
            onChange({ search: "", category: "", subcategory: "", exerciseType: "", source: "", verified: "" })
          }
          className="text-xs text-ink-muted hover:text-intensity-high transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Rensa filter
        </button>
      )}
    </div>
  );
}
