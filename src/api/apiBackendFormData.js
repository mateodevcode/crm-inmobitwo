// src/api/apiBackendFormData.js — cliente multipart del CRM
import { URL_BACKEND } from "@/config/config.js";
import { obtenerTokenFresco } from "@/api/refreshToken.js";
import { CLAVE_ESPACIO, obtenerEspacio } from "@/api/apiBackend.js";

function construirHeaders(token) {
  return {
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

export async function apiBackendFormData(endpoint, formData, method = "POST") {
  try {
    const url = `${URL_BACKEND}${endpoint}`;
    const token = localStorage.getItem("access_token");

    const res = await fetch(url, {
      method,
      headers: construirHeaders(token),
      credentials: "include",
      body: formData,
    });

    if (res.status === 401 && token) {
      const renovado = await obtenerTokenFresco();
      if (renovado) {
        const nuevoToken = localStorage.getItem("access_token");
        const reintento = await fetch(url, {
          method,
          headers: construirHeaders(nuevoToken),
          credentials: "include",
          body: formData,
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
