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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await db.session.findUnique({
    where: { id: params.id },
    include: {
      sessionExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.session.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
