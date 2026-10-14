import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerSolicitudes() {
  const res = await apiBackend("/dominios/solicitudes");
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las solicitudes.");
  return res.data;
}

export async function obtenerJobs(limite = 20) {
  const res = await apiBackend(`/dominios/jobs?limite=${limite}`);
  if (!res.success) throw new Error(res.error || "No se pudo cargar el historial.");
  return res.data;
}

export async function obtenerJob(id) {
  const res = await apiBackend(`/dominios/jobs/${id}`);
  if (!res.success) throw new Error(res.error || "No se pudo cargar el job.");
  return res.data;
}

export async function ejecutarAgregar({ organizacion_id, dominio, con_www }) {
  const res = await apiBackend("/dominios/agregar", "POST", { organizacion_id, dominio, con_www });
  if (!res.success) throw new Error(res.error || "No se pudo iniciar la ejecución.");
  return res.data;
}

export async function ejecutarQuitar({ organizacion_id }) {
  const res = await apiBackend("/dominios/quitar", "POST", { organizacion_id });
  if (!res.success) throw new Error(res.error || "No se pudo iniciar la baja.");
  return res.data;
}
