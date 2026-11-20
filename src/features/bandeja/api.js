import { apiBackend } from "@/api/apiBackend.js";

const mensaje = (res, porDefecto) =>
  Array.isArray(res.error) ? res.error.join(" ") : res.error || porDefecto;

async function pedir(ruta, metodo, datos, porDefecto) {
  const res = await apiBackend(ruta, metodo, datos);
  if (!res.success) throw new Error(mensaje(res, porDefecto));
  return res.data;
}

export function obtenerBandeja({ filtro = "todos", q } = {}) {
  const p = new URLSearchParams({ filtro });
  if (q) p.set("q", q);
  return pedir(`/crm/bandeja?${p}`, "GET", null, "No se pudo cargar la bandeja.");
}

export const contactoDesdeChat = (convId) =>
  pedir(`/crm/bandeja/chat/${convId}/contacto`, "POST", null, "No se pudo crear el contacto.");

export const obtenerPlantillas = () =>
  pedir("/crm/plantillas", "GET", null, "No se pudieron cargar las plantillas.").then((d) => d ?? []);
export const crearPlantilla = (datos) => pedir("/crm/plantillas", "POST", datos, "No se pudo crear la plantilla.");
export const actualizarPlantilla = (id, datos) =>
  pedir(`/crm/plantillas/${id}`, "PATCH", datos, "No se pudo guardar la plantilla.");
export const eliminarPlantilla = (id) => pedir(`/crm/plantillas/${id}`, "DELETE", null, "No se pudo borrar.");
// Cuenta el uso sin bloquear la interfaz si falla.
export const usarPlantilla = (id) => apiBackend(`/crm/plantillas/${id}/uso`, "POST").catch(() => null);
