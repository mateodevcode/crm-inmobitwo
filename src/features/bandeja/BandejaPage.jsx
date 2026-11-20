// /bandeja — todo lo que espera respuesta en un solo lugar: chats del portal
// sobre tus anuncios y leads. En celular, la lista y el detalle se alternan.
import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, InboxIcon, Settings2Icon } from "lucide-react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { obtenerBandeja } from "@/features/bandeja/api.js";
import { PanelChat } from "@/features/bandeja/components/PanelChat.jsx";
import { PanelLead } from "@/features/bandeja/components/PanelLead.jsx";
import { PlantillasDialog } from "@/features/bandeja/components/PlantillasDialog.jsx";
import { getInitials } from "@/lib/getInitials.js";
import { tiempoRelativo } from "@/lib/tiempoRelativo.js";
import { cn } from "@/lib/utils.js";

function useDebounce(v, ms = 350) {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

export default function BandejaPage() {
  const { espacio } = useContext(WorkspaceContext);
  const [filtro, setFiltro] = useState("pendientes");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null); // { tipo, id }
  const [plantillas, setPlantillas] = useState(false);
  const qd = useDebounce(q.trim());

  const bq = useQuery({
    queryKey: ["crm-bandeja", espacio, filtro, qd],
    queryFn: () => obtenerBandeja({ filtro, q: qd || undefined }),
    refetchInterval: 15000,
  });
  const items = bq.data?.items ?? [];
  const pend = bq.data?.pendientes ?? { chat: 0, leads: 0 };
  // La versión más reciente del elemento abierto (aunque ya no sea "pendiente").
  const [abierto, setAbierto] = useState(null);
  const actual = sel ? (items.find((i) => i.tipo === sel.tipo && i.id === sel.id) ?? abierto) : null;

  const abrir = (i) => {
    setSel({ tipo: i.tipo, id: i.id });
    setAbierto(i);
  };

  return (
    <>
      <PageHeader
        titulo="Bandeja"
        descripcion="Chats del portal y leads que esperan respuesta."
        acciones={
          <Button variant="outline" onClick={() => setPlantillas(true)}>
            <Settings2Icon /> Plantillas
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className={cn("gap-0 overflow-hidden py-0", actual && "hidden md:flex")}>
          <div className="grid gap-2 border-b p-3">
            <Tabs value={filtro} onValueChange={setFiltro}>
              <TabsList className="w-full">
                <TabsTrigger value="pendientes">
                  Pendientes{pend.chat + pend.leads ? ` (${pend.chat + pend.leads})` : ""}
                </TabsTrigger>
                <TabsTrigger value="todos">Todo</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre o inmueble…" aria-label="Buscar en la bandeja" />
          </div>
          <ul className="max-h-[65vh] overflow-y-auto" aria-label="Conversaciones y leads">
            {bq.isLoading ? <li className="text-muted-foreground p-4 text-sm">Cargando…</li> : null}
            {bq.isError ? <li role="alert" className="text-destructive p-4 text-sm">{bq.error.message}</li> : null}
            {bq.isSuccess && items.length === 0 ? (
              <li className="text-muted-foreground grid justify-items-center gap-2 p-8 text-center text-sm">
                <InboxIcon className="size-8 opacity-50" aria-hidden />
                {filtro === "pendientes" ? "No tienes nada pendiente. ¡Al día!" : "No hay conversaciones ni leads."}
              </li>
            ) : null}
            {items.map((i) => {
              const activo = sel?.tipo === i.tipo && sel?.id === i.id;
              return (
                <li key={`${i.tipo}-${i.id}`}>
                  <button
                    type="button"
                    onClick={() => abrir(i)}
                    aria-current={activo || undefined}
                    className={cn(
                      "hover:bg-accent flex w-full gap-3 border-b p-3 text-left transition focus-visible:bg-accent focus-visible:outline-none",
                      activo && "bg-accent",
                    )}
                  >
                    <Avatar className="mt-0.5">
                      {i.imagen ? <AvatarImage src={i.imagen} alt="" /> : null}
                      <AvatarFallback>{getInitials(i.nombre)}</AvatarFallback>
                    </Avatar>
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", i.pendiente ? "font-semibold" : "font-medium")}>{i.nombre}</span>
                        <span className="text-muted-foreground shrink-0 text-xs">{tiempoRelativo(i.at)}</span>
                      </span>
                      <span className="text-muted-foreground truncate text-xs">{i.propiedad_titulo ?? "—"}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">{i.texto}</span>
                        <Badge variant={i.tipo === "chat" ? "secondary" : "outline"} className="shrink-0">
                          {i.tipo === "chat" ? "Chat" : "Lead"}
                        </Badge>
                        {i.tipo === "chat" && i.no_leidos > 0 ? (
                          <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-1.5 text-xs" aria-label={`${i.no_leidos} sin leer`}>
                            {i.no_leidos}
                          </span>
                        ) : i.pendiente ? (
                          <span className="bg-primary size-2 shrink-0 rounded-full" aria-label="Pendiente" />
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className={cn("min-w-0 gap-0 py-0", !actual && "hidden md:flex")}>
          {actual ? (
            <>
              <div className="border-b p-2 md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setSel(null)}>
                  <ArrowLeftIcon /> Bandeja
                </Button>
              </div>
              {actual.tipo === "chat" ? (
                <PanelChat key={`c-${actual.id}`} item={actual} />
              ) : (
                <PanelLead key={`l-${actual.id}`} item={actual} />
              )}
            </>
          ) : (
            <div className="text-muted-foreground grid min-h-[50vh] place-items-center p-6 text-sm">
              Elige una conversación o un lead para responder.
            </div>
          )}
        </Card>
      </div>

      <PlantillasDialog abierto={plantillas} onCerrar={() => setPlantillas(false)} />
    </>
  );
}
