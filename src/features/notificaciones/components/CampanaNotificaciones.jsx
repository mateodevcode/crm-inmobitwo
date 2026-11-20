// Campana de la cabecera: contador y los últimos avisos del espacio activo.
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { obtenerNotificaciones } from "@/features/notificaciones/api.js";
import { ItemNotificacion } from "@/features/notificaciones/components/ItemNotificacion.jsx";
import { useContadorNotificaciones, useLeerNotificaciones } from "@/features/notificaciones/useNotificaciones.js";

export function CampanaNotificaciones() {
  const { espacio } = useContext(WorkspaceContext);
  const [abierta, setAbierta] = useState(false);
  const contador = useContadorNotificaciones();
  const { leerUna, leerTodas, leyendoTodas } = useLeerNotificaciones();
  const lista = useQuery({
    queryKey: ["crm-notif", "ultimas", espacio],
    queryFn: () => obtenerNotificaciones({ limite: 8 }),
    enabled: abierta,
  });
  const noLeidas = contador.data?.no_leidas ?? 0;
  const otros = contador.data?.otros_espacios ?? 0;
  const etiqueta = noLeidas ? `Avisos: ${noLeidas} sin leer` : "Avisos";

  return (
    <Popover open={abierta} onOpenChange={setAbierta}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={etiqueta} title={etiqueta}>
          <BellIcon />
          {noLeidas ? (
            <span className="bg-destructive absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none text-white tabular-nums">
              {noLeidas > 99 ? "99+" : noLeidas}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <p className="text-sm font-medium">Avisos</p>
          <Button variant="ghost" size="sm" disabled={!noLeidas || leyendoTodas} onClick={() => leerTodas()}>
            Marcar todo como leído
          </Button>
        </div>
        <div className="max-h-[min(28rem,70vh)] overflow-y-auto p-1">
          {lista.isLoading ? <p className="text-muted-foreground p-4 text-sm">Cargando…</p> : null}
          {lista.isError ? <p className="text-destructive p-4 text-sm">{lista.error.message}</p> : null}
          {lista.data && lista.data.items.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">No tienes avisos en este espacio.</p>
          ) : null}
          {(lista.data?.items ?? []).map((n) => (
            <ItemNotificacion key={n.id} n={n} onLeer={leerUna} onAbrir={() => setAbierta(false)} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <span className="text-muted-foreground text-xs">
            {otros ? `${otros} sin leer en otros espacios` : ""}
          </span>
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <Link to="/notificaciones" onClick={() => setAbierta(false)}>
              Ver todos
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
