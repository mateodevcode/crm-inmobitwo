// Conversación de chat dentro de la bandeja: mensajes, respuesta con
// plantillas y "Guardar como contacto".
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SendIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { enviarMensaje, marcarLeida, obtenerMensajes } from "@/features/mensajes/api.js";
import { contactoDesdeChat } from "@/features/bandeja/api.js";
import { SelectorPlantillas } from "@/features/bandeja/components/SelectorPlantillas.jsx";
import { formatoFechaHora } from "@/utils/fechas.js";

export function PanelChat({ item }) {
  const { usuario } = useContext(AuthContext);
  const { organizacion } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [texto, setTexto] = useState("");
  const abajo = useRef(null);

  const msgsQ = useQuery({
    queryKey: ["chat-mensajes", item.id],
    queryFn: () => obtenerMensajes(item.id),
    refetchInterval: 5000,
  });
  const mensajes = msgsQ.data?.mensajes ?? [];

  useEffect(() => {
    marcarLeida(item.id)
      .catch(() => {})
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ["crm-bandeja"] });
        queryClient.invalidateQueries({ queryKey: ["chat-no-leidos"] });
      });
  }, [item.id, queryClient]);
  useEffect(() => {
    abajo.current?.scrollIntoView({ block: "end" });
  }, [msgsQ.dataUpdatedAt]);

  const enviar = useMutation({
    mutationFn: () => enviarMensaje(item.id, texto.trim()),
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: ["chat-mensajes", item.id] });
      queryClient.invalidateQueries({ queryKey: ["crm-bandeja"] });
    },
    onError: (err) => toast.error(err.message),
  });
  const guardar = useMutation({
    mutationFn: () => contactoDesdeChat(item.id),
    onSuccess: (r) => {
      toast.success(r.nuevo ? "Contacto creado." : "Ya estaba en tus contactos.");
      queryClient.invalidateQueries({ queryKey: ["crm-bandeja"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const valores = {
    nombre: item.nombre?.split(" ")[0],
    inmueble: item.propiedad_titulo,
    agente: usuario?.name,
    inmobiliaria: organizacion?.nombre ?? usuario?.name,
  };

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.nombre}</p>
          <p className="text-muted-foreground truncate text-xs">Chat del portal · {item.propiedad_titulo ?? "Anuncio eliminado"}</p>
        </div>
        {item.contacto_id ? (
          <Button asChild size="sm" variant="outline">
            <Link to={`/contactos/${item.contacto_id}`}>Ver contacto</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => guardar.mutate()} disabled={guardar.isPending}>
            <UserPlusIcon /> Guardar como contacto
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {msgsQ.isLoading ? <p className="text-muted-foreground text-sm">Cargando mensajes…</p> : null}
        {mensajes.map((m) => {
          const mio = m.remitenteId === usuario?.id;
          return (
            <div key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mio ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="text-sm break-words whitespace-pre-wrap">{m.contenido}</p>
                <p className={`mt-0.5 text-right text-[11px] ${mio ? "opacity-70" : "text-muted-foreground"}`}>
                  {formatoFechaHora(m.createdAt)}
                  {mio && m.leidoAt ? " ✓✓" : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={abajo} />
      </div>

      <form
        className="grid gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (texto.trim()) enviar.mutate();
        }}
      >
        <Textarea
          rows={2}
          maxLength={2000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (texto.trim()) enviar.mutate();
            }
          }}
          placeholder="Escribe una respuesta… (Enter envía, Shift+Enter salto de línea)"
          aria-label="Respuesta"
        />
        <div className="flex items-center justify-between gap-2">
          <SelectorPlantillas valores={valores} onElegir={setTexto} />
          <Button type="submit" disabled={!texto.trim() || enviar.isPending}>
            <SendIcon /> Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
