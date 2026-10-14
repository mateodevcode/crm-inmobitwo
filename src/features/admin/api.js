import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerOrganizaciones(estado) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  const qs = params.toString();
  const res = await apiBackend(`/organizaciones${qs ? `?${qs}` : ""}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las inmobiliarias.");
  return res.data;
}

export async function crearOrganizacion(datos) {
  const res = await apiBackend("/organizaciones", "POST", datos);
  if (!res.success) throw new Error(res.error || "No se pudo crear la inmobiliaria.");
  return res.data;
}

export async function actualizarOrganizacion(id, datos) {
  const res = await apiBackend(`/organizaciones/${id}`, "PATCH", datos);
  if (!res.success) throw new Error(res.error || "No se pudo actualizar la inmobiliaria.");
  return res.data;
}

export async function eliminarOrganizacion(id) {
  const res = await apiBackend(`/organizaciones/${id}`, "DELETE");
  if (!res.success) throw new Error(res.error || "No se pudo eliminar la inmobiliaria.");
  return res.data;
}

export async function aprobarOrganizacion(id) {
  const res = await apiBackend(`/organizaciones/${id}/aprobar`, "PATCH");
  if (!res.success) throw new Error(res.error || "No se pudo aprobar.");
  return res.data;
}

export async function suspenderOrganizacion(id) {
  const res = await apiBackend(`/organizaciones/${id}/suspender`, "PATCH");
  if (!res.success) throw new Error(res.error || "No se pudo suspender.");
  return res.data;
}

export async function activarDominio(id) {
  const res = await apiBackend(`/organizaciones/${id}/dominio/activar`, "PATCH");
  if (!res.success) throw new Error(res.error || "No se pudo activar el dominio.");
  return res.data;
}

export async function desactivarDominio(id) {
  const res = await apiBackend(`/organizaciones/${id}/dominio/desactivar`, "PATCH");
  if (!res.success) throw new Error(res.error || "No se pudo pausar el dominio.");
  return res.data;
}

export async function quitarDominio(id) {
  const res = await apiBackend(`/organizaciones/${id}/dominio/quitar`, "PATCH");
  if (!res.success) throw new Error(res.error || "No se pudo quitar el dominio.");
  return res.data;
}
