import { WorkoutSession, WorkoutBackupFile, PersonalRecord, DayOfWeek, BodyMeasurement } from '../types';
import { WORKOUT_EXERCISES } from '../data/workoutPlan';

const STORAGE_KEY = 'fullbody_pro_workouts_v1';
const PREFS_KEY = 'fullbody_pro_user_prefs_v1';
const MEASUREMENTS_STORAGE_KEY = 'fullbody_pro_measurements_v1';

export interface UserPrefs {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultRestSeconds: number;
  userName: string;
}

export const DEFAULT_PREFS: UserPrefs = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultRestSeconds: 90,
  userName: 'Atleta'
};

export function loadStoredSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialSeedSessions();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getInitialSeedSessions();
  } catch (err) {
    console.error('Error loading sessions from storage:', err);
    return getInitialSeedSessions();
  }
}

export function saveStoredSessions(sessions: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
}

export function loadStoredMeasurements(): BodyMeasurement[] {
  try {
    const raw = localStorage.getItem(MEASUREMENTS_STORAGE_KEY);
    if (!raw) return getInitialSeedMeasurements();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getInitialSeedMeasurements();
  } catch (err) {
    console.error('Error loading measurements from storage:', err);
    return getInitialSeedMeasurements();
  }
}

export function saveStoredMeasurements(measurements: BodyMeasurement[]): void {
  try {
    localStorage.setItem(MEASUREMENTS_STORAGE_KEY, JSON.stringify(measurements));
  } catch (err) {
    console.error('Error saving measurements:', err);
  }
}

export function loadUserPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveUserPrefs(prefs: UserPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Error saving user prefs:', err);
  }
}

/**
 * Calculate 1RM (1 Rep Max) using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  const val = weightKg * (1 + reps / 30);
  return Math.round(val * 10) / 10;
}

/**
 * Calculate all personal records across completed sessions
 */
export function calculatePersonalRecords(sessions: WorkoutSession[]): Record<string, PersonalRecord> {
  const records: Record<string, PersonalRecord> = {};

  // Initialize for all defined exercises
  WORKOUT_EXERCISES.forEach((ex) => {
    records[ex.id] = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      maxWeightKg: 0,
      estimated1RMKg: 0,
      maxRepsAtMaxWeight: 0,
      bestVolumeInOneSetKg: 0,
      dateAchieved: '-'
    };
  });

  sessions.forEach((session) => {
    session.exercises.forEach((exLog) => {
      const currentPr = records[exLog.exerciseId] || {
        exerciseId: exLog.exerciseId,
        exerciseName: exLog.exerciseName,
        maxWeightKg: 0,
        estimated1RMKg: 0,
        maxRepsAtMaxWeight: 0,
        bestVolumeInOneSetKg: 0,
        dateAchieved: session.date
      };

      exLog.sets.forEach((set) => {
        if (!set.completed) return;
        const setVolume = set.weightKg * set.reps;
        const set1RM = estimate1RM(set.weightKg, set.reps);

        if (set.weightKg > currentPr.maxWeightKg) {
          currentPr.maxWeightKg = set.weightKg;
          currentPr.maxRepsAtMaxWeight = set.reps;
          currentPr.dateAchieved = session.date;
        }

        if (set1RM > currentPr.estimated1RMKg) {
          currentPr.estimated1RMKg = set1RM;
        }

        if (setVolume > currentPr.bestVolumeInOneSetKg) {
          currentPr.bestVolumeInOneSetKg = setVolume;
        }
      });

      records[exLog.exerciseId] = currentPr;
    });
  });

  return records;
}

/**
 * Get the latest completed session for pre-filling weights
 */
