-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "vad" TEXT NOT NULL,
    "varfor" TEXT NOT NULL,
    "hur" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "anvisningar" TEXT NOT NULL,
    "images" JSONB NOT NULL DEFAULT [],
    "videoUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SVFF',
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL DEFAULT '',
    "subcategory" TEXT NOT NULL DEFAULT '',
    "exerciseType" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Exercise" ("anvisningar", "createdAt", "hur", "id", "images", "organisation", "source", "title", "vad", "varfor", "verified", "videoUrl") SELECT "anvisningar", "createdAt", "hur", "id", "images", "organisation", "source", "title", "vad", "varfor", "verified", "videoUrl" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
