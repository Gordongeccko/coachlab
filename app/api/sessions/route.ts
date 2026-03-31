import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

function serializeSession(session: {
  id: string;
  name: string;
  notes: string | null;
  players: number;
  pitchSize: string;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
  sessionExercises: Array<{
    id: string;
    order: number;
    notes: string | null;
    duration: number | null;
    level: string | null;
    exerciseId: string;
    sessionId: string;
    exercise: {
      id: string;
      title: string;
      vad: string;
      varfor: string;
      hur: string;
      organisation: string;
      anvisningar: string;
      images: unknown;
      videoUrl: string | null;
      source: string;
      verified: boolean;
      createdAt: Date;
    };
  }>;
}) {
  return {
    ...session,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    sessionExercises: session.sessionExercises.map((se) => ({
      ...se,
      exercise: {
        ...se.exercise,
        images: parseImages(se.exercise.images),
        createdAt: se.exercise.createdAt.toISOString(),
      },
    })),
  };
}

export async function GET() {
  const sessions = await db.session.findMany({
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions.map(serializeSession));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Support both old format (exerciseIds[]) and new format (exercises[{id, notes, duration, level}])
  const exerciseItems: Array<{ id: string; notes?: string | null; duration?: number | null; level?: string | null }> =
    body.exercises ??
    ((body.exerciseIds as string[]) ?? []).map((id: string) => ({ id }));

  const session = await db.session.create({
    data: {
      name: body.name ?? "Untitled Session",
      notes: body.notes ?? null,
      players: body.players ?? 10,
      pitchSize: body.pitchSize ?? "Full",
      duration: body.duration ?? null,
      sessionExercises: {
        create: exerciseItems.map((item, i) => ({
          exerciseId: item.id,
          order: i,
          notes: item.notes ?? null,
          duration: item.duration ?? null,
          level: item.level ?? null,
        })),
      },
    },
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(serializeSession(session));
}
