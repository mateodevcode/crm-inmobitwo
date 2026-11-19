// Panel lateral con el detalle de una visita y sus acciones según el estado:
// confirmar, marcar realizada (con interés y comentario del cliente), no
// asistió, cancelar (con motivo), editar, borrar, reabrir y WhatsApp.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClockIcon,
  CheckIcon,
  HomeIcon,
  MapPinIcon,
  MessageCircleIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { cambiarEstadoVisita, eliminarVisita } from "@/features/agenda/api.js";
import { ACTIVOS, ESTADOS, INTERES } from "@/features/agenda/estados.js";
import { claveDia, textoDiaLargo, textoRangoHora } from "@/utils/agenda.js";
import { enlaceWhatsApp, mostrarTelefono } from "@/utils/telefono.js";

const Fila = ({ icono: Icono, children }) => (
  <p className="flex items-start gap-2 text-sm">
    <Icono className="text-muted-foreground mt-0.5 size-4 shrink-0" />
    <span className="min-w-0">{children}</span>
  </p>
);

export function VisitaDetalle({ visita, onCerrar, onEditar }) {
  return (
    <Sheet open={!!visita} onOpenChange={(v) => !v && onCerrar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {visita ? <Contenido key={visita.id} visita={visita} onCerrar={onCerrar} onEditar={onEditar} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function Contenido({ visita: v, onCerrar, onEditar }) {
  const queryClient = useQueryClient();
  const [modo, setModo] = useState(null); // null | "realizada" | "cancelar"
  const [interes, setInteres] = useState(null);
  const [comentario, setComentario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [borrar, setBorrar] = useState(false);

  const activa = ACTIVOS.includes(v.estado);
  const empezo = new Date(v.inicio_at) <= new Date();
  const est = ESTADOS[v.estado] ?? ESTADOS.programada;

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["crm-visitas"] });
    queryClient.invalidateQueries({ queryKey: ["crm-actividades"] });
  };

  const estado = useMutation({
    mutationFn: (datos) => cambiarEstadoVisita(v.id, datos),
    onSuccess: (_, datos) => {
      toast.success(
        { confirmada: "Visita confirmada.", realizada: "Visita registrada.", cancelada: "Visita cancelada.",
          no_asistio: "Marcada como no asistió.", programada: "Visita reabierta." }[datos.estado],
      );
      refrescar();
      onCerrar();
    },
    onError: (err) => toast.error(err.message),
  });

  const eliminar = useMutation({
    mutationFn: () => eliminarVisita(v.id),
    onSuccess: () => {
      toast.success("Visita borrada.");
      refrescar();
      onCerrar();
    },
    onError: (err) => toast.error(err.message),
  });

  const textoWhatsApp =
    `Hola ${v.contacto_nombre}, te escribo para confirmar la visita del ` +
    `${textoDiaLargo(claveDia(v.inicio_at))} a las ${textoRangoHora(v.inicio_at, v.fin_at).split(" – ")[0]}` +
    `${v.propiedad_titulo ? ` al inmueble ${v.propiedad_titulo}` : ""}${v.lugar ? ` (${v.lugar})` : ""}. ¿Me confirmas?`;
  const whatsapp = enlaceWhatsApp(v.contacto_telefono, textoWhatsApp);

  return (
    <>
      <SheetHeader>
        <div>
          <Badge variant="outline" className="gap-1.5">
            <span className={`size-2 rounded-full ${est.punto}`} aria-hidden />
            {est.etiqueta}
          </Badge>
        </div>
        <SheetTitle>Visita con {v.contacto_nombre}</SheetTitle>
        <SheetDescription className="first-letter:uppercase">
          {textoDiaLargo(claveDia(v.inicio_at))} · {textoRangoHora(v.inicio_at, v.fin_at)}
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-3 px-4">
        <Fila icono={UserIcon}>
          <Link to={`/contactos/${v.contacto_id}`} className="font-medium underline-offset-4 hover:underline">
            {v.contacto_nombre}
          </Link>
          {v.contacto_telefono ? <span className="text-muted-foreground"> · {mostrarTelefono(v.contacto_telefono)}</span> : null}
        </Fila>
        {v.propiedad_titulo ? (
          <Fila icono={HomeIcon}>
            {v.propiedad_titulo}
            {v.propiedad_ciudad ? <span className="text-muted-foreground"> · {v.propiedad_ciudad}</span> : null}
          </Fila>
        ) : null}
        {v.lugar ? <Fila icono={MapPinIcon}>{v.lugar}</Fila> : null}
        {v.agente_nombre ? <Fila icono={CalendarClockIcon}>Agente: {v.agente_nombre}</Fila> : null}
        {v.notas ? <p className="bg-muted rounded-lg p-3 text-sm whitespace-pre-line">{v.notas}</p> : null}

        {v.estado === "realizada" && (v.resultado_interes || v.resultado_comentario) ? (
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">Resultado</p>
            {v.resultado_interes ? <p>Interés: {v.resultado_interes}</p> : null}
            {v.resultado_comentario ? <p className="text-muted-foreground">{v.resultado_comentario}</p> : null}
          </div>
        ) : null}
        {v.estado === "cancelada" && v.motivo_cancelacion ? (
          <p className="text-muted-foreground text-sm">Motivo: {v.motivo_cancelacion}</p>
        ) : null}

        {whatsapp && activa ? (
          <Button asChild variant="outline">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircleIcon /> Confirmar por WhatsApp
            </a>
          </Button>
        ) : null}

        {modo === "realizada" ? (
          <form
            className="grid gap-3 rounded-lg border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              estado.mutate({ estado: "realizada", resultado_interes: interes, resultado_comentario: comentario });
            }}
          >
            <p className="text-sm font-medium">¿Cómo le fue al cliente?</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Interés del cliente">
              {INTERES.map((i) => (
                <Button
                  key={i.valor}
                  type="button"
                  size="sm"
                  role="radio"
                  aria-checked={interes === i.valor}
                  variant={interes === i.valor ? "default" : "outline"}
                  onClick={() => setInteres(interes === i.valor ? null : i.valor)}
                >
                  {i.etiqueta}
                </Button>
              ))}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="visita-comentario">Comentario</Label>
              <Textarea
                id="visita-comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Qué le gustó, objeciones, siguiente paso…"
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModo(null)}>Volver</Button>
              <Button type="submit" disabled={estado.isPending}>Guardar resultado</Button>
            </div>
          </form>
        ) : null}

        {modo === "cancelar" ? (
          <form
            className="grid gap-3 rounded-lg border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              estado.mutate({ estado: "cancelada", motivo_cancelacion: motivo });
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="visita-motivo">Motivo (opcional)</Label>
              <Input id="visita-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={300} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModo(null)}>Volver</Button>
              <Button type="submit" variant="destructive" disabled={estado.isPending}>Cancelar visita</Button>
            </div>
          </form>
        ) : null}
      </div>

      {modo === null ? (
        <SheetFooter className="grid grid-cols-2 gap-2">
          {activa && v.estado === "programada" ? (
            <Button onClick={() => estado.mutate({ estado: "confirmada" })} disabled={estado.isPending}>
              <CheckIcon /> Confirmar
            </Button>
          ) : null}
          {activa && empezo ? (
            <Button onClick={() => setModo("realizada")}>Marcar realizada</Button>
          ) : null}
          {activa && empezo ? (
            <Button variant="outline" onClick={() => estado.mutate({ estado: "no_asistio" })} disabled={estado.isPending}>
              No asistió
            </Button>
          ) : null}
          {activa ? (
            <Button variant="outline" onClick={() => onEditar(v)}>
              <PencilIcon /> Editar
            </Button>
          ) : null}
          {activa ? (
            <Button variant="outline" onClick={() => setModo("cancelar")}>Cancelar visita</Button>
          ) : null}
          {activa ? (
            <Button variant="ghost" className="text-destructive" onClick={() => setBorrar(true)}>
              <Trash2Icon /> Borrar
            </Button>
          ) : null}
          {!activa ? (
            <Button variant="outline" onClick={() => estado.mutate({ estado: "programada" })} disabled={estado.isPending}>
              Reabrir
            </Button>
          ) : null}
        </SheetFooter>
      ) : null}

      <ConfirmDialog
        abierto={borrar}
        onCancelar={() => setBorrar(false)}
        titulo="¿Borrar la visita?"
        descripcion="Úsalo si la creaste por error. Para dejar constancia de que no se hizo, mejor cancélala."
        confirmarTexto="Borrar"
        cancelando={eliminar.isPending}
        onConfirmar={() => eliminar.mutate()}
      />
    </>
  );
}
