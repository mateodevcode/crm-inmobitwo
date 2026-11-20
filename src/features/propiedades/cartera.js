// Textos de la cartera: estado comercial de las ofertas y exportación a CSV.
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";
import { aCsv, descargarArchivo } from "@/utils/csv.js";

export const ESTADO_OFERTA = {
  active: { etiqueta: "Disponible", clase: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100" },
  sold: { etiqueta: "Vendido", clase: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100" },
  rented: { etiqueta: "Arrendado", clase: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100" },
  inactive: { etiqueta: "Inactiva", clase: "bg-muted text-muted-foreground" },
  expired: { etiqueta: "Vencida", clase: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100" },
};

export const OPERACION = { venta: "Venta", alquiler: "Arriendo", alquiler_venta: "Venta y arriendo" };

// Estado "cerrado" por operación (lo que acepta el backend en listing_status).
export const CIERRE = { venta: "sold", alquiler: "rented" };

export const FILTROS_OFERTA = [
  { valor: "", etiqueta: "Cualquier estado comercial" },
  { valor: "active", etiqueta: "Disponibles" },
  { valor: "sold", etiqueta: "Vendidos" },
  { valor: "rented", etiqueta: "Arrendados" },
  { valor: "inactive", etiqueta: "Ofertas inactivas" },
  { valor: "sin_oferta", etiqueta: "Sin oferta" },
];

export function csvCartera(filas) {
  const cabecera = ["ID", "Título", "Ciudad", "Publicación", "Ofertas", "Mandato", "Vence mandato", "Vistas", "Favoritos", "Leads", "Creado"];
  const lineas = filas.map((p) => [
    p.id,
    p.titulo,
    p.ciudad,
    p.estado === "publicado" ? "Publicado" : "No publicado",
    (p.ofertas ?? [])
      .map((o) => `${OPERACION[o.operacion] ?? o.operacion} ${o.precio ? formatPrecioCompleto(Number(o.precio)) : ""} (${ESTADO_OFERTA[o.estado]?.etiqueta ?? o.estado})`)
      .join(" | "),
    p.captacion?.tipo_mandato ?? "",
    p.captacion?.vence_el ? p.captacion.vence_el.split("-").reverse().join("/") : "",
    p.vistas,
    p.favoritos,
    p.leads,
    new Date(p.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" }),
  ]);
  return aCsv(lineas, cabecera.map((titulo, i) => ({ titulo, valor: (l) => l[i] })));
}

export const descargarTexto = (nombre, contenido) => descargarArchivo(nombre, contenido);
