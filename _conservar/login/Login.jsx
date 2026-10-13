// src/components/login/Login.jsx

import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useAppContext } from "@/context/AppContext";
import { SlSocialGoogle } from "react-icons/sl";
import { Link, useSearchParams } from "react-router-dom";
import { scrollbarStyles } from "@/data/data.styles.scrollbar.js";
import Logo from "../../components/logo/Logo";
import { GoArrowLeft } from "react-icons/go";
import BarraNavegacionTauri from "../../components/barra-navegacion/BarraNavegacionTauri";

const Login = () => {
  const {
    handleChange,
    handleValidateEmail,
    handleLogin,
    handleChangeEmail,
    formDataUsuario,
    setFormDataUsuario,
  } = useAuth();
  const { loadingAuth } = useAppContext();
  const [searchParams] = useSearchParams();
  const emailActual = searchParams.get("email"); // Obtener email de la URL

  // Al recargar o llegar a la página, si hay email en URL, llenarlo automáticamente
  useEffect(() => {
    if (
      emailActual &&
      formDataUsuario.email !== decodeURIComponent(emailActual)
    ) {
      setFormDataUsuario({
        ...formDataUsuario,
        email: decodeURIComponent(emailActual),
      });
    }
  }, [emailActual, formDataUsuario, setFormDataUsuario]);

  return (
    <div className="grid grid-cols-1 bg-gray-100 relative">
      <div
        className="bg-gray-100 h-dvh flex flex-col items-center justify-center"
        id="form-login"
      >
        <div className="flex items-center justify-center px-4">
          <div className="max-w-md min-w-sm bg-white p-8">
            <div className="pb-5 flex items-center flex-col">
              <Logo />
              <p className="text-center mt-2">
                Accede a tu cuenta de Inmobitwo
              </p>
            </div>

            {/* PASO 1: Validar Email */}
            {!emailActual && (
              <form
                onSubmit={handleValidateEmail}
                className="flex flex-col gap-2"
              >
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-1">
                    Tu email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formDataUsuario.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="hover:bg-tercero/80 text-white bg-tercero font-semibold py-2.5 rounded-md transition disabled:opacity-50 cursor-pointer select-none"
                >
                  {loadingAuth ? "Validando..." : "Continuar"}
                </button>

                <Link
                  className="flex items-center justify-end py-2 text-sm hover:underline text-black/80 hover:text-blue-600 cursor-pointer select-none"
                  to={"/olvidaste-tu-password"}
                >
                  <p>¿Olvidaste tu contraseña?</p>
                </Link>

                <div className="flex items-center justify-center text-xs md:text-base py-2">
                  <p className="text-sm font-semibold">
                    También puedes continuar
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={loadingAuth}
                    className="hover:bg-black/80 text-primero bg-segundo font-medium py-2.5 rounded-md transition disabled:opacity-50 border border-black cursor-pointer select-none flex items-center justify-center gap-2"
                  >
                    <SlSocialGoogle /> <span>Google</span>
                  </button>
                </div>

                <p className="text-sm text-black/60 mt-2 text-center font-semibold">
                  ¿No tienes cuenta?{" "}
                  <Link
                    to="/registro"
                    className="text-blue-600 hover:underline"
                  >
                    Regístrate
                  </Link>
                </p>
              </form>
            )}

            {/* PASO 2: Ingresar Contraseña */}
            {emailActual && (
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formDataUsuario.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="hover:bg-tercero/80 text-white bg-tercero font-semibold py-2.5 rounded-md transition disabled:opacity-50 cursor-pointer select-none"
                >
                  {loadingAuth ? "Ingresando..." : "Continuar"}
                </button>

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loadingAuth}
                  className="text-blue-600 font-medium py-2 rounded-md transition hover:underline text-sm flex items-center justify-center gap-2"
                >
                  <GoArrowLeft /> <span>Usar otro email</span>
                </button>

                <div className="flex items-center justify-end py-2 text-sm hover:underline text-black/80 hover:text-blue-600 cursor-pointer select-none">
                  <p>¿Olvidaste tu contraseña?</p>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center mt-6 font-poppins gap-3">
          <p className="text-sm text-black/80">Eres profesional inmobiliario</p>
          <Link
            className="text-sm text-blue-600 font-semibold hover:underline cursor-pointer select-none"
            to={"/nuevo-profesional"}
          >
            Consulta los servicios para profesionales
          </Link>
        </div>
      </div>

      <BarraNavegacionTauri />
      <style>{scrollbarStyles.default}</style>
    </div>
  );
};

export default Login;
