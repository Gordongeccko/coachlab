import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

// Supports local dev.db or Turso via env vars
const url =
  process.env.TURSO_DATABASE_URL ??
  `file:${resolve(process.cwd(), "dev.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSQL({ url, authToken });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any);

interface RawExercise {
  title: string;
  vad: string;
  varfor: string;
  hur: string;
  organisation: string;
  anvisningar: string;
  image_url: string | null;
  images: string[];
  video_url: string | null;
  source: string;
  verified: boolean;
  category: string;
  subcategory: string;
  exercise_type: string;
}

async function main() {
  const exercisesDir = resolve(process.cwd(), "public/exercises");

  const folders = readdirSync(exercisesDir).filter((name) => {
    const fullPath = join(exercisesDir, name);
    return statSync(fullPath).isDirectory();
  });

  console.log(`Found ${folders.length} exercise folders. Starting import...`);
  await db.sessionExercise.deleteMany();
  await db.exercise.deleteMany();

  let inserted = 0;
  let failed = 0;

  for (const folder of folders) {
    const dataPath = join(exercisesDir, folder, "data.json");
    let ex: RawExercise;
    try {
      ex = JSON.parse(readFileSync(dataPath, "utf-8")) as RawExercise;
    } catch {
      console.error(`Could not read ${dataPath}`);
      failed++;
      continue;
    }

    // Use external image_url if available (works without hosting local files),
    // otherwise fall back to local path prefix for dev.
    const images: string[] = ex.image_url
      ? [ex.image_url]
      : (ex.images ?? []).map((img) =>
          img.startsWith("http") ? img : `${folder}/${img}`
        );

    try {
      await db.exercise.create({
        data: {
          title:        ex.title        ?? "",
          vad:          ex.vad          ?? "",
          varfor:       ex.varfor       ?? "",
          hur:          ex.hur          ?? "",
          organisation: ex.organisation ?? "",
          anvisningar:  ex.anvisningar  ?? "",
          images,
          videoUrl:     ex.video_url    ?? null,
          source:       ex.source       ?? "SVFF",
          verified:     ex.verified     ?? true,
          category:     ex.category     ?? "",
          subcategory:  ex.subcategory  ?? "",
          exerciseType: ex.exercise_type ?? "",
        },
      });
      inserted++;
      if (inserted % 100 === 0) console.log(`  ${inserted} / ${folders.length}`);
    } catch (err) {
      failed++;
      console.error(`Failed: "${ex.title}"`, err);
    }
  }
  console.log(`Done. ${inserted} inserted, ${failed} failed.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => db.$disconnect());
