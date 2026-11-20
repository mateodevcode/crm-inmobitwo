// src/utils/fechas.js — es-CO, America/Bogota, dd/mm/aaaa
import { ZONA_HORARIA } from "@/config/config.js";

export function formatoFecha(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatoFechaHora(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// "hace 5 min", "hace 3 h", "ayer", luego dd/mm/aaaa.
export function tiempoRelativo(iso, ahora = Date.now()) {
  if (!iso) return "";
  const seg = Math.max(0, Math.round((ahora - new Date(iso).getTime()) / 1000));
  if (seg < 60) return "hace un momento";
  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  return formatoFecha(iso);
}
