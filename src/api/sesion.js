// src/api/sesion.js — token de acceso SOLO en memoria (auditoría N-12/N-13).
//
// Ni el access_token ni el usuario (con su rol) se guardan en localStorage:
// un XSS o una extensión no pueden leerlos de ahí y no sobreviven a cerrar el
// navegador. Al recargar, la sesión se recupera con la cookie httpOnly del
// refresh (POST /auth/refresh) y el usuario se pide a /auth/me.
// En localStorage solo queda el espacio de trabajo elegido (no es secreto:
// el backend comprueba la membresía en cada petición).
export const CLAVE_ESPACIO = "crm_espacio";

let accessToken = null;

export const obtenerToken = () => accessToken;

export function guardarToken(token) {
  accessToken = token || null;
}

export function borrarSesionLocal() {
  accessToken = null;
  try {
    localStorage.removeItem(CLAVE_ESPACIO);
  } catch {
    // almacenamiento bloqueado: no hay nada que borrar
  }
}

// Versiones anteriores del CRM guardaban el token y el usuario aquí.
export function limpiarClavesAntiguas() {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
  } catch {
    // almacenamiento bloqueado
  }
}
