// Etiquetas y ayudas de captaciones.
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";

export const MANDATOS = [
  { valor: "exclusiva", etiqueta: "Exclusiva" },
  { valor: "compartida", etiqueta: "Compartida" },
  { valor: "sin_exclusiva", etiqueta: "Sin exclusividad" },
];
export const ETIQUETA_MANDATO = Object.fromEntries(MANDATOS.map((m) => [m.valor, m.etiqueta]));

export const ESTADOS_CAPTACION = [
  { valor: "en_captacion", etiqueta: "En captación" },
  { valor: "activa", etiqueta: "Activa" },
  { valor: "retirada", etiqueta: "Retirada" },
  { valor: "cerrada", etiqueta: "Cerrada (vendida / arrendada)" },
];
export const ETIQUETA_ESTADO = Object.fromEntries(ESTADOS_CAPTACION.map((e) => [e.valor, e.etiqueta]));

export const TIPOS_DOCUMENTO = [
  { valor: "cedula", etiqueta: "Cédula del propietario" },
  { valor: "certificado_tradicion", etiqueta: "Certificado de tradición y libertad" },
  { valor: "contrato_mandato", etiqueta: "Contrato de mandato" },
  { valor: "predial", etiqueta: "Impuesto predial" },
  { valor: "paz_y_salvo", etiqueta: "Paz y salvo de administración" },
  { valor: "otro", etiqueta: "Otro" },
];
export const ETIQUETA_DOCUMENTO = Object.fromEntries(TIPOS_DOCUMENTO.map((t) => [t.valor, t.etiqueta]));

// Estado del mandato según los días para vencer (solo captaciones vigentes).
export function estadoVencimiento(k) {
  if (!["en_captacion", "activa"].includes(k.estado) || k.dias_para_vencer == null) return null;
  if (k.dias_para_vencer < 0) return { texto: `Venció hace ${-k.dias_para_vencer} d`, tono: "vencido" };
  if (k.dias_para_vencer === 0) return { texto: "Vence hoy", tono: "vencido" };
  if (k.dias_para_vencer <= 30) return { texto: `Vence en ${k.dias_para_vencer} d`, tono: "pronto" };
  return { texto: `Vence el ${k.vence_el.split("-").reverse().join("/")}`, tono: "ok" };
}

export const CLASE_TONO = {
  vencido: "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-100",
  pronto: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100",
  ok: "bg-muted text-muted-foreground",
};

export const textoTamano = (b) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

// "3,5 %" o "$ 4.000.000" según el tipo de comisión (null si no hay).
export function textoComision(k) {
  if (k.comision_tipo === "valor") return k.comision_valor ? formatPrecioCompleto(Number(k.comision_valor)) : null;
  return k.comision_porcentaje != null ? `${String(Number(k.comision_porcentaje)).replace(".", ",")} %` : null;
}
