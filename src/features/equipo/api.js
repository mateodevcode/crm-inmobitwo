import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerMiembros(orgId) {
  const res = await apiBackend(`/organizaciones/${orgId}/miembros`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar los miembros.");
  return res.data;
}

export async function agregarMiembro(orgId, { email, rol_en_org }) {
  const res = await apiBackend(`/organizaciones/${orgId}/miembros`, "POST", { email, rol_en_org });
  if (!res.success) throw new Error(res.error || "No se pudo agregar.");
  return res.data;
}

export async function actualizarMiembro(id, datos) {
  const res = await apiBackend(`/organizaciones/miembros/${id}`, "PATCH", datos);
  if (!res.success) throw new Error(res.error || "No se pudo actualizar.");
  return res.data;
}

export async function eliminarMiembro(id) {
  const res = await apiBackend(`/organizaciones/miembros/${id}`, "DELETE");
  if (!res.success) throw new Error(res.error || "No se pudo eliminar.");
  return res.data;
}

export async function obtenerCarga() {
  const res = await apiBackend("/crm/reportes/actividad");
  if (!res.success) throw new Error(res.error || "No se pudo cargar la actividad.");
  return res.data;
}

export async function reasignarMasivo(desde_id, hacia_id) {
  const res = await apiBackend("/crm/reasignar", "POST", { desde_id, hacia_id });
  if (!res.success) throw new Error(res.error || "No se pudo reasignar.");
  return res.data;
}

// ── Reparto de leads y metas ─────────────────────────────────────
const msg = (res, porDefecto) => (Array.isArray(res.error) ? res.error.join(" ") : res.error || porDefecto);

export async function obtenerReparto() {
  const res = await apiBackend("/crm/equipo/reparto");
  if (!res.success) throw new Error(msg(res, "No se pudo cargar el reparto."));
  return res.data;
}

export async function guardarReparto(datos) {
  const res = await apiBackend("/crm/equipo/reparto", "PUT", datos);
  if (!res.success) throw new Error(msg(res, "No se pudo guardar el reparto."));
  return res.data;
}

export async function repartirLeads() {
  const res = await apiBackend("/crm/equipo/repartir-leads", "POST");
  if (!res.success) throw new Error(msg(res, "No se pudieron repartir los leads."));
  return res.data;
}

export async function obtenerMetas(mes) {
  const res = await apiBackend(`/crm/equipo/metas${mes ? `?mes=${mes}` : ""}`);
  if (!res.success) throw new Error(msg(res, "No se pudieron cargar las metas."));
  return res.data;
}

export async function guardarMetas(datos) {
  const res = await apiBackend("/crm/equipo/metas", "PUT", datos);
  if (!res.success) throw new Error(msg(res, "No se pudieron guardar las metas."));
  return res.data;
}
