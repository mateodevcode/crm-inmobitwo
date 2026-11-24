// Push del navegador para los avisos del CRM. El service worker es public/sw-avisos.js
// y la suscripción se guarda en el backend con app = 'crm' (POST /crm/push/suscripcion).
import { apiBackend } from "@/api/apiBackend.js";

const SW = "/sw-avisos.js";

export const pushSoportado = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const base64AUint8 = (b64) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

async function suscripcionActual() {
  const reg = await navigator.serviceWorker.getRegistration(SW);
  return reg ? reg.pushManager.getSubscription() : null;
}

// → "no_soportado" | "bloqueado" | "activo" | "inactivo"
export async function estadoPush() {
  if (!pushSoportado()) return "no_soportado";
  if (Notification.permission === "denied") return "bloqueado";
  return (await suscripcionActual()) ? "activo" : "inactivo";
}

// ¿El backend tiene el push habilitado? (503 = apagado). Devuelve la clave pública o null.
export async function clavePublicaPush() {
  const res = await apiBackend("/crm/push/clave-publica");
  return res.success ? res.data?.publicKey ?? null : null;
}

export async function activarPush() {
  if (!pushSoportado()) throw new Error("Este navegador no admite notificaciones.");
  const clave = await clavePublicaPush();
  if (!clave) throw new Error("Las notificaciones del navegador aún no están disponibles.");
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") throw new Error("No diste permiso para mostrar notificaciones.");
  const reg = await navigator.serviceWorker.register(SW);
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64AUint8(clave) }));
  const res = await apiBackend("/crm/push/suscripcion", "POST", { subscription: sub.toJSON() });
  if (!res.success) {
    await sub.unsubscribe().catch(() => {});
    throw new Error([].concat(res.error || "No se pudo activar.").join(" "));
  }
}

export async function desactivarPush() {
  const sub = await suscripcionActual();
  if (!sub) return;
  await apiBackend("/crm/push/suscripcion", "DELETE", { endpoint: sub.endpoint });
  await sub.unsubscribe();
}
