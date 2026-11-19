// src/utils/agenda.js — fechas de la agenda en hora de Bogotá.
//
// Colombia no tiene horario de verano: siempre UTC−5. Todo se calcula con ese
// desfase fijo, así la agenda se ve igual aunque el navegador esté en otra zona.
// "Día" = clave "aaaa-mm-dd" en hora de Bogotá.
import { LOCALE, ZONA_HORARIA } from "@/config/config.js";

const OFFSET = "-05:00";
const MS_DIA = 86400000;

const fmtClave = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA });
const fmtHora = new Intl.DateTimeFormat(LOCALE, {
  timeZone: ZONA_HORARIA,
  hour: "numeric",
  minute: "2-digit",
});
const fmtDiaLargo = new Intl.DateTimeFormat(LOCALE, {
  timeZone: ZONA_HORARIA,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const fmtDiaCorto = new Intl.DateTimeFormat(LOCALE, {
  timeZone: ZONA_HORARIA,
  weekday: "short",
  day: "numeric",
});
const fmtMes = new Intl.DateTimeFormat(LOCALE, {
  timeZone: ZONA_HORARIA,
  month: "long",
  year: "numeric",
});

// Fecha (Date o ISO) → "aaaa-mm-dd" en Bogotá.
export const claveDia = (fecha = new Date()) => fmtClave.format(new Date(fecha));
export const hoy = () => claveDia();

// "aaaa-mm-dd" ± n días (aritmética en UTC sobre la clave: sin saltos de zona).
export function sumarDias(clave, n) {
  const d = new Date(`${clave}T12:00:00Z`);
  return new Date(d.getTime() + n * MS_DIA).toISOString().slice(0, 10);
}

// Lunes de la semana de la clave (semana colombiana: lunes a domingo).
export function lunesDe(clave) {
  const dow = new Date(`${clave}T12:00:00Z`).getUTCDay(); // 0 = domingo
  return sumarDias(clave, dow === 0 ? -6 : 1 - dow);
}

export const diasDeSemana = (clave) => {
  const lunes = lunesDe(clave);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
};

// Fecha "aaaa-mm-dd" + hora "HH:MM" de Bogotá → ISO con zona para el backend.
export const isoBogota = (clave, hora) => `${clave}T${hora}:00${OFFSET}`;

// Minutos desde la medianoche de Bogotá (para posicionar en la grilla).
export function minutosDelDia(fecha) {
  const d = new Date(new Date(fecha).getTime() - 5 * 3600000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

// "HH:MM" de Bogotá para inputs type=time.
export function horaInput(fecha) {
  const m = minutosDelDia(fecha);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export const duracionMin = (inicio, fin) =>
  Math.round((new Date(fin) - new Date(inicio)) / 60000);

export const textoHora = (fecha) => fmtHora.format(new Date(fecha));
export const textoRangoHora = (inicio, fin) => `${textoHora(inicio)} – ${textoHora(fin)}`;
export const textoDiaLargo = (clave) => fmtDiaLargo.format(new Date(isoBogota(clave, "12:00")));
export const textoDiaCorto = (clave) => fmtDiaCorto.format(new Date(isoBogota(clave, "12:00")));
export const textoMes = (clave) => fmtMes.format(new Date(isoBogota(clave, "12:00")));

// "Esta semana: 17 – 23 de noviembre de 2026"
export function textoSemana(clave) {
  const dias = diasDeSemana(clave);
  const ini = new Date(isoBogota(dias[0], "12:00"));
  const fin = new Date(isoBogota(dias[6], "12:00"));
  const f = (d, opts) => new Intl.DateTimeFormat(LOCALE, { timeZone: ZONA_HORARIA, ...opts }).format(d);
  const mismoMes = dias[0].slice(0, 7) === dias[6].slice(0, 7);
  return mismoMes
    ? `${f(ini, { day: "numeric" })} – ${f(fin, { day: "numeric", month: "long", year: "numeric" })}`
    : `${f(ini, { day: "numeric", month: "short" })} – ${f(fin, { day: "numeric", month: "short", year: "numeric" })}`;
}
