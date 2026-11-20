// Textos de Habeas Data (Ley 1581 de 2012).

export const ORIGENES = [
  { valor: "verbal", etiqueta: "Verbal (llamada o en persona)" },
  { valor: "escrito", etiqueta: "Documento firmado" },
  { valor: "formulario_web", etiqueta: "Formulario web" },
  { valor: "correo", etiqueta: "Correo electrónico" },
  { valor: "whatsapp", etiqueta: "WhatsApp" },
  { valor: "contrato", etiqueta: "Contrato de servicios" },
];

const ETIQUETA_ORIGEN = Object.fromEntries([
  ...ORIGENES.map((o) => [o.valor, o.etiqueta]),
  ["importacion", "Importación (confirmada al importar)"],
  ["crm", "Registrada en el CRM"],
  ["portal", "Portal"],
]);
export const textoOrigen = (o) => ETIQUETA_ORIGEN[o] ?? o ?? "—";

export const MOTIVOS_SUPRESION = [
  { valor: "solicitud_titular", etiqueta: "Lo pidió el titular" },
  { valor: "revocatoria", etiqueta: "Revocó la autorización" },
  { valor: "fin_finalidad", etiqueta: "Ya no se necesitan los datos" },
  { valor: "otro", etiqueta: "Otro motivo" },
];

export const ACCIONES = {
  exportacion: "Exportación de datos",
  rectificacion: "Rectificación",
  supresion: "Supresión",
  autorizacion_registrada: "Autorización registrada",
  autorizacion_retirada: "Autorización retirada",
};

const CAMPO = { nombre: "nombre", email: "correo", telefono: "celular" };
const MOTIVO = Object.fromEntries(MOTIVOS_SUPRESION.map((m) => [m.valor, m.etiqueta.toLowerCase()]));

// Resumen legible del detalle (nunca trae datos personales).
export function textoDetalle(accion, d = {}) {
  if (accion === "rectificacion") return `Cambió: ${(d.campos ?? []).map((c) => CAMPO[c] ?? c).join(", ")}`;
  if (accion === "autorizacion_registrada") return d.origen ? `Origen: ${textoOrigen(d.origen)}` : "";
  if (accion === "exportacion" || accion === "supresion") {
    const partes = [
      ["actividades", "actividades"],
      ["tareas", "tareas"],
      ["oportunidades", "oportunidades"],
      ["visitas", "visitas"],
      ["demandas", "demandas"],
      ["captaciones", "captaciones"],
      ["captaciones_desvinculadas", "captaciones desvinculadas"],
    ]
      .filter(([k]) => d[k])
      .map(([k, t]) => `${d[k]} ${t}`);
    const extra = [];
    if (accion === "supresion" && d.motivo) extra.push(`Motivo: ${MOTIVO[d.motivo] ?? d.motivo}`);
    if (d.lead_anonimizado) extra.push("solicitud del portal anonimizada");
    return [...extra, partes.length ? partes.join(", ") : accion === "supresion" ? "sin registros asociados" : ""].filter(Boolean).join(" · ");
  }
  return "";
}
