// /agenda — calendario de visitas del espacio activo.
// Vistas: semana (por defecto en escritorio), día y lista (por defecto en
// celular). ?visita=ID abre el detalle (enlace del correo de recordatorio).
import { useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.jsx";
import { useIsMobile } from "@/hooks/use-mobile.js";
import { obtenerMiembros } from "@/features/equipo/api.js";
import { obtenerVisita, obtenerVisitas } from "@/features/agenda/api.js";
import { ESTADOS } from "@/features/agenda/estados.js";
import { VistaCalendario } from "@/features/agenda/components/VistaCalendario.jsx";
import { VistaLista } from "@/features/agenda/components/VistaLista.jsx";
import { VisitaDialog } from "@/features/agenda/components/VisitaDialog.jsx";
import { VisitaDetalle } from "@/features/agenda/components/VisitaDetalle.jsx";
import { diasDeSemana, hoy, sumarDias, textoDiaLargo, textoSemana } from "@/utils/agenda.js";

export default function AgendaPage() {
  const { espacio, organizacion, puedeAdministrar, esPersonal } = useContext(WorkspaceContext);
  const esMovil = useIsMobile();
  const [params, setParams] = useSearchParams();
  const [vistaElegida, setVista] = useState(null);
  const vista = vistaElegida ?? (esMovil ? "lista" : "semana");
  const [fecha, setFecha] = useState(hoy);
  const [agente, setAgente] = useState("");
  const [verCanceladas, setVerCanceladas] = useState(false);
  const [dialogo, setDialogo] = useState(null); // null | { inicial } | { visita }
  const [seleccionada, setSeleccionada] = useState(null);

  const dias = useMemo(() => (vista === "dia" ? [fecha] : diasDeSemana(fecha)), [vista, fecha]);
  const filtroAgente = !esPersonal && puedeAdministrar ? agente : "";

  const visitasQ = useQuery({
    queryKey: ["crm-visitas", espacio, dias[0], dias.at(-1), filtroAgente],
    queryFn: () => obtenerVisitas({ desde: dias[0], hasta: dias.at(-1), asignado: filtroAgente || undefined }),
  });
  const visitas = (visitasQ.data ?? []).filter((v) => verCanceladas || v.estado !== "cancelada");

  const miembrosQ = useQuery({
    queryKey: ["crm-miembros", espacio],
    queryFn: () => obtenerMiembros(organizacion.id),
    enabled: !esPersonal && puedeAdministrar && !!organizacion,
    select: (ms) => ms.filter((m) => m.estado === "activo"),
  });

  // Visita abierta desde la URL (correo de recordatorio).
  const idUrl = params.get("visita");
  const visitaUrlQ = useQuery({
    queryKey: ["crm-visitas", espacio, "detalle", idUrl],
    queryFn: () => obtenerVisita(idUrl),
    enabled: !!idUrl,
    retry: false,
  });
  const detalle =
    seleccionada ??
    (idUrl ? (visitasQ.data?.find((v) => String(v.id) === idUrl) ?? visitaUrlQ.data ?? null) : null);
  // Siempre la versión más reciente de la lista (tras confirmar, editar…).
  const detalleActual = detalle ? (visitasQ.data?.find((v) => v.id === detalle.id) ?? detalle) : null;

  const cerrarDetalle = () => {
    setSeleccionada(null);
    if (idUrl) {
      params.delete("visita");
      setParams(params, { replace: true });
    }
  };

  const paso = vista === "dia" ? 1 : 7;
  const titulo = vista === "dia" ? textoDiaLargo(fecha) : textoSemana(fecha);
  const activas = visitas.filter((v) => v.estado === "programada" || v.estado === "confirmada").length;

  return (
    <>
      <PageHeader
        titulo="Agenda"
        descripcion={`${activas} ${activas === 1 ? "visita pendiente" : "visitas pendientes"} en ${vista === "dia" ? "el día" : "la semana"}.`}
        acciones={
          <Button onClick={() => setDialogo({ inicial: { fecha: fecha < hoy() ? hoy() : fecha } })}>
            <CalendarPlusIcon /> Agendar visita
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setFecha(hoy())}>Hoy</Button>
          <Button variant="ghost" size="icon" aria-label="Anterior" onClick={() => setFecha(sumarDias(fecha, -paso))}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Siguiente" onClick={() => setFecha(sumarDias(fecha, paso))}>
            <ChevronRightIcon />
          </Button>
        </div>
        <h2 className="min-w-0 flex-1 text-base font-semibold first-letter:uppercase" aria-live="polite">
          {titulo}
        </h2>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={vista}
          onValueChange={(v) => v && setVista(v)}
          aria-label="Vista"
        >
          <ToggleGroupItem value="semana">Semana</ToggleGroupItem>
          <ToggleGroupItem value="dia">Día</ToggleGroupItem>
          <ToggleGroupItem value="lista">Lista</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {!esPersonal && puedeAdministrar ? (
          <Select value={agente || "todos"} onValueChange={(v) => setAgente(v === "todos" ? "" : v)}>
            <SelectTrigger className="w-52" aria-label="Agente">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los agentes</SelectItem>
              {(miembrosQ.data ?? []).map((m) => (
                <SelectItem key={m.usuario_id} value={String(m.usuario_id)}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <div className="flex items-center gap-2">
          <Checkbox id="ver-canceladas" checked={verCanceladas} onCheckedChange={(v) => setVerCanceladas(!!v)} />
          <Label htmlFor="ver-canceladas" className="text-sm font-normal">Ver canceladas</Label>
        </div>
        <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs" aria-label="Leyenda">
          {Object.entries(ESTADOS)
            .filter(([k]) => verCanceladas || k !== "cancelada")
            .map(([k, e]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${e.punto}`} aria-hidden /> {e.etiqueta}
              </li>
            ))}
        </ul>
      </div>

      {visitasQ.isError ? (
        <p role="alert" className="text-destructive text-sm">{visitasQ.error.message}</p>
      ) : vista === "lista" ? (
        <VistaLista
          dias={dias}
          visitas={visitas}
          onElegir={setSeleccionada}
          onCrear={(d, h) => setDialogo({ inicial: { fecha: d, hora: h } })}
        />
      ) : (
        <VistaCalendario
          dias={dias}
          visitas={visitas}
          onElegir={setSeleccionada}
          onCrear={(d, h) => setDialogo({ inicial: { fecha: d, hora: h } })}
        />
      )}
      {visitasQ.isLoading ? <p className="text-muted-foreground text-sm">Cargando visitas…</p> : null}

      <VisitaDialog
        abierto={!!dialogo}
        visita={dialogo?.visita ?? null}
        inicial={dialogo?.inicial ?? null}
        onCerrar={() => setDialogo(null)}
      />
      <VisitaDetalle
        visita={dialogo ? null : detalleActual}
        onCerrar={cerrarDetalle}
        onEditar={(v) => {
          setSeleccionada(null);
          setDialogo({ visita: v });
        }}
      />
    </>
  );
}
