// Tareas de un contacto o de una oportunidad: pendientes primero, alta rápida
// con fecha opcional y completar. Se usa en la ficha de contacto y en el pipeline.
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { cn } from "@/lib/utils.js";
import { completarTarea, crearTarea, obtenerTareas } from "@/features/tareas/api.js";
import { hoy, isoBogota } from "@/utils/agenda.js";
import { formatoFecha } from "@/utils/fechas.js";

const MAX = 50;

/**
 * @param {object} p
 * @param {string} p.titulo
 * @param {{ contactoId?: number|string, oportunidadId?: number|string }} p.filtros
 * @param {{ contacto_id?: number, oportunidad_id?: number }} p.nueva  datos fijos de la tarea nueva
 */
export function TarjetaTareas({ titulo = "Tareas", filtros, nueva, className }) {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [texto, setTexto] = useState("");
  const [fecha, setFecha] = useState("");
  const [verHechas, setVerHechas] = useState(false);

  const q = useQuery({
    queryKey: ["crm-tareas", espacio, "tarjeta", filtros],
    queryFn: () => obtenerTareas({ pagina: 1, limite: MAX, incluirCompletadas: true, ...filtros }),
    select: (res) => res.data ?? [],
  });
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["crm-tareas"] });
    queryClient.invalidateQueries({ queryKey: ["crm-oportunidades"] });
  };

  const crear = useMutation({
    // Con fecha: vence a las 6:00 p. m. de ese día (hora de Bogotá).
    mutationFn: () => crearTarea({ ...nueva, titulo: texto.trim(), ...(fecha ? { vence_at: isoBogota(fecha, "18:00") } : {}) }),
    onSuccess: () => {
      toast.success("Tarea creada.");
      setTexto("");
      setFecha("");
      refrescar();
    },
    onError: (e) => toast.error(e.message),
  });
  const completar = useMutation({
    mutationFn: completarTarea,
    onSuccess: refrescar,
    onError: (e) => toast.error(e.message),
  });

  const tareas = q.data ?? [];
  const pendientes = tareas.filter((t) => !t.completada_at);
  const hechas = tareas.filter((t) => t.completada_at);
  const ahora = q.dataUpdatedAt;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (texto.trim()) crear.mutate();
          }}
        >
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Nueva tarea…"
            aria-label="Nueva tarea"
            maxLength={200}
            className="min-w-48 flex-1"
          />
          <Input
            type="date"
            value={fecha}
            min={hoy()}
            onChange={(e) => setFecha(e.target.value)}
            aria-label="Vence el (opcional)"
            title="Vence el (opcional)"
            className="w-40"
          />
          <Button type="submit" disabled={!texto.trim() || crear.isPending}>
            Crear
          </Button>
        </form>

        {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {q.isError ? <p className="text-destructive text-sm">{q.error.message}</p> : null}
        {!q.isLoading && pendientes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin tareas pendientes.</p>
        ) : null}

        <ul className="grid gap-2">
          {pendientes.map((t) => {
            const vencida = t.vence_at && new Date(t.vence_at).getTime() < ahora;
            return (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate">{t.titulo}</span>
                  {t.vence_at ? (
                    <span className={cn("text-xs", vencida ? "text-destructive" : "text-muted-foreground")}>
                      {vencida ? "Venció el " : "Vence el "}
                      {formatoFecha(t.vence_at)}
                    </span>
                  ) : null}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={completar.isPending}
                  onClick={() => completar.mutate(t.id)}
                >
                  <CheckIcon /> Hecha
                </Button>
              </li>
            );
          })}
        </ul>

        {hechas.length ? (
          <div className="grid gap-2">
            <Button variant="link" size="sm" className="h-auto justify-self-start p-0" onClick={() => setVerHechas((v) => !v)}>
              {verHechas ? "Ocultar completadas" : `Ver completadas (${hechas.length})`}
            </Button>
            {verHechas ? (
              <ul className="grid gap-1">
                {hechas.map((t) => (
                  <li key={t.id} className="text-muted-foreground flex justify-between gap-3 px-3 text-sm">
                    <span className="truncate line-through">{t.titulo}</span>
                    <span className="shrink-0 text-xs">{formatoFecha(t.completada_at)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
