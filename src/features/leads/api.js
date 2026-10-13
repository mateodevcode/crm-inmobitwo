import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerLeads(filtros) {
  const params = new URLSearchParams({
    pagina: String(filtros.pagina),
    limite: String(filtros.limite),
  });
  for (const k of ["estado", "origen", "desde", "hasta", "propiedadId", "q"]) {
    if (filtros[k]) params.set(k, filtros[k]);
  }
  const res = await apiBackend(`/crm/leads?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar los leads.");
  return res;
}

export async function cambiarEstadoLead(id, estado) {
  const res = await apiBackend(`/leads/${id}`, "PATCH", { estado });
  if (!res.success) throw new Error(res.error || "No se pudo cambiar el estado.");
  return res.data;
}
