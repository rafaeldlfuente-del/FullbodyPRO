import React, { useEffect, useState, useRef } from 'react';
import { Timer, X, Volume2, VolumeX, Plus, Minus, Check } from 'lucide-react';
import { playTickSound, playRestFinishedSound } from '../utils/audio';

interface RestTimerModalProps {
  initialSeconds: number;
  exerciseName?: string;
  nextSetNumber?: number;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  initialSeconds,
  exerciseName,
  nextSetNumber,
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioPlayedRef = useRef<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(initialSeconds);
      setTotalTime(initialSeconds);
      setIsMinimized(false);
      audioPlayedRef.current = {};
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const nextVal = prev - 1;

        if (soundEnabled) {
          // Warning ticks at 3, 2, 1
          if (nextVal <= 3 && nextVal > 0 && !audioPlayedRef.current[nextVal]) {
            audioPlayedRef.current[nextVal] = true;
            playTickSound();
          } else if (nextVal === 0 && !audioPlayedRef.current[0]) {
            audioPlayedRef.current[0] = true;
            playRestFinishedSound();
          }
        }

        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, soundEnabled, timeLeft]);

  if (!isOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, ((totalTime - timeLeft) / (totalTime || 1)) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAdjustTime = (delta: number) => {
    setTimeLeft((prev) => {
      const updated = Math.max(5, prev + delta);
      if (updated > totalTime) {
        setTotalTime(updated);
      }
      return updated;
    });
  };

  // If timer finished
  const isFinished = timeLeft <= 0;

  if (isMinimized) {
    return (
      <div 
        id="rest-timer-minimized"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#1E293B] border border-indigo-500/50 shadow-2xl shadow-indigo-950/50 text-white cursor-pointer hover:scale-105 transition-transform"
      >
        <Timer className={`w-5 h-5 ${isFinished ? 'text-emerald-400 animate-bounce' : 'text-indigo-400 animate-spin'}`} />
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Descanso</p>
          <p className={`text-base font-bold font-mono ${isFinished ? 'text-emerald-400' : 'text-white'}`}>
            {isFinished ? '¡A por la serie!' : formatTime(timeLeft)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="rest-timer-overlay"
      className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 shadow-2xl shadow-black/60 flex flex-col items-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Controls */}
        <div className="w-full flex items-center justify-between mb-4 z-10">
          <button
            id="btn-timer-toggle-sound"
            onClick={onToggleSound}
            className={`p-2 rounded-2xl border transition-colors ${
              soundEnabled 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                : 'bg-slate-900 border-slate-750 text-slate-500'
            }`}
            title={soundEnabled ? 'Silenciar avisos' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5 justify-center">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              Tiempo de Descanso
            </span>
          </div>

          <button
            id="btn-timer-close"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Cerrar temporizador"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exercise Context */}
        {exerciseName && (
          <div className="text-center mb-6">
            <p className="text-xs text-indigo-400 font-semibold">{exerciseName}</p>
            {nextSetNumber && (
              <p className="text-slate-400 text-xs mt-0.5">Siguiente: Serie {nextSetNumber}</p>
            )}
          </div>
        )}

        {/* Circular Progress & Countdown */}
        <div className="relative w-44 h-44 flex items-center justify-center my-2">
          {/* SVG Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`stroke-current transition-all duration-300 ${
                isFinished 
                  ? 'text-emerald-500' 
                  : timeLeft <= 5 
                    ? 'text-amber-500 animate-pulse' 
                    : 'text-indigo-500'
              }`}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isFinished ? (
              <div className="animate-bounce">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-400 mt-1">¡A levantar!</p>
              </div>
            ) : (
              <>
                <span className="text-4xl font-black tracking-tight font-mono text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {timeLeft <= 5 ? '¡Prepárate!' : 'Respira y descansa'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Adjust Buttons */}
        <div className="flex items-center gap-2 mt-4 mb-5">
          <button
            id="btn-timer-minus-15"
            onClick={() => handleAdjustTime(-15)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>15s</span>
          </button>
          <button
            id="btn-timer-plus-15"
            onClick={() => handleAdjustTime(15)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>15s</span>
          </button>
          <button
            id="btn-timer-plus-30"
            onClick={() => handleAdjustTime(30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>30s</span>
          </button>
        </div>

        {/* Main Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            id="btn-timer-minimize"
            onClick={() => setIsMinimized(true)}
            className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Minimizar
          </button>

          <button
            id="btn-timer-ready"
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xl shadow-indigo-600/30 transition-colors hover:scale-105"
          >
            {isFinished ? 'Continuar' : 'Saltar Descanso'}
          </button>
        </div>
      </div>
    </div>
  );
};
