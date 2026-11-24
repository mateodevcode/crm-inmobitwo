import { apiBackend } from "@/api/apiBackend.js";

const fallo = (res, txt) => new Error([].concat(res.error || txt).join(" "));

export async function obtenerContador() {
  const res = await apiBackend("/crm/notificaciones/contador");
  if (!res.success) throw fallo(res, "No se pudieron cargar los avisos.");
  return res.data;
}

export async function obtenerNotificaciones({ soloNoLeidas = false, limite = 20, antes } = {}) {
  const p = new URLSearchParams({ limite: String(limite) });
  if (soloNoLeidas) p.set("solo_no_leidas", "1");
  if (antes) p.set("antes", String(antes));
  const res = await apiBackend(`/crm/notificaciones?${p}`);
  if (!res.success) throw fallo(res, "No se pudieron cargar los avisos.");
  return res.data;
}

export async function marcarLeida(id) {
  const res = await apiBackend(`/crm/notificaciones/${id}/leida`, "POST");
  if (!res.success) throw fallo(res, "No se pudo marcar el aviso.");
  return res.data;
}

export async function marcarTodasLeidas() {
  const res = await apiBackend("/crm/notificaciones/leer-todas", "POST");
  if (!res.success) throw fallo(res, "No se pudieron marcar los avisos.");
  return res.data;
}

// Preferencias por usuario (no por espacio): { correo }.
export async function obtenerPreferenciasAvisos() {
  const res = await apiBackend("/crm/notificaciones/preferencias");
  if (!res.success) throw fallo(res, "No se pudieron cargar las preferencias.");
  return res.data;
}

export async function guardarPreferenciasAvisos(datos) {
  const res = await apiBackend("/crm/notificaciones/preferencias", "PUT", datos);
  if (!res.success) throw fallo(res, "No se pudieron guardar las preferencias.");
  return res.data;
}
