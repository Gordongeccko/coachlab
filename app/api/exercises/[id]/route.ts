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
  const exercise = await db.exercise.findUnique({
    where: { id: params.id },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...exercise,
    images: parseImages(exercise.images),
    createdAt: exercise.createdAt.toISOString(),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const exercise = await db.exercise.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.vad !== undefined && { vad: body.vad }),
      ...(body.varfor !== undefined && { varfor: body.varfor }),
      ...(body.hur !== undefined && { hur: body.hur }),
      ...(body.organisation !== undefined && { organisation: body.organisation }),
      ...(body.anvisningar !== undefined && { anvisningar: body.anvisningar }),
      ...(body.images !== undefined && { images: body.images }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.verified !== undefined && { verified: body.verified }),
    },
  });

  return NextResponse.json({
    ...exercise,
    images: parseImages(exercise.images),
    createdAt: exercise.createdAt.toISOString(),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.exercise.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
