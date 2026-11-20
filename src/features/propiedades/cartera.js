// Textos de la cartera: estado comercial de las ofertas y exportación a CSV.
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";

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

const celda = (v) => {
  const s = v == null ? "" : String(v);
  // Comillas dobles y neutraliza fórmulas al abrir en Excel (=, +, -, @).
  const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${seguro.replace(/"/g, '""')}"`;
};

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
  // BOM para que Excel abra bien las tildes; separador ; (configuración regional es-CO).
  return "﻿" + [cabecera, ...lineas].map((l) => l.map(celda).join(";")).join("\r\n");
}

export function descargarTexto(nombre, contenido, tipo = "text/csv;charset=utf-8") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
