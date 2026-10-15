// src/features/auth/LoginPage.jsx — pasos: email → contraseña → OTP
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth.js";
import { PORTAL_URL } from "@/config/config.js";
import { GoogleButton } from "@/features/auth/GoogleButton.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";

export default function LoginPage() {
  const { cargando, validarEmail, ingresar, verificarOtp, reenviarOtp } = useAuth();
  const [paso, setPaso] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [codigo, setCodigo] = useState("");

  const onEmail = async (e) => {
    e.preventDefault();
    if (await validarEmail(email.trim())) setPaso("password");
  };

  const onPassword = async (e) => {
    e.preventDefault();
    const r = await ingresar(email.trim(), password);
    if (r.ok && r.requiereOTP) setPaso("otp");
  };

  const onOtp = async (e) => {
    e.preventDefault();
    await verificarOtp(email.trim(), codigo.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CRM inmobitwo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Accede con tu cuenta de anunciante.
          </p>
        </CardHeader>
        <CardContent>
          {paso === "email" && (
            <form onSubmit={onEmail} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <Button type="submit" disabled={cargando}>
                {cargando ? "Validando…" : "Continuar"}
              </Button>
            </form>
          )}

          {paso === "password" && (
            <form onSubmit={onPassword} className="grid gap-4">
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={verPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {verPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={cargando}>
                {cargando ? "Ingresando…" : "Ingresar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPaso("email")}
              >
                Usar otro correo
              </Button>
            </form>
          )}

          {paso === "otp" && (
            <form onSubmit={onOtp} className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Escriba el código de 6 dígitos que enviamos a {email}.
              </p>
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <Button type="submit" disabled={cargando}>
                {cargando ? "Verificando…" : "Verificar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => reenviarOtp(email.trim())}
              >
                Reenviar código
              </Button>
            </form>
          )}

          <div className="mt-6 flex flex-col gap-2 text-sm">
            <GoogleButton />
            <a href={`${PORTAL_URL}/olvidaste-tu-password`}>
              ¿Olvidó su contraseña?
            </a>
            <p className="text-muted-foreground">
              ¿No tiene cuenta?{" "}
              <a href={`${PORTAL_URL}/registro`}>Crear cuenta en el portal</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
