// src/context/espacio.js — helpers del espacio personal | org:{id}
export const ESPACIO_PERSONAL = "personal";

export function esEspacioOrg(espacio) {
  return typeof espacio === "string" && espacio.startsWith("org:");
}

export function idDeEspacioOrg(espacio) {
  return esEspacioOrg(espacio) ? Number(espacio.slice(4)) : null;
}
