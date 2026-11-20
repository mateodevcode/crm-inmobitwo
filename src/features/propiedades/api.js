import { apiBackend } from "@/api/apiBackend.js";

const mensaje = (res, porDefecto) =>
  Array.isArray(res.error) ? res.error.join(" ") : res.error || res.message || porDefecto;

export async function obtenerPropiedades({ pagina, limite, estado, oferta, q }) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
  });
  if (estado) params.set("estado", estado);
  if (oferta) params.set("oferta", oferta);
  if (q) params.set("q", q);
  const res = await apiBackend(`/crm/propiedades?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las propiedades.");
  return res;
}

// Publicar o pausar varios a la vez → { actualizados: [ids], omitidos: [{ id, motivo }] }
export async function accionMasiva(ids, accion) {
  const res = await apiBackend("/crm/propiedades/acciones", "POST", { ids, accion });
  if (!res.success) throw new Error(mensaje(res, "No se pudo aplicar la acción."));
  return res.data;
}

export async function duplicarPropiedad(id) {
  const res = await apiBackend(`/crm/propiedades/${id}/duplicar`, "POST");
  if (!res.success) throw new Error(mensaje(res, "No se pudo duplicar."));
  return res.data;
}

export async function obtenerRendimiento(id) {
  const res = await apiBackend(`/crm/propiedades/${id}/rendimiento`);
  if (!res.success) throw new Error(mensaje(res, "No se pudo cargar el rendimiento."));
  return res.data;
}

// Estado comercial de una oferta (venta → sold, alquiler → rented, active para reactivar).
export async function cambiarEstadoOferta(id, operacion, listingStatus) {
  const res = await apiBackend(`/propiedades/${id}/ofertas/${operacion}`, "PUT", { listing_status: listingStatus });
  if (!res.success) throw new Error(mensaje(res, "No se pudo cambiar el estado comercial."));
  return res.data;
}

// Detalle público del inmueble (para la ficha imprimible).
export async function obtenerDetalle(id) {
  const res = await apiBackend(`/propiedades/${id}`);
  if (!res.success) throw new Error(mensaje(res, "No se pudo cargar el inmueble."));
  return res.data;
}
