import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerConversaciones() {
  const res = await apiBackend("/chat/conversaciones");
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las conversaciones.");
  return res.data;
}

export async function obtenerMensajes(id, antesDe = null) {
  const qs = antesDe ? `?antesDe=${antesDe}&limite=30` : "";
  const res = await apiBackend(`/chat/conversaciones/${id}/mensajes${qs}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar los mensajes.");
  return res.data;
}

export async function enviarMensaje(id, contenido) {
  const clientMsgId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const res = await apiBackend(`/chat/conversaciones/${id}/mensajes`, "POST", {
    contenido,
    clientMsgId,
  });
  if (!res.success) throw new Error(res.error || "No se pudo enviar.");
  return res.data;
}

export async function marcarLeida(id) {
  const res = await apiBackend(`/chat/conversaciones/${id}/leer`, "POST");
  if (!res.success) throw new Error(res.error || "No se pudo marcar como leída.");
  return res.data;
}

export async function eliminarConversacion(id) {
  const res = await apiBackend(`/chat/conversaciones/${id}`, "DELETE");
  if (!res.success) throw new Error(res.error || "No se pudo eliminar.");
  return res.data;
}
