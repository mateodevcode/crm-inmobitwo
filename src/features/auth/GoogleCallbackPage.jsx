import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.js";
import { apiBackend } from "@/api/apiBackend.js";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { guardarSesion } = useContext(AuthContext);
  const [error, setError] = useState(() => (params.get("code") ? null : "Falta el código de autorización."));
  // El código es de un solo uso: se comparte la misma promesa entre
  // montajes (ver página del portal).
  const promesaRef = useRef(null);

  useEffect(() => {
    const code = params.get("code");
    if (!code) return;
    if (!promesaRef.current) {
      promesaRef.current = apiBackend("/auth/oauth/google/canjear", "POST", { code });
    }
    let vivo = true;
    (async () => {
      const res = await promesaRef.current;
      if (!vivo) return;
      if (res.success) {
        guardarSesion(res.data.usuario, res.data.accessToken);
        const origen = params.get("next");
        navigate(origen && origen.startsWith("/") ? origen : "/", { replace: true });
      } else {
        setError(res.error || "No se pudo completar el ingreso con Google.");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [params, guardarSesion, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {error ? (
        <div className="max-w-md text-center">
          <p className="mb-2 font-semibold">No se pudo ingresar con Google</p>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <a href="/login" className="text-sm underline">
            Volver al login
          </a>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Completando el ingreso con Google…</p>
      )}
    </div>
  );
}
