// src/context/AuthProvider.jsx — sesión del CRM
// Claves localStorage: access_token, usuario (igual que el portal).
import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext.js";
import { apiBackend, CLAVE_ESPACIO } from "@/api/apiBackend.js";
import { obtenerTokenFresco } from "@/api/refreshToken.js";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem("usuario");
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const guardarSesion = useCallback((usuarioData, accessToken) => {
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
    localStorage.setItem("access_token", accessToken);
    setUsuario(usuarioData);
  }, []);

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("access_token");
    localStorage.removeItem(CLAVE_ESPACIO);
    setUsuario(null);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await apiBackend("/auth/logout", "POST");
    } finally {
      limpiarSesion();
    }
  }, [limpiarSesion]);

  // Al arrancar: usa el access_token; si no hay, intenta el refresh por cookie.
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        let token = localStorage.getItem("access_token");
        if (!token) {
          const renovado = await obtenerTokenFresco();
          if (!renovado) {
            if (vivo) {
              limpiarSesion();
              setCargandoSesion(false);
            }
            return;
          }
          token = localStorage.getItem("access_token");
        }
        const res = await apiBackend("/auth/me");
        if (!vivo) return;
        if (res.success && res.data) {
          localStorage.setItem("usuario", JSON.stringify(res.data));
          setUsuario(res.data);
        } else {
          limpiarSesion();
        }
      } catch {
        if (vivo) limpiarSesion();
      } finally {
        if (vivo) setCargandoSesion(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [limpiarSesion]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: !!usuario,
        cargandoSesion,
        guardarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
