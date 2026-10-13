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
