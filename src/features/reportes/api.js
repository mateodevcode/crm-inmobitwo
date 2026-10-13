import { apiBackend } from "@/api/apiBackend.js";

async function get(ruta) {
  const res = await apiBackend(ruta);
  if (!res.success) throw new Error(res.error || "No se pudo cargar el reporte.");
  return res.data;
}

export function paramsReporte({ desde, hasta, asignado }) {
  const p = new URLSearchParams();
  if (desde) p.set("desde", desde);
  if (hasta) p.set("hasta", hasta);
  if (asignado) p.set("asignado", asignado);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const obtenerEmbudo = (f) => get(`/crm/reportes/embudo${paramsReporte(f)}`);
export const obtenerConversion = (f) => get(`/crm/reportes/conversion${paramsReporte(f)}`);
export const obtenerValorGanado = (f) => get(`/crm/reportes/valor-ganado${paramsReporte(f)}`);
export const obtenerActividad = (f) => get(`/crm/reportes/actividad${paramsReporte(f)}`);
export const obtenerLeadsOrigen = (f) => get(`/crm/reportes/leads-origen${paramsReporte(f)}`);

export function descargarCsv(nombre, filas, columnas) {
  const linea = (xs) => xs.map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`).join(";");
  const texto = [linea(columnas), ...filas.map((f) => linea(columnas.map((c) => f[c])))].join("\n");
  const blob = new Blob(["\uFEFF" + texto], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
