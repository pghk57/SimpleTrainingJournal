
export interface Exercise {
  id: string;
  name: string;
  reps: number;
  sets: number;
  targetMuscles: string[];
  repsPerSet?: number[]; // Optional array to store individual reps for each set
}

export interface MasterExercise {
  id: string;
  name: string;
  defaultMuscles: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  exercises: Exercise[];
  notes?: string;
}

export interface MuscleStat {
  name: string;
  value: number;
}

export interface TrainingStats {
  totalReps: number;
  totalSets: number;
  totalWorkouts: number;
  muscleDistribution: MuscleStat[];
}
