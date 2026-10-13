import { useContext, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { obtenerContactos } from "@/features/contactos/api.js";
import {
  cerrarOportunidad,
  crearOportunidad,
  moverOportunidad,
  obtenerEtapas,
  obtenerOportunidades,
} from "@/features/pipeline/api.js";

function Tarjeta({ op, onAbrir }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: op.id,
    data: { etapaId: op.etapa_id },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      onClick={() => onAbrir(op)}
      className="cursor-grab rounded-lg border bg-card p-3 text-sm"
    >
      <p className="font-medium">{op.titulo}</p>
      <p className="text-muted-foreground text-xs">{op.contacto_nombre}</p>
      {op.propiedad_titulo ? <p className="text-xs">{op.propiedad_titulo}</p> : null}
      <p className="mt-1 flex justify-between text-xs">
        <MoneyText valor={op.valor} />
        <span>{op.probabilidad}%</span>
      </p>
    </div>
  );
}

function Columna({ etapa, ops, total, onAbrir }) {
  const { setNodeRef } = useDroppable({ id: `col-${etapa.id}`, data: { etapaId: etapa.id } });
  return (
    <div ref={setNodeRef} className="flex w-72 shrink-0 flex-col gap-2 rounded-lg border p-2">
      <div className="flex items-center justify-between px-1">
        <p className="font-medium">{etapa.nombre}</p>
        <span className="text-muted-foreground text-xs">{ops.length}</span>
      </div>
      <SortableContext items={ops.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-2">
          {ops.map((op) => (
            <Tarjeta key={op.id} op={op} onAbrir={onAbrir} />
          ))}
        </div>
      </SortableContext>
      <p className="text-muted-foreground px-1 text-xs">
        Total: <MoneyText valor={total} />
      </p>
    </div>
  );
}

export default function PipelinePage() {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [filtros, setFiltros] = useState({ valorMin: "", valorMax: "", propiedad: "" });
  const [aplicados, setAplicados] = useState({ valorMin: "", valorMax: "", propiedad: "" });
  const [detalle, setDetalle] = useState(null);
  const [crear, setCrear] = useState(params.get("crear") ? { contacto_id: params.get("crear"), titulo: "", valor: "" } : null);
  const [motivo, setMotivo] = useState("");

  const clave = ["crm-oportunidades", espacio, aplicados];
  const etapasQ = useQuery({ queryKey: ["crm-etapas", espacio], queryFn: obtenerEtapas });
  const opsQ = useQuery({ queryKey: clave, queryFn: () => obtenerOportunidades(aplicados) });
  const contactosQ = useQuery({
    queryKey: ["crm-contactos-lista", espacio],
    queryFn: () => obtenerContactos({ pagina: 1, limite: 100 }),
    enabled: !!crear,
  });

  const porEtapa = useMemo(() => {
    const mapa = {};
    for (const op of opsQ.data ?? []) {
      (mapa[op.etapa_id] ??= []).push(op);
    }
    for (const k of Object.keys(mapa)) mapa[k].sort((a, b) => a.posicion - b.posicion);
    return mapa;
  }, [opsQ.data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const mover = useMutation({
    mutationFn: ({ id, etapaId, indice }) => moverOportunidad(id, etapaId, indice),
    onError: (err) => {
      toast.error(err.message);
      queryClient.invalidateQueries({ queryKey: clave });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: clave }),
  });

  const encontrar = (id) => (opsQ.data ?? []).find((o) => Number(o.id) === Number(id));

  const onDragEnd = (e) => {
    const { active, over } = e;
    if (!over) return;
    const op = encontrar(active.id);
    if (!op) return;
    // Destino: tarjeta (su etapa) o columna.
    const overOp = encontrar(over.id);
    const etapaDestino = overOp ? overOp.etapa_id : Number(String(over.id).replace("col-", ""));
    if (!etapaDestino) return;
    const lista = [...(porEtapa[etapaDestino] ?? [])].sort((a, b) => a.posicion - b.posicion);
    let indice = lista.length;
    if (overOp) {
      indice = lista.findIndex((o) => Number(o.id) === Number(overOp.id));
      if (Number(op.etapa_id) === Number(etapaDestino)) {
        const actual = lista.findIndex((o) => Number(o.id) === Number(op.id));
        if (actual < indice) indice -= 0; // el backend ajusta el hueco
        if (actual === indice) return;
      }
    }
    // Optimista: reordena en caché.
    queryClient.setQueryData(clave, (viejo) => {
      if (!Array.isArray(viejo)) return viejo;
      return viejo.map((o) =>
        Number(o.id) === Number(op.id) ? { ...o, etapa_id: etapaDestino } : o,
      );
    });
    mover.mutate({ id: op.id, etapaId: etapaDestino, indice });
  };

  const cerrar = useMutation({
    mutationFn: ({ id, estado }) => cerrarOportunidad(id, estado, estado === "perdida" ? motivo : null),
    onSuccess: () => {
      toast.success("Oportunidad cerrada.");
      setDetalle(null);
      setMotivo("");
      queryClient.invalidateQueries({ queryKey: clave });
    },
    onError: (err) => toast.error(err.message),
  });

  const crearMut = useMutation({
    mutationFn: crearOportunidad,
    onSuccess: () => {
      toast.success("Oportunidad creada.");
      setCrear(null);
      queryClient.invalidateQueries({ queryKey: clave });
    },
    onError: (err) => toast.error(err.message),
  });

  if (etapasQ.isLoading || opsQ.isLoading) {
    return (
      <>
        <PageHeader titulo="Pipeline" />
        <Skeleton className="h-64" />
      </>
    );
  }
  if (etapasQ.isError || opsQ.isError) {
    return (
      <>
        <PageHeader titulo="Pipeline" />
        <EmptyState titulo="No se pudo cargar el pipeline" />
      </>
    );
  }

  const etapas = (etapasQ.data ?? []).filter((et) => et.tipo === "abierta");

  return (
    <>
      <PageHeader
        titulo="Pipeline"
        descripcion="Arrastre las tarjetas entre etapas."
        acciones={<Button onClick={() => setCrear({ contacto_id: "", titulo: "", valor: "" })}>Nueva oportunidad</Button>}
      />
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setAplicados(filtros);
        }}
      >
        <Input
          placeholder="Valor mín (COP)"
          inputMode="numeric"
          value={filtros.valorMin}
          onChange={(e) => setFiltros((f) => ({ ...f, valorMin: e.target.value }))}
          className="w-40"
        />
        <Input
          placeholder="Valor máx (COP)"
          inputMode="numeric"
          value={filtros.valorMax}
          onChange={(e) => setFiltros((f) => ({ ...f, valorMax: e.target.value }))}
          className="w-40"
        />
        <Input
          placeholder="ID propiedad"
          inputMode="numeric"
          value={filtros.propiedad}
          onChange={(e) => setFiltros((f) => ({ ...f, propiedad: e.target.value }))}
          className="w-36"
        />
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {etapas.map((et) => {
            const ops = porEtapa[et.id] ?? [];
            const total = ops.reduce((s, o) => s + (Number(o.valor) || 0), 0);
            return <Columna key={et.id} etapa={et} ops={ops} total={total} onAbrir={setDetalle} />;
          })}
        </div>
      </DndContext>

      <Sheet open={!!detalle} onOpenChange={(v) => !v && setDetalle(null)}>
        <SheetContent>
          {detalle ? (
            <>
              <SheetHeader>
                <SheetTitle>{detalle.titulo}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-3 pt-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Contacto: </span>
                  <Link to={`/contactos/${detalle.contacto_id}`} className="underline">
                    {detalle.contacto_nombre}
                  </Link>
                </p>
                <p><span className="text-muted-foreground">Valor: </span><MoneyText valor={detalle.valor} /></p>
                <p><span className="text-muted-foreground">Probabilidad: </span>{detalle.probabilidad}%</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => cerrar.mutate({ id: detalle.id, estado: "ganada" })}>
                    Cerrar ganada
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Input
                    placeholder="Motivo de pérdida"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => cerrar.mutate({ id: detalle.id, estado: "perdida" })}
                  >
                    Cerrar perdida
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={!!crear} onOpenChange={(v) => !v && setCrear(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva oportunidad</DialogTitle>
          </DialogHeader>
          {crear ? (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                crearMut.mutate({
                  contacto_id: Number(crear.contacto_id),
                  titulo: crear.titulo,
                  valor: crear.valor ? Number(crear.valor) : null,
                });
              }}
            >
              <Select
                value={String(crear.contacto_id || "")}
                onValueChange={(v) => setCrear((c) => ({ ...c, contacto_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Contacto" />
                </SelectTrigger>
                <SelectContent>
                  {(contactosQ.data?.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Título (ej. Apartamento Usaquén — Juan)"
                required
                value={crear.titulo}
                onChange={(e) => setCrear((c) => ({ ...c, titulo: e.target.value }))}
              />
              <Input
                placeholder="Valor COP"
                inputMode="numeric"
                value={crear.valor}
                onChange={(e) => setCrear((c) => ({ ...c, valor: e.target.value }))}
              />
              <Button type="submit" disabled={crearMut.isPending}>Crear</Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
