export interface Exercise {
  id: string;
  title: string;
  vad: string;
  varfor: string;
  hur: string;
  organisation: string;
  anvisningar: string;
  images: string[];
  videoUrl: string | null;
  source: string;
  verified: boolean;
  category: string;
  subcategory: string;
  exerciseType: string;
  createdAt: string;
}

export interface SessionExercise {
  id: string;
  order: number;
  notes: string | null;
  duration: number | null;
  level: string | null;
  exerciseId: string;
  sessionId: string;
  exercise: Exercise;
}

export interface Session {
  id: string;
  name: string;
  notes: string | null;
  players: number;
  pitchSize: string;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  sessionExercises: SessionExercise[];
}
