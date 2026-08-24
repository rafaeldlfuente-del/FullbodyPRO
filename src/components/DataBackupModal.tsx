import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Database, 
  RefreshCw,
  Scale,
  Sparkles
} from 'lucide-react';
import { WorkoutSession, BodyMeasurement } from '../types';
import { 
  generateBackupJSON, 
  generateWorkoutCSV, 
  generateMeasurementsCSV,
  downloadFile, 
  validateAndParseImport, 
  UserPrefs 
} from '../utils/storage';

interface DataBackupModalProps {
  sessions: WorkoutSession[];
  measurements: BodyMeasurement[];
  userPrefs: UserPrefs;
  onImportData: (
    sessions: WorkoutSession[], 
    measurements: BodyMeasurement[], 
    mode: 'merge' | 'replace'
  ) => void;
  onResetToDemo: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  sessions,
  measurements,
  userPrefs,
  onImportData,
  onResetToDemo
}) => {
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    sessions: WorkoutSession[];
    measurements: BodyMeasurement[];
    count: number;
    measurementCount: number;
    filename: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Export JSON (Combined Workouts + Body Measurements)
  const handleExportJSON = () => {
    const jsonStr = generateBackupJSON(sessions, userPrefs, measurements);
    const filename = `fullbody_pro_backup_${todayStr}.json`;
    downloadFile(jsonStr, filename, 'application/json');
  };

  // 2. Export Workout CSV
  const handleExportWorkoutCSV = () => {
    const csvStr = generateWorkoutCSV(sessions);
    const filename = `fullbody_pro_entrenamientos_${todayStr}.csv`;
    downloadFile(csvStr, filename, 'text/csv;charset=utf-8;');
  };

  // 3. Export Body Measurements CSV
  const handleExportMeasurementsCSV = () => {
    const csvStr = generateMeasurementsCSV(measurements);
    const filename = `fullbody_pro_peso_medidas_${todayStr}.csv`;
    downloadFile(csvStr, filename, 'text/csv;charset=utf-8;');
  };

  // 4. Copy JSON to Clipboard
  const handleCopyJSON = () => {
    const jsonStr = generateBackupJSON(sessions, userPrefs, measurements);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // 5. File selection & Parsing
  const handleFileProcess = (file: File) => {
    setImportError(null);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setImportError('El archivo está vacío.');
        return;
      }

      const result = validateAndParseImport(content);
      if (result.success) {
        setImportPreview({
          sessions: result.sessions || [],
          measurements: result.measurements || [],
          count: result.count || 0,
          measurementCount: result.measurementCount || 0,
          filename: file.name
        });
      } else {
        setImportError(result.error || 'Error al validar el archivo de datos.');
      }
    };
    reader.onerror = () => {
      setImportError('Error al leer el archivo desde el dispositivo.');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Confirm Import
  const handleConfirmImport = (mode: 'merge' | 'replace') => {
    if (!importPreview) return;
    onImportData(importPreview.sessions, importPreview.measurements, mode);
    setImportSuccessMsg(
      mode === 'replace'
        ? `¡Datos restaurados con éxito! (${importPreview.count} sesiones y ${importPreview.measurementCount} registros de medidas).`
        : `¡Datos integrados al registro existente! (${importPreview.count} sesiones y ${importPreview.measurementCount} registros de medidas).`
    );
    setImportPreview(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Exportar & Importar Registro</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Tus datos se guardan de forma privada en tu dispositivo. Puedes descargar tu archivo completo con tus sesiones de entrenamiento, pesos y medidas corporales (pecho, bíceps, abdomen) para tener un respaldo total y restaurarlo cuando quieras.
        </p>
      </div>

      {/* Success Notification */}
      {importSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* Grid: Export vs Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================== */}
        {/* EXPORT CARD */}
        {/* ======================================================== */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">1. Descargar Archivo (Exportar)</h2>
                <p className="text-xs text-slate-400">Copia de seguridad completa de entrenamientos y medidas.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/50 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Sesiones registradas:</span>
                <strong className="text-white font-mono">{sessions.length} sesiones</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registros de peso & medidas:</span>
                <strong className="text-indigo-400 font-mono">{measurements.length} tomas</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Formato completo:</span>
                <span className="text-indigo-400 font-semibold font-mono">JSON Estructurado (.json)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hojas de cálculo:</span>
                <span className="text-emerald-400 font-semibold font-mono">Archivos CSV (.csv)</span>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="btn-download-json"
              onClick={handleExportJSON}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <FileJson className="w-4 h-4" />
              <span>Descargar Archivo Completo (.JSON)</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-download-workout-csv"
                onClick={handleExportWorkoutCSV}
                className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Exportar sesiones de gimnasio a CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV Entrenamientos</span>
              </button>

              <button
                id="btn-download-measurements-csv"
                onClick={handleExportMeasurementsCSV}
                className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Exportar peso y medidas a CSV"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>CSV Peso & Medidas</span>
              </button>
            </div>

            <button
              id="btn-copy-json"
              onClick={handleCopyJSON}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar JSON al portapapeles'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* IMPORT CARD */}
        {/* ======================================================== */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">2. Subir Archivo (Importar)</h2>
                <p className="text-xs text-slate-400">Restaura tus registros desde un archivo previo.</p>
              </div>
            </div>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drag & Drop Box */}
            <div
              id="drop-zone-workout-file"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <FileJson className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">
                Arrastra tu archivo .json aquí o haz clic para seleccionar
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Compatible con copias de entrenamientos y medidas
              </p>
            </div>

            {/* Error message */}
            {importError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Import Preview Modal / Box */}
            {importPreview && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    Archivo Válido Detectado
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{importPreview.filename}</span>
                </div>

                <div className="space-y-1 text-xs text-slate-200">
                  <p>• Sesiones de entrenamiento: <strong className="text-white font-mono">{importPreview.count}</strong></p>
                  <p>• Registros de peso y medidas: <strong className="text-indigo-400 font-mono">{importPreview.measurementCount}</strong></p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    id="btn-import-merge"
                    onClick={() => handleConfirmImport('merge')}
                    className="py-2 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Fusionar Datos
                  </button>

                  <button
                    id="btn-import-replace"
                    onClick={() => handleConfirmImport('replace')}
                    className="py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-colors"
                  >
                    Reemplazar Todo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              id="btn-trigger-file-select"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Explorar Archivos del Dispositivo
            </button>
          </div>
        </div>
      </div>

      {/* Extra Utilities */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Privacidad & Almacenamiento Local</h3>
            <p className="text-xs text-slate-400">Todos tus datos se procesan en tu navegador sin enviar registros a servidores externos.</p>
          </div>
        </div>

        <button
          id="btn-reset-demo-data"
          onClick={onResetToDemo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Restablecer Datos de Ejemplo</span>
        </button>
      </div>
    </div>
  );
};

