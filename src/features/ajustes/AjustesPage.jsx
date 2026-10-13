import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import {
  actualizarEtapa,
  crearEtapa,
  eliminarEtapa,
  obtenerEtapas,
} from "@/features/pipeline/api.js";

export default function AjustesPage() {
  const { espacio, puedeAdministrar } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [eliminar, setEliminar] = useState(null);

  const clave = ["crm-etapas", espacio];
  const { data, isLoading } = useQuery({ queryKey: clave, queryFn: obtenerEtapas });

  const crear = useMutation({
    mutationFn: () => crearEtapa({ nombre: nombre.trim() }),
    onSuccess: () => {
      toast.success("Etapa creada.");
      setNombre("");
      queryClient.invalidateQueries({ queryKey: clave });
    },
    onError: (err) => toast.error(err.message),
  });

  const renombrar = useMutation({
    mutationFn: ({ id, campo, valor }) => actualizarEtapa(id, { [campo]: valor }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clave }),
    onError: (err) => toast.error(err.message),
  });

  const borrar = useMutation({
    mutationFn: (id) => eliminarEtapa(id),
    onSuccess: () => {
      toast.success("Etapa eliminada.");
      setEliminar(null);
      queryClient.invalidateQueries({ queryKey: clave });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <PageHeader titulo="Ajustes" descripcion="Etapas del pipeline de su espacio." />
      <Card>
        <CardHeader>
          <CardTitle>Etapas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
          {(data ?? []).map((et) => (
            <div key={et.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <Input
                defaultValue={et.nombre}
                disabled={!puedeAdministrar}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== et.nombre) {
                    renombrar.mutate({ id: et.id, campo: "nombre", valor: e.target.value.trim() });
                  }
                }}
                className="w-48"
              />
              <input
                type="color"
                defaultValue={et.color || "#64748b"}
                disabled={!puedeAdministrar}
                onBlur={(e) => renombrar.mutate({ id: et.id, campo: "color", valor: e.target.value })}
                className="h-9 w-12"
                aria-label={`Color de ${et.nombre}`}
              />
              <span className="text-muted-foreground text-xs">
                {et.tipo} · {et.probabilidad_default}%
              </span>
              {puedeAdministrar ? (
                <Button size="sm" variant="outline" onClick={() => setEliminar(et)}>
                  Eliminar
                </Button>
              ) : null}
            </div>
          ))}
          {puedeAdministrar ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (nombre.trim()) crear.mutate();
              }}
            >
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nueva etapa…"
                className="max-w-xs"
              />
              <Button type="submit" disabled={crear.isPending}>Añadir</Button>
            </form>
          ) : (
            <p className="text-muted-foreground text-sm">
              Solo un administrador puede editar las etapas.
            </p>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        abierto={!!eliminar}
        titulo="Eliminar etapa"
        descripcion="No se puede eliminar una etapa con oportunidades."
        confirmarTexto="Eliminar"
        onCancelar={() => setEliminar(null)}
        onConfirmar={() => borrar.mutate(eliminar.id)}
      />
    </>
  );
}
