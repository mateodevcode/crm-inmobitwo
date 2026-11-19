import { apiBackend } from "@/api/apiBackend.js";

const mensaje = (res, porDefecto) =>
  Array.isArray(res.error) ? res.error.join(" ") : res.error || porDefecto;

export async function obtenerVisitas(filtros = {}) {
  const params = new URLSearchParams();
  for (const k of ["desde", "hasta", "asignado", "contacto_id", "propiedad_id", "estado"]) {
    if (filtros[k]) params.set(k, filtros[k]);
  }
  const res = await apiBackend(`/crm/visitas?${params.toString()}`);
  if (!res.success) throw new Error(mensaje(res, "No se pudieron cargar las visitas."));
  return res.data ?? [];
}

export async function obtenerVisita(id) {
  const res = await apiBackend(`/crm/visitas/${id}`);
  if (!res.success) throw new Error(mensaje(res, "No se pudo cargar la visita."));
  return res.data;
}

// Un 409 trae los choques de horario para que la UI pregunte si forzar.
function errorConChoques(res, porDefecto) {
  const err = new Error(mensaje(res, porDefecto));
  err.choques = res.status === 409 ? (res.data?.choques ?? []) : null;
  return err;
}

export async function crearVisita(datos) {
  const res = await apiBackend("/crm/visitas", "POST", datos);
  if (!res.success) throw errorConChoques(res, "No se pudo agendar la visita.");
  return res.data;
}

export async function actualizarVisita(id, datos) {
  const res = await apiBackend(`/crm/visitas/${id}`, "PATCH", datos);
  if (!res.success) throw errorConChoques(res, "No se pudo actualizar la visita.");
  return res.data;
}

export async function cambiarEstadoVisita(id, datos) {
  const res = await apiBackend(`/crm/visitas/${id}/estado`, "POST", datos);
  if (!res.success) throw new Error(mensaje(res, "No se pudo cambiar el estado."));
  return res.data;
}

export async function eliminarVisita(id) {
  const res = await apiBackend(`/crm/visitas/${id}`, "DELETE");
  if (!res.success) throw new Error(mensaje(res, "No se pudo borrar la visita."));
  return res.data;
}
