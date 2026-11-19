// Tarjeta compacta de visitas (panel: "Visitas de hoy"; ficha de contacto:
// historial). Trae su propio diálogo para agendar y el panel de detalle.
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlusIcon } from "lucide-react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { obtenerVisitas } from "@/features/agenda/api.js";
import { ESTADOS } from "@/features/agenda/estados.js";
import { VisitaDialog } from "@/features/agenda/components/VisitaDialog.jsx";
import { VisitaDetalle } from "@/features/agenda/components/VisitaDetalle.jsx";
import { formatoFecha } from "@/utils/fechas.js";
import { claveDia, hoy, textoRangoHora } from "@/utils/agenda.js";
import { cn } from "@/lib/utils.js";

export function TarjetaVisitas({
  titulo,
  filtros,
  inicialNueva = null,
  vacio = "Sin visitas.",
  mostrarFecha = false,
  verAgenda = false,
  className,
}) {
  const { espacio } = useContext(WorkspaceContext);
  const [nueva, setNueva] = useState(false);
  const [editar, setEditar] = useState(null);
  const [elegida, setElegida] = useState(null);

  const q = useQuery({
    queryKey: ["crm-visitas", espacio, "tarjeta", filtros],
    queryFn: () => obtenerVisitas(filtros),
  });
  // Historial: próximas primero (ascendente) y luego las pasadas (recientes primero).
  // Referencia estable: el momento en que llegaron los datos.
  const ahora = q.dataUpdatedAt;
  const visitas = [...(q.data ?? [])].sort((a, b) => {
    const fa = new Date(a.inicio_at).getTime() >= ahora;
    const fb = new Date(b.inicio_at).getTime() >= ahora;
    if (fa !== fb) return fa ? -1 : 1;
    return fa ? new Date(a.inicio_at) - new Date(b.inicio_at) : new Date(b.inicio_at) - new Date(a.inicio_at);
  });
  const actual = elegida ? (q.data?.find((v) => v.id === elegida.id) ?? elegida) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardAction className="flex gap-1">
          {verAgenda ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/agenda">Ver agenda</Link>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => setNueva(true)}>
            <CalendarPlusIcon /> Agendar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2">
        {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {q.isError ? <p className="text-destructive text-sm">{q.error.message}</p> : null}
        {visitas.map((v) => {
          const est = ESTADOS[v.estado] ?? ESTADOS.programada;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setElegida(v)}
              className="hover:bg-accent flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", est.punto)} aria-hidden />
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="flex flex-wrap justify-between gap-x-3">
                  <span className="truncate font-medium">{v.contacto_nombre}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {mostrarFecha || claveDia(v.inicio_at) !== hoy() ? `${formatoFecha(v.inicio_at)} · ` : ""}
                    {textoRangoHora(v.inicio_at, v.fin_at)}
                  </span>
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {est.etiqueta}
                  {v.propiedad_titulo ? ` · ${v.propiedad_titulo}` : ""}
                </span>
              </span>
            </button>
          );
        })}
        {!q.isLoading && !q.isError && visitas.length === 0 ? (
          <p className="text-muted-foreground text-sm">{vacio}</p>
        ) : null}
      </CardContent>

      <VisitaDialog
        abierto={nueva || !!editar}
        visita={editar}
        inicial={editar ? null : inicialNueva}
        onCerrar={() => {
          setNueva(false);
          setEditar(null);
        }}
      />
      <VisitaDetalle
        visita={nueva || editar ? null : actual}
        onCerrar={() => setElegida(null)}
        onEditar={(v) => {
          setElegida(null);
          setEditar(v);
        }}
      />
    </Card>
  );
}
