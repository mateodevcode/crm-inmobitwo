// src/api/apiBackend.js
import { URL_BACKEND } from "@/config/config.js";
import { obtenerTokenFresco } from "@/api/refreshToken.js";

export async function apiBackend(endpoint, metodo = "GET", datos = null) {
  try {
    const url = `${URL_BACKEND}${endpoint}`;
    // Leer access token del localStorage
    const token = localStorage.getItem("access_token");

    // ────────────────────────────────────────────────────────────
    // NUEVO: mandamos siempre el host actual del navegador.
    // El backend lo usa (middleware resolverTenant) para saber si
    // esta petición viene del dominio propio de una organización.
    // Si venimos del dominio principal, el backend simplemente no
    // encuentra coincidencia y sigue como "sin tenant".
    // ────────────────────────────────────────────────────────────
    const headers = {
      "Content-Type": "application/json",
      "X-Tenant-Host": window.location.host,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const res = await fetch(url, {
      method: metodo,
      headers,
      credentials: "include", // ← necesario para enviar/recibir cookies (refresh_token)
      body: metodo !== "GET" && datos !== null ? JSON.stringify(datos) : null,
    });

    // Si el access_token expiró, intentar renovarlo automáticamente
    if (res.status === 401 && token) {
      const renovado = await obtenerTokenFresco();
      if (renovado) {
        const nuevoToken = localStorage.getItem("access_token");
        const reintento = await fetch(url, {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Host": window.location.host,
            Authorization: `Bearer ${nuevoToken}`,
          },
          credentials: "include",
          body:
            metodo !== "GET" && datos !== null ? JSON.stringify(datos) : null,
        });
        const data = await reintento.json();
        return formatearRespuesta(data, reintento.status);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("usuario");
        window.location.href = "/login";
        return { success: false, error: "Sesión expirada.", data: null };
      }
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
// Normaliza la respuesta siempre al mismo formato
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
