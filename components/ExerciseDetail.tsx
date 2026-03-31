"use client";

import { useState } from "react";
import { Exercise } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import VideoPlayer from "@/components/VideoPlayer";
import clsx from "clsx";

interface ExerciseDetailProps {
  exercise: Exercise;
}

// Normalize exercise text that may lack newlines between list items / sections.
function formatText(raw: string): string {
  if (!raw?.trim()) return raw;
  return raw
    // Insert newline before numbered items like 1) 2) 3)
    // but NOT when preceded by ( — those are inline references like (1)
    .replace(/([^(\n])(\d+\))/g, "$1\n$2")
    // Insert blank line before "Progression" keywords not already on new line
    .replace(/([^\n])(Progression)/g, "$1\n\n$2")
    // Insert newline between "Progression" and the next word when directly concatenated
    .replace(/(Progression)([A-ZÅÄÖ])/g, "$1\n$2")
    // Insert newline after "Progression N:" or "Progression N " when title runs into content
    .replace(/(Progression\s*\d*\s*:?\s*)([A-ZÅÄÖ][a-zåäö]+)([A-ZÅÄÖ])/g, "$1$2\n$3")
    // Collapse 3+ consecutive newlines down to 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface SectionProps {
  icon: React.ReactNode;
  label: string;
  content: string;
}

function Section({ icon, label, content }: SectionProps) {
  if (!content || content.trim() === "") return null;
  const formatted = formatText(content);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-accent-light">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </span>
      </div>
      <p className="text-ink-secondary text-sm leading-relaxed whitespace-pre-line pl-6">
        {formatted}
      </p>
    </div>
  );
}

export default function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const hasImages = exercise.images && exercise.images.length > 0;
  const hasVideo = !!exercise.videoUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Left: Media */}
      <div className="space-y-4">
        {hasImages ? (
          <>
            <div className="bg-surface-3 rounded-xl border border-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  exercise.images[activeImage].startsWith("http")
                    ? exercise.images[activeImage]
                    : `/exercises/${exercise.images[activeImage]}`
                }
                alt={exercise.title}
                className="w-full h-auto block"
              />
            </div>

            {exercise.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {exercise.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={clsx(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                      activeImage === i
                        ? "border-accent"
                        : "border-border hover:border-border-strong"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        img.startsWith("http")
                          ? img
                          : `/exercises/${img}`
                      }
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : !hasVideo ? (
          <div className="aspect-video bg-surface-3 rounded-xl border border-border flex items-center justify-center" style={{minHeight: "22rem"}}>
            <div className="text-center">
              <svg
                className="mx-auto mb-2 text-ink-muted"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-ink-muted text-xs">No images available</p>
            </div>
          </div>
        ) : null}

        {hasVideo && <VideoPlayer url={exercise.videoUrl!} />}
      </div>

      {/* Right: Details */}
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {exercise.category && <Badge variant="category">{exercise.category}</Badge>}
            {exercise.subcategory && <Badge variant="neutral">{exercise.subcategory}</Badge>}
            {exercise.exerciseType && <Badge variant="neutral">{exercise.exerciseType}</Badge>}
            <Badge variant="source">{exercise.source}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-ink-primary leading-tight">
            {exercise.title}
          </h1>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-5">
          <Section
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
            label="Vad"
            content={exercise.vad}
          />

          <Section
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            label="Varfor"
            content={exercise.varfor}
          />

          <Section
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            }
            label="Hur"
            content={exercise.hur}
          />

          <Section
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            label="Organisation"
            content={exercise.organisation}
          />

          <Section
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            }
            label="Anvisningar"
            content={exercise.anvisningar}
          />
        </div>
      </div>
    </div>
  );
}
