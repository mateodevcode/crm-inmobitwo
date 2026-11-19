// Estados de una visita: etiqueta y colores (bloque en la grilla + punto).
export const ESTADOS = {
  programada: {
    etiqueta: "Programada",
    bloque: "border-sky-500 bg-sky-50 text-sky-950 dark:bg-sky-950/60 dark:text-sky-50",
    punto: "bg-sky-500",
  },
  confirmada: {
    etiqueta: "Confirmada",
    bloque: "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-50",
    punto: "bg-emerald-500",
  },
  realizada: {
    etiqueta: "Realizada",
    bloque: "border-zinc-400 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    punto: "bg-zinc-400",
  },
  cancelada: {
    etiqueta: "Cancelada",
    bloque: "border-red-300 bg-red-50 text-red-900 line-through opacity-70 dark:bg-red-950/40 dark:text-red-100",
    punto: "bg-red-400",
  },
  no_asistio: {
    etiqueta: "No asistió",
    bloque: "border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950/50 dark:text-amber-50",
    punto: "bg-amber-500",
  },
};

export const ACTIVOS = ["programada", "confirmada"];

export const INTERES = [
  { valor: "alto", etiqueta: "Alto" },
  { valor: "medio", etiqueta: "Medio" },
  { valor: "bajo", etiqueta: "Bajo" },
  { valor: "ninguno", etiqueta: "Ninguno" },
];

export const DURACIONES = [15, 30, 45, 60, 90, 120];
export const RECORDATORIOS = [
  { valor: "", etiqueta: "Sin recordatorio" },
  { valor: "15", etiqueta: "15 min antes" },
  { valor: "30", etiqueta: "30 min antes" },
  { valor: "60", etiqueta: "1 hora antes" },
  { valor: "120", etiqueta: "2 horas antes" },
  { valor: "1440", etiqueta: "1 día antes" },
];
