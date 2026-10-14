import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { PORTAL_URL } from "@/config/config.js";
import { aprobarOrganizacion, obtenerOrganizaciones, suspenderOrganizacion } from "@/features/admin/api.js";
import { darDeBajaOrganizacion } from "@/features/inmobiliaria/api.js";

// Suscripción hardcodeada: aún no existe el sistema de pagos.
const SUSCRIPCION = "pendiente";

export default function InmobiliariasPage() {
  const queryClient = useQueryClient();
  const [baja1, setBaja1] = useState(null);
  const [baja2, setBaja2] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["todas-inmobiliarias"],
    queryFn: () => obtenerOrganizaciones(""),
  });
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["todas-inmobiliarias"] });
    queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
  };

  const mAprobar = useMutation({
    mutationFn: (id) => aprobarOrganizacion(id),
    onSuccess: () => {
      toast.success("Inmobiliaria aprobada.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const mSuspender = useMutation({
    mutationFn: (id) => suspenderOrganizacion(id),
    onSuccess: () => {
      toast.success("Inmobiliaria suspendida.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const mBaja = useMutation({
    mutationFn: (id) => darDeBajaOrganizacion(id),
    onSuccess: () => {
      toast.success("Inmobiliaria dada de baja.");
      setBaja2(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const orgs = data ?? [];

  return (
    <>
      <PageHeader
        titulo="Inmobiliarias"
        descripcion="Todas las inmobiliarias con sus datos clave. Solo superadmin."
      />
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : orgs.length === 0 ? (
        <EmptyState titulo="Sin inmobiliarias" descripcion="Aún no hay registradas." />
      ) : (
        <div className="grid gap-3">
          {orgs.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1 text-sm">
                  <p className="font-medium">
                    {o.nombre} <span className="text-muted-foreground text-xs">ID {o.id}</span>
                  </p>
                  <p>
                    <EstadoBadge estado={o.estado} />{" "}
                    <span className="text-muted-foreground text-xs">
                      Suscripción: {SUSCRIPCION}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Dominio: {o.custom_domain ? `${o.custom_domain} (${o.dominio_estado})` : "—"}
                    {" · "}Miembros: {o.miembros_activos ?? "…"} ({o.agentes_activos ?? "…"} agentes)
                    {" · "}Inmuebles: {o.inmuebles ?? "…"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`${PORTAL_URL}/inmobiliarias/${o.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">Ver</Button>
                  </a>
                  {o.estado !== "aprobada" ? (
                    <Button size="sm" onClick={() => mAprobar.mutate(o.id)}>Aprobar</Button>
                  ) : null}
                  {o.estado !== "suspendida" ? (
                    <Button size="sm" variant="outline" onClick={() => mSuspender.mutate(o.id)}>Suspender</Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={(o.agentes_activos ?? 1) > 0 || (o.inmuebles ?? 1) > 0}
                    title={
                      (o.agentes_activos ?? 0) > 0 || (o.inmuebles ?? 0) > 0
                        ? `Pendientes: ${o.agentes_activos} agentes, ${o.inmuebles} inmuebles`
                        : "Dar de baja"
                    }
                    onClick={() => setBaja1(o)}
                  >
                    Baja
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        abierto={!!baja1}
        titulo="Dar de baja (1/2)"
        descripcion={`"${baja1?.nombre}" se eliminará. Solo procede con 0 agentes y 0 inmuebles.`}
        confirmarTexto="Continuar"
        onCancelar={() => setBaja1(null)}
        onConfirmar={() => {
          setBaja1(null);
          setBaja2(baja1);
        }}
      />
      <ConfirmDialog
        abierto={!!baja2}
        titulo="Confirmación final (2/2)"
        descripcion="Esta acción no se puede deshacer."
        confirmarTexto="Sí, dar de baja"
        onCancelar={() => setBaja2(null)}
        onConfirmar={() => mBaja.mutate(baja2.id)}
      />
    </>
  );
}
