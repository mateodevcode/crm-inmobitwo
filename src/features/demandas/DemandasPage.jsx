// /demandas — lo que buscan los clientes y el cruce con los inmuebles.
// ?demanda=ID abre esa demanda (enlace del correo de aviso).
import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PauseIcon, PencilIcon, PlayIcon, PlusIcon, SearchCheckIcon, Trash2Icon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import {
  actualizarDemanda,
  eliminarDemanda,
  obtenerDemanda,
  obtenerDemandas,
} from "@/features/demandas/api.js";
import { ESTADOS_DEMANDA, resumenDemanda } from "@/features/demandas/criterios.js";
import { DemandaDialog } from "@/features/demandas/components/DemandaDialog.jsx";
import { Coincidencias } from "@/features/demandas/components/Coincidencias.jsx";
import { cn } from "@/lib/utils.js";

export default function DemandasPage() {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [estado, setEstado] = useState("activa");
  const [dialogo, setDialogo] = useState(null); // null | { demanda? }
  const [borrar, setBorrar] = useState(null);

  const listaQ = useQuery({
    queryKey: ["crm-demandas", espacio, "lista", estado],
    queryFn: () => obtenerDemandas({ estado }),
  });
  const lista = listaQ.data ?? [];

  const idSel = params.get("demanda") ?? (lista[0] ? String(lista[0].id) : null);
  const enLista = lista.find((d) => String(d.id) === idSel);
  // Si viene por URL y no está en la pestaña actual (p. ej. pausada), se pide aparte.
  const detalleQ = useQuery({
    queryKey: ["crm-demandas", espacio, "detalle", idSel],
    queryFn: () => obtenerDemanda(idSel),
    enabled: !!idSel && !enLista && !listaQ.isLoading,
    retry: false,
  });
  const seleccionada = enLista ?? detalleQ.data ?? null;

  const elegir = (id) => {
    params.set("demanda", String(id));
    setParams(params, { replace: true });
  };

  const cambiarEstado = useMutation({
    mutationFn: ({ id, nuevo }) => actualizarDemanda(id, { estado: nuevo }),
    onSuccess: (_, { nuevo }) => {
      toast.success({ activa: "Demanda reactivada.", pausada: "Demanda pausada.", cerrada: "Demanda cerrada." }[nuevo]);
      queryClient.invalidateQueries({ queryKey: ["crm-demandas"] });
    },
    onError: (err) => toast.error(err.message),
  });
  const eliminar = useMutation({
    mutationFn: (id) => eliminarDemanda(id),
    onSuccess: () => {
      toast.success("Demanda borrada.");
      setBorrar(null);
      params.delete("demanda");
      setParams(params, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["crm-demandas"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <PageHeader
        titulo="Demandas"
        descripcion="Qué buscan tus clientes y qué inmuebles les encajan."
        acciones={
          <Button onClick={() => setDialogo({})}>
            <PlusIcon /> Nueva demanda
          </Button>
        }
      />

      <Tabs value={estado} onValueChange={setEstado}>
        <TabsList>
          <TabsTrigger value="activa">Activas</TabsTrigger>
          <TabsTrigger value="pausada">Pausadas</TabsTrigger>
          <TabsTrigger value="cerrada">Cerradas</TabsTrigger>
        </TabsList>
      </Tabs>

      {listaQ.isError ? <p role="alert" className="text-destructive text-sm">{listaQ.error.message}</p> : null}
      {!listaQ.isLoading && !listaQ.isError && lista.length === 0 && !seleccionada ? (
        <EmptyState
          titulo={estado === "activa" ? "Aún no hay demandas" : "No hay demandas en este estado"}
          descripcion="Registra lo que busca un cliente y el CRM te muestra los inmuebles que le encajan."
          accion={<Button onClick={() => setDialogo({})}>Nueva demanda</Button>}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {lista.length > 0 ? (
          <ul className="grid content-start gap-2" aria-label="Demandas">
            {lista.map((d) => {
              const activa = String(d.id) === String(seleccionada?.id);
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => elegir(d.id)}
                    aria-current={activa || undefined}
                    className={cn(
                      "grid w-full gap-1 rounded-xl border p-3 text-left transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      activa && "border-primary bg-accent",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate font-medium">{d.contacto_nombre}</span>
                      {d.coincidencias?.nuevas ? (
                        <Badge className="shrink-0">{d.coincidencias.nuevas} nuevas</Badge>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground line-clamp-2 text-xs">{resumenDemanda(d)}</span>
                    <span className="text-xs">
                      <span className="font-semibold">{d.coincidencias?.total ?? 0}</span>{" "}
                      <span className="text-muted-foreground">
                        {d.coincidencias?.total === 1 ? "coincidencia en tu cartera" : "coincidencias en tu cartera"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="hidden lg:block" />
        )}

        {seleccionada ? (
          <Card className="min-w-0">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <SearchCheckIcon className="size-4" aria-hidden />
                    <Link to={`/contactos/${seleccionada.contacto_id}`} className="truncate underline-offset-4 hover:underline">
                      {seleccionada.contacto_nombre}
                    </Link>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">{resumenDemanda(seleccionada)}</p>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <span className={`size-2 rounded-full ${ESTADOS_DEMANDA[seleccionada.estado]?.punto}`} aria-hidden />
                  {ESTADOS_DEMANDA[seleccionada.estado]?.etiqueta}
                </Badge>
              </div>
              {seleccionada.notas ? (
                <p className="bg-muted rounded-lg p-3 text-sm whitespace-pre-line">{seleccionada.notas}</p>
              ) : null}
              {seleccionada.agente_nombre ? (
                <p className="text-muted-foreground text-xs">Responsable: {seleccionada.agente_nombre}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDialogo({ demanda: seleccionada })}>
                  <PencilIcon /> Editar
                </Button>
                {seleccionada.estado === "activa" ? (
                  <Button size="sm" variant="outline" onClick={() => cambiarEstado.mutate({ id: seleccionada.id, nuevo: "pausada" })}>
                    <PauseIcon /> Pausar
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => cambiarEstado.mutate({ id: seleccionada.id, nuevo: "activa" })}>
                    <PlayIcon /> Reactivar
                  </Button>
                )}
                {seleccionada.estado !== "cerrada" ? (
                  <Button size="sm" variant="outline" onClick={() => cambiarEstado.mutate({ id: seleccionada.id, nuevo: "cerrada" })}>
                    <XCircleIcon /> Cerrar
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setBorrar(seleccionada)}>
                  <Trash2Icon /> Borrar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Coincidencias key={seleccionada.id} demanda={seleccionada} />
            </CardContent>
          </Card>
        ) : null}
      </div>
      {listaQ.isLoading ? <p className="text-muted-foreground text-sm">Cargando demandas…</p> : null}

      <DemandaDialog
        abierto={!!dialogo}
        demanda={dialogo?.demanda ?? null}
        onCerrar={() => setDialogo(null)}
        onGuardada={(d) => d?.id && elegir(d.id)}
      />
      <ConfirmDialog
        abierto={!!borrar}
        titulo="¿Borrar la demanda?"
        descripcion="Se pierde el registro de inmuebles enviados y descartados. Si el cliente ya no busca, mejor ciérrala."
        confirmarTexto="Borrar"
        cancelando={eliminar.isPending}
        onCancelar={() => setBorrar(null)}
        onConfirmar={() => eliminar.mutate(borrar.id)}
      />
    </>
  );
}
