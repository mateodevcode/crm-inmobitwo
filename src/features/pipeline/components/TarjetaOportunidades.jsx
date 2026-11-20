// Oportunidades de un contacto (abiertas primero, luego ganadas y perdidas).
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { obtenerOportunidades } from "@/features/pipeline/api.js";

const ESTADO = {
  abierta: { texto: "Abierta", variant: "secondary" },
  ganada: { texto: "Ganada", variant: "default" },
  perdida: { texto: "Perdida", variant: "outline" },
};

export function TarjetaOportunidades({ contactoId }) {
  const { espacio } = useContext(WorkspaceContext);
  const q = useQuery({
    queryKey: ["crm-oportunidades", espacio, "contacto", String(contactoId)],
    queryFn: () => obtenerOportunidades({ contacto_id: contactoId }),
  });
  const ops = q.data ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oportunidades</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/pipeline?crear=${contactoId}`}>Nueva</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {q.isLoading ? <p className="text-muted-foreground">Cargando…</p> : null}
        {q.isError ? <p className="text-destructive">{q.error.message}</p> : null}
        {!q.isLoading && !q.isError && ops.length === 0 ? (
          <p className="text-muted-foreground">Aún no hay oportunidades con este contacto.</p>
        ) : null}
        {ops.map((o) => {
          const e = ESTADO[o.estado] ?? ESTADO.abierta;
          return (
            <Link
              key={o.id}
              to={o.estado === "abierta" ? `/pipeline?oportunidad=${o.id}` : "/pipeline"}
              className="hover:bg-accent/50 grid gap-1 rounded-lg border p-3"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{o.titulo}</span>
                <Badge variant={e.variant}>{e.texto}</Badge>
              </span>
              <span className="text-muted-foreground flex flex-wrap justify-between gap-x-3 text-xs">
                <span>{o.estado === "abierta" ? o.etapa_nombre : (o.motivo_perdida ?? o.etapa_nombre)}</span>
                <MoneyText valor={o.valor} />
              </span>
              {o.propiedad_titulo ? <span className="text-muted-foreground truncate text-xs">{o.propiedad_titulo}</span> : null}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
