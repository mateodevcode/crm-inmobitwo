// public/sw-avisos.js — service worker del CRM: solo notificaciones push de avisos.
// El backend manda { titulo, cuerpo, url, tag } (lib/notificaciones.js → payloadPush).
// No cachea nada ni intercepta peticiones.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Solo rutas internas del CRM ("/tareas", "/contactos/5").
const rutaInterna = (url) =>
  typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/notificaciones";

self.addEventListener("push", (event) => {
  let datos;
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { titulo: event.data ? event.data.text() : "" };
  }
  const titulo = String(datos.titulo || "Nuevo aviso en el CRM").slice(0, 200);
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: String(datos.cuerpo || "").slice(0, 500),
      tag: typeof datos.tag === "string" ? datos.tag : undefined,
      icon: "/logo/logo.png",
      lang: "es-CO",
      data: { url: rutaInterna(datos.url) },
    }),
  );
});

// Al tocar la notificación: enfoca una pestaña del CRM y navega, o abre una nueva.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = new URL(rutaInterna(event.notification.data?.url), self.location.origin).href;
  event.waitUntil(
    (async () => {
      const pestanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const propia = pestanas.find((c) => new URL(c.url).origin === self.location.origin);
      if (propia) {
        await propia.focus();
        return propia.navigate(destino);
      }
      return self.clients.openWindow(destino);
    })(),
  );
});
