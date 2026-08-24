import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardHome } from './components/DashboardHome';
import { ActiveWorkout } from './components/ActiveWorkout';
import { PlanOverview } from './components/PlanOverview';
import { ProgressionCharts } from './components/ProgressionCharts';
import { WorkoutHistory } from './components/WorkoutHistory';
import { BodyMeasurements } from './components/BodyMeasurements';
import { DataBackupModal } from './components/DataBackupModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { 
  ActiveTab, 
  WorkoutSession, 
  BodyMeasurement,
  DayOfWeek 
} from './types';
import { 
  loadStoredSessions, 
  saveStoredSessions, 
  loadStoredMeasurements,
  saveStoredMeasurements,
  loadUserPrefs, 
  saveUserPrefs, 
  UserPrefs,
  getSuggestedDayOfWeek 
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadStoredSessions());
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => loadStoredMeasurements());
  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() => loadUserPrefs());
  const [currentActiveSession, setCurrentActiveSession] = useState<WorkoutSession | null>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  // Sync body measurements to localStorage
  useEffect(() => {
    saveStoredMeasurements(measurements);
  }, [measurements]);

  // Sync prefs to localStorage
  useEffect(() => {
    saveUserPrefs(userPrefs);
  }, [userPrefs]);

  // Start new workout
  const handleStartWorkout = (day?: DayOfWeek) => {
    const chosenDay = day || getSuggestedDayOfWeek();
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: chosenDay,
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      completed: false,
      warmupCompleted: false,
      stretchesCompleted: false,
      exercises: [],
      totalVolumeKg: 0,
      totalSets: 0
    };

    setCurrentActiveSession(newSession);
    setActiveTab('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start from historical session (loads previous weights as template)
  const handleStartFromHistorical = (historicalSession: WorkoutSession) => {
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: historicalSession.dayOfWeek,
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      completed: false,
      warmupCompleted: false,
      stretchesCompleted: false,
      exercises: historicalSession.exercises.map((ex) => ({
        ...ex,
        completed: false,
        sets: ex.sets.map((s) => ({
          ...s,
          completed: false
        }))
      })),
      totalVolumeKg: 0,
      totalSets: 0
    };

    setCurrentActiveSession(newSession);
    setActiveTab('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save completed session
  const handleSaveSession = (completedSession: WorkoutSession) => {
    setSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === completedSession.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = completedSession;
        return updated;
      }
      return [completedSession, ...prev];
    });

    setCurrentActiveSession(null);
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel in-progress session
  const handleCancelSession = () => {
    setCurrentActiveSession(null);
    setActiveTab('today');
  };

  // Delete historical session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Update historical session
  const handleUpdateSession = (updatedSession: WorkoutSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
  };

  // Body Measurements Handlers
  const handleAddMeasurement = (newM: BodyMeasurement) => {
    setMeasurements((prev) => [newM, ...prev]);
  };

  const handleUpdateMeasurement = (updatedM: BodyMeasurement) => {
    setMeasurements((prev) =>
      prev.map((m) => (m.id === updatedM.id ? updatedM : m))
    );
  };

  const handleDeleteMeasurement = (measurementId: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
  };

  // Import data (Sessions & Measurements)
  const handleImportData = (
    importedSessions: WorkoutSession[], 
    importedMeasurements: BodyMeasurement[], 
    mode: 'merge' | 'replace'
  ) => {
    if (mode === 'replace') {
      setSessions(importedSessions);
      setMeasurements(importedMeasurements);
    } else {
      // Merge sessions
      setSessions((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newOnes = importedSessions.filter((s) => !existingIds.has(s.id));
        return [...newOnes, ...prev];
      });
      // Merge measurements
      setMeasurements((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newOnes = importedMeasurements.filter((m) => !existingIds.has(m.id));
        return [...newOnes, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      });
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    localStorage.removeItem('fullbody_pro_workouts_v1');
    localStorage.removeItem('fullbody_pro_measurements_v1');
    setSessions([]);
    setMeasurements([]);
  };

  const handleToggleSound = () => {
    setUserPrefs((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWorkoutInProgress={currentActiveSession !== null}
        sessions={sessions}
        onStartNewWorkout={() => handleStartWorkout()}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full">
        {activeTab === 'today' && (
          <DashboardHome
            sessions={sessions}
            onStartWorkout={handleStartWorkout}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'active' && (
          <ActiveWorkout
            currentSession={currentActiveSession}
            sessions={sessions}
            userPrefs={userPrefs}
            onSaveSession={handleSaveSession}
            onCancelSession={handleCancelSession}
            onToggleSound={handleToggleSound}
          />
        )}

        {activeTab === 'measurements' && (
          <BodyMeasurements
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onUpdateMeasurement={handleUpdateMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
          />
        )}

        {activeTab === 'plan' && (
          <PlanOverview
            onStartWorkout={handleStartWorkout}
          />
        )}

        {activeTab === 'progression' && (
          <ProgressionCharts
            sessions={sessions}
          />
        )}

        {activeTab === 'history' && (
          <WorkoutHistory
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={handleUpdateSession}
            onStartFromHistorical={handleStartFromHistorical}
          />
        )}

        {activeTab === 'backup' && (
          <DataBackupModal
            sessions={sessions}
            measurements={measurements}
            userPrefs={userPrefs}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* PWA Installation Banner for Mobile & Desktop */}
      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B1120] py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">FullBody <span className="text-indigo-400 font-bold">PRO</span> • Plan de Entrenamiento 3 días + Control de Peso y Medidas</p>
        <p className="text-[11px] text-slate-500 mt-1">Almacenamiento local privado con opción de exportar e importar entrenamientos y medidas corporales.</p>
      </footer>
    </div>
  );
}

