// src/router/guards.jsx — RutaPrivada espera la sesión; RutaAdminOrg es agency_admin; RutaSuperadmin es superadmin.
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";

export function RutaPrivada({ children }) {
  const { estaAutenticado, cargandoSesion } = useContext(AuthContext);
  const location = useLocation();
  if (cargandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }
  if (!estaAutenticado) {
    const origen = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?origen=${origen}`} replace />;
  }
  return children;
}

export function RutaPublica({ children }) {
  const { estaAutenticado, cargandoSesion } = useContext(AuthContext);
  if (cargandoSesion) return null;
  return estaAutenticado ? <Navigate to="/" replace /> : children;
}

export function RutaAdminOrg({ children }) {
  const { estaAutenticado, cargandoSesion } = useContext(AuthContext);
  const { rolEnOrg, esPersonal, cargandoOrgs } = useContext(WorkspaceContext);
  if (cargandoSesion || cargandoOrgs) return null;
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  // Equipo solo existe en espacio de organización con agency_admin.
  if (esPersonal || rolEnOrg !== "agency_admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function RutaSuperadmin({ children }) {
  const { usuario, estaAutenticado, cargandoSesion } = useContext(AuthContext);
  if (cargandoSesion) return null;
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  // Portada solo existe para el superadmin global.
  if (usuario?.rol !== "superadmin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
