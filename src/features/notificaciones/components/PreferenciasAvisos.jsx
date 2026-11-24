// Ajustes → avisos por correo. La preferencia es del usuario (vale para todos sus espacios).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Label } from "@/components/ui/label.jsx";
import { guardarPreferenciasAvisos, obtenerPreferenciasAvisos } from "@/features/notificaciones/api.js";

const CLAVE = ["crm-notif-preferencias"];

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
        <CardTitle>Avisos por correo</CardTitle>
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
      </CardContent>
    </Card>
  );
}
