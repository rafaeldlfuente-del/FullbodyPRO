import React from 'react';
import { 
  Flame, 
  Dumbbell, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Play, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Calendar
} from 'lucide-react';
import { 
  WARMUP_EXERCISES, 
  WORKOUT_EXERCISES, 
  STRETCH_EXERCISES, 
  TRAINING_TIPS 
} from '../data/workoutPlan';
import { DayOfWeek } from '../types';

interface PlanOverviewProps {
  onStartWorkout: (day?: DayOfWeek) => void;
}

export const PlanOverview: React.FC<PlanOverviewProps> = ({ onStartWorkout }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Estructura Oficial
            </span>
            <span className="text-xs text-indigo-100 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-200" />
              Lunes, Miércoles y Viernes
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Plan Full-Body (3 Días / Semana)
          </h1>

          <p className="text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
            Optimizado para <strong className="text-white">30-45 minutos</strong> de duración (~40 min en total), enfocado en maximizar <strong className="text-white font-bold">fuerza e hipertrofia</strong> mediante sobrecarga progresiva y calentamiento específico.
          </p>

          {/* Quick Schedule Selector */}
          <div className="pt-2 flex flex-wrap gap-3">
            {(['Lunes', 'Miércoles', 'Viernes'] as DayOfWeek[]).map((day) => (
              <button
                key={day}
                id={`btn-plan-start-${day.toLowerCase()}`}
                onClick={() => onStartWorkout(day)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 text-xs font-bold shadow-lg transition-all hover:scale-105"
              >
                <Play className="w-3 h-3 fill-current text-indigo-600" />
                <span>Entrenar {day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phase Summary Pill Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/20">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase">1. Calentamiento</p>
              <p className="text-xs font-bold text-white">8 - 10 Minutos</p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-white/20 flex items-center justify-center text-white">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase">2. Entrenamiento</p>
              <p className="text-xs font-bold text-white">25 - 30 Minutos</p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase">3. Estiramientos</p>
              <p className="text-xs font-bold text-white">5 - 7 Minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: CALENTAMIENTO */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">📌 1. Calentamiento (8-10 minutos)</h2>
            <p className="text-xs text-slate-400">Objetivo: Activar el sistema cardiovascular, movilizar articulaciones y preparar los músculos.</p>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700/50">
                <tr>
                  <th className="py-3 px-4">Ejercicio</th>
                  <th className="py-3 px-4">Repeticiones / Duración</th>
                  <th className="py-3 px-4">Notas & Ejecución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-200">
                {WARMUP_EXERCISES.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-amber-300">
                      {item.repsOrDuration}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: ENTRENAMIENTO PRINCIPAL */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">📌 2. Entrenamiento (25-30 minutos)</h2>
            <p className="text-xs text-slate-400">
              Enfoque: <strong className="text-white">Fuerza</strong> (4-6 repeticiones con peso alto) + <strong className="text-white">Hipertrofia</strong> (8-12 repeticiones con peso moderado).
            </p>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700/50">
                <tr>
                  <th className="py-3 px-4">Ejercicio</th>
                  <th className="py-3 px-4 text-center">Series x Reps</th>
                  <th className="py-3 px-4 text-center">Descanso</th>
                  <th className="py-3 px-4">Notas & Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-200">
                {WORKOUT_EXERCISES.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-semibold border ${
                          item.focus === 'Fuerza'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : item.focus === 'Core'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        }`}>
                          {item.focus}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{item.muscleGroup}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {item.targetSets} x {item.targetReps}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-indigo-300">
                      {item.restSeconds} seg
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: ESTIRAMIENTOS */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">📌 3. Estiramientos (5-7 minutos)</h2>
            <p className="text-xs text-slate-400">Objetivo: Reducir la tensión muscular, mejorar la flexibilidad y acelerar la recuperación.</p>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700/50">
                <tr>
                  <th className="py-3 px-4">Músculo / Área</th>
                  <th className="py-3 px-4">Estiramiento</th>
                  <th className="py-3 px-4 text-center">Duración</th>
                  <th className="py-3 px-4">Notas & Postura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-slate-200">
                {STRETCH_EXERCISES.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-indigo-300">
                      {item.area}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-300 whitespace-nowrap">
                      {item.duration}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: CONSEJOS CLAVE DURANTE EL ENTRENAMIENTO */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>🔹 Consejos Clave para Progresar</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRAINING_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-[#1E293B] border border-slate-700/50 p-5 rounded-3xl space-y-2 shadow-xl shadow-black/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                {tip.tag}
              </span>
              <h3 className="font-bold text-sm text-white pt-1">{tip.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
