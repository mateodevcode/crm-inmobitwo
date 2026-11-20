// Demandas de un contacto (ficha del contacto).
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { obtenerDemandas } from "@/features/demandas/api.js";
import { ESTADOS_DEMANDA, resumenDemanda } from "@/features/demandas/criterios.js";
import { DemandaDialog } from "@/features/demandas/components/DemandaDialog.jsx";

export function TarjetaDemandas({ contacto }) {
  const { espacio } = useContext(WorkspaceContext);
  const [nueva, setNueva] = useState(false);
  const q = useQuery({
    queryKey: ["crm-demandas", espacio, "contacto", String(contacto.id)],
    queryFn: () => obtenerDemandas({ contacto_id: contacto.id }),
  });
  const lista = q.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Qué busca</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => setNueva(true)}>
            <PlusIcon /> Nueva demanda
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2">
        {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {q.isError ? <p className="text-destructive text-sm">{q.error.message}</p> : null}
        {lista.map((d) => (
          <Link
            key={d.id}
            to={`/demandas?demanda=${d.id}`}
            className="hover:bg-accent grid gap-1 rounded-lg border p-3 text-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs">
                <span className={`size-2 rounded-full ${ESTADOS_DEMANDA[d.estado]?.punto}`} aria-hidden />
                {ESTADOS_DEMANDA[d.estado]?.etiqueta}
              </span>
              <span className="flex gap-1">
                {d.coincidencias?.nuevas ? <Badge>{d.coincidencias.nuevas} nuevas</Badge> : null}
                <Badge variant="secondary">{d.coincidencias?.total ?? 0} en cartera</Badge>
              </span>
            </span>
            <span>{resumenDemanda(d)}</span>
          </Link>
        ))}
        {!q.isLoading && !q.isError && lista.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Registra qué busca este cliente para ver qué inmuebles le encajan.
          </p>
        ) : null}
      </CardContent>
      <DemandaDialog
        abierto={nueva}
        contacto={{ id: contacto.id, etiqueta: contacto.nombre }}
        onCerrar={() => setNueva(false)}
      />
    </Card>
  );
}
