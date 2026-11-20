import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerTareas({ pagina, limite, vista, asignado, contactoId, oportunidadId, incluirCompletadas }) {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (vista) params.set("vista", vista);
  if (asignado) params.set("asignado", asignado);
  if (contactoId) params.set("contacto_id", String(contactoId));
  if (oportunidadId) params.set("oportunidad_id", String(oportunidadId));
  if (incluirCompletadas) params.set("incluir_completadas", "1");
  const res = await apiBackend(`/crm/tareas?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las tareas.");
  return res;
}

export async function crearTarea(datos) {
  const res = await apiBackend("/crm/tareas", "POST", datos);
  if (!res.success) throw new Error(Array.isArray(res.error) ? res.error.join(" ") : res.error || "No se pudo crear la tarea.");
  return res.data;
}

export async function completarTarea(id) {
  const res = await apiBackend(`/crm/tareas/${id}/completar`, "POST");
  if (!res.success) throw new Error(res.error || "No se pudo completar.");
  return res.data;
}

export async function actualizarTarea(id, datos) {
  const res = await apiBackend(`/crm/tareas/${id}`, "PATCH", datos);
  if (!res.success) throw new Error(res.error || "No se pudo actualizar.");
  return res.data;
}
