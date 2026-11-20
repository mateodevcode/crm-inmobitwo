// Gestionar plantillas de respuesta del espacio: crear, editar y borrar.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  actualizarPlantilla,
  crearPlantilla,
  eliminarPlantilla,
  obtenerPlantillas,
} from "@/features/bandeja/api.js";
import { PLANTILLAS_SUGERIDAS, VARIABLES } from "@/features/bandeja/plantillas.js";

export function PlantillasDialog({ abierto, onCerrar }) {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(null); // null | { id?, titulo, contenido }
  const [borrar, setBorrar] = useState(null);
  const q = useQuery({ queryKey: ["crm-plantillas"], queryFn: obtenerPlantillas, enabled: abierto });
  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-plantillas"] });

  const guardar = useMutation({
    mutationFn: (p) => (p.id ? actualizarPlantilla(p.id, { titulo: p.titulo, contenido: p.contenido }) : crearPlantilla(p)),
    onSuccess: () => {
      toast.success("Plantilla guardada.");
      setEditando(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const eliminar = useMutation({
    mutationFn: (id) => eliminarPlantilla(id),
    onSuccess: () => {
      toast.success("Plantilla eliminada.");
      setBorrar(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const lista = q.data ?? [];
  const insertarVariable = (clave) =>
    setEditando((e) => ({ ...e, contenido: `${e.contenido}${e.contenido && !e.contenido.endsWith(" ") ? " " : ""}{${clave}}` }));

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Plantillas de respuesta</DialogTitle>
          <DialogDescription>Mensajes listos para chat, WhatsApp o correo. Las ve todo tu equipo.</DialogDescription>
        </DialogHeader>

        {editando ? (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              guardar.mutate(editando);
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="pl-titulo">Título</Label>
              <Input
                id="pl-titulo"
                maxLength={80}
                value={editando.titulo}
                onChange={(e) => setEditando((x) => ({ ...x, titulo: e.target.value }))}
                placeholder="Ej.: Primer contacto"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pl-contenido">Mensaje</Label>
              <Textarea
                id="pl-contenido"
                rows={5}
                maxLength={2000}
                value={editando.contenido}
                onChange={(e) => setEditando((x) => ({ ...x, contenido: e.target.value }))}
              />
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-muted-foreground text-xs">Insertar:</span>
                {VARIABLES.map((v) => (
                  <Button key={v.clave} type="button" size="xs" variant="outline" title={v.descripcion} onClick={() => insertarVariable(v.clave)}>
                    {`{${v.clave}}`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button
                type="submit"
                disabled={guardar.isPending || editando.titulo.trim().length < 2 || editando.contenido.trim().length < 2}
              >
                Guardar
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3">
            <Button variant="outline" onClick={() => setEditando({ titulo: "", contenido: "" })}>
              <PlusIcon /> Nueva plantilla
            </Button>
            {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
            {q.isError ? <p className="text-destructive text-sm">{q.error.message}</p> : null}
            {q.isSuccess && lista.length === 0 ? (
              <div className="grid gap-2 rounded-lg border border-dashed p-3">
                <p className="text-sm">Aún no tienes plantillas. Empieza con una de estas:</p>
                {PLANTILLAS_SUGERIDAS.map((s) => (
                  <Button key={s.titulo} variant="secondary" size="sm" className="justify-start" onClick={() => setEditando(s)}>
                    <PlusIcon /> {s.titulo}
                  </Button>
                ))}
              </div>
            ) : null}
            <ul className="grid gap-2">
              {lista.map((t) => (
                <li key={t.id} className="grid gap-1 rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{t.titulo}</p>
                    {t.editable ? (
                      <div className="flex shrink-0 gap-1">
                        <Button size="icon" variant="ghost" aria-label={`Editar ${t.titulo}`} onClick={() => setEditando(t)}>
                          <PencilIcon />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" aria-label={`Borrar ${t.titulo}`} onClick={() => setBorrar(t)}>
                          <Trash2Icon />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-line">{t.contenido}</p>
                  <p className="text-muted-foreground text-xs">
                    {t.usos} {t.usos === 1 ? "uso" : "usos"}
                    {t.creado_por_nombre ? ` · ${t.creado_por_nombre}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ConfirmDialog
          abierto={!!borrar}
          titulo="¿Borrar la plantilla?"
          descripcion={`«${borrar?.titulo}» deja de estar disponible para todo el equipo.`}
          confirmarTexto="Borrar"
          cancelando={eliminar.isPending}
          onCancelar={() => setBorrar(null)}
          onConfirmar={() => eliminar.mutate(borrar.id)}
        />
      </DialogContent>
    </Dialog>
  );
}
