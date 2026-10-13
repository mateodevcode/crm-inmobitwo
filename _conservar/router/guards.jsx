// src/router/guards.jsx
import { Navigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext.js";

export const RutaPrivada = ({ children }) => {
  const { estaAutenticado } = useAppContext();
  return estaAutenticado ? children : <Navigate to="/login" replace />;
};

export const RutaAdmin = ({ children }) => {
  const { estaAutenticado, esSuperAdmin } = useAppContext();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (!esSuperAdmin) return <Navigate to="/" replace />;
  return children;
};

export const RutaPublica = ({ children }) => {
  const { estaAutenticado } = useAppContext();
  return estaAutenticado ? <Navigate to="/" replace /> : children;
};
