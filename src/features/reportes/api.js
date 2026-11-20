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

export const obtenerReporteAgentes = (f) => get(`/crm/reportes/agentes${paramsReporte(f)}`);
export const obtenerReporteInmuebles = (f) => get(`/crm/reportes/inmuebles${paramsReporte(f)}`);
export const obtenerReporteRespuesta = (f) => get(`/crm/reportes/respuesta${paramsReporte(f)}`);
