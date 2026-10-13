// src/api/apiBackend.js — cliente JSON del CRM
// Espacio de trabajo via header X-Crm-Espacio (personal | org:{id}).
import { URL_BACKEND } from "@/config/config.js";
import { obtenerTokenFresco } from "@/api/refreshToken.js";

export const CLAVE_ESPACIO = "crm_espacio";

export function obtenerEspacio() {
  return localStorage.getItem(CLAVE_ESPACIO) || "personal";
}

function construirHeaders(token) {
  return {
    "Content-Type": "application/json",
    "X-Crm-Espacio": obtenerEspacio(),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function redirigirLogin() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("usuario");
  localStorage.removeItem(CLAVE_ESPACIO);
  const origen = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  window.location.href = `/login?origen=${origen}`;
}

export async function apiBackend(endpoint, metodo = "GET", datos = null) {
  try {
    const url = `${URL_BACKEND}${endpoint}`;
    const token = localStorage.getItem("access_token");

    const res = await fetch(url, {
      method: metodo,
      headers: construirHeaders(token),
      credentials: "include", // refresh_token httpOnly
      body: metodo !== "GET" && datos !== null ? JSON.stringify(datos) : null,
    });

    // Access expirado → renovar con la cookie y reintentar una vez
    if (res.status === 401 && token) {
      const renovado = await obtenerTokenFresco();
      if (renovado) {
        const nuevoToken = localStorage.getItem("access_token");
        const reintento = await fetch(url, {
          method: metodo,
          headers: construirHeaders(nuevoToken),
          credentials: "include",
          body:
            metodo !== "GET" && datos !== null ? JSON.stringify(datos) : null,
        });
        const data = await reintento.json();
        return formatearRespuesta(data, reintento.status);
      }
      redirigirLogin();
      return { success: false, error: "Sesión expirada.", data: null };
    }

    const data = await res.json();
    return formatearRespuesta(data, res.status);
  } catch (error) {
    return {
      success: false,
      message: "No se pudo conectar con el servidor",
      error: error.message,
      data: null,
      status: 500,
    };
  }
}

// ─────────────────────────────────────────────
function formatearRespuesta(data, status) {
  return {
    success: data.success ?? false,
    message: data.message ?? null,
    data: data.data ?? null,
    error: data.error ?? null,
    status,
  };
}
