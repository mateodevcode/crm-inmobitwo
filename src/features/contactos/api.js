import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerContactos({ pagina, limite, ...f }) {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  for (const k of ["q", "tipo", "origen", "asignado", "etiqueta"]) {
    if (f[k]) params.set(k, f[k]);
  }
  const res = await apiBackend(`/crm/contactos?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar los contactos.");
  return res;
}

export async function crearContacto(datos) {
  const res = await apiBackend("/crm/contactos", "POST", datos);
  if (!res.success) {
    const err = new Error(Array.isArray(res.error) ? res.error.join(" ") : res.error || "No se pudo crear.");
    err.existente = res.data;
    throw err;
  }
  return res.data;
}

export async function actualizarContacto(id, datos) {
  const res = await apiBackend(`/crm/contactos/${id}`, "PATCH", datos);
  if (!res.success) throw new Error(Array.isArray(res.error) ? res.error.join(" ") : res.error || "No se pudo actualizar.");
  return res.data;
}

export async function archivarContacto(id) {
  const res = await apiBackend(`/crm/contactos/${id}`, "DELETE");
  if (!res.success) throw new Error(res.error || "No se pudo archivar.");
  return res.data;
}

export async function obtenerContacto(id) {
  const res = await apiBackend(`/crm/contactos/${id}`);
  if (!res.success) throw new Error(res.error || "Contacto no encontrado.");
  return res.data;
}

export async function obtenerActividades(id) {
  const res = await apiBackend(`/crm/contactos/${id}/actividades`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las actividades.");
  return res.data;
}

export async function crearActividad(datos) {
  const res = await apiBackend("/crm/actividades", "POST", datos);
  if (!res.success) throw new Error(Array.isArray(res.error) ? res.error.join(" ") : res.error || "No se pudo registrar.");
  return res.data;
}

export async function convertirLead(id) {
  const res = await apiBackend(`/crm/leads/${id}/convertir`, "POST");
  if (!res.success) throw new Error(res.error || "No se pudo convertir el lead.");
  return res;
}

export async function asignarContacto(id, asignado_a_id) {
  const res = await apiBackend(`/crm/contactos/${id}/asignar`, "PATCH", { asignado_a_id });
  if (!res.success) throw new Error(res.error || "No se pudo reasignar.");
  return res.data;
}
