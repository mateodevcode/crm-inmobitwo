// Métricas de las metas del equipo.
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";

export const METRICAS = [
  { clave: "visitas_realizadas", etiqueta: "Visitas realizadas", corta: "Visitas" },
  { clave: "captaciones", etiqueta: "Captaciones nuevas", corta: "Captaciones" },
  { clave: "contactos_nuevos", etiqueta: "Contactos nuevos", corta: "Contactos" },
  { clave: "oportunidades_ganadas", etiqueta: "Negocios ganados", corta: "Ganados" },
  { clave: "valor_ganado", etiqueta: "Valor ganado", corta: "Valor", dinero: true },
];

export const formatoMetrica = (m, v) => (m.dinero ? formatPrecioCompleto(Number(v) || 0) : Number(v ?? 0).toLocaleString("es-CO"));

// "2026-11" ± n meses
export function sumarMes(mes, n) {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const mesActual = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date()).slice(0, 7);

export const textoMes = (mes) =>
  new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${mes}-15T12:00:00Z`));
