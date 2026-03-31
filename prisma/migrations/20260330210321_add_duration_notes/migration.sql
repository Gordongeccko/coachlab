-- CreateTable
CREATE TABLE "Exercise" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "players" INTEGER NOT NULL DEFAULT 10,
    "pitchSize" TEXT NOT NULL DEFAULT 'Full',
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "duration" INTEGER,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
