// Inmuebles que coinciden con una demanda. Pestañas: cartera propia y portal.
// Acciones por inmueble: enviar por WhatsApp (marca "enviada"), marcar
// enviada, descartar / quitar marca, ver en el portal y agendar visita
// (solo cartera: la visita debe ser a un inmueble del espacio).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BathIcon,
  BedDoubleIcon,
  CalendarPlusIcon,
  CarIcon,
  CheckIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  ImageOffIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  RulerIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { VisitaDialog } from "@/features/agenda/components/VisitaDialog.jsx";
import {
  marcarSeguimiento,
  marcarVistas,
  obtenerCoincidencias,
  quitarSeguimiento,
} from "@/features/demandas/api.js";
import { urlPortalInmueble } from "@/features/demandas/criterios.js";
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";
import { enlaceWhatsApp } from "@/utils/telefono.js";

const Dato = ({ icono: Icono, children }) => (
  <span className="inline-flex items-center gap-1">
    <Icono className="size-3.5" aria-hidden /> {children}
  </span>
);

export function Coincidencias({ demanda }) {
  const queryClient = useQueryClient();
  const [alcance, setAlcance] = useState("cartera");
  const [verDescartadas, setVerDescartadas] = useState(false);
  const [visita, setVisita] = useState(null);

  const clave = ["crm-demandas", "coincidencias", demanda.id, alcance, verDescartadas];
  const q = useQuery({
    queryKey: clave,
    queryFn: () => obtenerCoincidencias(demanda.id, { alcance, incluirDescartadas: verDescartadas }),
  });

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-demandas"] });
  const seguimiento = useMutation({
    mutationFn: ({ propiedadId, estado }) =>
      estado ? marcarSeguimiento(demanda.id, propiedadId, estado) : quitarSeguimiento(demanda.id, propiedadId),
    onSuccess: (_, { estado }) => {
      if (estado === "descartada") toast.success("Inmueble descartado para este cliente.");
      if (estado === "enviada") toast.success("Marcado como enviado. Quedó en la línea de tiempo del contacto.");
      refrescar();
      queryClient.invalidateQueries({ queryKey: ["crm-actividades"] });
    },
    onError: (err) => toast.error(err.message),
  });
  const vistas = useMutation({
    mutationFn: () => marcarVistas(demanda.id),
    onSuccess: () => {
      toast.success("Coincidencias marcadas como vistas.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const lista = q.data ?? [];
  const nuevas = lista.filter((p) => p.nueva).length;

  const mensajeWhatsApp = (p) =>
    [
      `Hola ${demanda.contacto_nombre}, te comparto un inmueble que encaja con lo que buscas:`,
      `${p.titulo}${p.precio ? ` — ${formatPrecioCompleto(Number(p.precio))}` : ""}`,
      p.estado === "publicado" ? urlPortalInmueble(p.id) : null,
    ]
      .filter(Boolean)
      .join("\n");

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={alcance} onValueChange={setAlcance}>
          <TabsList>
            <TabsTrigger value="cartera">Mi cartera</TabsTrigger>
            <TabsTrigger value="portal">Portal</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id={`descartadas-${demanda.id}`} checked={verDescartadas} onCheckedChange={(v) => setVerDescartadas(!!v)} />
            <Label htmlFor={`descartadas-${demanda.id}`} className="text-sm font-normal">Ver descartadas</Label>
          </div>
          {alcance === "cartera" && nuevas > 0 ? (
            <Button variant="outline" size="sm" onClick={() => vistas.mutate()} disabled={vistas.isPending}>
              Marcar {nuevas} {nuevas === 1 ? "nueva" : "nuevas"} como vistas
            </Button>
          ) : null}
        </div>
      </div>

      {alcance === "portal" ? (
        <p className="text-muted-foreground text-xs">
          Inmuebles publicados por otros anunciantes. Puedes compartirlos con tu cliente; para visitarlos, coordina con el anunciante.
        </p>
      ) : null}

      {q.isLoading ? <p className="text-muted-foreground text-sm">Buscando coincidencias…</p> : null}
      {q.isError ? <p role="alert" className="text-destructive text-sm">{q.error.message}</p> : null}
      {!q.isLoading && !q.isError && lista.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
          {alcance === "cartera"
            ? "Ningún inmueble de tu cartera cumple estos criterios. Prueba en el portal o amplía la búsqueda."
            : "No hay inmuebles publicados en el portal que cumplan estos criterios."}
        </p>
      ) : null}

      <ul className="grid gap-3 md:grid-cols-2">
        {lista.map((p) => {
          const wa = enlaceWhatsApp(demanda.contacto_telefono, mensajeWhatsApp(p));
          const descartada = p.seguimiento === "descartada";
          return (
            <li key={p.id} className={`flex gap-3 rounded-xl border p-3 ${descartada ? "opacity-60" : ""}`}>
              <div className="bg-muted size-24 shrink-0 overflow-hidden rounded-lg">
                {p.foto ? (
                  <img src={p.foto} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center">
                    <ImageOffIcon className="size-6" aria-hidden />
                  </div>
                )}
              </div>
              <div className="grid min-w-0 flex-1 content-start gap-1">
                <div className="flex flex-wrap gap-1">
                  {p.nueva ? <Badge>Nueva</Badge> : null}
                  {p.sobre_presupuesto ? <Badge variant="outline">Sobre presupuesto</Badge> : null}
                  {p.seguimiento === "enviada" ? <Badge variant="secondary">Enviada</Badge> : null}
                  {descartada ? <Badge variant="outline">Descartada</Badge> : null}
                  {alcance === "cartera" && p.estado !== "publicado" ? <Badge variant="outline">No publicado</Badge> : null}
                </div>
                <p className="line-clamp-2 text-sm font-medium">{p.titulo}</p>
                <p className="text-sm font-semibold"><MoneyText valor={p.precio} /></p>
                <p className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                  {p.habitaciones != null ? <Dato icono={BedDoubleIcon}>{p.habitaciones}</Dato> : null}
                  {p.banos != null ? <Dato icono={BathIcon}>{p.banos}</Dato> : null}
                  {p.parqueaderos ? <Dato icono={CarIcon}>{p.parqueaderos}</Dato> : null}
                  {p.area ? <Dato icono={RulerIcon}>{p.area} m²</Dato> : null}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {[p.barrio_nombre, p.ciudad, p.estrato ? `Estrato ${p.estrato}` : null].filter(Boolean).join(" · ")}
                  {p.inmobiliaria ? ` · ${p.inmobiliaria}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {wa && !descartada ? (
                    <Button
                      asChild
                      size="xs"
                      onClick={() => seguimiento.mutate({ propiedadId: p.id, estado: "enviada" })}
                    >
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        <MessageCircleIcon /> WhatsApp
                      </a>
                    </Button>
                  ) : null}
                  {!p.seguimiento ? (
                    <Button size="xs" variant="outline" onClick={() => seguimiento.mutate({ propiedadId: p.id, estado: "enviada" })}>
                      <CheckIcon /> Enviada
                    </Button>
                  ) : null}
                  {alcance === "cartera" && !descartada ? (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setVisita({ id: p.id, etiqueta: p.titulo })}
                    >
                      <CalendarPlusIcon /> Visita
                    </Button>
                  ) : null}
                  {p.estado === "publicado" ? (
                    <Button asChild size="xs" variant="ghost">
                      <a href={urlPortalInmueble(p.id)} target="_blank" rel="noopener noreferrer" aria-label="Ver en el portal">
                        <ExternalLinkIcon />
                      </a>
                    </Button>
                  ) : null}
                  {p.seguimiento ? (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => seguimiento.mutate({ propiedadId: p.id, estado: null })}
                      aria-label="Quitar marca"
                    >
                      <RotateCcwIcon /> Quitar marca
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => seguimiento.mutate({ propiedadId: p.id, estado: "descartada" })}
                    >
                      <EyeOffIcon /> Descartar
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <VisitaDialog
        abierto={!!visita}
        inicial={visita ? { contacto: { id: demanda.contacto_id, etiqueta: demanda.contacto_nombre }, propiedad: visita } : null}
        onCerrar={() => setVisita(null)}
      />
    </div>
  );
}
