export type DayOfWeek = 'Lunes' | 'Miércoles' | 'Viernes' | 'Otro';

export interface WarmupExercise {
  id: string;
  name: string;
  repsOrDuration: string;
  durationSeconds?: number;
  sets?: number;
  repsCount?: number;
  notes: string;
  category: 'cardio' | 'mobility' | 'core';
}

export interface WorkoutExerciseDef {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  minReps: number;
  maxReps: number;
  restSeconds: number;
  notes: string;
  focus: 'Fuerza' | 'Hipertrofia' | 'Core' | 'Fuerza / Hipertrofia';
  equipment: string;
  muscleGroup: string;
  isTimed?: boolean;
}

export interface StretchExercise {
  id: string;
  area: string;
  name: string;
  duration: string;
  durationSeconds: number;
  isBilateral: boolean;
  notes: string;
}

export interface ExerciseSetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  rpe?: number; // 1-10 rate of perceived exertion
  notes?: string;
  completedAt?: string;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSetLog[];
  completed: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: DayOfWeek;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  durationMinutes: number;
  completed: boolean;
  warmupCompleted: boolean;
  stretchesCompleted: boolean;
  exercises: ExerciseSessionLog[];
  generalNotes?: string;
  perceivedEffort?: number; // 1 to 5 stars or 1 to 10
  totalVolumeKg: number;
  totalSets: number;
}

export interface BodyMeasurement {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  weightKg?: number; // Peso corporal en kg
  chestCm?: number;  // Pecho / Contorno pectoral en cm
  bicepsCm?: number; // Bíceps / Brazo en cm
  abdomenCm?: number;// Abdomen / Cintura en cm
  notes?: string;
  createdAt?: string; // ISO timestamp
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  estimated1RMKg: number;
  maxRepsAtMaxWeight: number;
  bestVolumeInOneSetKg: number;
  dateAchieved: string;
}

export interface WorkoutBackupFile {
  version: string;
  appName: string;
  exportDate: string;
  totalWorkouts: number;
  totalMeasurements?: number;
  sessions: WorkoutSession[];
  bodyMeasurements?: BodyMeasurement[];
  userPreferences?: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    defaultRestSeconds: number;
    userName?: string;
  };
}

export type ActiveTab = 'today' | 'active' | 'history' | 'progression' | 'measurements' | 'plan' | 'backup';
