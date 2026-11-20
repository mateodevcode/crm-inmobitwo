// Lead dentro de la bandeja: datos, responder por WhatsApp o correo con una
// plantilla, cambiar el estado y convertirlo en contacto.
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MailIcon, MessageCircleIcon, PhoneIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { cambiarEstadoLead } from "@/features/leads/api.js";
import { convertirLead } from "@/features/contactos/api.js";
import { SelectorPlantillas } from "@/features/bandeja/components/SelectorPlantillas.jsx";
import { formatoFechaHora } from "@/utils/fechas.js";
import { enlaceWhatsApp, mostrarTelefono } from "@/utils/telefono.js";

const ESTADOS = [
  { valor: "nuevo", etiqueta: "Nuevo" },
  { valor: "contactado", etiqueta: "Contactado" },
  { valor: "en_negociacion", etiqueta: "En negociación" },
  { valor: "cerrado", etiqueta: "Cerrado" },
  { valor: "descartado", etiqueta: "Descartado" },
];

export function PanelLead({ item }) {
  const { usuario } = useContext(AuthContext);
  const { organizacion } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [texto, setTexto] = useState("");
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["crm-bandeja"] });
    queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
  };

  const estado = useMutation({
    mutationFn: (nuevo) => cambiarEstadoLead(item.id, nuevo),
    onSuccess: () => {
      toast.success("Estado del lead actualizado.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const convertir = useMutation({
    mutationFn: () => convertirLead(item.id),
    onSuccess: () => {
      toast.success("Lead convertido en contacto.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const valores = {
    nombre: item.nombre?.split(" ")[0],
    inmueble: item.propiedad_titulo,
    agente: usuario?.name,
    inmobiliaria: organizacion?.nombre ?? usuario?.name,
  };
  const wa = item.telefono ? enlaceWhatsApp(item.telefono, texto) : null;
  const correo = item.email
    ? `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Sobre ${item.propiedad_titulo ?? "el inmueble"}`)}&body=${encodeURIComponent(texto)}`
    : null;
  // Responder por un canal marca el lead como contactado si seguía nuevo.
  const alResponder = () => {
    if (item.estado === "nuevo") estado.mutate("contactado");
  };

  return (
    <div className="grid content-start gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-medium">{item.nombre}</p>
          <p className="text-muted-foreground text-sm">Lead · {item.propiedad_titulo}</p>
          <p className="text-muted-foreground text-xs">{formatoFechaHora(item.at)}</p>
        </div>
        <EstadoBadge estado={item.estado} />
      </div>

      <p className="bg-muted rounded-lg p-3 text-sm">{item.texto}</p>

      <div className="grid gap-1 text-sm">
        {item.telefono ? (
          <p className="flex items-center gap-2"><PhoneIcon className="text-muted-foreground size-4" /> {mostrarTelefono(item.telefono)}</p>
        ) : null}
        {item.email ? (
          <p className="flex items-center gap-2 break-all"><MailIcon className="text-muted-foreground size-4" /> {item.email}</p>
        ) : null}
        {!item.telefono && !item.email ? <p className="text-muted-foreground">Sin datos de contacto.</p> : null}
      </div>

      {wa || correo ? (
        <div className="grid gap-2">
          <Label htmlFor={`lead-msg-${item.id}`}>Mensaje</Label>
          <Textarea
            id={`lead-msg-${item.id}`}
            rows={4}
            maxLength={2000}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe o elige una plantilla…"
          />
          <div className="flex flex-wrap items-center gap-2">
            <SelectorPlantillas valores={valores} onElegir={setTexto} />
            {wa ? (
              <Button asChild size="sm" onClick={alResponder}>
                <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircleIcon /> WhatsApp</a>
              </Button>
            ) : null}
            {correo ? (
              <Button asChild size="sm" variant="outline" onClick={alResponder}>
                <a href={correo}><MailIcon /> Correo</a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 border-t pt-4">
        <div className="grid gap-1.5">
          <Label htmlFor={`lead-estado-${item.id}`}>Estado</Label>
          <Select value={item.estado} onValueChange={(v) => estado.mutate(v)} disabled={estado.isPending}>
            <SelectTrigger id={`lead-estado-${item.id}`} className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map((e) => (
                <SelectItem key={e.valor} value={e.valor}>{e.etiqueta}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {item.contacto_id ? (
          <Button asChild variant="outline">
            <Link to={`/contactos/${item.contacto_id}`}>Ver contacto</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={() => convertir.mutate()} disabled={convertir.isPending}>
            <UserPlusIcon /> Convertir en contacto
          </Button>
        )}
      </div>
    </div>
  );
}
