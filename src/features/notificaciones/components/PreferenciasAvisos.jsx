// Ajustes → avisos por correo (preferencia del usuario, vale para todos sus espacios)
// y notificaciones en este navegador (push; la suscripción es de este navegador).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.jsx";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Label } from "@/components/ui/label.jsx";
import { guardarPreferenciasAvisos, obtenerPreferenciasAvisos } from "@/features/notificaciones/api.js";
import { activarPush, clavePublicaPush, desactivarPush, estadoPush } from "@/features/notificaciones/push.js";

const CLAVE = ["crm-notif-preferencias"];
const CLAVE_PUSH = ["crm-notif-push"];

const TEXTO_PUSH = {
  no_soportado: "Este navegador no admite notificaciones.",
  bloqueado: "Bloqueaste las notificaciones de este sitio. Actívalas desde la configuración del navegador.",
  apagado: "Las notificaciones del navegador aún no están disponibles.",
  activo: "Recibes los avisos como notificaciones en este navegador.",
  inactivo: "Recibe los avisos al momento, aunque no tengas el CRM abierto.",
};

function NotificacionesNavegador() {
  const queryClient = useQueryClient();
  const { data: estado, isLoading } = useQuery({
    queryKey: CLAVE_PUSH,
    queryFn: async () => {
      const e = await estadoPush();
      if (e === "no_soportado" || e === "bloqueado") return e;
      if (e === "inactivo" && !(await clavePublicaPush())) return "apagado";
      return e;
    },
  });
  const cambiar = useMutation({
    mutationFn: () => (estado === "activo" ? desactivarPush() : activarPush()),
    onSuccess: () => {
      toast.success(estado === "activo" ? "Notificaciones desactivadas en este navegador." : "Notificaciones activadas.");
      queryClient.invalidateQueries({ queryKey: CLAVE_PUSH });
    },
    onError: (err) => {
      toast.error(err.message);
      queryClient.invalidateQueries({ queryKey: CLAVE_PUSH });
    },
  });
  const puedeCambiar = estado === "activo" || estado === "inactivo";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
      <div className="grid gap-1">
        <p className="font-medium">Notificaciones en este navegador</p>
        <p className="text-muted-foreground max-w-2xl">{isLoading ? "Comprobando…" : TEXTO_PUSH[estado]}</p>
      </div>
      {puedeCambiar ? (
        <Button variant="outline" disabled={cambiar.isPending} onClick={() => cambiar.mutate()}>
          {estado === "activo" ? "Desactivar" : "Activar"}
        </Button>
      ) : null}
    </div>
  );
}

export function PreferenciasAvisos() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: CLAVE, queryFn: obtenerPreferenciasAvisos });

  const guardar = useMutation({
    mutationFn: (correo) => guardarPreferenciasAvisos({ correo }),
    onSuccess: (pref) => {
      queryClient.setQueryData(CLAVE, pref);
      toast.success(pref.correo ? "Recibirás los avisos por correo." : "Ya no recibirás los avisos por correo.");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avisos fuera del CRM</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {isError ? <p className="text-destructive">No se pudieron cargar tus preferencias.</p> : null}
        <div className="flex items-start gap-3">
          <Checkbox
            id="avisos-correo"
            checked={data?.correo ?? true}
            disabled={isLoading || isError || guardar.isPending}
            onCheckedChange={(v) => guardar.mutate(v === true)}
          />
          <div className="grid gap-1">
            <Label htmlFor="avisos-correo">Enviarme por correo los avisos que no he leído</Label>
            <p className="text-muted-foreground max-w-2xl">
              Si un aviso del CRM (contactos, tareas o visitas que te asignan, captaciones por vencer…) sigue sin
              leer unos minutos después, te llega en un solo correo. Los leads nuevos y las coincidencias de
              demandas ya tienen su propio correo. Vale para todos tus espacios.
            </p>
          </div>
        </div>
        <NotificacionesNavegador />
      </CardContent>
    </Card>
  );
}
