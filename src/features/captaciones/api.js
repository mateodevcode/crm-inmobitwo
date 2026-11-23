import { apiBackend, obtenerEspacio } from "@/api/apiBackend.js";
import { apiBackendFormData } from "@/api/apiBackendFormData.js";
import { obtenerTokenFresco } from "@/api/refreshToken.js";
import { obtenerToken } from "@/api/sesion.js";
import { URL_BACKEND } from "@/config/config.js";

const mensaje = (res, porDefecto) =>
  Array.isArray(res.error) ? res.error.join(" ") : res.error || porDefecto;

async function pedir(ruta, metodo, datos, porDefecto) {
  const res = await apiBackend(ruta, metodo, datos);
  if (!res.success) {
    const err = new Error(mensaje(res, porDefecto));
    err.status = res.status;
    throw err;
  }
  return res.data;
}

export function obtenerCaptaciones(filtros = {}) {
  const p = new URLSearchParams();
  for (const k of ["estado", "vence_en_dias", "asignado", "propietario_id"]) {
    if (filtros[k] !== undefined && filtros[k] !== "") p.set(k, filtros[k]);
  }
  return pedir(`/crm/captaciones?${p}`, "GET", null, "No se pudieron cargar las captaciones.").then((d) => d ?? []);
}

export const captacionDePropiedad = (propiedadId) =>
  pedir(`/crm/propiedades/${propiedadId}/captacion`, "GET", null, "No se pudo cargar la captación.");
export const crearCaptacion = (datos) => pedir("/crm/captaciones", "POST", datos, "No se pudo registrar la captación.");
export const actualizarCaptacion = (id, datos) =>
  pedir(`/crm/captaciones/${id}`, "PATCH", datos, "No se pudo actualizar la captación.");
export const eliminarCaptacion = (id) => pedir(`/crm/captaciones/${id}`, "DELETE", null, "No se pudo borrar.");
export const eliminarDocumento = (id, docId) =>
  pedir(`/crm/captaciones/${id}/documentos/${docId}`, "DELETE", null, "No se pudo borrar el documento.");

export async function subirDocumento(id, archivo, tipo) {
  const fd = new FormData();
  fd.append("tipo", tipo);
  fd.append("archivo", archivo);
  const res = await apiBackendFormData(`/crm/captaciones/${id}/documentos`, fd, "POST");
  if (!res.success) throw new Error(mensaje(res, "No se pudo subir el documento."));
  return res.data;
}

// Descarga autenticada: el documento solo se sirve por el backend (nunca hay
// URL pública), así que se pide con el token y se guarda desde un blob.
export async function descargarDocumento(id, doc) {
  const url = `${URL_BACKEND}/crm/captaciones/${id}/documentos/${doc.id}`;
  const pedirBlob = () =>
    fetch(url, {
      credentials: "include",
      headers: {
        "X-Crm-Espacio": obtenerEspacio(),
        Authorization: `Bearer ${obtenerToken()}`,
      },
    });
  let res = await pedirBlob();
  if (res.status === 401 && (await obtenerTokenFresco())) res = await pedirBlob();
  if (!res.ok) {
    let msg = "No se pudo descargar el documento.";
    try {
      msg = (await res.json()).error || msg;
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = doc.nombre_archivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 10000);
}
