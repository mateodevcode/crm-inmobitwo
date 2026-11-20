// Variables de las plantillas de respuesta.
export const VARIABLES = [
  { clave: "nombre", descripcion: "Nombre del cliente" },
  { clave: "inmueble", descripcion: "Título del inmueble" },
  { clave: "agente", descripcion: "Tu nombre" },
  { clave: "inmobiliaria", descripcion: "Nombre de la inmobiliaria (o el tuyo)" },
];

// Reemplaza {variable} por su valor. Una variable sin valor se quita y se
// limpian los espacios dobles que deja; una desconocida se deja tal cual.
export function aplicarPlantilla(texto, valores) {
  return String(texto)
    .replace(/\{(\w+)\}/g, (todo, clave) => {
      if (!VARIABLES.some((v) => v.clave === clave)) return todo;
      const v = valores?.[clave];
      return v == null || v === "" ? "" : String(v).trim();
    })
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ([,.;:!?])/g, "$1")
    .trim();
}

// Plantillas sugeridas para empezar (se ofrecen cuando el espacio no tiene ninguna).
export const PLANTILLAS_SUGERIDAS = [
  {
    titulo: "Primer contacto",
    contenido:
      "Hola {nombre}, gracias por tu interés en {inmueble}. Soy {agente} de {inmobiliaria}. ¿Te gustaría agendar una visita esta semana?",
  },
  {
    titulo: "Confirmar visita",
    contenido: "Hola {nombre}, te confirmo la visita a {inmueble}. Cualquier cambio me avisas por aquí. ¡Nos vemos!",
  },
  {
    titulo: "Seguimiento",
    contenido:
      "Hola {nombre}, ¿cómo te pareció {inmueble}? Si quieres te comparto otras opciones parecidas que tenemos disponibles.",
  },
];
