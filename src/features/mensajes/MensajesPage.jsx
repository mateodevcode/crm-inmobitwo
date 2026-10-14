import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { getInitials } from "@/lib/getInitials.js";
import { formatoFechaHora } from "@/utils/fechas.js";
import { PORTAL_URL } from "@/config/config.js";
import {
  eliminarConversacion,
  enviarMensaje,
  marcarLeida,
  obtenerConversaciones,
  obtenerMensajes,
} from "@/features/mensajes/api.js";

function Burbuja({ mensaje, mio }) {
  return (
    <div className={`flex ${mio ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${mio ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <p className="text-sm whitespace-pre-wrap break-words">{mensaje.contenido}</p>
        <p className={`mt-0.5 text-right text-[11px] ${mio ? "opacity-70" : "text-muted-foreground"}`}>
          {formatoFechaHora(mensaje.createdAt)}
          {mio && mensaje.leidoAt ? " ✓✓" : ""}
        </p>
      </div>
    </div>
  );
}

export default function MensajesPage() {
  const { usuario } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [convId, setConvId] = useState(null);
  const [texto, setTexto] = useState("");
  const [eliminar, setEliminar] = useState(false);
  const abajoRef = useRef(null);

  const convsQ = useQuery({
    queryKey: ["chat-conversaciones"],
    queryFn: obtenerConversaciones,
    refetchInterval: 10_000,
  });
  const msgsQ = useQuery({
    queryKey: ["chat-mensajes", convId],
    queryFn: () => obtenerMensajes(convId),
    enabled: convId != null,
    refetchInterval: 3_000,
  });

  const convs = convsQ.data ?? [];
  const conv = convs.find((c) => c.id === convId) ?? null;
  const mensajes = msgsQ.data?.mensajes ?? [];

  // Al abrir: marcar leída + bajar al final.
  useEffect(() => {
    if (convId == null) return;
    marcarLeida(convId)
      .catch(() => {})
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ["chat-conversaciones"] });
        queryClient.invalidateQueries({ queryKey: ["chat-no-leidos"] });
      });
  }, [convId, queryClient]);

  useEffect(() => {
    abajoRef.current?.scrollIntoView({ block: "end" });
  }, [msgsQ.dataUpdatedAt]);

  const mEnviar = useMutation({
    mutationFn: () => enviarMensaje(convId, texto.trim()),
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: ["chat-mensajes", convId] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversaciones"] });
    },
    onError: (err) => toast.error(err.message),
  });
  const mEliminar = useMutation({
    mutationFn: () => eliminarConversacion(convId),
    onSuccess: () => {
      toast.success("Conversación eliminada.");
      setEliminar(false);
      setConvId(null);
      queryClient.invalidateQueries({ queryKey: ["chat-conversaciones"] });
      queryClient.invalidateQueries({ queryKey: ["chat-no-leidos"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const cargarMas = async () => {
    if (!msgsQ.data?.hayMas || mensajes.length === 0) return;
    try {
      const mas = await obtenerMensajes(convId, mensajes[0].id);
      queryClient.setQueryData(["chat-mensajes", convId], (viejo) => ({
        hayMas: mas.hayMas,
        mensajes: [...mas.mensajes, ...(viejo?.mensajes ?? [])],
      }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader titulo="Mensajes" descripcion="Conversaciones de sus anuncios." />
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Lista (en móvil se oculta al abrir una conversación) */}
        <Card className={`${convId != null ? "hidden md:block" : ""}`}>
          <div className="grid max-h-[70vh] gap-1 overflow-auto p-2">
            {convsQ.isLoading ? (
              <p className="text-muted-foreground p-2 text-sm">Cargando…</p>
            ) : convs.length === 0 ? (
              <div className="p-2">
                <EmptyState titulo="Sin conversaciones" descripcion="Aquí llegan los mensajes de sus anuncios." />
              </div>
            ) : (
              convs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConvId(c.id)}
                  className={`flex items-center gap-3 rounded-lg p-2 text-left hover:bg-muted ${c.id === convId ? "bg-muted" : ""}`}
                >
                  <Avatar>
                    <AvatarImage src={c.otraPersona?.imagenUrl ?? undefined} />
                    <AvatarFallback>{getInitials(c.otraPersona?.nombre ?? "?")}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm">{c.otraPersona?.nombre ?? "—"}</strong>
                      {(c.noLeidos ?? 0) > 0 ? (
                        <span className="bg-primary text-primary-foreground rounded-full px-2 text-xs">
                          {c.noLeidos}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {c.ultimoMensaje?.texto ?? c.propiedad?.titulo ?? "—"}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Conversación (en móvil ocupa todo con botón volver) */}
        <Card className={`${convId == null ? "hidden md:block" : ""}`}>
          {!conv ? (
            <div className="p-4">
              <EmptyState titulo="Seleccione una conversación" descripcion="" />
            </div>
          ) : (
            <div className="flex max-h-[70vh] flex-col">
              <div className="flex items-center gap-2 border-b p-3">
                <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setConvId(null)}>
                  ←
                </Button>
                <Avatar>
                  <AvatarImage src={conv.otraPersona?.imagenUrl ?? undefined} />
                  <AvatarFallback>{getInitials(conv.otraPersona?.nombre ?? "?")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{conv.otraPersona?.nombre}</p>
                  {conv.propiedad?.id ? (
                    <a
                      href={`${PORTAL_URL}/inmueble/${conv.propiedad.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground block truncate text-xs underline"
                    >
                      {conv.propiedad.titulo ?? `Anuncio ${conv.propiedad.id}`}
                    </a>
                  ) : null}
                </div>
                <Button size="sm" variant="outline" onClick={() => setEliminar(true)}>
                  Eliminar
                </Button>
              </div>
              <div className="grid flex-1 gap-2 overflow-auto p-3">
                {msgsQ.data?.hayMas ? (
                  <Button size="sm" variant="ghost" onClick={cargarMas}>
                    Cargar anteriores
                  </Button>
                ) : null}
                {msgsQ.isLoading ? (
                  <p className="text-muted-foreground text-sm">Cargando…</p>
                ) : (
                  mensajes.map((m) => (
                    <Burbuja key={m.id} mensaje={m} mio={m.remitenteId === usuario?.id} />
                  ))
                )}
                <div ref={abajoRef} />
              </div>
              <form
                className="flex gap-2 border-t p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (texto.trim() && !mEnviar.isPending) mEnviar.mutate();
                }}
              >
                <Input
                  placeholder="Escriba un mensaje…"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  maxLength={2000}
                />
                <Button type="submit" disabled={!texto.trim() || mEnviar.isPending}>
                  Enviar
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        abierto={eliminar}
        titulo="Eliminar conversación"
        descripcion="Se ocultará de su lista. Esta acción no se puede deshacer."
        confirmarTexto="Eliminar"
        onCancelar={() => setEliminar(false)}
        onConfirmar={() => mEliminar.mutate()}
      />
    </>
  );
}
