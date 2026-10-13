// src/hooks/useAuth.js — login CRM con OTP y email no verificado
// Respuestas reales backend:
// POST /auth/check-email {email} -> 200 {data:{email}} | 404 | 403 bloqueada
// POST /auth/login {email,password} -> {data:{requiereOTP:true,email}} | {data:{usuario,accessToken}}
// POST /auth/verificar-otp-login {email,codigo} -> {data:{usuario,accessToken}}
// POST /auth/reenviar-otp-login {email} -> 200
// POST /usuarios/:id/enviar-codigo | POST /usuarios/:id/confirmar-codigo {codigo}
import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { apiBackend } from "@/api/apiBackend.js";

export default function useAuth() {
  const { guardarSesion } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cargando, setCargando] = useState(false);

  const irDestino = () => {
    const origen = searchParams.get("origen");
    navigate(origen && origen.startsWith("/") ? origen : "/", { replace: true });
  };

  const validarEmail = async (email) => {
    setCargando(true);
    try {
      const res = await apiBackend("/auth/check-email", "POST", { email });
      if (!res.success) {
        toast.error(res.error || "No encontramos una cuenta con este correo.");
        return false;
      }
      return true;
    } finally {
      setCargando(false);
    }
  };

  const ingresar = async (email, password) => {
    setCargando(true);
    try {
      const res = await apiBackend("/auth/login", "POST", { email, password });
      if (!res.success) {
        toast.error(res.error || "Credenciales incorrectas.");
        return { ok: false };
      }
      if (res.data?.requiereOTP) {
        toast.success("Te enviamos un código de verificación a tu correo.");
        return { ok: true, requiereOTP: true };
      }
      guardarSesion(res.data.usuario, res.data.accessToken);
      toast.success("Sesión iniciada.");
      irDestino();
      return { ok: true };
    } finally {
      setCargando(false);
    }
  };

  const verificarOtp = async (email, codigo) => {
    setCargando(true);
    try {
      const res = await apiBackend("/auth/verificar-otp-login", "POST", {
        email,
        codigo,
      });
      if (!res.success) {
        toast.error(res.error || "El código no es válido o expiró.");
        return false;
      }
      guardarSesion(res.data.usuario, res.data.accessToken);
      toast.success("Verificación correcta. ¡Bienvenido!");
      irDestino();
      return true;
    } finally {
      setCargando(false);
    }
  };

  const reenviarOtp = async (email) => {
    const res = await apiBackend("/auth/reenviar-otp-login", "POST", { email });
    if (res.success) toast.success("Código reenviado a tu correo.");
    else toast.error(res.error || "No pudimos reenviar el código.");
  };

  const enviarCodigoEmail = async (usuarioId) => {
    const res = await apiBackend(`/usuarios/${usuarioId}/enviar-codigo`, "POST");
    if (res.success) toast.success("Código enviado a tu correo.");
    else toast.error(res.error || "No pudimos enviar el código.");
    return res.success;
  };

  const confirmarCodigoEmail = async (usuarioId, codigo) => {
    const res = await apiBackend(`/usuarios/${usuarioId}/confirmar-codigo`, "POST", {
      codigo,
    });
    if (res.success) toast.success("Correo verificado.");
    else toast.error(res.error || "El código no es válido.");
    return res.success;
  };

  return {
    cargando,
    validarEmail,
    ingresar,
    verificarOtp,
    reenviarOtp,
    enviarCodigoEmail,
    confirmarCodigoEmail,
  };
}
