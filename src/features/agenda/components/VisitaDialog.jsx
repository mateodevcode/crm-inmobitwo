// Formulario para agendar o editar una visita.
// - inicial: { fecha, hora, contacto: {id, etiqueta}, propiedad: {id, etiqueta} }
// - visita: si viene, el diálogo edita (el contacto no se puede cambiar).
// Si el agente ya tiene otra visita a esa hora, el backend responde 409 con
// los choques y aquí se ofrece "Agendar igualmente".
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { obtenerContactos } from "@/features/contactos/api.js";
import { obtenerPropiedades } from "@/features/propiedades/api.js";
import { obtenerMiembros } from "@/features/equipo/api.js";
import { actualizarVisita, crearVisita } from "@/features/agenda/api.js";
import { DURACIONES, RECORDATORIOS } from "@/features/agenda/estados.js";
import { SelectorBusqueda } from "@/features/agenda/components/SelectorBusqueda.jsx";
import {
  claveDia,
  duracionMin,
  horaInput,
  hoy,
  isoBogota,
  proximaMediaHora,
  textoRangoHora,
} from "@/utils/agenda.js";
import { mostrarTelefono } from "@/utils/telefono.js";

const buscarContactos = async (q) => {
  const res = await obtenerContactos({ pagina: 1, limite: 20, q: q || undefined });
  return (res.data ?? []).map((c) => ({
    id: c.id,
    etiqueta: c.nombre,
    detalle: [c.telefono ? mostrarTelefono(c.telefono) : null, c.email].filter(Boolean).join(" · "),
  }));
};

const buscarPropiedades = async (q) => {
  const res = await obtenerPropiedades({ pagina: 1, limite: 20, q: q || undefined });
  return (res.data ?? []).map((p) => ({ id: p.id, etiqueta: p.titulo, detalle: p.ciudad }));
};

function estadoInicial(visita, inicial) {
  if (visita) {
    return {
      contacto: { id: visita.contacto_id, etiqueta: visita.contacto_nombre },
      propiedad: visita.propiedad_id ? { id: visita.propiedad_id, etiqueta: visita.propiedad_titulo } : null,
      fecha: claveDia(visita.inicio_at),
      hora: horaInput(visita.inicio_at),
      duracion: String(duracionMin(visita.inicio_at, visita.fin_at)),
      agente: visita.asignado_a_id ? String(visita.asignado_a_id) : "",
      lugar: visita.lugar ?? "",
      notas: visita.notas ?? "",
      recordatorio: visita.recordatorio_minutos ? String(visita.recordatorio_minutos) : "",
    };
  }
  return {
    contacto: inicial?.contacto ?? null,
    propiedad: inicial?.propiedad ?? null,
    fecha: inicial?.fecha ?? hoy(),
    // Hoy sin hora elegida → la siguiente media hora (no una que ya pasó).
    hora: inicial?.hora ?? ((inicial?.fecha ?? hoy()) === hoy() ? proximaMediaHora() : "10:00"),
    duracion: "60",
    agente: "",
    lugar: "",
    notas: "",
    recordatorio: "60",
  };
}

