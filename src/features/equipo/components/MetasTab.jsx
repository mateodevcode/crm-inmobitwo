// Pestaña Metas: objetivos mensuales por agente, lo logrado y la
// clasificación del equipo. El admin fija las metas de cada agente.
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrophyIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
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
import { guardarMetas, obtenerMetas } from "@/features/equipo/api.js";
import { METRICAS, formatoMetrica, mesActual, sumarMes, textoMes } from "@/features/equipo/metas.js";
import { getInitials } from "@/lib/getInitials.js";

function Barra({ valor }) {
  const pct = Math.max(0, Math.min(100, valor ?? 0));
  return (
    <div className="bg-muted h-2 w-full overflow-hidden rounded-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Fila de un agente (también se usa en el panel para "Mis metas").
export function FilaMetas({ agente, puesto, onEditar }) {
  return (
    <div className="grid gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          {agente.imagen ? <AvatarImage src={agente.imagen} alt="" /> : null}
          <AvatarFallback>{getInitials(agente.nombre)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-medium">
            {puesto === 1 && agente.avance ? <TrophyIcon className="size-4 text-amber-500" aria-label="Primer lugar" /> : null}
            {agente.nombre}
          </p>
          <p className="text-muted-foreground text-xs">
            {agente.avance == null ? "Sin metas este mes" : `${agente.avance} % de avance`}
          </p>
        </div>
        {onEditar ? (
          <Button size="sm" variant="outline" onClick={() => onEditar(agente)}>
            <PencilIcon /> Metas
          </Button>
        ) : null}
      </div>
      {agente.avance != null ? <Barra valor={agente.avance} /> : null}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
        {METRICAS.map((m) => {
          const x = agente.metricas[m.clave];
          const pct = x.objetivo ? Math.round((x.logrado / x.objetivo) * 100) : null;
          return (
            <div key={m.clave} className="grid gap-1">
              <dt className="text-muted-foreground text-xs">{m.corta}</dt>
              <dd className="text-sm tabular-nums">
                <span className="font-semibold">{formatoMetrica(m, x.logrado)}</span>
                {x.objetivo ? <span className="text-muted-foreground"> / {formatoMetrica(m, x.objetivo)}</span> : null}
              </dd>
              {pct != null ? <Barra valor={pct} /> : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function MetasTab() {
  const { espacio, puedeAdministrar } = useContext(WorkspaceContext);
  const [mes, setMes] = useState(mesActual);
  const [editar, setEditar] = useState(null);
  const q = useQuery({ queryKey: ["equipo-metas", espacio, mes], queryFn: () => obtenerMetas(mes) });
  const equipo = q.data?.equipo ?? [];

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => setMes(sumarMes(mes, -1))}>
          <ChevronLeftIcon />
        </Button>
        <h2 className="min-w-40 text-center text-base font-semibold first-letter:uppercase" aria-live="polite">{textoMes(mes)}</h2>
        <Button variant="ghost" size="icon" aria-label="Mes siguiente" onClick={() => setMes(sumarMes(mes, 1))}>
          <ChevronRightIcon />
        </Button>
        {mes !== mesActual() ? (
          <Button variant="outline" size="sm" onClick={() => setMes(mesActual())}>Este mes</Button>
        ) : null}
      </div>
      {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
      {q.isError ? <p role="alert" className="text-destructive text-sm">{q.error.message}</p> : null}
      {q.isSuccess && equipo.every((a) => a.avance == null) && puedeAdministrar ? (
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            Aún no hay metas para este mes. Usa «Metas» en cada agente para fijarlas; lo logrado se calcula solo con sus visitas, captaciones, contactos y negocios.
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-3">
        {equipo.map((a, i) => (
          <FilaMetas key={a.usuario_id} agente={a} puesto={i + 1} onEditar={puedeAdministrar ? setEditar : null} />
        ))}
      </div>
      <DialogoMetas agente={editar} mes={mes} onCerrar={() => setEditar(null)} />
    </div>
  );
}

function DialogoMetas({ agente, mes, onCerrar }) {
  return (
    <Dialog open={!!agente} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        {agente ? <FormMetas key={agente.usuario_id + mes} agente={agente} mes={mes} onCerrar={onCerrar} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function FormMetas({ agente, mes, onCerrar }) {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [v, setV] = useState(() =>
    Object.fromEntries(METRICAS.map((m) => [m.clave, agente.metricas[m.clave].objetivo ? String(agente.metricas[m.clave].objetivo) : ""])),
  );
  const guardar = useMutation({
    mutationFn: () =>
      guardarMetas({
        mes,
        usuario_id: agente.usuario_id,
        metricas: Object.fromEntries(METRICAS.map((m) => [m.clave, v[m.clave] === "" ? null : Number(v[m.clave])])),
      }),
    onSuccess: () => {
      toast.success("Metas guardadas.");
      queryClient.invalidateQueries({ queryKey: ["equipo-metas", espacio] });
      onCerrar();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        guardar.mutate();
      }}
    >
      <DialogHeader>
        <DialogTitle>Metas de {agente.nombre}</DialogTitle>
        <DialogDescription className="first-letter:uppercase">{textoMes(mes)} · vacío = sin meta</DialogDescription>
      </DialogHeader>
      {METRICAS.map((m) => (
        <div key={m.clave} className="grid grid-cols-[1fr_9rem] items-center gap-3">
          <Label htmlFor={`meta-${m.clave}`}>{m.etiqueta}</Label>
          <Input
            id={`meta-${m.clave}`}
            inputMode="numeric"
            placeholder="—"
            value={m.dinero && v[m.clave] ? Number(v[m.clave]).toLocaleString("es-CO") : v[m.clave]}
            onChange={(e) => setV((x) => ({ ...x, [m.clave]: e.target.value.replace(/\D/g, "").slice(0, 13) }))}
          />
        </div>
      ))}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
        <Button type="submit" disabled={guardar.isPending}>{guardar.isPending ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}
