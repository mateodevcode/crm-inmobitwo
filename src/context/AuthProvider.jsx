// src/context/AuthProvider.jsx — sesión del CRM
// El token y el usuario viven solo en memoria (api/sesion.js, auditoría N-12/N-13).
// Al cargar la página la sesión se recupera con la cookie httpOnly del refresh.
import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext.js";
import { apiBackend } from "@/api/apiBackend.js";
import { obtenerTokenFresco } from "@/api/refreshToken.js";
import { borrarSesionLocal, guardarToken, limpiarClavesAntiguas, obtenerToken } from "@/api/sesion.js";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const guardarSesion = useCallback((usuarioData, accessToken) => {
    guardarToken(accessToken);
    setUsuario(usuarioData);
  }, []);

  const limpiarSesion = useCallback(() => {
    borrarSesionLocal();
    setUsuario(null);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await apiBackend("/auth/logout", "POST");
    } finally {
      limpiarSesion();
    }
  }, [limpiarSesion]);

  // Al arrancar: sin token en memoria (recarga o pestaña nueva) → refresh por cookie.
  useEffect(() => {
    let vivo = true;
    limpiarClavesAntiguas();
    (async () => {
      try {
        if (!obtenerToken()) {
          const renovado = await obtenerTokenFresco();
          if (!renovado) {
            if (vivo) {
              limpiarSesion();
              setCargandoSesion(false);
            }
            return;
          }
        }
        const res = await apiBackend("/auth/me");
        if (!vivo) return;
        if (res.success && res.data) {
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