export function getLastCompletedExerciseSets(
  sessions: WorkoutSession[],
  exerciseId: string
): { weightKg: number; reps: number }[] {
  // Sort descending by date
  const sorted = [...sessions]
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const session of sorted) {
    const foundEx = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (foundEx && foundEx.sets.length > 0) {
      return foundEx.sets.map((s) => ({
        weightKg: s.weightKg,
        reps: s.reps
      }));
    }
  }

  // Fallback defaults
  const exDef = WORKOUT_EXERCISES.find((e) => e.id === exerciseId);
  const defaultSetsCount = exDef ? exDef.targetSets : 3;
  const defaultReps = exDef ? exDef.minReps : 10;
  return Array.from({ length: defaultSetsCount }, () => ({
    weightKg: exerciseId === 'ex-squat' ? 12 : exerciseId === 'ex-military-press' ? 10 : exerciseId === 'ex-romanian-deadlift' ? 14 : exerciseId === 'ex-lateral-raises' ? 4 : 0,
    reps: defaultReps
  }));
}

/**
 * Export data to JSON string for downloading (includes workouts, body measurements, and preferences)
 */
export function generateBackupJSON(
  sessions: WorkoutSession[], 
  prefs: UserPrefs, 
  measurements: BodyMeasurement[] = []
): string {
  const backup: WorkoutBackupFile = {
    version: '1.1.0',
    appName: 'FullBody Pro PWA',
    exportDate: new Date().toISOString(),
    totalWorkouts: sessions.length,
    totalMeasurements: measurements.length,
    sessions,
    bodyMeasurements: measurements,
    userPreferences: prefs
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Export data to CSV string for spreadsheets
 */
export function generateWorkoutCSV(sessions: WorkoutSession[]): string {
  const headers = [
    'ID Sesión',
    'Fecha',
    'Día',
    'Duración (min)',
    'Ejercicio',
    'Serie',
    'Peso (kg)',
    'Repeticiones',
    'Completada',
    'RPE (Esfuerzo 1-10)',
    'Volumen Serie (kg)',
    'Notas Ejercicio'
  ];

  const rows: string[] = [headers.join(';')];

  sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        const volume = set.weightKg * set.reps;
        const row = [
          session.id,
          session.date,
          session.dayOfWeek,
          session.durationMinutes,
          `"${ex.exerciseName.replace(/"/g, '""')}"`,
          set.setNumber,
          set.weightKg,
          set.reps,
          set.completed ? 'SÍ' : 'NO',
          set.rpe || '',
          volume,
          `"${(set.notes || ex.notes || '').replace(/"/g, '""')}"`
        ];
        rows.push(row.join(';'));
      });
    });
  });

  return rows.join('\n');
}

/**
 * Export body measurements to CSV string for spreadsheets
 */
export function generateMeasurementsCSV(measurements: BodyMeasurement[]): string {
  const headers = [
    'ID Registro',
    'Fecha',
    'Peso Corporal (kg)',
    'Pecho (cm)',
    'Bíceps (cm)',
    'Abdomen (cm)',
    'Notas'
  ];

  const rows: string[] = [headers.join(';')];

  // Sort chronological for CSV
  const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sorted.forEach((m) => {
    const row = [
      m.id,
      m.date,
      m.weightKg !== undefined ? m.weightKg : '',
      m.chestCm !== undefined ? m.chestCm : '',
      m.bicepsCm !== undefined ? m.bicepsCm : '',
      m.abdomenCm !== undefined ? m.abdomenCm : '',
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ];
    rows.push(row.join(';'));
  });

  return rows.join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported JSON content
 */
export function validateAndParseImport(jsonString: string): {
  success: boolean;
  sessions?: WorkoutSession[];
  measurements?: BodyMeasurement[];
  prefs?: UserPrefs;
  error?: string;
  count?: number;
  measurementCount?: number;
} {
  try {
    const data = JSON.parse(jsonString);

    // Case 1: Standard WorkoutBackupFile structure
    if (data && (Array.isArray(data.sessions) || Array.isArray(data.bodyMeasurements) || Array.isArray(data.measurements))) {
      const parsedSessions: WorkoutSession[] = Array.isArray(data.sessions) ? data.sessions : [];
      const parsedMeasurements: BodyMeasurement[] = Array.isArray(data.bodyMeasurements) 
        ? data.bodyMeasurements 
        : Array.isArray(data.measurements) 
          ? data.measurements 
          : [];

      return {
        success: true,
        sessions: parsedSessions,
        measurements: parsedMeasurements,
        prefs: data.userPreferences,
        count: parsedSessions.length,
        measurementCount: parsedMeasurements.length
      };
    }

    // Case 2: Direct array of sessions or measurements
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { success: false, error: 'El archivo JSON está vacío.' };
      }

      // Check if it's an array of measurements
      if (data[0].chestCm !== undefined || data[0].bicepsCm !== undefined || data[0].abdomenCm !== undefined) {
        return {
          success: true,
          sessions: [],
          measurements: data,
          count: 0,
          measurementCount: data.length
        };
      }

      // Check basic session signature
      if (!data[0].date || (!data[0].exercises && data[0].weightKg === undefined)) {
        return { success: false, error: 'El archivo JSON no tiene la estructura de entrenamientos o medidas válida.' };
      }

      return {
        success: true,
        sessions: data,
        measurements: [],
        count: data.length,
        measurementCount: 0
      };
    }

    return { success: false, error: 'Formato de archivo no reconocido.' };
  } catch (err) {
    return { success: false, error: `Error al leer el archivo JSON: ${(err as Error).message}` };
  }
}

