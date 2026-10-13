// src/hooks/useAuth.js
// Equivalente al useIniciarSesion.js de Next.js
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppContext } from "@/context/AppContext.js";
import { apiBackend } from "@/api/apiBackend.js";
import usePropiedades from "@/hooks/usePropiedades";
import useResetForm from "./useResetForm";
import { validatePasswordRegistro } from "@/utils/validatePassword";

const useAuth = () => {
  const {
    formDataUsuario,
    setFormDataUsuario,
    resetFormDataUsuario,
    guardarSesion,
    cerrarSesion,
    setLoadingAuth,
    iniciarCarga,
    terminarCarga,
  } = useContext(AppContext);
  const { limpiarPropiedades } = usePropiedades();
  const { resetFormDataPropiedad } = useResetForm();

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // Manejar cambios en el formulario
  // ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataUsuario((prev) => ({ ...prev, [name]: value }));
  };

  // ─────────────────────────────────────────────
  // PASO 1: Validar email (sin password)
  // ─────────────────────────────────────────────
  const handleValidateEmail = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);

    try {
      // Validar que el email no esté vacío
      if (!formDataUsuario.email.trim()) {
        toast.error("Por favor ingresa tu email", { position: "bottom-right" });
        setLoadingAuth(false);
        return;
      }

      const res = await apiBackend("/auth/check-email", "POST", {
        email: formDataUsuario.email,
      });

      if (!res.success) {
        toast.error(res.error || "Error al validar el email", {
          position: "bottom-right",
        });
        setLoadingAuth(false);
        return;
      }

      // Email válido - agregar a URL y avanzar al paso 2
      navigate(`/login?email=${encodeURIComponent(formDataUsuario.email)}`);
    } catch (error) {
      toast.error("Error de conexión. Intenta nuevamente.", {
        position: "bottom-right",
      });
      console.error("❌ Error validando email:", error);
    } finally {
      setLoadingAuth(false);
    }
  };

  // ─────────────────────────────────────────────
  // PASO 2: Login con email + contraseña
  // ─────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);

    try {
      iniciarCarga();

      // Validar que la contraseña no esté vacía
      if (!formDataUsuario.password.trim()) {
        toast.error("Por favor ingresa tu contraseña", {
          position: "bottom-right",
        });
        setLoadingAuth(false);
        return;
      }

      const res = await apiBackend("/auth/login", "POST", {
        email: formDataUsuario.email,
        password: formDataUsuario.password,
      });

      if (!res.success) {
        toast.error(res.error || "Credenciales incorrectas", {
          position: "bottom-right",
        });
        setLoadingAuth(false);
        return;
      }

      guardarSesion(res.data.usuario, res.data.accessToken);
      // await cargarPropiedades();
      resetFormDataUsuario();

      toast.success("¡Inicio de sesión exitoso!", { position: "bottom-right" });

      // Redirigir según rol
      if (res.data.usuario.rol === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("Error inesperado", { position: "bottom-right" });
      console.error("❌ Error en login:", error);
    } finally {
      terminarCarga();
      setLoadingAuth(false);
    }
  };

  // ─────────────────────────────────────────────
  // Cambiar de email (volver al paso 1)
  // ─────────────────────────────────────────────
  const handleChangeEmail = () => {
    resetFormDataUsuario();
    navigate("/login");
  };

  // ─────────────────────────────────────────────
  // Registro de nuevo usuario
  // ─────────────────────────────────────────────
  const handleRegistro = async (e) => {
    e.preventDefault();

    const erroresPassword = validatePasswordRegistro(formDataUsuario.password);
    if (erroresPassword.length > 0) {
      toast.error(erroresPassword[0], { position: "bottom-right" });
      return;
    }

    setLoadingAuth(true);

    try {
      const res = await apiBackend("/auth/registro", "POST", {
        name: formDataUsuario.name,
        email: formDataUsuario.email,
        password: formDataUsuario.password,
        telefono: formDataUsuario.telefono,
      });

      if (!res.success) {
        const errorMsg = Array.isArray(res.error)
          ? res.error.join(", ")
          : res.error;
        toast.error(errorMsg || "Error al crear la cuenta", {
          position: "bottom-right",
        });
        return;
      }

      guardarSesion(res.data.usuario, res.data.accessToken);
      resetFormDataUsuario();

      toast.success("¡Cuenta creada correctamente!", {
        position: "bottom-right",
      });
      navigate("/");
    } catch (error) {
      toast.error("Error inesperado", { position: "bottom-right" });
      console.error("❌ Error en registro:", error);
    } finally {
      setLoadingAuth(false);
    }
  };

  // ─────────────────────────────────────────────
  // Cerrar sesión
  // ─────────────────────────────────────────────
  const handleCerrarSesion = async () => {
    await cerrarSesion();
    toast.success("Sesión cerrada", { position: "bottom-right" });

    resetFormDataPropiedad();
    limpiarPropiedades();
    navigate("/login");
  };

  return {
    handleChange,
    handleValidateEmail,
    handleLogin,
    handleChangeEmail,
    handleRegistro,
    handleCerrarSesion,
    formDataUsuario,
    setFormDataUsuario,
  };
};

export default useAuth;
