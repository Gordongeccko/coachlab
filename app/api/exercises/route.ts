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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const exerciseType = searchParams.get("exerciseType");
  const source = searchParams.get("source");
  const verified = searchParams.get("verified");
  const search = searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { vad: { contains: search } },
      { varfor: { contains: search } },
      { hur: { contains: search } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (subcategory) {
    where.subcategory = subcategory;
  }

  if (exerciseType) {
    where.exerciseType = exerciseType;
  }

  if (source) {
    where.source = source;
  }

  if (verified !== null && verified !== "") {
    where.verified = verified === "true";
  }

  const exercises = await db.exercise.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const parsed = exercises.map((ex) => ({
    ...ex,
    images: parseImages(ex.images),
    createdAt: ex.createdAt.toISOString(),
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const exercise = await db.exercise.create({
    data: {
      title: body.title ?? "",
      vad: body.vad ?? "",
      varfor: body.varfor ?? "",
      hur: body.hur ?? "",
      organisation: body.organisation ?? "",
      anvisningar: body.anvisningar ?? "",
      images: body.images ?? [],
      videoUrl: body.videoUrl ?? null,
      source: body.source ?? "SVFF",
      verified: body.verified ?? true,
      category: body.category ?? "",
      subcategory: body.subcategory ?? "",
      exerciseType: body.exerciseType ?? "",
    },
  });

  return NextResponse.json({
    ...exercise,
    images: parseImages(exercise.images),
    createdAt: exercise.createdAt.toISOString(),
  });
}
