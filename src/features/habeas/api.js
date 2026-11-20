import { apiBackend } from "@/api/apiBackend.js";

const fallo = (res, txt) => new Error([].concat(res.error || txt).join(" "));

// Derecho de acceso: JSON con todo lo que el espacio guarda del contacto.
export async function exportarDatosContacto(id) {
  const res = await apiBackend(`/crm/contactos/${id}/datos-personales`);
  if (!res.success) throw fallo(res, "No se pudieron exportar los datos.");
  return res.data;
}

export async function actualizarAutorizacion(id, { autorizado, origen }) {
  const res = await apiBackend(`/crm/contactos/${id}/autorizacion`, "PUT", { autorizado, ...(origen ? { origen } : {}) });
  if (!res.success) throw fallo(res, "No se pudo actualizar la autorización.");
  return res.data;
}

export async function suprimirContacto(id, motivo) {
  const res = await apiBackend(`/crm/contactos/${id}/suprimir`, "POST", { confirmar: true, motivo });
  if (!res.success) throw fallo(res, "No se pudieron suprimir los datos.");
  return res.data;
}

export async function obtenerRegistro({ pagina = 1, limite = 50, contactoId } = {}) {
  const p = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (contactoId) p.set("contacto_id", String(contactoId));
  const res = await apiBackend(`/crm/habeas-data/registro?${p}`);
  if (!res.success) throw fallo(res, "No se pudo cargar el registro.");
  return res;
}
