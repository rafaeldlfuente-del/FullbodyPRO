import React from 'react';
import { 
  Dumbbell, 
  Flame, 
  TrendingUp, 
  History, 
  BookOpen, 
  Download, 
  Play,
  Calendar,
  Scale
} from 'lucide-react';
import { ActiveTab, WorkoutSession } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isWorkoutInProgress: boolean;
  sessions: WorkoutSession[];
  onStartNewWorkout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isWorkoutInProgress,
  sessions,
  onStartNewWorkout
}) => {
  // Calculate this week's workout count
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekCount = sessions.filter((s) => {
    const sDate = new Date(s.date);
    return sDate >= startOfWeek && s.completed;
  }).length;

  return (
    <header className="sticky top-0 z-40 bg-[#1E293B]/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between h-16">
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">FULLBODY<span className="text-indigo-400">PRO</span></span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">3 Días / Semana • ~40 min</p>
            </div>
          </div>

          {/* Right Action / Weekly adherence pill */}
          <div className="flex items-center gap-3">
            <div 
              title={`${thisWeekCount} de 3 sesiones recomendadas completadas esta semana`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300"
            >
              <Flame className={`w-4 h-4 ${thisWeekCount >= 3 ? 'text-amber-400 fill-amber-400' : 'text-orange-400'}`} />
              <span>Esta semana:</span>
              <span className="font-bold text-white">{thisWeekCount}/3</span>
              <span className="text-slate-400 text-[11px]">(L-M-V)</span>
            </div>

            {isWorkoutInProgress ? (
              <button
                id="btn-active-workout-header"
                onClick={() => setActiveTab('active')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 animate-pulse transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Sesión en curso</span>
              </button>
            ) : (
              <button
                id="btn-start-workout-nav"
                onClick={onStartNewWorkout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Entrenar Hoy</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-700/40">
          <button
            id="nav-tab-today"
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'today'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Inicio / Sesión</span>
          </button>

          {isWorkoutInProgress && (
            <button
              id="nav-tab-active"
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Modo Guiado</span>
            </button>
          )}

          <button
            id="nav-tab-measurements"
            onClick={() => setActiveTab('measurements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'measurements'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Peso & Medidas</span>
          </button>

          <button
            id="nav-tab-progression"
            onClick={() => setActiveTab('progression')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'progression'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progresión & PRs</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({sessions.length})</span>
          </button>

          <button
            id="nav-tab-plan"
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'plan'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Plan Completo</span>
          </button>

          <button
            id="nav-tab-backup"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'backup'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar / Importar</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
