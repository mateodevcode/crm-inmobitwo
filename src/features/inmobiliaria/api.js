import { apiBackend } from "@/api/apiBackend.js";

export async function crearMiOrganizacion(datos) {
  const res = await apiBackend("/organizaciones", "POST", datos);
  if (!res.success) throw new Error(res.error || "No se pudo registrar la inmobiliaria.");
  return res.data;
}

export async function actualizarMiOrganizacion(id, datos) {
  const res = await apiBackend(`/organizaciones/${id}`, "PATCH", datos);
  if (!res.success) throw new Error(res.error || "No se pudo actualizar.");
  return res.data;
}

export async function obtenerMiembros(orgId) {
  const res = await apiBackend(`/organizaciones/${orgId}/miembros`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar los miembros.");
  return res.data;
}

export async function obtenerEstadisticas(orgId) {
  const res = await apiBackend(`/organizaciones/${orgId}/estadisticas`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las estadísticas.");
  return res.data;
}

export async function solicitarDominio(orgId, customDomain) {
  const res = await apiBackend(`/organizaciones/${orgId}/dominio`, "PATCH", {
    custom_domain: customDomain,
  });
  if (!res.success) throw new Error(res.error || "No se pudo solicitar el dominio.");
  return res.data;
}

export async function darDeBajaOrganizacion(orgId) {
  const res = await apiBackend(`/organizaciones/${orgId}/baja`, "DELETE");
  if (!res.success) {
    const pendientes = res.data;
    const detalle =
      pendientes && (pendientes.agentes > 0 || pendientes.inmuebles > 0)
        ? ` Pendientes: ${pendientes.agentes} agentes, ${pendientes.inmuebles} inmuebles.`
        : "";
    throw new Error(`${res.error || "No se pudo dar de baja."}${detalle}`);
  }
  return res.data;
}