/**
 * Initial seed body measurements so user sees progression graphs immediately
 */
function getInitialSeedMeasurements(): BodyMeasurement[] {
  const today = new Date();
  const d1 = new Date(today);
  d1.setDate(today.getDate() - 21);
  const d2 = new Date(today);
  d2.setDate(today.getDate() - 14);
  const d3 = new Date(today);
  d3.setDate(today.getDate() - 7);
  const d4 = new Date(today);
  d4.setDate(today.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return [
    {
      id: 'meas-seed-1',
      date: formatDate(d1),
      weightKg: 78.5,
      chestCm: 101.5,
      bicepsCm: 34.0,
      abdomenCm: 86.0,
      notes: 'Inicio de la rutina Full-Body (pesado en ayunas)'
    },
    {
      id: 'meas-seed-2',
      date: formatDate(d2),
      weightKg: 78.0,
      chestCm: 102.0,
      bicepsCm: 34.4,
      abdomenCm: 85.0,
      notes: 'Fin de la semana 1. Cintura bajando, bíceps respondiendo.'
    },
    {
      id: 'meas-seed-3',
      date: formatDate(d3),
      weightKg: 77.4,
      chestCm: 102.8,
      bicepsCm: 34.9,
      abdomenCm: 84.0,
      notes: 'Semana 2. Progresión visible en pecho y congestión de brazos.'
    },
    {
      id: 'meas-seed-4',
      date: formatDate(d4),
      weightKg: 76.9,
      chestCm: 103.5,
      bicepsCm: 35.3,
      abdomenCm: 83.0,
      notes: 'Excelente tono muscular y reducción neta de cintura.'
    }
  ];
}

/**
 * Seed initial historical workouts so user sees charts immediately
 */
function getInitialSeedSessions(): WorkoutSession[] {
  const today = new Date();
  
  // Create 2 recent sample sessions (last Monday and Wednesday)
  const d1 = new Date(today);
  d1.setDate(today.getDate() - 5);
  const d2 = new Date(today);
  d2.setDate(today.getDate() - 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return [
    {
      id: 'session-seed-1',
      date: formatDate(d1),
      dayOfWeek: 'Lunes',
      startTime: d1.toISOString(),
      endTime: new Date(d1.getTime() + 42 * 60000).toISOString(),
      durationMinutes: 42,
      completed: true,
      warmupCompleted: true,
      stretchesCompleted: true,
      generalNotes: 'Primera sesión. Muy buenas sensaciones en sentadillas.',
      perceivedEffort: 8,
      totalVolumeKg: 2840,
      totalSets: 23,
      exercises: [
        {
          exerciseId: 'ex-squat',
          exerciseName: 'Sentadillas con mancuernas',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 12, reps: 10, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 12, reps: 10, completed: true, rpe: 7 },
            { setNumber: 3, weightKg: 14, reps: 9, completed: true, rpe: 8 },
            { setNumber: 4, weightKg: 14, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-pushups',
          exerciseName: 'Flexiones',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 0, reps: 12, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 0, reps: 11, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 0, reps: 10, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-row',
          exerciseName: 'Remo con gomas',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 10, reps: 12, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 10, reps: 12, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 10, reps: 11, completed: true, rpe: 8 }
          ]
        },
        {
          exerciseId: 'ex-military-press',
          exerciseName: 'Press militar',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 10, reps: 8, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 10, reps: 8, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 12, reps: 7, completed: true, rpe: 8 },
            { setNumber: 4, weightKg: 12, reps: 6, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-plank',
          exerciseName: 'Plancha abdominal',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 0, reps: 35, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 0, reps: 35, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 0, reps: 30, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-romanian-deadlift',
          exerciseName: 'Peso muerto rumano',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 14, reps: 10, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 14, reps: 10, completed: true, rpe: 7 },
            { setNumber: 3, weightKg: 16, reps: 9, completed: true, rpe: 8 }
          ]
        },
        {
          exerciseId: 'ex-lateral-raises',
          exerciseName: 'Elevaciones laterales',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 4, reps: 15, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 4, reps: 14, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 4, reps: 13, completed: true, rpe: 9 }
          ]
        }
      ]
    },
    {
      id: 'session-seed-2',
      date: formatDate(d2),
      dayOfWeek: 'Miércoles',
      startTime: d2.toISOString(),
      endTime: new Date(d2.getTime() + 39 * 60000).toISOString(),
      durationMinutes: 39,
      completed: true,
      warmupCompleted: true,
      stretchesCompleted: true,
      generalNotes: 'Progresión lograda en sentadillas y press militar.',
      perceivedEffort: 8,
      totalVolumeKg: 3120,
      totalSets: 23,
      exercises: [
        {
          exerciseId: 'ex-squat',
          exerciseName: 'Sentadillas con mancuernas',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 14, reps: 10, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 14, reps: 10, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 16, reps: 9, completed: true, rpe: 9 },
            { setNumber: 4, weightKg: 16, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-pushups',
          exerciseName: 'Flexiones',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 0, reps: 12, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 0, reps: 12, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 0, reps: 11, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-row',
          exerciseName: 'Remo con gomas',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 12, reps: 12, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 12, reps: 12, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 12, reps: 11, completed: true, rpe: 8 }
          ]
        },
        {
          exerciseId: 'ex-military-press',
          exerciseName: 'Press militar',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 12, reps: 8, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 12, reps: 8, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 14, reps: 7, completed: true, rpe: 9 },
            { setNumber: 4, weightKg: 14, reps: 6, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-plank',
          exerciseName: 'Plancha abdominal',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 0, reps: 40, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 0, reps: 38, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 0, reps: 35, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-romanian-deadlift',
          exerciseName: 'Peso muerto rumano',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 16, reps: 10, completed: true, rpe: 7 },
            { setNumber: 2, weightKg: 16, reps: 10, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 18, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          exerciseId: 'ex-lateral-raises',
          exerciseName: 'Elevaciones laterales',
          completed: true,
          sets: [
            { setNumber: 1, weightKg: 5, reps: 14, completed: true, rpe: 8 },
            { setNumber: 2, weightKg: 5, reps: 13, completed: true, rpe: 8 },
            { setNumber: 3, weightKg: 5, reps: 12, completed: true, rpe: 9 }
          ]
        }
      ]
    }
  ];
}

export function getSuggestedDayOfWeek(): DayOfWeek {
  const day = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  if (day === 1) return 'Lunes';
  if (day === 3) return 'Miércoles';
  if (day === 5) return 'Viernes';
  return 'Otro';
}