export function VisitaDialog({ abierto, onCerrar, visita = null, inicial = null, onGuardada }) {
  // key en el padre (abierto/visita) reinicia el estado al reabrir.
  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {abierto ? (
          <FormularioVisita
            key={visita?.id ?? JSON.stringify(inicial ?? {})}
            visita={visita}
            inicial={inicial}
            onCerrar={onCerrar}
            onGuardada={onGuardada}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FormularioVisita({ visita, inicial, onCerrar, onGuardada }) {
  const { espacio, organizacion, puedeAdministrar, esPersonal } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [f, setF] = useState(() => estadoInicial(visita, inicial));
  const [choques, setChoques] = useState(null);
  const set = (k) => (v) => setF((prev) => ({ ...prev, [k]: v }));
  const editando = !!visita;
  const eligeAgente = !esPersonal && puedeAdministrar && organizacion;

  const miembrosQ = useQuery({
    queryKey: ["crm-miembros", espacio],
    queryFn: () => obtenerMiembros(organizacion.id),
    enabled: !!eligeAgente,
    select: (ms) => ms.filter((m) => m.estado === "activo"),
  });

  const original = editando ? estadoInicial(visita, null) : null;
  const guardar = useMutation({
    mutationFn: (forzar) => {
      // Al editar, la hora solo se envía si cambió: el backend trata un
      // cambio de horario como reprogramación (pide confirmar de nuevo).
      const cambioHora =
        !editando || f.fecha !== original.fecha || f.hora !== original.hora;
      const cambioDuracion = !editando || f.duracion !== original.duracion;
      const datos = {
        propiedad_id: f.propiedad?.id ?? null,
        ...(cambioHora ? { inicio_at: isoBogota(f.fecha, f.hora) } : {}),
        ...(cambioDuracion ? { duracion_min: Number(f.duracion) } : {}),
        lugar: f.lugar,
        notas: f.notas,
        // Cambiar el aviso lo reprograma: solo se envía si cambió.
        ...(!editando || f.recordatorio !== original.recordatorio
          ? { recordatorio_minutos: f.recordatorio ? Number(f.recordatorio) : null }
          : {}),
        forzar,
        ...(eligeAgente && f.agente ? { asignado_a_id: Number(f.agente) } : {}),
      };
      return editando
        ? actualizarVisita(visita.id, datos)
        : crearVisita({
            ...datos,
            contacto_id: f.contacto.id,
            ...(inicial?.oportunidad_id ? { oportunidad_id: Number(inicial.oportunidad_id) } : {}),
          });
    },
    onSuccess: (v) => {
      toast.success(editando ? "Visita actualizada." : "Visita agendada.");
      queryClient.invalidateQueries({ queryKey: ["crm-visitas"] });
      // El pipeline muestra la próxima visita de cada oportunidad.
      queryClient.invalidateQueries({ queryKey: ["crm-oportunidades"] });
      onGuardada?.(v);
      onCerrar();
    },
    onError: (err) => {
      if (err.choques?.length) setChoques(err.choques);
      else toast.error(err.message);
    },
  });

  const valido = f.contacto && f.fecha && /^\d{2}:\d{2}$/.test(f.hora);
  const enviar = (forzar = false) => {
    setChoques(null);
    guardar.mutate(forzar);
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (valido) enviar(false);
      }}
    >
      <DialogHeader>
        <DialogTitle>{editando ? "Editar visita" : "Agendar visita"}</DialogTitle>
        <DialogDescription>
          {editando ? "Cambia la hora, el inmueble o los detalles." : "Cita con un cliente para mostrar un inmueble."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <Label htmlFor="visita-contacto">Cliente</Label>
        <SelectorBusqueda
          id="visita-contacto"
          value={f.contacto}
          onChange={set("contacto")}
          buscar={buscarContactos}
          claveQuery="crm-buscar-contactos"
          placeholder="Buscar contacto…"
          vacio="No hay contactos con ese nombre."
          disabled={editando || !!inicial?.contacto}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="visita-propiedad">Inmueble (opcional)</Label>
        <SelectorBusqueda
          id="visita-propiedad"
          value={f.propiedad}
          onChange={set("propiedad")}
          buscar={buscarPropiedades}
          claveQuery="crm-buscar-propiedades"
          placeholder="Buscar inmueble…"
          vacio="No hay inmuebles con ese texto."
          permitirQuitar
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="visita-fecha">Fecha</Label>
          <Input id="visita-fecha" type="date" value={f.fecha} onChange={(e) => set("fecha")(e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="visita-hora">Hora</Label>
          <Input
            id="visita-hora"
            type="time"
            step={900}
            value={f.hora}
            onChange={(e) => set("hora")(e.target.value)}
            required
          />
        </div>
        <div className="col-span-2 grid gap-1.5 sm:col-span-1">
          <Label htmlFor="visita-duracion">Duración</Label>
          <Select value={f.duracion} onValueChange={set("duracion")}>
            <SelectTrigger id="visita-duracion" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURACIONES.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m < 60 ? `${m} min` : `${m / 60} h`.replace(".5", ",5")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {eligeAgente ? (
        <div className="grid gap-1.5">
          <Label htmlFor="visita-agente">Agente</Label>
          <Select value={f.agente || "yo"} onValueChange={(v) => set("agente")(v === "yo" ? "" : v)}>
            <SelectTrigger id="visita-agente" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yo">Yo</SelectItem>
              {(miembrosQ.data ?? []).map((m) => (
                <SelectItem key={m.usuario_id} value={String(m.usuario_id)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="visita-lugar">Lugar</Label>
        <Input
          id="visita-lugar"
          value={f.lugar}
          onChange={(e) => set("lugar")(e.target.value)}
          placeholder={f.propiedad ? "Por defecto, la dirección del inmueble" : "Dirección o punto de encuentro"}
          maxLength={300}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="visita-notas">Notas</Label>
        <Textarea
          id="visita-notas"
          value={f.notas}
          onChange={(e) => set("notas")(e.target.value)}
          placeholder="Llaves, portería, lo que busca el cliente…"
          rows={3}
          maxLength={5000}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="visita-recordatorio">Recordatorio por correo</Label>
        <Select value={f.recordatorio || "ninguno"} onValueChange={(v) => set("recordatorio")(v === "ninguno" ? "" : v)}>
          <SelectTrigger id="visita-recordatorio" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECORDATORIOS.map((r) => (
              <SelectItem key={r.valor || "ninguno"} value={r.valor || "ninguno"}>
                {r.etiqueta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {choques?.length ? (
        <div role="alert" className="rounded-lg border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-50">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangleIcon className="size-4" /> El agente ya tiene visita a esa hora
          </p>
          <ul className="mt-1 list-disc pl-5">
            {choques.map((c) => (
              <li key={c.id}>
                {textoRangoHora(c.inicio_at, c.fin_at)} con {c.contacto_nombre}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        {choques?.length ? (
          <Button type="button" variant="secondary" disabled={guardar.isPending} onClick={() => enviar(true)}>
            Agendar igualmente
          </Button>
        ) : null}
        <Button type="submit" disabled={!valido || guardar.isPending}>
          {guardar.isPending ? "Guardando…" : editando ? "Guardar cambios" : "Agendar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
