import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerEtapas() {
  const res = await apiBackend("/crm/etapas");
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las etapas.");
  return res.data;
}

export async function obtenerOportunidades(filtros = {}) {
  const params = new URLSearchParams();
  for (const k of ["asignado", "propiedad", "valorMin", "valorMax"]) {
    if (filtros[k]) params.set(k, filtros[k]);
  }
  const res = await apiBackend(`/crm/oportunidades?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las oportunidades.");
  return res.data;
}

export async function crearOportunidad(datos) {
  const res = await apiBackend("/crm/oportunidades", "POST", datos);
  if (!res.success) throw new Error(Array.isArray(res.error) ? res.error.join(" ") : res.error || "No se pudo crear.");
  return res.data;
}

export async function moverOportunidad(id, etapaId, indice) {
  const res = await apiBackend(`/crm/oportunidades/${id}/mover`, "PATCH", { etapaId, indice });
  if (!res.success) throw new Error(res.error || "No se pudo mover.");
  return res.data;
}

export async function cerrarOportunidad(id, estado, motivo_perdida) {
  const res = await apiBackend(`/crm/oportunidades/${id}/cerrar`, "PATCH", { estado, motivo_perdida });
  if (!res.success) throw new Error(res.error || "No se pudo cerrar.");
  return res.data;
}

export async function actualizarEtapa(id, datos) {
  const res = await apiBackend(`/crm/etapas/${id}`, "PATCH", datos);
  if (!res.success) throw new Error(res.error || "No se pudo actualizar la etapa.");
  return res.data;
}

export async function crearEtapa(datos) {
  const res = await apiBackend("/crm/etapas", "POST", datos);
  if (!res.success) throw new Error(res.error || "No se pudo crear la etapa.");
  return res.data;
}

export async function eliminarEtapa(id) {
  const res = await apiBackend(`/crm/etapas/${id}`, "DELETE");
  if (!res.success) throw new Error(res.error || "No se pudo eliminar.");
  return res.data;
}
