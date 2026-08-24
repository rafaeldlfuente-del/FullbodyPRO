import { WarmupExercise, WorkoutExerciseDef, StretchExercise } from '../types';

export const WARMUP_EXERCISES: WarmupExercise[] = [
  {
    id: 'warmup-1',
    name: 'Saltos suaves (jumping jacks)',
    repsOrDuration: '1 minuto',
    durationSeconds: 60,
    notes: 'Elevar frecuencia cardíaca gradualmente.',
    category: 'cardio'
  },
  {
    id: 'warmup-2',
    name: 'Movilidad de hombros',
    repsOrDuration: '2 x 10 (hacia adelante/atrás)',
    sets: 2,
    repsCount: 10,
    notes: 'Con gomas o sin peso para lubricar articulación glenohumeral.',
    category: 'mobility'
  },
  {
    id: 'warmup-3',
    name: 'Sentadillas sin peso',
    repsOrDuration: '2 x 12',
    sets: 2,
    repsCount: 12,
    notes: 'Enfócate en la técnica, profundidad y apertura de caderas.',
    category: 'mobility'
  },
  {
    id: 'warmup-4',
    name: 'Estocadas caminando',
    repsOrDuration: '2 x 10 (por pierna)',
    sets: 2,
    repsCount: 10,
    notes: 'Mantén el torso erguido y zancadas controladas.',
    category: 'mobility'
  },
  {
    id: 'warmup-5',
    name: 'Plancha dinámica',
    repsOrDuration: '30 segundos',
    durationSeconds: 30,
    notes: 'Alterna apoyo en manos y antebrazos manteniendo core firme.',
    category: 'core'
  },
  {
    id: 'warmup-6',
    name: 'Rotaciones de cadera',
    repsOrDuration: '2 x 10 (por lado)',
    sets: 2,
    repsCount: 10,
    notes: 'Para activar glúteos y prevenir lesiones lumbares.',
    category: 'mobility'
  }
];

export const WORKOUT_EXERCISES: WorkoutExerciseDef[] = [
  {
    id: 'ex-squat',
    name: 'Sentadillas con mancuernas',
    targetSets: 4,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 90,
    notes: 'Pies al ancho de los hombros, baja hasta 90°. Pecho erguido.',
    focus: 'Hipertrofia',
    equipment: 'Mancuernas',
    muscleGroup: 'Piernas / Cuádriceps y Glúteos'
  },
  {
    id: 'ex-pushups',
    name: 'Flexiones',
    targetSets: 3,
    targetReps: '10-12',
    minReps: 10,
    maxReps: 12,
    restSeconds: 60,
    notes: 'Si es fácil, hazlas con pies elevados o peso en la espalda.',
    focus: 'Hipertrofia',
    equipment: 'Peso corporal / Lastre',
    muscleGroup: 'Pecho / Tríceps / Hombros'
  },
  {
    id: 'ex-row',
    name: 'Remo con gomas',
    targetSets: 3,
    targetReps: '10-12',
    minReps: 10,
    maxReps: 12,
    restSeconds: 60,
    notes: 'Espalda recta, tira las gomas hacia el abdomen retrayendo escápulas.',
    focus: 'Hipertrofia',
    equipment: 'Gomas elásticas / Mancuerna',
    muscleGroup: 'Espalda / Dorsal / Bíceps'
  },
  {
    id: 'ex-military-press',
    name: 'Press militar',
    targetSets: 4,
    targetReps: '6-8',
    minReps: 6,
    maxReps: 8,
    restSeconds: 90,
    notes: 'Controla el movimiento, sin arquear la espalda. Core y glúteos activos.',
    focus: 'Fuerza',
    equipment: 'Mancuernas / Barra',
    muscleGroup: 'Hombros / Deltoides / Tríceps'
  },
  {
    id: 'ex-plank',
    name: 'Plancha abdominal',
    targetSets: 3,
    targetReps: '30-45 seg',
    minReps: 30,
    maxReps: 45,
    restSeconds: 30,
    notes: 'Mantén el cuerpo completamente alineado, glúteos y abdomen apretados.',
    focus: 'Core',
    equipment: 'Esterilla / Suelo',
    muscleGroup: 'Core / Abdomen profundo',
    isTimed: true
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Peso muerto rumano',
    targetSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 90,
    notes: 'Piernas semi-flexionadas, lleva las caderas hacia atrás sintiendo isquios.',
    focus: 'Hipertrofia',
    equipment: 'Mancuernas / Barra',
    muscleGroup: 'Isquiotibiales / Glúteos / Cadena posterior'
  },
  {
    id: 'ex-lateral-raises',
    name: 'Elevaciones laterales',
    targetSets: 3,
    targetReps: '12-15',
    minReps: 12,
    maxReps: 15,
    restSeconds: 45,
    notes: 'Usa mancuernas ligeras, controla el movimiento y la fase excéntrica.',
    focus: 'Hipertrofia',
    equipment: 'Mancuernas ligeras',
    muscleGroup: 'Deltoides lateral'
  }
];

