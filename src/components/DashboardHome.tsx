import React from 'react';
import { 
  Play, 
  Flame, 
  TrendingUp, 
  Dumbbell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Award,
  Sparkles,
  Download,
  BookOpen
} from 'lucide-react';
import { WorkoutSession, DayOfWeek, ActiveTab } from '../types';
import { WORKOUT_EXERCISES, TRAINING_TIPS } from '../data/workoutPlan';
import { calculatePersonalRecords, getSuggestedDayOfWeek } from '../utils/storage';

interface DashboardHomeProps {
  sessions: WorkoutSession[];
  onStartWorkout: (day?: DayOfWeek) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  sessions,
  onStartWorkout,
  setActiveTab
}) => {
  const suggestedDay = getSuggestedDayOfWeek();
  const personalRecords = calculatePersonalRecords(sessions);

  // Latest session
  const latestSession = [...sessions]
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Calculate this week's adherence
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekSessions = sessions.filter((s) => {
    const sDate = new Date(s.date);
    return sDate >= startOfWeek && s.completed;
  });

  const hasTrainedMonday = thisWeekSessions.some((s) => s.dayOfWeek === 'Lunes');
  const hasTrainedWednesday = thisWeekSessions.some((s) => s.dayOfWeek === 'Miércoles');
  const hasTrainedFriday = thisWeekSessions.some((s) => s.dayOfWeek === 'Viernes');

  const totalVolumeAllTime = sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Primary Action Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 relative overflow-hidden text-white">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                Plan Full-Body • 3 Días/Semana
              </span>
              <span className="text-xs text-indigo-100 font-medium">~40 min / sesión</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ¿Listo para tu sesión de {suggestedDay === 'Otro' ? 'hoy' : suggestedDay}?
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl leading-relaxed">
              Calentamiento articular (8-10 min) + Bloque de fuerza e hipertrofia (25-30 min) + Estiramientos finales (5-7 min).
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                id="btn-hero-start-workout"
                onClick={() => onStartWorkout(suggestedDay === 'Otro' ? 'Lunes' : suggestedDay)}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-current text-indigo-600" />
                <span>Iniciar Entrenamiento Guiado</span>
              </button>

              <button
                id="btn-hero-view-plan"
                onClick={() => setActiveTab('plan')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-colors"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Ver Plan Completo</span>
              </button>
            </div>
          </div>

          {/* Weekly Adherence Bento Box */}
          <div className="lg:col-span-4 bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Semana Actual</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {thisWeekSessions.length} / 3 Días
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-xl border text-center ${
                hasTrainedMonday 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-white' 
                  : 'bg-black/20 border-white/10 text-indigo-200'
              }`}>
                <span className="text-[10px] uppercase font-bold block">Lunes</span>
                {hasTrainedMonday ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mx-auto mt-1" />
                ) : (
                  <span className="text-[11px] font-semibold opacity-60 block mt-1">Pendiente</span>
                )}
              </div>

              <div className={`p-2.5 rounded-xl border text-center ${
                hasTrainedWednesday 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-white' 
                  : 'bg-black/20 border-white/10 text-indigo-200'
              }`}>
                <span className="text-[10px] uppercase font-bold block">Miércoles</span>
                {hasTrainedWednesday ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mx-auto mt-1" />
                ) : (
                  <span className="text-[11px] font-semibold opacity-60 block mt-1">Pendiente</span>
                )}
              </div>

              <div className={`p-2.5 rounded-xl border text-center ${
                hasTrainedFriday 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-white' 
                  : 'bg-black/20 border-white/10 text-indigo-200'
              }`}>
                <span className="text-[10px] uppercase font-bold block">Viernes</span>
                {hasTrainedFriday ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mx-auto mt-1" />
                ) : (
                  <span className="text-[11px] font-semibold opacity-60 block mt-1">Pendiente</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-indigo-100/80 text-center pt-1">
              {thisWeekSessions.length >= 3 
                ? '🎉 ¡Objetivo semanal completado con éxito!' 
                : 'Mantén 1 día de descanso entre cada sesión.'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setActiveTab('history')}
          className="bg-[#1E293B] border border-slate-700/50 hover:border-indigo-500/40 p-4 rounded-2xl cursor-pointer transition-all hover:bg-slate-800 shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sesiones</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{sessions.length}</p>
          <span className="text-[11px] text-indigo-400 mt-1 block font-medium">Ver historial →</span>
        </div>

        <div 
          onClick={() => setActiveTab('progression')}
          className="bg-[#1E293B] border border-slate-700/50 hover:border-indigo-500/40 p-4 rounded-2xl cursor-pointer transition-all hover:bg-slate-800 shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tonelaje Total</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{totalVolumeAllTime.toLocaleString()} kg</p>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">Ver gráficas →</span>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/50 p-4 rounded-2xl shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ejercicios</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{WORKOUT_EXERCISES.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Full-Body equilibrado</span>
        </div>

        <div 
          onClick={() => setActiveTab('backup')}
          className="bg-[#1E293B] border border-slate-700/50 hover:border-indigo-500/40 p-4 rounded-2xl cursor-pointer transition-all hover:bg-slate-800 shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Copia de Seguridad</span>
            <Download className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xs font-bold text-slate-200 mt-1">Archivo JSON / CSV</p>
          <span className="text-[11px] text-indigo-400 mt-2 block font-medium">Descargar copia →</span>
        </div>
      </div>

      {/* Latest Workout Summary Card */}
      {latestSession && (
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Último Entrenamiento Registrado</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{latestSession.date} ({latestSession.dayOfWeek})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Duración</span>
              <p className="text-base font-bold text-white font-mono">{latestSession.durationMinutes} minutos</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Volumen Levantado</span>
              <p className="text-base font-bold text-indigo-400 font-mono">{latestSession.totalVolumeKg?.toLocaleString() || 0} kg</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Series Completadas</span>
              <p className="text-base font-bold text-emerald-400 font-mono">{latestSession.totalSets || 0} series</p>
            </div>
          </div>

          {latestSession.generalNotes && (
            <p className="text-xs text-slate-300 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              "{latestSession.generalNotes}"
            </p>
          )}
        </div>
      )}

      {/* Routine Exercises Quick Reference Table */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Ejercicios del Plan Full-Body</h2>
            <p className="text-xs text-slate-400 mt-0.5">Estructura de series y descansos</p>
          </div>

          <button
            id="btn-home-see-all-plan"
            onClick={() => setActiveTab('plan')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Ver detalles y técnica</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WORKOUT_EXERCISES.map((ex) => {
            const pr = personalRecords[ex.id];
            return (
              <div
                key={ex.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center justify-between transition-colors"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{ex.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {ex.targetSets} series x {ex.targetReps} reps • Descanso: {ex.restSeconds}s
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Record</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {pr && pr.maxWeightKg > 0 ? `${pr.maxWeightKg} kg` : ex.isTimed ? 'Core' : '0 kg'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TRAINING_TIPS.map((tip, idx) => (
          <div key={idx} className="bg-[#1E293B] border border-slate-700/50 p-4 rounded-2xl space-y-1.5 shadow-lg shadow-black/20">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">{tip.tag}</span>
            <h4 className="font-bold text-xs text-white pt-1">{tip.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
