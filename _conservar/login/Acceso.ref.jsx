import HeaderInmobitwo from "@/pages/publicar-anuncio-info/components/HeaderInmobitwo";
import HeadPerfilAcceso from "../components/HeadPerfilAcceso";
import { FaCheckCircle } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";
import { IoMailOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { GoAlert } from "react-icons/go";
import { apiBackend } from "@/api/apiBackend.js";
import useUsuarios from "@/hooks/useUsuarios";
import { mapearApiAFormDataUsuario } from "@/hooks/useResetForm";
import { phoneFormatter } from "@/lib/phoneFormatter";

const Acceso = () => {
  const {
    usuario,
    setOpenModalCambiarPassword,
    iniciarCarga,
    terminarCarga,
    setFormDataUsuario,
    formDataUsuario,
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const {
    enviarCodigoVerificacion,
    confirmarCodigoVerificacion,
    desactivarVerificacionEmail,
  } = useUsuarios();

  const { email } = usuario;

  const cargarUsuario = async (usuarioId) => {
    try {
      iniciarCarga();
      const res = await apiBackend(
        `/usuarios/${usuarioId}?fields=id,name,email,telefono,email_verificado`,
      );
      const { success, data } = res;
      if (success) {
        setFormDataUsuario(mapearApiAFormDataUsuario(data));
      }
    } catch (error) {
      console.error("Error cargando propiedad:", error);
    } finally {
      terminarCarga();
    }
  };

  useEffect(() => {
    if (usuario.id) {
      cargarUsuario(usuario.id);
    }
  }, [usuario.id]);

  const handleEnviarCodigo = async () => {
    const res = await enviarCodigoVerificacion(formDataUsuario.id, setLoading);
    if (res?.success) {
      setCodigoEnviado(true);
    }
  };

  const handleConfirmarCodigo = async (e) => {
    e.preventDefault();
    if (codigoInput.trim().length !== 6) return;

    const res = await confirmarCodigoVerificacion(
      formDataUsuario.id,
      setLoading,
      codigoInput.trim(),
    );

    if (res?.success) {
      setFormDataUsuario((prev) => ({ ...prev, email_verificado: true }));
      setCodigoEnviado(false);
      setCodigoInput("");
    }
  };

  const handleDesactivar = async () => {
    const res = await desactivarVerificacionEmail(
      formDataUsuario.id,
      setLoading,
    );
    if (res?.success) {
      setFormDataUsuario((prev) => ({ ...prev, email_verificado: false }));
      setCodigoEnviado(false);
      setCodigoInput("");
    }
  };

  return (
    <div className="flex flex-col font-montserrat relative items-center">
      <HeaderInmobitwo />
      <HeadPerfilAcceso />

      <div className="w-11/12 md:w-10/12 min-h-svh mb-8 md:mb-20">
        {formDataUsuario.email_verificado && (
          <div className="w-full md:w-150 bg-stone-50 shadow-sm shadow-black/20 p-8 flex flex-col justify-between border border-black/10 mt-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-black">
                Protege tu cuenta con verificación por email al iniciar sesión
              </h3>

              <div className="flex items-center gap-4 bg-green-100 p-2 px-4 my-4">
                <FaCheckCircle className="text-green-700 text-xl" />
                <p className="text-base md:text-lg font-semibold text-green-800">
                  Verificación en dos pasos activada
                </p>
              </div>

              <p className="text-base md:text-lg mt-2 text-black/90">
                Tus datos cuentan con una seguridad adicional. Al iniciar
                sesión, recibirás un código de verificación en el correo {email}{" "}
                para verificar tu identidad.
              </p>
            </div>

            <button
              className="flex items-center gap-2 text-blue-700 cursor-pointer select-none hover:text-blue-600 mt-4 hover:underline"
              type="button"
              disabled={loading}
              onClick={handleDesactivar}
            >
              <p className="font-semibold text-base md:text-lg">
                Desactivar verificación por email
              </p>
            </button>
          </div>
        )}

        {!formDataUsuario.email_verificado && (
          <div className="w-full md:w-150 bg-stone-50 shadow-sm shadow-black/20 p-6 md:p-8 flex flex-col justify-between border border-black/10 mt-8">
            <div>
              <h3 className="text-xl font-bold text-black">
                Verifica tu correo electrónico para proteger tu cuenta
              </h3>

              <div className="flex items-center gap-4 bg-black/5 p-2 px-4 my-4">
                <GoAlert className="text-black text-xl" />
                <p className="text-base md:text-lg font-semibold text-black">
                  Email sin verificar
                </p>
              </div>

              <p className="text-base md:text-lg mt-2 text-black/90">
                Tu dirección de correo {email} aún no ha sido verificada.
                Verifícala para activar la seguridad adicional y poder recibir
                códigos al iniciar sesión.
              </p>
            </div>

            {!codigoEnviado ? (
              <button
                className="flex items-center gap-2 text-white cursor-pointer select-none hover:bg-black/80 bg-black mt-4 py-2 px-4 rounded-md justify-center w-full md:w-80 active:scale-95 duration-75 transition disabled:opacity-50"
                type="button"
                disabled={loading}
                onClick={handleEnviarCodigo}
              >
                <IoMailOutline className="text-lg md:text-xl" />
                <p className="font-semibold text-base">
                  Enviar correo de verificación
                </p>
              </button>
            ) : (
              <form
                onSubmit={handleConfirmarCodigo}
                className="mt-4 flex flex-col gap-3 w-sm"
              >
                <p className="text-black/90">
                  Te enviamos un código de 6 dígitos a {email}. Escríbelo abajo
                  para verificar tu correo.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigoInput}
                  onChange={(e) =>
                    setCodigoInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  className="border border-black/30 rounded-md p-3 text-black text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-600"
                />
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading || codigoInput.length !== 6}
                    className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verificando..." : "Confirmar código"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEnviarCodigo}
                    disabled={loading}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Reenviar código
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="w-full md:w-150 bg-stone-50 shadow-sm shadow-black/20 p-6 md:p-8 flex flex-col justify-between border border-black/10 mt-6 md:mt-8">
          <div>
            <h3 className="text-xl font-bold text-black">Email de acceso</h3>
            <p className="text-base md:text-lg mt-2 text-black/90">
              Tus datos cuentan con una seguridad adicional. Al iniciar sesión,
              recibirás un código SMS en el móvil{" "}
              {phoneFormatter(formDataUsuario.telefono)} para verificar tu
              identidad.
            </p>
          </div>

          <div className="bg-stone-100 p-2 border border-black/10 w-full md:w-96 px-4 mt-4">
            <p className="text-base md:text-lg text-black">{email}</p>
          </div>

          <button className="flex items-center gap-2 text-amber-700 mt-4">
            <p className="text-base md:text-lg">
              Si quieres modificar tu email llama al 917882791
            </p>
          </button>
        </div>

        <div className="w-full md:w-150 bg-stone-50 shadow-sm shadow-black/20 p-6 md:p-8 flex flex-col justify-between border border-black/10 mt-8">
          <div>
            <h3 className="text-xl font-bold text-black">Contraseña</h3>
          </div>

          <button
            className="flex items-center gap-2 text-blue-700 cursor-pointer select-none hover:text-blue-600 mt-8 hover:underline"
            type="button"
            onClick={() => setOpenModalCambiarPassword(true)}
          >
            <p className="font-semibold text-base md:text-lg">
              Cambiar contraseña
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Acceso;
