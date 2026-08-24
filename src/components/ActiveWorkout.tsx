import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Dumbbell, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Save, 
  X, 
  Plus, 
  Minus, 
  Info,
  Timer,
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  WorkoutSession, 
  DayOfWeek, 
  ExerciseSessionLog, 
  ExerciseSetLog 
} from '../types';
import { 
  WARMUP_EXERCISES, 
  WORKOUT_EXERCISES, 
  STRETCH_EXERCISES, 
  TRAINING_TIPS 
} from '../data/workoutPlan';
import { RestTimerModal } from './RestTimerModal';
import { playSuccessChime, playTickSound } from '../utils/audio';
import { getLastCompletedExerciseSets, UserPrefs } from '../utils/storage';

interface ActiveWorkoutProps {
  currentSession: WorkoutSession | null;
  sessions: WorkoutSession[];
  userPrefs: UserPrefs;
  onSaveSession: (session: WorkoutSession) => void;
  onCancelSession: () => void;
  onToggleSound: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  currentSession,
  sessions,
  userPrefs,
  onSaveSession,
  onCancelSession,
  onToggleSound
}) => {
  // Navigation stage in session: 1: Calentamiento, 2: Entrenamiento, 3: Estiramientos, 4: Resumen
  const [activeStage, setActiveStage] = useState<'warmup' | 'workout' | 'stretch' | 'summary'>('workout');
  
  // Warmup checks state
  const [warmupChecks, setWarmupChecks] = useState<Record<string, boolean>>({});
  const [activeWarmupTimerId, setActiveWarmupTimerId] = useState<string | null>(null);
  const [warmupTimerSeconds, setWarmupTimerSeconds] = useState<number>(0);

  // Stretches checks & timer state
  const [stretchChecks, setStretchChecks] = useState<Record<string, boolean>>({});
  const [activeStretchTimerId, setActiveStretchTimerId] = useState<string | null>(null);
  const [stretchTimerSeconds, setStretchTimerSeconds] = useState<number>(0);

  // Main exercise logs
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseSessionLog[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [perceivedEffort, setPerceivedEffort] = useState<number>(8);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Lunes');

  // Elapsed workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const startTimeRef = useRef<Date>(new Date());

  // Rest Timer Modal
  const [restTimerOpen, setRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [currentRestExercise, setCurrentRestExercise] = useState<{ name: string; nextSet?: number }>({ name: '' });

  // Initialize or resume session
  useEffect(() => {
    if (currentSession) {
      setSelectedDay(currentSession.dayOfWeek);
      setGeneralNotes(currentSession.generalNotes || '');
      setPerceivedEffort(currentSession.perceivedEffort || 8);
      startTimeRef.current = new Date(currentSession.startTime);
      
      // Warmup state
      if (currentSession.warmupCompleted) {
        const checks: Record<string, boolean> = {};
        WARMUP_EXERCISES.forEach((w) => { checks[w.id] = true; });
        setWarmupChecks(checks);
      }

      // Stretch state
      if (currentSession.stretchesCompleted) {
        const checks: Record<string, boolean> = {};
        STRETCH_EXERCISES.forEach((s) => { checks[s.id] = true; });
        setStretchChecks(checks);
      }

      if (currentSession.exercises && currentSession.exercises.length > 0) {
        setExerciseLogs(currentSession.exercises);
        const exp: Record<string, boolean> = {};
        currentSession.exercises.forEach((ex) => { exp[ex.exerciseId] = true; });
        setExpandedExercises(exp);
      }
    } else {
      // Build fresh session structure based on WORKOUT_EXERCISES and previous weights
      const initialLogs: ExerciseSessionLog[] = WORKOUT_EXERCISES.map((exDef) => {
        const previousSets = getLastCompletedExerciseSets(sessions, exDef.id);
        const sets: ExerciseSetLog[] = Array.from({ length: exDef.targetSets }, (_, idx) => {
          const prev = previousSets[idx] || previousSets[previousSets.length - 1] || { weightKg: 0, reps: exDef.minReps };
          return {
            setNumber: idx + 1,
            weightKg: prev.weightKg,
            reps: prev.reps || exDef.minReps,
            completed: false,
            rpe: 8
          };
        });

        return {
          exerciseId: exDef.id,
          exerciseName: exDef.name,
          completed: false,
          sets
        };
      });

      setExerciseLogs(initialLogs);
      const exp: Record<string, boolean> = {};
      initialLogs.forEach((ex) => { exp[ex.exerciseId] = true; });
      setExpandedExercises(exp);
      startTimeRef.current = new Date();
    }
  }, [currentSession, sessions]);

  // Elapsed timer clock
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
      setElapsedSeconds(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Warmup active countdown timer
  useEffect(() => {
    if (!activeWarmupTimerId || warmupTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setWarmupTimerSeconds((prev) => {
        if (prev <= 1) {
          if (userPrefs.soundEnabled) playSuccessChime();
          setWarmupChecks((c) => ({ ...c, [activeWarmupTimerId]: true }));
          setActiveWarmupTimerId(null);
          return 0;
        }
        if (prev <= 4 && userPrefs.soundEnabled) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWarmupTimerId, warmupTimerSeconds, userPrefs.soundEnabled]);

  // Stretch active countdown timer
  useEffect(() => {
    if (!activeStretchTimerId || stretchTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setStretchTimerSeconds((prev) => {
        if (prev <= 1) {
          if (userPrefs.soundEnabled) playSuccessChime();
          setStretchChecks((c) => ({ ...c, [activeStretchTimerId]: true }));
          setActiveStretchTimerId(null);
          return 0;
        }
        if (prev <= 4 && userPrefs.soundEnabled) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStretchTimerId, stretchTimerSeconds, userPrefs.soundEnabled]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle Exercise collapse/expand
  const toggleExpand = (exId: string) => {
    setExpandedExercises((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  // Update set field (weightKg, reps, rpe, notes)
  const handleUpdateSet = (exId: string, setIndex: number, field: keyof ExerciseSetLog, val: number | string | boolean) => {
    setExerciseLogs((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exId) return ex;
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: val };
        
        // Check if all sets completed
        const allCompleted = newSets.every((s) => s.completed);
        return { ...ex, sets: newSets, completed: allCompleted };
      })
    );
  };

  // Toggle Set Complete and trigger rest timer
  const handleToggleSetComplete = (exId: string, setIndex: number) => {
    const currentEx = exerciseLogs.find((e) => e.exerciseId === exId);
    if (!currentEx) return;

    const currentSet = currentEx.sets[setIndex];
    const newStatus = !currentSet.completed;

    handleUpdateSet(exId, setIndex, 'completed', newStatus);

    // If marked completed, start rest timer unless it's the very last set of the last exercise
    if (newStatus) {
      const exDef = WORKOUT_EXERCISES.find((e) => e.id === exId);
      const restTime = exDef ? exDef.restSeconds : userPrefs.defaultRestSeconds;
      
      const nextSetNum = setIndex + 2 <= currentEx.sets.length ? setIndex + 2 : undefined;
      setCurrentRestExercise({
        name: currentEx.exerciseName,
        nextSet: nextSetNum
      });
      setRestTimerSeconds(restTime);
      setRestTimerOpen(true);
    }
  };

  // Add / remove sets dynamically
  const handleAddSet = (exId: string) => {
    setExerciseLogs((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ExerciseSetLog = {
          setNumber: ex.sets.length + 1,
          weightKg: lastSet ? lastSet.weightKg : 0,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          rpe: 8
        };
        return { ...ex, sets: [...ex.sets, newSet], completed: false };
      })
    );
  };

  const handleRemoveSet = (exId: string, setIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exId || ex.sets.length <= 1) return ex;
        const filtered = ex.sets.filter((_, idx) => idx !== setIndex);
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        const allCompleted = renumbered.every((s) => s.completed);
        return { ...ex, sets: renumbered, completed: allCompleted };
      })
    );
  };

  // Metrics calculations
  const totalCompletedSets = exerciseLogs.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalPlannedSets = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
  
  const totalVolume = exerciseLogs.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.weightKg * s.reps, 0)
    );
  }, 0);

  const warmupAllDone = WARMUP_EXERCISES.every((w) => warmupChecks[w.id]);
  const stretchesAllDone = STRETCH_EXERCISES.every((s) => stretchChecks[s.id]);

  // Finish and compile workout session
  const handleFinishWorkout = () => {
    const duration = Math.max(1, Math.round(elapsedSeconds / 60));
    const nowISO = new Date().toISOString();

    const finalizedSession: WorkoutSession = {
      id: currentSession?.id || `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: selectedDay,
      startTime: startTimeRef.current.toISOString(),
      endTime: nowISO,
      durationMinutes: duration,
      completed: true,
      warmupCompleted: warmupAllDone,
      stretchesCompleted: stretchesAllDone,
      exercises: exerciseLogs,
      generalNotes,
      perceivedEffort,
      totalVolumeKg: totalVolume,
      totalSets: totalCompletedSets
    };

    if (userPrefs.soundEnabled) {
      playSuccessChime();
    }

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    onSaveSession(finalizedSession);
  };

  // Start warmup timer
  const handleStartWarmupTimer = (id: string, durationSec: number) => {
    setActiveWarmupTimerId(id);
    setWarmupTimerSeconds(durationSec);
  };

  // Start stretch timer
  const handleStartStretchTimer = (id: string, durationSec: number) => {
    setActiveStretchTimerId(id);
    setStretchTimerSeconds(durationSec);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Rest Timer Modal */}
      <RestTimerModal
        initialSeconds={restTimerSeconds}
        exerciseName={currentRestExercise.name}
        nextSetNumber={currentRestExercise.nextSet}
        isOpen={restTimerOpen}
        onClose={() => setRestTimerOpen(false)}
        soundEnabled={userPrefs.soundEnabled}
        onToggleSound={onToggleSound}
      />

      {/* Top Session Progress Bar & Controls */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/20 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Sesión Full-Body</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400">Tiempo: <span className="font-mono text-white font-bold">{formatElapsed(elapsedSeconds)}</span> • {totalCompletedSets}/{totalPlannedSets} Series</p>
            </div>
          </div>

          {/* Day of week selector & Cancel */}
          <div className="flex items-center gap-2">
            <select
              id="select-workout-day"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-2xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Lunes">Día: Lunes</option>
              <option value="Miércoles">Día: Miércoles</option>
              <option value="Viernes">Día: Viernes</option>
              <option value="Otro">Día: Extra</option>
            </select>

            <button
              id="btn-cancel-session"
              onClick={onCancelSession}
              className="p-2 rounded-2xl bg-slate-900/80 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 transition-colors"
              title="Salir sin guardar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            id="tab-stage-warmup"
            onClick={() => setActiveStage('warmup')}
            className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeStage === 'warmup'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>1. Calentamiento</span>
            {warmupAllDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />}
          </button>

          <button
            id="tab-stage-workout"
            onClick={() => setActiveStage('workout')}
            className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeStage === 'workout'
                ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>2. Fuerza & Hipertrofia</span>
            <span className="text-[11px] opacity-80">({totalCompletedSets}/{totalPlannedSets})</span>
          </button>

          <button
            id="tab-stage-stretch"
            onClick={() => setActiveStage('stretch')}
            className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeStage === 'stretch'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Estiramientos</span>
            {stretchesAllDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />}
          </button>
        </div>

        {/* Global Workout Progress Metric Bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Volumen Levantado: <strong className="text-white">{totalVolume.toLocaleString()} kg</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Progreso:</span>
            <div className="w-24 bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round((totalCompletedSets / (totalPlannedSets || 1)) * 100)}%` }}
              />
            </div>
            <span className="font-bold text-white font-mono">{Math.round((totalCompletedSets / (totalPlannedSets || 1)) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 1: CALENTAMIENTO (8-10 MINUTOS) */}
      {/* ======================================================== */}
      {activeStage === 'warmup' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-amber-500/10 via-[#1E293B] to-[#1E293B] border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-xl shadow-black/20">
            <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-300">Fase 1: Calentamiento Articular y Activación (8-10 min)</h2>
              <p className="text-xs text-slate-300 mt-1">
                Objetivo: Activar el sistema cardiovascular, movilizar articulaciones y preparar los músculos para levantar con seguridad.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WARMUP_EXERCISES.map((warmup) => {
              const isChecked = !!warmupChecks[warmup.id];
              const isTimerRunning = activeWarmupTimerId === warmup.id;

              return (
                <div
                  key={warmup.id}
                  id={`warmup-item-${warmup.id}`}
                  className={`p-4 rounded-3xl border transition-all shadow-lg ${
                    isChecked
                      ? 'bg-slate-900/80 border-emerald-500/40 text-slate-300'
                      : 'bg-[#1E293B] border-slate-700/50 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{warmup.name}</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700 font-mono">
                          {warmup.repsOrDuration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{warmup.notes}</p>
                    </div>

                    <button
                      id={`btn-check-warmup-${warmup.id}`}
                      onClick={() => setWarmupChecks((c) => ({ ...c, [warmup.id]: !isChecked }))}
                      className={`p-2 rounded-2xl transition-all ${
                        isChecked
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Interactive Timer if available */}
                  {warmup.durationSeconds && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                      {isTimerRunning ? (
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 animate-pulse">
                          <Timer className="w-4 h-4 animate-spin" />
                          <span>Restante: {warmupTimerSeconds}s</span>
                        </div>
                      ) : (
                        <button
                          id={`btn-start-warmup-timer-${warmup.id}`}
                          onClick={() => handleStartWarmupTimer(warmup.id, warmup.durationSeconds!)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>Iniciar Cronómetro ({warmup.durationSeconds}s)</span>
                        </button>
                      )}

                      {isChecked && <span className="text-xs text-emerald-400 font-medium">¡Completado!</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              id="btn-next-to-workout"
              onClick={() => setActiveStage('workout')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Ir al Entrenamiento Principal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STAGE 2: ENTRENAMIENTO PRINCIPAL (25-30 MINUTOS) */}
      {/* ======================================================== */}
      {activeStage === 'workout' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Info Banner with Key Advice */}
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-white">Fuerza & Hipertrofia:</strong> Completa cada serie, anota tus pesos y descansa el tiempo recomendado para maximizar resultados.
              </p>
            </div>
            <button
              id="btn-open-rest-manual"
              onClick={() => {
                setRestTimerSeconds(userPrefs.defaultRestSeconds);
                setCurrentRestExercise({ name: 'Descanso libre' });
                setRestTimerOpen(true);
              }}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cronómetro</span>
            </button>
          </div>

          {/* Exercise Logs Cards */}
          <div className="space-y-4">
            {exerciseLogs.map((exLog, exIndex) => {
              const exDef = WORKOUT_EXERCISES.find((e) => e.id === exLog.exerciseId);
              const isExpanded = !!expandedExercises[exLog.exerciseId];
              const completedSetsCount = exLog.sets.filter((s) => s.completed).length;
              const allDone = exLog.sets.length > 0 && completedSetsCount === exLog.sets.length;

              return (
                <div
                  key={exLog.exerciseId}
                  id={`exercise-card-${exLog.exerciseId}`}
                  className={`bg-[#1E293B] border rounded-3xl overflow-hidden transition-all shadow-xl shadow-black/20 ${
                    allDone
                      ? 'border-emerald-500/40 shadow-emerald-500/5'
                      : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  {/* Exercise Header */}
                  <div
                    onClick={() => toggleExpand(exLog.exerciseId)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-900/40 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        allDone 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-slate-900 text-slate-300 border border-slate-700'
                      }`}>
                        {allDone ? <CheckCircle2 className="w-4 h-4" /> : exIndex + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-white">{exLog.exerciseName}</h3>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            exDef?.focus === 'Fuerza' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                              : exDef?.focus === 'Core'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          }`}>
                            {exDef?.focus || 'Hipertrofia'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Objetivo: <span className="text-slate-300 font-semibold">{exDef?.targetSets} series x {exDef?.targetReps} reps</span> • Descanso: <span className="text-indigo-400 font-semibold">{exDef?.restSeconds}s</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {completedSetsCount} / {exLog.sets.length} series
                      </span>
                      <div className="p-1 text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content: Sets Table & Notes */}
                  {isExpanded && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-700/50 space-y-4">
                      {/* Notes / Form Hint */}
                      {exDef?.notes && (
                        <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-200">Técnica:</strong> {exDef.notes}</span>
                        </div>
                      )}

                      {/* Sets Grid */}
                      <div className="space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                          <div className="col-span-2 text-center">Serie</div>
                          <div className="col-span-4 text-center">{exDef?.isTimed ? 'Segundos' : 'Peso (kg)'}</div>
                          <div className="col-span-3 text-center">{exDef?.isTimed ? 'Hold (s)' : 'Reps'}</div>
                          <div className="col-span-3 text-center">Completar</div>
                        </div>

                        {/* Set Rows */}
                        {exLog.sets.map((set, setIdx) => (
                          <div
                            key={set.setNumber}
                            id={`set-row-${exLog.exerciseId}-${set.setNumber}`}
                            className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl border transition-all ${
                              set.completed
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                                : 'bg-slate-900/80 border-slate-750 text-slate-200'
                            }`}
                          >
                            {/* Set Number */}
                            <div className="col-span-2 text-center">
                              <span className="font-bold text-xs text-slate-300 font-mono">
                                #{set.setNumber}
                              </span>
                            </div>

                            {/* Weight / Hold */}
                            <div className="col-span-4 flex items-center justify-center gap-1">
                              {!exDef?.isTimed ? (
                                <>
                                  <button
                                    id={`btn-minus-weight-${exLog.exerciseId}-${setIdx}`}
                                    onClick={() => handleUpdateSet(exLog.exerciseId, setIdx, 'weightKg', Math.max(0, (set.weightKg || 0) - 2.5))}
                                    className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                                    title="-2.5 kg"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>

                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={set.weightKg === 0 ? '' : set.weightKg}
                                    placeholder="0"
                                    onChange={(e) => handleUpdateSet(exLog.exerciseId, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                    className="w-14 text-center py-1 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />

                                  <button
                                    id={`btn-plus-weight-${exLog.exerciseId}-${setIdx}`}
                                    onClick={() => handleUpdateSet(exLog.exerciseId, setIdx, 'weightKg', (set.weightKg || 0) + 2.5)}
                                    className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                                    title="+2.5 kg"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold">Plancha</span>
                              )}
                            </div>

                            {/* Reps */}
                            <div className="col-span-3 flex items-center justify-center gap-1">
                              <button
                                id={`btn-minus-reps-${exLog.exerciseId}-${setIdx}`}
                                onClick={() => handleUpdateSet(exLog.exerciseId, setIdx, 'reps', Math.max(1, set.reps - 1))}
                                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <input
                                type="number"
                                min="1"
                                value={set.reps}
                                onChange={(e) => handleUpdateSet(exLog.exerciseId, setIdx, 'reps', parseInt(e.target.value) || 1)}
                                className="w-11 text-center py-1 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                              />

                              <button
                                id={`btn-plus-reps-${exLog.exerciseId}-${setIdx}`}
                                onClick={() => handleUpdateSet(exLog.exerciseId, setIdx, 'reps', set.reps + 1)}
                                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Checkmark Complete */}
                            <div className="col-span-3 flex items-center justify-center">
                              <button
                                id={`btn-complete-set-${exLog.exerciseId}-${setIdx}`}
                                onClick={() => handleToggleSetComplete(exLog.exerciseId, setIdx)}
                                className={`w-full py-1.5 rounded-xl flex items-center justify-center gap-1 font-semibold text-xs transition-all ${
                                  set.completed
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {set.completed ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Hecho</span>
                                  </>
                                ) : (
                                  <span>Registrar</span>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Set / Remove Set Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-add-set-${exLog.exerciseId}`}
                            onClick={() => handleAddSet(exLog.exerciseId)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-indigo-400" />
                            <span>Añadir Serie</span>
                          </button>

                          {exLog.sets.length > 1 && (
                            <button
                              id={`btn-remove-set-${exLog.exerciseId}`}
                              onClick={() => handleRemoveSet(exLog.exerciseId, exLog.sets.length - 1)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-400 transition-colors"
                              title="Quitar última serie"
                            >
                              <Minus className="w-3 h-3 text-rose-400" />
                              <span>Quitar</span>
                            </button>
                          )}
                        </div>

                        <span className="text-xs text-slate-400">
                          Total Ejercicio: <strong className="text-slate-200">
                            {exLog.sets.filter((s) => s.completed).reduce((sum, s) => sum + s.weightKg * s.reps, 0)} kg
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation to Stretches */}
          <div className="flex justify-between items-center pt-4">
            <button
              id="btn-back-to-warmup"
              onClick={() => setActiveStage('warmup')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              ← Volver a Calentamiento
            </button>

            <button
              id="btn-goto-stretch"
              onClick={() => setActiveStage('stretch')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Continuar a Estiramientos (5-7 min)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STAGE 3: ESTIRAMIENTOS (5-7 MINUTOS) */}
      {/* ======================================================== */}
      {activeStage === 'stretch' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-violet-500/10 via-[#1E293B] to-[#1E293B] border border-violet-500/30 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-xl shadow-black/20">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-violet-300">Fase 3: Estiramientos y Vuelta a la Calma (5-7 min)</h2>
              <p className="text-xs text-slate-300 mt-1">
                Objetivo: Reducir la tensión muscular, mejorar la flexibilidad y acelerar la recuperación articular y muscular.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STRETCH_EXERCISES.map((stretch) => {
              const isChecked = !!stretchChecks[stretch.id];
              const isTimerRunning = activeStretchTimerId === stretch.id;

              return (
                <div
                  key={stretch.id}
                  id={`stretch-item-${stretch.id}`}
                  className={`p-4 rounded-3xl border transition-all shadow-lg ${
                    isChecked
                      ? 'bg-slate-900/80 border-emerald-500/40 text-slate-300'
                      : 'bg-[#1E293B] border-slate-700/50 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block mb-0.5">
                        {stretch.area}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{stretch.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{stretch.notes}</p>
                    </div>

                    <button
                      id={`btn-check-stretch-${stretch.id}`}
                      onClick={() => setStretchChecks((c) => ({ ...c, [stretch.id]: !isChecked }))}
                      className={`p-2 rounded-2xl transition-all ${
                        isChecked
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Stretch Timer */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    {isTimerRunning ? (
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-400 animate-pulse">
                        <Timer className="w-4 h-4 animate-spin" />
                        <span>Restante: {stretchTimerSeconds}s</span>
                      </div>
                    ) : (
                      <button
                        id={`btn-start-stretch-timer-${stretch.id}`}
                        onClick={() => handleStartStretchTimer(stretch.id, stretch.durationSeconds)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 transition-colors"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Iniciar ({stretch.duration})</span>
                      </button>
                    )}

                    {isChecked && <span className="text-xs text-emerald-400 font-medium">¡Estirado!</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              id="btn-back-to-exercises"
              onClick={() => setActiveStage('workout')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              ← Volver a Ejercicios
            </button>

            <button
              id="btn-goto-summary"
              onClick={() => setActiveStage('summary')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <Award className="w-4 h-4" />
              <span>Finalizar Sesión & Guardar</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STAGE 4: RESUMEN DE SESIÓN & GUARDADO */}
      {/* ======================================================== */}
      {activeStage === 'summary' && (
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/20 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Award className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">¡Excelente Entrenamiento!</h2>
            <p className="text-xs text-slate-400">
              Revisa el resumen de tu sesión Full-Body antes de guardarla en tu registro permanente.
            </p>
          </div>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Duración Total</p>
              <p className="text-xl font-bold text-white font-mono mt-1">{formatElapsed(elapsedSeconds)}</p>
            </div>

            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Series Hechas</p>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{totalCompletedSets}/{totalPlannedSets}</p>
            </div>

            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Volumen Total</p>
              <p className="text-xl font-bold text-indigo-400 font-mono mt-1">{totalVolume.toLocaleString()} kg</p>
            </div>

            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Fases</p>
              <p className="text-xs font-semibold text-slate-200 mt-2">
                {warmupAllDone ? '🔥 Calent. ' : ''} {stretchesAllDone ? '✨ Estir.' : ''}
              </p>
            </div>
          </div>

          {/* Perceived Effort (RPE) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Sensación de Esfuerzo Percibido (RPE: 1 a 10): <strong className="text-indigo-400">{perceivedEffort} / 10</strong>
            </label>
            <input
              id="input-perceived-effort"
              type="range"
              min="1"
              max="10"
              value={perceivedEffort}
              onChange={(e) => setPerceivedEffort(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 - Muy Suave</span>
              <span>5 - Moderado</span>
              <span>8 - Óptimo</span>
              <span>10 - Al Fallo Máximo</span>
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Notas de la sesión (sensaciones, pesos destacados, mejoras para la próxima):
            </label>
            <textarea
              id="input-session-notes"
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ej: Buena congestión en sentadillas. La próxima semana subir 1kg en press militar..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Save Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              id="btn-back-to-workout-edit"
              onClick={() => setActiveStage('workout')}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Revisar Ejercicios
            </button>

            <button
              id="btn-save-workout-session"
              onClick={handleFinishWorkout}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Sesión en Registro</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
