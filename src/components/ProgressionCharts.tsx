import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  Dumbbell, 
  Calendar, 
  BarChart2, 
  Zap, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { WorkoutSession, PersonalRecord } from '../types';
import { WORKOUT_EXERCISES } from '../data/workoutPlan';
import { calculatePersonalRecords, estimate1RM } from '../utils/storage';

interface ProgressionChartsProps {
  sessions: WorkoutSession[];
}

export const ProgressionCharts: React.FC<ProgressionChartsProps> = ({ sessions }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex-squat');

  const personalRecords = calculatePersonalRecords(sessions);
  const selectedExDef = WORKOUT_EXERCISES.find((e) => e.id === selectedExerciseId);

  // Sort sessions chronologically (oldest to newest for charts)
  const sortedSessions = [...sessions]
    .filter((s) => s.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare exercise-specific chart data
  const exerciseChartData = sortedSessions.map((session) => {
    const exLog = session.exercises.find((e) => e.exerciseId === selectedExerciseId);
    let maxWeight = 0;
    let maxEst1RM = 0;
    let totalVolume = 0;
    let repsSum = 0;

    if (exLog) {
      exLog.sets.forEach((set) => {
        if (set.completed) {
          if (set.weightKg > maxWeight) maxWeight = set.weightKg;
          const est1RM = estimate1RM(set.weightKg, set.reps);
          if (est1RM > maxEst1RM) maxEst1RM = est1RM;
          totalVolume += set.weightKg * set.reps;
          repsSum += set.reps;
        }
      });
    }

    return {
      date: session.date.substring(5), // MM-DD
      fullDate: session.date,
      day: session.dayOfWeek,
      pesoMax: maxWeight,
      rmEstimado: maxEst1RM,
      volumen: totalVolume,
      repsTotal: repsSum
    };
  }).filter((d) => d.pesoMax > 0 || d.volumen > 0 || d.repsTotal > 0);

  // Prepare overall session volume chart data
  const overallVolumeData = sortedSessions.map((session) => ({
    date: session.date.substring(5),
    fullDate: session.date,
    day: session.dayOfWeek,
    volumenTotalKg: session.totalVolumeKg || 0,
    duracionMin: session.durationMinutes || 0,
    seriesTotal: session.totalSets || 0
  }));

  // Selected exercise PR
  const currentPr = personalRecords[selectedExerciseId];

  // Calculate adherence count
  const completedTotal = sortedSessions.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Progresión & Récords Personales</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza tu evolución de peso, estimación de 1RM y tonelaje acumulado sesión a sesión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            {completedTotal} Sesiones Registradas
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PERSONAL RECORDS (PRs) BENTO GRID */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Mejores Marcas por Ejercicio</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKOUT_EXERCISES.map((ex) => {
            const pr = personalRecords[ex.id];
            const isSelected = selectedExerciseId === ex.id;

            return (
              <div
                key={ex.id}
                id={`pr-card-${ex.id}`}
                onClick={() => setSelectedExerciseId(ex.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer select-none shadow-xl shadow-black/20 ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-[#1E293B] border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-indigo-400 block mb-0.5">
                      {ex.focus}
                    </span>
                    <h3 className="font-bold text-sm text-white">{ex.name}</h3>
                  </div>
                  <div className={`p-2 rounded-2xl ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 border border-slate-700/60'}`}>
                    <Dumbbell className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-700/50">
                  <div>
                    <p className="text-[10px] text-slate-400">Peso Máximo</p>
                    <p className="text-base font-bold text-white font-mono">
                      {pr && pr.maxWeightKg > 0 ? `${pr.maxWeightKg} kg` : ex.isTimed ? 'Hold (s)' : 'Sin datos'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">1RM Estimado</p>
                    <p className="text-base font-bold text-emerald-400 font-mono">
                      {pr && pr.estimated1RMKg > 0 ? `${pr.estimated1RMKg} kg` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXERCISE EVOLUTION CHART */}
      {/* ======================================================== */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Evolución de {selectedExDef?.name}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Progresión del peso levantado (kg) y 1RM calculado (fórmula Epley) a lo largo del tiempo.
            </p>
          </div>

          {/* Exercise Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-chart-exercise"
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-2xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {WORKOUT_EXERCISES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Exercise Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Peso Récord</span>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              {currentPr?.maxWeightKg ? `${currentPr.maxWeightKg} kg` : '-'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">1RM Estimado</span>
            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              {currentPr?.estimated1RMKg ? `${currentPr.estimated1RMKg} kg` : '-'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Mejor Volumen Serie</span>
            <p className="text-lg font-black text-indigo-400 font-mono mt-0.5">
              {currentPr?.bestVolumeInOneSetKg ? `${currentPr.bestVolumeInOneSetKg} kg` : '-'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Rango Recomendado</span>
            <p className="text-xs font-bold text-slate-200 mt-1">
              {selectedExDef?.targetSets} x {selectedExDef?.targetReps} reps
            </p>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-72 w-full pt-4">
          {exerciseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="pesoMax"
                  name="Peso Máx (kg)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="rmEstimado"
                  name="1RM Estimado (kg)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Dumbbell className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">No hay datos registrados aún para este ejercicio.</p>
              <p className="text-[11px] text-slate-400 mt-1">Completa una sesión para ver la gráfica de progresión.</p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TOTAL WORKOUT VOLUME OVER TIME (BAR CHART) */}
      {/* ======================================================== */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 space-y-5">
        <div className="pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Volumen Total de Entrenamiento por Sesión (kg)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Suma del tonelaje total levantado (Peso x Repeticiones de todas las series completadas).
          </p>
        </div>

        <div className="h-64 w-full pt-2">
          {overallVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallVolumeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
                <Bar
                  dataKey="volumenTotalKg"
                  name="Volumen Total (kg)"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Sin datos de volumen suficientes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
