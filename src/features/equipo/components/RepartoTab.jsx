// Pestaña Reparto: cómo se asignan los leads que llegan del portal.
// Manual = se los queda quien los convierte. Por turnos = rotan entre los
// agentes elegidos, en el orden de la lista (se puede reordenar).
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.jsx";
import { guardarReparto, obtenerReparto, repartirLeads } from "@/features/equipo/api.js";

const MARCADO =
  "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";

export function RepartoTab() {
  const { espacio } = useContext(WorkspaceContext);
  const q = useQuery({ queryKey: ["equipo-reparto", espacio], queryFn: obtenerReparto });
  if (q.isLoading) return <p className="text-muted-foreground text-sm">Cargando…</p>;
  if (q.isError) return <p role="alert" className="text-destructive text-sm">{q.error.message}</p>;
  return <Formulario key={q.dataUpdatedAt} datos={q.data} />;
}

function Formulario({ datos }) {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [modo, setModo] = useState(datos.modo);
  // Orden: primero los de la rotación guardada, luego el resto de miembros.
  const [orden, setOrden] = useState(() => {
    const ids = datos.miembros.map((m) => m.id);
    return [...datos.agentes.filter((id) => ids.includes(id)), ...ids.filter((id) => !datos.agentes.includes(id))];
  });
  const [elegidos, setElegidos] = useState(() => new Set(datos.agentes));
  const porId = Object.fromEntries(datos.miembros.map((m) => [m.id, m]));
  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["equipo-reparto", espacio] });

  const guardar = useMutation({
    mutationFn: () => guardarReparto({ modo, agentes: orden.filter((id) => elegidos.has(id)) }),
    onSuccess: () => {
      toast.success("Reparto guardado.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const repartir = useMutation({
    mutationFn: repartirLeads,
    onSuccess: (r) => {
      toast.success(`${r.repartidos.length} ${r.repartidos.length === 1 ? "lead repartido" : "leads repartidos"}.`, {
        description: r.omitidos.length
          ? `${r.omitidos.length} ya eran contactos (mismo correo o teléfono).`
          : undefined,
      });
      refrescar();
      queryClient.invalidateQueries({ queryKey: ["crm-bandeja"] });
      queryClient.invalidateQueries({ queryKey: ["equipo-carga", espacio] });
    },
    onError: (err) => toast.error(err.message),
  });

  const mover = (i, d) =>
    setOrden((o) => {
      const n = [...o];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const cambiado =
    modo !== datos.modo || JSON.stringify(orden.filter((id) => elegidos.has(id))) !== JSON.stringify(datos.agentes);
  const sinAgentes = modo === "rotacion" && elegidos.size === 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reparto de leads</CardTitle>
          <CardDescription>Quién se queda con cada lead del portal cuando se convierte en contacto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ToggleGroup type="single" variant="outline" value={modo} onValueChange={(v) => v && setModo(v)} className="justify-start" aria-label="Modo de reparto">
            <ToggleGroupItem value="manual" className={`flex-none px-4 ${MARCADO}`}>Manual</ToggleGroupItem>
            <ToggleGroupItem value="rotacion" className={`flex-none px-4 ${MARCADO}`}>Por turnos</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-muted-foreground text-sm">
            {modo === "manual"
              ? "Cada lead queda asignado a quien lo convierte en contacto."
              : "Los leads rotan entre los agentes marcados, en este orden. Un agente que convierte un lead se lo queda."}
          </p>

          {modo === "rotacion" ? (
            <ol className="grid gap-1.5" aria-label="Orden de la rotación">
              {orden.map((id, i) => {
                const m = porId[id];
                if (!m) return null;
                return (
                  <li key={id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Checkbox
                      id={`rep-${id}`}
                      checked={elegidos.has(id)}
                      onCheckedChange={(v) =>
                        setElegidos((s) => {
                          const n = new Set(s);
                          if (v) n.add(id);
                          else n.delete(id);
                          return n;
                        })
                      }
                    />
                    <label htmlFor={`rep-${id}`} className="min-w-0 flex-1 truncate text-sm">
                      {m.name}
                      {m.rol_en_org === "agency_admin" ? <span className="text-muted-foreground"> · admin</span> : null}
                    </label>
                    {datos.siguiente_id === id && datos.modo === "rotacion" ? <Badge variant="secondary">Siguiente</Badge> : null}
                    <Button type="button" size="icon-xs" variant="ghost" aria-label={`Subir a ${m.name}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                      <ArrowUpIcon />
                    </Button>
                    <Button type="button" size="icon-xs" variant="ghost" aria-label={`Bajar a ${m.name}`} disabled={i === orden.length - 1} onClick={() => mover(i, 1)}>
                      <ArrowDownIcon />
                    </Button>
                  </li>
                );
              })}
            </ol>
          ) : null}
          {sinAgentes ? <p className="text-destructive text-sm">Marca al menos un agente.</p> : null}

          <div>
            <Button onClick={() => guardar.mutate()} disabled={!cambiado || sinAgentes || guardar.isPending}>
              {guardar.isPending ? "Guardando…" : "Guardar reparto"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads sin repartir</CardTitle>
          <CardDescription>Leads nuevos del portal (últimos 90 días) que aún no son contactos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-3xl font-semibold tabular-nums">{datos.leads_sin_repartir}</p>
          {datos.modo !== "rotacion" ? (
            <p className="text-muted-foreground text-sm">Activa y guarda el reparto por turnos para repartirlos de una vez.</p>
          ) : null}
          <div>
            <Button
              onClick={() => repartir.mutate()}
              disabled={datos.modo !== "rotacion" || cambiado || datos.leads_sin_repartir === 0 || repartir.isPending}
            >
              <SendIcon /> {repartir.isPending ? "Repartiendo…" : "Repartir ahora"}
            </Button>
          </div>
          {cambiado && datos.modo === "rotacion" ? (
            <p className="text-muted-foreground text-xs">Guarda los cambios del reparto antes de repartir.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
