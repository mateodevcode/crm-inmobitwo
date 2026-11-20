// Todos los avisos del espacio activo, con filtro "sin leer" y paginación por cursor.
import { useContext, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { obtenerNotificaciones } from "@/features/notificaciones/api.js";
import { ItemNotificacion } from "@/features/notificaciones/components/ItemNotificacion.jsx";
import { useContadorNotificaciones, useLeerNotificaciones } from "@/features/notificaciones/useNotificaciones.js";

export default function NotificacionesPage() {
  const { espacio } = useContext(WorkspaceContext);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const contador = useContadorNotificaciones();
  const { leerUna, leerTodas, leyendoTodas } = useLeerNotificaciones();
  const q = useInfiniteQuery({
    queryKey: ["crm-notif", "pagina", espacio, soloNoLeidas],
    queryFn: ({ pageParam }) => obtenerNotificaciones({ soloNoLeidas, limite: 20, antes: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (ultima) => (ultima.hay_mas ? ultima.items.at(-1)?.id : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const noLeidas = contador.data?.no_leidas ?? 0;
  const otros = contador.data?.otros_espacios ?? 0;

  return (
    <>
      <PageHeader
        titulo="Avisos"
        descripcion="Leads nuevos, asignaciones, visitas, demandas y captaciones de este espacio."
        acciones={
          <Button variant="outline" disabled={!noLeidas || leyendoTodas} onClick={() => leerTodas()}>
            Marcar todo como leído
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={soloNoLeidas ? "no_leidas" : "todas"} onValueChange={(v) => setSoloNoLeidas(v === "no_leidas")}>
          <TabsList>
            <TabsTrigger value="todas">Todos</TabsTrigger>
            <TabsTrigger value="no_leidas">Sin leer{noLeidas ? ` (${noLeidas})` : ""}</TabsTrigger>
          </TabsList>
        </Tabs>
        {otros ? (
          <p className="text-muted-foreground text-sm">Tienes {otros} sin leer en otros espacios: cámbialo en el selector del menú.</p>
        ) : null}
      </div>
      <Card>
        <CardContent className="grid gap-1 p-2">
          {q.isLoading ? <p className="text-muted-foreground p-4 text-sm">Cargando…</p> : null}
          {q.isError ? <p role="alert" className="text-destructive p-4 text-sm">{q.error.message}</p> : null}
          {!q.isLoading && !q.isError && items.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">
              {soloNoLeidas ? "Estás al día: no hay avisos sin leer." : "Aún no tienes avisos en este espacio."}
            </p>
          ) : null}
          {items.map((n) => (
            <ItemNotificacion key={n.id} n={n} onLeer={leerUna} />
          ))}
          {q.hasNextPage ? (
            <div className="p-2">
              <Button variant="ghost" className="w-full" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
                {q.isFetchingNextPage ? "Cargando…" : "Ver anteriores"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
