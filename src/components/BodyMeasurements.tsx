import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Ruler, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  FileText, 
  Activity, 
  HelpCircle, 
  Check, 
  X,
  Sparkles,
  Minus
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { BodyMeasurement } from '../types';

interface BodyMeasurementsProps {
  measurements: BodyMeasurement[];
  onAddMeasurement: (measurement: BodyMeasurement) => void;
  onUpdateMeasurement: (measurement: BodyMeasurement) => void;
  onDeleteMeasurement: (id: string) => void;
}

type ChartMetric = 'all' | 'weight' | 'chest' | 'biceps' | 'abdomen';

export const BodyMeasurements: React.FC<BodyMeasurementsProps> = ({
  measurements,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement
}) => {
  const [selectedChartMetric, setSelectedChartMetric] = useState<ChartMetric>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formWeight, setFormWeight] = useState<string>('');
  const [formChest, setFormChest] = useState<string>('');
  const [formBiceps, setFormBiceps] = useState<string>('');
  const [formAbdomen, setFormAbdomen] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Sort chronological for calculations and charts
  const sortedChronological = useMemo(() => {
    return [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements]);

  // Sort reverse-chronological for history list
  const sortedReverse = useMemo(() => {
    return [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [measurements]);

  // Key metrics calculation
  const stats = useMemo(() => {
    if (sortedChronological.length === 0) return null;

    const first = sortedChronological[0];
    const latest = sortedChronological[sortedChronological.length - 1];
    const previous = sortedChronological.length > 1 ? sortedChronological[sortedChronological.length - 2] : null;

    const calcDiff = (curr?: number, prev?: number) => {
      if (curr === undefined || prev === undefined) return null;
      return Math.round((curr - prev) * 10) / 10;
    };

    return {
      latest,
      weight: {
        current: latest.weightKg,
        diffPrev: previous ? calcDiff(latest.weightKg, previous.weightKg) : null,
        diffTotal: calcDiff(latest.weightKg, first.weightKg)
      },
      chest: {
        current: latest.chestCm,
        diffPrev: previous ? calcDiff(latest.chestCm, previous.chestCm) : null,
        diffTotal: calcDiff(latest.chestCm, first.chestCm)
      },
      biceps: {
        current: latest.bicepsCm,
        diffPrev: previous ? calcDiff(latest.bicepsCm, previous.bicepsCm) : null,
        diffTotal: calcDiff(latest.bicepsCm, first.bicepsCm)
      },
      abdomen: {
        current: latest.abdomenCm,
        diffPrev: previous ? calcDiff(latest.abdomenCm, previous.abdomenCm) : null,
        diffTotal: calcDiff(latest.abdomenCm, first.abdomenCm)
      }
    };
  }, [sortedChronological]);

  // Chart data
  const chartData = useMemo(() => {
    return sortedChronological.map((m) => {
      const parts = m.date.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : m.date;

      return {
        date: formattedDate,
        fullDate: m.date,
        peso: m.weightKg ?? null,
        pecho: m.chestCm ?? null,
        biceps: m.bicepsCm ?? null,
        abdomen: m.abdomenCm ?? null
      };
    });
  }, [sortedChronological]);

  // Open modal for new entry
  const handleOpenAddModal = () => {
    setEditingMeasurement(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    // Pre-fill with latest values as quick starting point
    const latest = sortedReverse[0];
    setFormWeight(latest?.weightKg ? String(latest.weightKg) : '');
    setFormChest(latest?.chestCm ? String(latest.chestCm) : '');
    setFormBiceps(latest?.bicepsCm ? String(latest.bicepsCm) : '');
    setFormAbdomen(latest?.abdomenCm ? String(latest.abdomenCm) : '');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: BodyMeasurement) => {
    setEditingMeasurement(item);
    setFormDate(item.date);
    setFormWeight(item.weightKg !== undefined ? String(item.weightKg) : '');
    setFormChest(item.chestCm !== undefined ? String(item.chestCm) : '');
    setFormBiceps(item.bicepsCm !== undefined ? String(item.bicepsCm) : '');
    setFormAbdomen(item.abdomenCm !== undefined ? String(item.abdomenCm) : '');
    setFormNotes(item.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formDate) {
      setFormError('Por favor selecciona una fecha.');
      return;
    }

    const weight = formWeight ? parseFloat(formWeight.replace(',', '.')) : undefined;
    const chest = formChest ? parseFloat(formChest.replace(',', '.')) : undefined;
    const biceps = formBiceps ? parseFloat(formBiceps.replace(',', '.')) : undefined;
    const abdomen = formAbdomen ? parseFloat(formAbdomen.replace(',', '.')) : undefined;

    if (
      (weight === undefined || isNaN(weight)) &&
      (chest === undefined || isNaN(chest)) &&
      (biceps === undefined || isNaN(biceps)) &&
      (abdomen === undefined || isNaN(abdomen))
    ) {
      setFormError('Debes ingresar al menos una métrica (peso, pecho, bíceps o abdomen).');
      return;
    }

    if (editingMeasurement) {
      onUpdateMeasurement({
        ...editingMeasurement,
        date: formDate,
        weightKg: weight && !isNaN(weight) ? Math.round(weight * 10) / 10 : undefined,
        chestCm: chest && !isNaN(chest) ? Math.round(chest * 10) / 10 : undefined,
        bicepsCm: biceps && !isNaN(biceps) ? Math.round(biceps * 10) / 10 : undefined,
        abdomenCm: abdomen && !isNaN(abdomen) ? Math.round(abdomen * 10) / 10 : undefined,
        notes: formNotes.trim() || undefined
      });
    } else {
      onAddMeasurement({
        id: `meas-${Date.now()}`,
        date: formDate,
        weightKg: weight && !isNaN(weight) ? Math.round(weight * 10) / 10 : undefined,
        chestCm: chest && !isNaN(chest) ? Math.round(chest * 10) / 10 : undefined,
        bicepsCm: biceps && !isNaN(biceps) ? Math.round(biceps * 10) / 10 : undefined,
        abdomenCm: abdomen && !isNaN(abdomen) ? Math.round(abdomen * 10) / 10 : undefined,
        notes: formNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      });
    }

    setIsModalOpen(false);
  };

  const formatDisplayDate = (isoDate: string) => {
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  // Helper badge for difference
  const renderDiffBadge = (diff: number | null, unit: string, isInverse: boolean = false) => {
    if (diff === null || diff === 0) {
      return (
        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
          = 0 {unit}
        </span>
      );
    }

    // For waist/abdomen, reduction is positive (green). For chest/biceps, gain is positive (green).
    const isPositiveChange = isInverse ? diff < 0 : diff > 0;
    const sign = diff > 0 ? '+' : '';

    return (
      <span
        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
          isPositiveChange
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
        }`}
      >
        {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{sign}{diff} {unit}</span>
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Control de Peso & Medidas</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Seguimiento continuo de peso corporal, pecho, bíceps y abdomen para evaluar tu recomposición corporal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-measurement-tips"
            onClick={() => setShowTipsModal(true)}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Guía para tomar medidas correctamente"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </button>

          <button
            id="btn-add-measurement-header"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Medida</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PESO */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              Peso Corporal
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Báscula</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {stats?.weight.current ? `${stats.weight.current}` : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">kg</span>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Último cambio:</span>
            {stats && renderDiffBadge(stats.weight.diffPrev, 'kg')}
          </div>

          {stats?.weight.diffTotal !== null && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Total desde inicio:</span>
              <span className="font-mono text-slate-300 font-semibold">
                {stats?.weight.diffTotal && stats.weight.diffTotal > 0 ? `+${stats.weight.diffTotal}` : stats?.weight.diffTotal} kg
              </span>
            </div>
          )}
        </div>

        {/* PECHO */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-4 h-4" />
              Pecho / Pectoral
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Contorno</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {stats?.chest.current ? `${stats.chest.current}` : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">cm</span>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Último cambio:</span>
            {stats && renderDiffBadge(stats.chest.diffPrev, 'cm')}
          </div>

          {stats?.chest.diffTotal !== null && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Total desde inicio:</span>
              <span className="font-mono text-slate-300 font-semibold">
                {stats?.chest.diffTotal && stats.chest.diffTotal > 0 ? `+${stats.chest.diffTotal}` : stats?.chest.diffTotal} cm
              </span>
            </div>
          )}
        </div>

        {/* BÍCEPS */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Bíceps / Brazo
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Contorno</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {stats?.biceps.current ? `${stats.biceps.current}` : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">cm</span>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Último cambio:</span>
            {stats && renderDiffBadge(stats.biceps.diffPrev, 'cm')}
          </div>

          {stats?.biceps.diffTotal !== null && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Total desde inicio:</span>
              <span className="font-mono text-slate-300 font-semibold">
                {stats?.biceps.diffTotal && stats.biceps.diffTotal > 0 ? `+${stats.biceps.diffTotal}` : stats?.biceps.diffTotal} cm
              </span>
            </div>
          )}
        </div>

        {/* ABDOMEN */}
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Abdomen / Cintura
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Ombligo</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {stats?.abdomen.current ? `${stats.abdomen.current}` : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">cm</span>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Último cambio:</span>
            {stats && renderDiffBadge(stats.abdomen.diffPrev, 'cm', true)}
          </div>

          {stats?.abdomen.diffTotal !== null && (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Total desde inicio:</span>
              <span className="font-mono text-slate-300 font-semibold">
                {stats?.abdomen.diffTotal && stats.abdomen.diffTotal > 0 ? `+${stats.abdomen.diffTotal}` : stats?.abdomen.diffTotal} cm
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Evolution Chart Section */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Evolución en el Tiempo</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Progreso gráfico de tus medidas corporales</p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-700/60 overflow-x-auto">
            <button
              id="chart-filter-all"
              onClick={() => setSelectedChartMetric('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChartMetric === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              id="chart-filter-weight"
              onClick={() => setSelectedChartMetric('weight')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChartMetric === 'weight'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Peso (kg)
            </button>
            <button
              id="chart-filter-chest"
              onClick={() => setSelectedChartMetric('chest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChartMetric === 'chest'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pecho (cm)
            </button>
            <button
              id="chart-filter-biceps"
              onClick={() => setSelectedChartMetric('biceps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChartMetric === 'biceps'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bíceps (cm)
            </button>
            <button
              id="chart-filter-abdomen"
              onClick={() => setSelectedChartMetric('abdomen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChartMetric === 'abdomen'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Abdomen (cm)
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} ${name.includes('Peso') ? 'kg' : 'cm'}`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {(selectedChartMetric === 'all' || selectedChartMetric === 'weight') && (
                  <Line
                    type="monotone"
                    dataKey="peso"
                    name="Peso (kg)"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#6366f1' }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                )}

                {(selectedChartMetric === 'all' || selectedChartMetric === 'chest') && (
                  <Line
                    type="monotone"
                    dataKey="pecho"
                    name="Pecho (cm)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}

                {(selectedChartMetric === 'all' || selectedChartMetric === 'biceps') && (
                  <Line
                    type="monotone"
                    dataKey="biceps"
                    name="Bíceps (cm)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}

                {(selectedChartMetric === 'all' || selectedChartMetric === 'abdomen') && (
                  <Line
                    type="monotone"
                    dataKey="abdomen"
                    name="Abdomen (cm)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#06b6d4' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Scale className="w-8 h-8 opacity-40" />
              <p className="text-xs">No hay datos suficientes para graficar</p>
            </div>
          )}
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Historial de Registros</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Total de {measurements.length} tomas de medidas registradas
            </p>
          </div>

          <button
            id="btn-add-measurement-inline"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Registro</span>
          </button>
        </div>

        {sortedReverse.length > 0 ? (
          <div className="space-y-3">
            {sortedReverse.map((item, index) => {
              // Calculate difference against next older item in array
              const olderItem = sortedReverse[index + 1];

              return (
                <div
                  key={item.id}
                  id={`measurement-row-${item.id}`}
                  className="bg-slate-900 border border-slate-700/50 hover:border-slate-600 p-4 sm:p-5 rounded-2xl transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white capitalize block">
                          {formatDisplayDate(item.date)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`btn-edit-measurement-${item.id}`}
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title="Editar registro"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`btn-delete-measurement-${item.id}`}
                        onClick={() => setMeasurementToDelete(item.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metric values pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {/* Peso */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Peso</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-black text-white font-mono">
                          {item.weightKg ? `${item.weightKg} kg` : '-'}
                        </span>
                        {item.weightKg && olderItem?.weightKg && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.weightKg - olderItem.weightKg > 0 ? `+${(item.weightKg - olderItem.weightKg).toFixed(1)}` : (item.weightKg - olderItem.weightKg).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pecho */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pecho</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-black text-amber-400 font-mono">
                          {item.chestCm ? `${item.chestCm} cm` : '-'}
                        </span>
                        {item.chestCm && olderItem?.chestCm && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.chestCm - olderItem.chestCm > 0 ? `+${(item.chestCm - olderItem.chestCm).toFixed(1)}` : (item.chestCm - olderItem.chestCm).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bíceps */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bíceps</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {item.bicepsCm ? `${item.bicepsCm} cm` : '-'}
                        </span>
                        {item.bicepsCm && olderItem?.bicepsCm && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.bicepsCm - olderItem.bicepsCm > 0 ? `+${(item.bicepsCm - olderItem.bicepsCm).toFixed(1)}` : (item.bicepsCm - olderItem.bicepsCm).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Abdomen */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Abdomen</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-black text-cyan-400 font-mono">
                          {item.abdomenCm ? `${item.abdomenCm} cm` : '-'}
                        </span>
                        {item.abdomenCm && olderItem?.abdomenCm && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.abdomenCm - olderItem.abdomenCm > 0 ? `+${(item.abdomenCm - olderItem.abdomenCm).toFixed(1)}` : (item.abdomenCm - olderItem.abdomenCm).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Scale className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-white">No hay registros corporales aún</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Empieza registrando tu peso y contornos hoy para ver tu progreso con el paso de las semanas.
            </p>
            <button
              id="btn-add-first-measurement"
              onClick={handleOpenAddModal}
              className="mt-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Crear Primer Registro
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-black/80 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingMeasurement ? 'Editar Registro de Medidas' : 'Nuevo Registro de Medidas'}
                  </h3>
                  <p className="text-xs text-slate-400">Introduce las mediciones del día</p>
                </div>
              </div>

              <button
                id="btn-close-measurement-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Fecha de la medición
                </label>
                <input
                  type="date"
                  id="input-measurement-date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-semibold rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="input-measurement-weight"
                    placeholder="ej. 78.5"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-mono font-bold rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>

                {/* Chest */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    Pecho (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="input-measurement-chest"
                    placeholder="ej. 102.5"
                    value={formChest}
                    onChange={(e) => setFormChest(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-mono font-bold rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-600"
                  />
                </div>

                {/* Biceps */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Bíceps (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="input-measurement-biceps"
                    placeholder="ej. 34.8"
                    value={formBiceps}
                    onChange={(e) => setFormBiceps(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-mono font-bold rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
                  />
                </div>

                {/* Abdomen */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Abdomen (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="input-measurement-abdomen"
                    placeholder="ej. 84.0"
                    value={formAbdomen}
                    onChange={(e) => setFormAbdomen(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-mono font-bold rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Notas u Observaciones (opcional)
                </label>
                <input
                  type="text"
                  id="input-measurement-notes"
                  placeholder="ej. En ayunas por la mañana, buena definición"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-2xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  id="btn-cancel-measurement-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-save-measurement-modal"
                  className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  {editingMeasurement ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {measurementToDelete && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl shadow-black/60 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">¿Eliminar este registro?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Esta acción eliminará de forma permanente los datos de medidas de esta fecha.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-cancel-delete-measurement"
                onClick={() => setMeasurementToDelete(null)}
                className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-delete-measurement"
                onClick={() => {
                  onDeleteMeasurement(measurementToDelete);
                  setMeasurementToDelete(null);
                }}
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-xl shadow-rose-600/30 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MEASUREMENT TIPS MODAL */}
      {/* ======================================================== */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Consejos para medir con precisión</h3>
              </div>
              <button
                id="btn-close-tips-modal"
                onClick={() => setShowTipsModal(false)}
                className="p-2 rounded-2xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <strong className="text-white block mb-1">⚖️ Peso Corporal:</strong>
                Pésate siempre por la mañana, en ayunas, tras ir al baño y sin ropa para evitar oscilaciones de líquidos o digestiones.
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <strong className="text-amber-400 block mb-1">📐 Pecho:</strong>
                Coloca la cinta métrica horizontalmente a la altura de la línea de los pezones, con los brazos relajados y respiración normal (sin inflar excesivamente el tórax).
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">💪 Bíceps:</strong>
                Flexiona el brazo en 90° apretando el músculo y mide en el punto de mayor relieve o pico del bíceps.
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <strong className="text-cyan-400 block mb-1">🌀 Abdomen / Cintura:</strong>
                Mide a la altura del ombligo, manteniendo la postura erguida y el abdomen relajado sin meter tripa.
              </div>
            </div>

            <button
              id="btn-dismiss-tips"
              onClick={() => setShowTipsModal(false)}
              className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
