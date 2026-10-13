// src/config/config.js — convenciones CRM Colombia
export const URL_BACKEND =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001";
export const PORTAL_URL =
  import.meta.env.VITE_PORTAL_URL ?? "http://localhost:3000";

export const LOCALE = "es-CO";
export const ZONA_HORARIA = "America/Bogota";
export const MONEDA = "COP";
