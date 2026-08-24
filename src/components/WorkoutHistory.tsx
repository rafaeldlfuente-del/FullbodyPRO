import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Trash2, 
  Edit3,
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  FileText,
  AlertTriangle,
  Play,
  Check,
  X,
  Plus
} from 'lucide-react';
import { WorkoutSession, DayOfWeek, ExerciseSessionLog, ExerciseSetLog } from '../types';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (session: WorkoutSession) => void;
  onStartFromHistorical: (session: WorkoutSession) => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  sessions,
  onDeleteSession,
  onUpdateSession,
  onStartFromHistorical
}) => {
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});
  const [filterDay, setFilterDay] = useState<string>('all');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<WorkoutSession | null>(null);

  // Sort descending by date
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredSessions = sortedSessions.filter((s) => {
    if (filterDay === 'all') return true;
    return s.dayOfWeek === filterDay;
  });

  const toggleSessionExpand = (id: string) => {
    setExpandedSessionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleOpenEdit = (session: WorkoutSession) => {
    // Deep copy session so edits don't mutate state prematurely
    setSessionToEdit(JSON.parse(JSON.stringify(session)));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToEdit) return;

    // Recalculate totalVolume and totalSets
    let totalVol = 0;
    let completedSetsCount = 0;

    sessionToEdit.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVol += Number(set.weightKg || 0) * Number(set.reps || 0);
          completedSetsCount += 1;
        }
      });
    });

    const updated: WorkoutSession = {
      ...sessionToEdit,
      totalVolumeKg: totalVol,
      totalSets: completedSetsCount
    };

    onUpdateSession(updated);
    setSessionToEdit(null);
  };

  const handleUpdateSetField = (
    exIdx: number,
    setIdx: number,
    field: keyof ExerciseSetLog,
    val: any
  ) => {
    if (!sessionToEdit) return;
    const updated = { ...sessionToEdit };
    const set = updated.exercises[exIdx].sets[setIdx];
    if (set) {
      (set as any)[field] = val;
    }
    setSessionToEdit(updated);
  };

  const handleAddSet = (exIdx: number) => {
    if (!sessionToEdit) return;
    const updated = { ...sessionToEdit };
    const ex = updated.exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];
    const newSetNumber = ex.sets.length + 1;
    const newSet: ExerciseSetLog = {
      setNumber: newSetNumber,
      weightKg: lastSet ? lastSet.weightKg : 0,
      reps: lastSet ? lastSet.reps : 10,
      completed: true,
      rpe: 8
    };
    ex.sets.push(newSet);
    setSessionToEdit(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    if (!sessionToEdit) return;
    const updated = { ...sessionToEdit };
    const ex = updated.exercises[exIdx];
    ex.sets.splice(setIdx, 1);
    // Renumber sets
    ex.sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setSessionToEdit(updated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Historial de Entrenamientos</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro detallado de tus sesiones. Puedes editar o eliminar cualquier sesión manualmente.
          </p>
        </div>

        {/* Day Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filtrar por día:</span>
          <select
            id="select-history-filter"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-2xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Todos los días ({sessions.length})</option>
            <option value="Lunes">Lunes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Viernes">Viernes</option>
            <option value="Otro">Otros</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl shadow-black/60">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-white">¿Eliminar registro?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Esta acción eliminará la sesión seleccionada de forma permanente del dispositivo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-cancel-delete"
                onClick={() => setSessionToDelete(null)}
                className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-delete"
                onClick={() => {
                  onDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-xl shadow-rose-600/30 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {sessionToEdit && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-700/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Modificar Sesión de Entrenamiento</h3>
                  <p className="text-xs text-slate-400">Edita fecha, cargas, repeticiones y notas del registro.</p>
                </div>
              </div>

              <button
                id="btn-close-edit-modal"
                onClick={() => setSessionToEdit(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fecha
                  </label>
                  <input
                    type="date"
                    id="edit-session-date"
                    value={sessionToEdit.date}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, date: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Día del Plan
                  </label>
                  <select
                    id="edit-session-day"
                    value={sessionToEdit.dayOfWeek}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    id="edit-session-duration"
                    value={sessionToEdit.durationMinutes || 0}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, durationMinutes: Math.max(1, parseInt(e.target.value) || 0) })}
                    min="1"
                    max="300"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* RPE and General Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Esfuerzo Percibido (RPE 1-10)
                  </label>
                  <input
                    type="number"
                    id="edit-session-rpe"
                    value={sessionToEdit.perceivedEffort || 8}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, perceivedEffort: Math.min(10, Math.max(1, parseInt(e.target.value) || 8)) })}
                    min="1"
                    max="10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Notas de la sesión
                  </label>
                  <input
                    type="text"
                    id="edit-session-notes"
                    value={sessionToEdit.generalNotes || ''}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, generalNotes: e.target.value })}
                    placeholder="Ej. Buenas sensaciones en sentadillas..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Warmup & Stretches checkboxes */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionToEdit.warmupCompleted}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, warmupCompleted: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Calentamiento articular completado</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionToEdit.stretchesCompleted}
                    onChange={(e) => setSessionToEdit({ ...sessionToEdit, stretchesCompleted: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Estiramientos finales completados</span>
                </label>
              </div>

              {/* Exercises & Sets Editor */}
              <div className="space-y-4 pt-2 border-t border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Modificar Series y Cargas por Ejercicio
                </h4>

                <div className="space-y-3">
                  {sessionToEdit.exercises.map((ex, exIdx) => (
                    <div key={ex.exerciseId} className="bg-slate-900/90 border border-slate-700/50 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{ex.exerciseName}</span>
                        <button
                          type="button"
                          onClick={() => handleAddSet(exIdx)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Añadir Serie</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ex.sets.map((set, setIdx) => (
                          <div
                            key={setIdx}
                            className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 text-xs"
                          >
                            <span className="font-mono text-[10px] text-slate-400 font-bold w-6">
                              S{set.setNumber}
                            </span>

                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="500"
                                value={set.weightKg}
                                onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                title="Peso (kg)"
                              />
                              <span className="text-[10px] text-slate-500 font-semibold">kg ×</span>

                              <input
                                type="number"
                                min="0"
                                max="1000"
                                value={set.reps}
                                onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                title="Repeticiones"
                              />
                              <span className="text-[10px] text-slate-500 font-semibold">reps</span>
                            </div>

                            <input
                              type="checkbox"
                              checked={set.completed}
                              onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'completed', e.target.checked)}
                              title="Serie completada"
                              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                            />

                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                title="Eliminar serie"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  id="btn-cancel-edit-session"
                  onClick={() => setSessionToEdit(null)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-save-edit-session"
                  className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isExpanded = !!expandedSessionIds[session.id];
            const completedSets = session.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
              0
            );

            return (
              <div
                key={session.id}
                id={`history-session-${session.id}`}
                className="bg-[#1E293B] border border-slate-700/50 hover:border-slate-600 rounded-3xl overflow-hidden shadow-xl shadow-black/20 transition-all"
              >
                {/* Session Card Header */}
                <div
                  onClick={() => toggleSessionExpand(session.id)}
                  className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none bg-[#1E293B] hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      <Calendar className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white capitalize">
                          {formatDate(session.date)}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {session.dayOfWeek}
                        </span>
                        {session.perceivedEffort && (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            RPE {session.perceivedEffort}/10
                          </span>
                        )}
                      </div>

                      {/* Summary Metrics Inline */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {session.durationMinutes} min
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-slate-200">{session.totalVolumeKg?.toLocaleString() || 0} kg</strong> volumen
                        </span>
                        <span>•</span>
                        <span>{completedSets} series</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-repeat-session-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFromHistorical(session);
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:border-slate-600 transition-colors"
                      title="Usar estas cargas como base"
                    >
                      <Play className="w-3 h-3 fill-current text-indigo-400" />
                      <span>Reanudar / Repetir</span>
                    </button>

                    <button
                      id={`btn-edit-session-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(session);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-900 hover:bg-indigo-950/40 hover:text-indigo-400 border border-slate-700 text-slate-300 transition-colors"
                      title="Modificar sesión"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-delete-session-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(session.id);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 transition-colors"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Session Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-700/50 bg-slate-950/40 space-y-4">
                    {/* General Notes */}
                    {session.generalNotes && (
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block mb-0.5">Notas de la sesión:</strong>
                          <p>{session.generalNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Warmup / Stretch Completion Badges */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 ${
                        session.warmupCompleted 
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' 
                          : 'bg-slate-900 border border-slate-700/50 text-slate-500'
                      }`}>
                        <Flame className="w-3.5 h-3.5" />
                        <span>Calentamiento: {session.warmupCompleted ? 'Completado' : 'Omitido'}</span>
                      </span>

                      <span className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 ${
                        session.stretchesCompleted 
                          ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' 
                          : 'bg-slate-900 border border-slate-700/50 text-slate-500'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Estiramientos: {session.stretchesCompleted ? 'Completados' : 'Omitidos'}</span>
                      </span>
                    </div>

                    {/* Exercises breakdown */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Desglose de Ejercicios y Cargas
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {session.exercises.map((ex) => (
                          <div
                            key={ex.exerciseId}
                            className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{ex.exerciseName}</span>
                              <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                                {ex.sets.filter((s) => s.completed).reduce((sum, s) => sum + s.weightKg * s.reps, 0)} kg
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {ex.sets.map((set) => (
                                <span
                                  key={set.setNumber}
                                  className={`text-[11px] font-mono px-2.5 py-1 rounded-xl border ${
                                    set.completed
                                      ? 'bg-slate-950 border-slate-700 text-slate-200'
                                      : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                                  }`}
                                >
                                  S{set.setNumber}: {set.weightKg > 0 ? `${set.weightKg}kg × ` : ''}{set.reps} {set.weightKg === 0 ? 'reps' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-12 text-center space-y-3 shadow-xl shadow-black/20">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-white">No hay sesiones en el historial</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Completa tu primera sesión del Plan Full-Body o importa un archivo de entrenamiento existente.
          </p>
        </div>
      )}
    </div>
  );
};