export const STRETCH_EXERCISES: StretchExercise[] = [
  {
    id: 'stretch-quads',
    area: 'Piernas (cuádriceps)',
    name: 'Estiramiento de cuádriceps (de pie)',
    duration: '30 seg / pierna',
    durationSeconds: 30,
    isBilateral: true,
    notes: 'Sujeta el pie hacia el glúteo manteniendo rodillas juntas.'
  },
  {
    id: 'stretch-hamstrings',
    area: 'Isquiotibiales',
    name: 'Toque de puntas (sentado o de pie)',
    duration: '30 segundos',
    durationSeconds: 30,
    isBilateral: false,
    notes: 'Mantén las piernas rectas sin bloquear en exceso y respira profundo.'
  },
  {
    id: 'stretch-back',
    area: 'Espalda',
    name: 'Estiramiento de gato-vaca',
    duration: '30 segundos',
    durationSeconds: 30,
    isBilateral: false,
    notes: 'Arquea y redondea la espalda lentamente en cuadrupedia.'
  },
  {
    id: 'stretch-chest',
    area: 'Hombros / Pecho',
    name: 'Brazo en la pared (estiramiento de pectoral)',
    duration: '30 seg / lado',
    durationSeconds: 30,
    isBilateral: true,
    notes: 'Coloca el antebrazo en la pared y gira el torso suavemente hacia afuera.'
  },
  {
    id: 'stretch-triceps',
    area: 'Tríceps',
    name: 'Estiramiento de tríceps (brazo detrás de la cabeza)',
    duration: '30 seg / lado',
    durationSeconds: 30,
    isBilateral: true,
    notes: 'Empuja el codo suavemente hacia abajo con la otra mano.'
  },
  {
    id: 'stretch-lowerback',
    area: 'Lumbares',
    name: 'Rodillas al pecho (tumbado)',
    duration: '30 segundos',
    durationSeconds: 30,
    isBilateral: false,
    notes: 'Abraza las rodillas contra el pecho sintiendo alivio lumbar.'
  }
];

export const TRAINING_TIPS = [
  {
    title: 'Prioriza la técnica',
    desc: 'Si no puedes hacer las repeticiones con buena forma, baja el peso inmediatamente para prevenir sobrecargas y maximizar el estímulo.',
    tag: 'Técnica'
  },
  {
    title: 'Anota tus pesos y reps',
    desc: 'Registra en cada sesión lo que levantas para aplicar sobrecarga progresiva sistemática semana tras semana.',
    tag: 'Progresión'
  },
  {
    title: 'Control de la respiración',
    desc: 'Exhala al realizar la fase concéntrica/esfuerzo (ej: al subir en press militar o sentadilla), e inhala al bajar controladamente.',
    tag: 'Rendimiento'
  }
];
