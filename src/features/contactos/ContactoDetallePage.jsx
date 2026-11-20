import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MailIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { formatoFechaHora } from "@/utils/fechas.js";
import { enlaceWhatsApp, mostrarTelefono, normalizarTelefonoColombia } from "@/utils/telefono.js";
import {
  crearActividad,
  obtenerActividades,
  obtenerContacto,
} from "@/features/contactos/api.js";
import { TarjetaTareas } from "@/features/tareas/components/TarjetaTareas.jsx";
import { TarjetaOportunidades } from "@/features/pipeline/components/TarjetaOportunidades.jsx";
import { TarjetaVisitas } from "@/features/agenda/components/TarjetaVisitas.jsx";
import { TarjetaDemandas } from "@/features/demandas/components/TarjetaDemandas.jsx";
import { TarjetaCaptaciones } from "@/features/captaciones/components/TarjetaCaptaciones.jsx";
import { TarjetaDatosPersonales } from "@/features/habeas/components/TarjetaDatosPersonales.jsx";

const TIPOS_ACTIVIDAD = ["nota", "llamada", "email", "whatsapp", "visita", "reunion"];
const TEXTO_ACTIVIDAD = {
  nota: "Nota",
  llamada: "Llamada",
  email: "Correo",
  whatsapp: "WhatsApp",
  visita: "Visita",
  reunion: "Reunión",
  cambio_etapa: "Cambio de etapa",
  sistema: "Sistema",
};
const TEXTO_TIPO = { comprador: "Comprador", vendedor: "Vendedor", arrendatario: "Arrendatario", inversor: "Inversor", otro: "Otro" };
const TEXTO_ORIGEN = { manual: "Creado a mano", portal: "Lead del portal", chat: "Chat del portal", importacion: "Importado" };

export default function ContactoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState("nota");
  const [contenido, setContenido] = useState("");

  const contactoQ = useQuery({
    queryKey: ["crm-contacto", espacio, id],
    queryFn: () => obtenerContacto(id),
  });
  const actsQ = useQuery({
    queryKey: ["crm-actividades", espacio, id],
    queryFn: () => obtenerActividades(id),
  });

  const actMut = useMutation({
    mutationFn: () => crearActividad({ contacto_id: Number(id), tipo, contenido: contenido.trim() || null }),
    onSuccess: () => {
      toast.success("Actividad registrada.");
      setContenido("");
      queryClient.invalidateQueries({ queryKey: ["crm-actividades", espacio, id] });
    },
    onError: (err) => toast.error(err.message),
  });


  if (contactoQ.isLoading) {
    return (
      <>
        <PageHeader titulo="Contacto" />
        <Skeleton className="h-40" />
      </>
    );
  }
  if (contactoQ.isError || !contactoQ.data) {
    return (
      <>
        <PageHeader titulo="Contacto" />
        <EmptyState titulo="Contacto no encontrado" />
      </>
    );
  }

  const c = contactoQ.data;
  const whatsapp = enlaceWhatsApp(c.telefono, `Hola ${c.nombre.split(" ")[0]},`);
  const celular = normalizarTelefonoColombia(c.telefono);

  return (
    <>
      <PageHeader
        titulo={c.nombre}
        descripcion={`${TEXTO_TIPO[c.tipo] ?? c.tipo} · ${TEXTO_ORIGEN[c.origen] ?? c.origen}`}
        acciones={
          <div className="flex flex-wrap gap-2">
            {whatsapp ? (
              <Button variant="outline" asChild>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircleIcon /> WhatsApp
                </a>
              </Button>
            ) : null}
            {celular ? (
              <Button variant="outline" asChild>
                <a href={`tel:+57${celular}`}>
                  <PhoneIcon /> Llamar
                </a>
              </Button>
            ) : null}
            {c.email ? (
              <Button variant="outline" asChild>
                <a href={`mailto:${c.email}`}>
                  <MailIcon /> Correo
                </a>
              </Button>
            ) : null}
            <Button onClick={() => navigate(`/pipeline?crear=${c.id}`)}>Nueva oportunidad</Button>
          </div>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p><span className="text-muted-foreground">Correo: </span>{c.email ?? "—"}</p>
            <p><span className="text-muted-foreground">Celular: </span>{mostrarTelefono(c.telefono)}</p>
            <p>
              <span className="text-muted-foreground">Presupuesto: </span>
              <MoneyText valor={c.presupuesto_min} /> — <MoneyText valor={c.presupuesto_max} />
            </p>
            <p><span className="text-muted-foreground">Zona: </span>{c.zona_interes ?? "—"}</p>
            <p><span className="text-muted-foreground">Etiquetas: </span>{(c.etiquetas ?? []).join(", ") || "—"}</p>
            {c.lead_id ? (
              <p>
                <span className="text-muted-foreground">Lead origen: </span>
                <Link to="/leads" className="underline">ver en Leads</Link>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Línea de tiempo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (contenido.trim()) actMut.mutate();
              }}
            >
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-36" aria-label="Tipo de actividad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ACTIVIDAD.map((t) => (
                    <SelectItem key={t} value={t}>{TEXTO_ACTIVIDAD[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Registrar nota, llamada, visita…"
                aria-label="Detalle de la actividad"
                className="min-w-52 flex-1"
              />
              <Button type="submit" disabled={actMut.isPending}>Añadir</Button>
            </form>
            <div className="grid gap-2">
              {(actsQ.data ?? []).map((a) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{TEXTO_ACTIVIDAD[a.tipo] ?? a.tipo} · {a.autor_nombre ?? "—"}</p>
                  {a.contenido ? <p className="mt-1">{a.contenido}</p> : null}
                  <p className="text-muted-foreground mt-1 text-xs">{formatoFechaHora(a.ocurrio_at)}</p>
                </div>
              ))}
              {(actsQ.data ?? []).length === 0 && !actsQ.isLoading ? (
                <p className="text-muted-foreground text-sm">Sin actividades registradas.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TarjetaOportunidades contactoId={c.id} />
        <TarjetaTareas
          titulo="Tareas del contacto"
          filtros={{ contactoId: c.id }}
          nueva={{ contacto_id: Number(c.id) }}
        />
      </div>

      <TarjetaDemandas contacto={c} />

      <TarjetaCaptaciones
        titulo="Inmuebles que es propietario"
        filtros={{ propietario_id: c.id }}
        vacio=""
        ocultarPropietario
        ocultarSiVacia
      />

      <TarjetaVisitas
        titulo="Visitas"
        filtros={{ contacto_id: id }}
        inicialNueva={{ contacto: { id: c.id, etiqueta: c.nombre } }}
        vacio="Este contacto aún no tiene visitas."
        mostrarFecha
        ocultarContacto
      />

      <TarjetaDatosPersonales contacto={c} />
    </>
  );
}
