import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

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

async function getOwnedSession(id: string, userId: string) {
  const session = await db.session.findUnique({
    where: { id },
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!session) return { session: null, error: "Not found", status: 404 };
  if (session.userId !== userId) return { session: null, error: "Forbidden", status: 403 };
  return { session, error: null, status: 200 };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session, error, status } = await getOwnedSession(params.id, authSession.user.id);
  if (!session) return NextResponse.json({ error }, { status });

  return NextResponse.json({
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
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session: existing, error, status } = await getOwnedSession(params.id, authSession.user.id);
  if (!existing) return NextResponse.json({ error }, { status });

  const body = await request.json();

  const exerciseItems: Array<{ id: string; notes?: string | null; duration?: number | null; level?: string | null }> =
    body.exercises ??
    ((body.exerciseIds as string[]) ?? []).map((id: string) => ({ id }));

  // Replace all session exercises atomically
  const updated = await db.session.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      notes: body.notes ?? existing.notes,
      players: body.players ?? existing.players,
      pitchSize: body.pitchSize ?? existing.pitchSize,
      duration: body.duration ?? existing.duration,
      sessionExercises: {
        deleteMany: {},
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

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    sessionExercises: updated.sessionExercises.map((se) => ({
      ...se,
      exercise: {
        ...se.exercise,
        images: parseImages(se.exercise.images),
        createdAt: se.exercise.createdAt.toISOString(),
      },
    })),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session, error, status } = await getOwnedSession(params.id, authSession.user.id);
  if (!session) return NextResponse.json({ error }, { status });

  await db.session.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
