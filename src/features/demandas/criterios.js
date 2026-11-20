// Textos y constantes de demandas.
import { formatPrecioCompacto } from "@/utils/formatPrecio.js";
import { PORTAL_URL } from "@/config/config.js";

export const ESTADOS_DEMANDA = {
  activa: { etiqueta: "Activa", punto: "bg-emerald-500" },
  pausada: { etiqueta: "Pausada", punto: "bg-amber-500" },
  cerrada: { etiqueta: "Cerrada", punto: "bg-zinc-400" },
};

export const OPERACIONES = [
  { valor: "venta", etiqueta: "Compra" },
  { valor: "alquiler", etiqueta: "Arriendo" },
];

export const MINIMOS = ["", "1", "2", "3", "4", "5"];

// "$ 300M – $ 450M", "Hasta $ 2,5M", "Desde $ 200M" o null.
export function textoRangoPrecio(min, max) {
  const f = (n) => `$ ${formatPrecioCompacto(n)}`;
  if (min && max) return `${f(min)} – ${f(max)}`;
  if (max) return `Hasta ${f(max)}`;
  if (min) return `Desde ${f(min)}`;
  return null;
}

// Resumen en una línea: "Compra · Apartamento, Casa · Bogotá D.C. · 3+ hab · Hasta $ 450M"
export function resumenDemanda(d) {
  const partes = [
    d.operacion === "alquiler" ? "Arriendo" : "Compra",
    d.tipos?.length ? d.tipos.map((t) => t.nombre).join(", ") : "Cualquier tipo",
    d.ciudades?.length ? d.ciudades.map((c) => c.nombre).join(", ") : null,
    d.barrios?.length ? `${d.barrios.length} ${d.barrios.length === 1 ? "barrio" : "barrios"}` : null,
    d.habitaciones_min ? `${d.habitaciones_min}+ hab` : null,
    d.banos_min ? `${d.banos_min}+ baños` : null,
    d.parqueaderos_min ? `${d.parqueaderos_min}+ parq.` : null,
    d.estratos?.length ? `Estrato ${d.estratos.join(", ")}` : null,
    textoRangoPrecio(d.precio_min, d.precio_max),
  ];
  return partes.filter(Boolean).join(" · ");
}

export const urlPortalInmueble = (id) => `${PORTAL_URL.replace(/\/$/, "")}/inmueble/${id}`;
