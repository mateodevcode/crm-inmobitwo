import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { mostrarTelefono } from "@/utils/telefono.js";
import {
  crearActividad,
  obtenerActividades,
  obtenerContacto,
} from "@/features/contactos/api.js";
import { completarTarea, crearTarea, obtenerTareas } from "@/features/tareas/api.js";

const TIPOS_ACTIVIDAD = ["nota", "llamada", "email", "whatsapp", "visita", "reunion"];

export default function ContactoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState("nota");
  const [contenido, setContenido] = useState("");
  const [tituloTarea, setTituloTarea] = useState("");

  const contactoQ = useQuery({
    queryKey: ["crm-contacto", espacio, id],
    queryFn: () => obtenerContacto(id),
  });
  const actsQ = useQuery({
    queryKey: ["crm-actividades", espacio, id],
    queryFn: () => obtenerActividades(id),
  });
  const tareasQ = useQuery({
    queryKey: ["crm-tareas-contacto", espacio, id],
    queryFn: () => obtenerTareas({ pagina: 1, limite: 50 }),
    select: (res) => (res.data ?? []).filter((t) => String(t.contacto_id) === String(id)),
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

  const tareaMut = useMutation({
    mutationFn: () => crearTarea({ contacto_id: Number(id), titulo: tituloTarea.trim() }),
    onSuccess: () => {
      toast.success("Tarea creada.");
      setTituloTarea("");
      queryClient.invalidateQueries({ queryKey: ["crm-tareas-contacto", espacio, id] });
    },
    onError: (err) => toast.error(err.message),
  });

  const completarMut = useMutation({
    mutationFn: (tid) => completarTarea(tid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tareas-contacto", espacio, id] });
      queryClient.invalidateQueries({ queryKey: ["crm-tareas"] });
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

  return (
    <>
      <PageHeader
        titulo={c.nombre}
        descripcion={`${c.tipo} · ${c.origen}`}
        acciones={
          <Button onClick={() => navigate(`/pipeline?crear=${c.id}`)}>
            Nueva oportunidad
          </Button>
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
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ACTIVIDAD.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Registrar nota, llamada, visita…"
                className="min-w-52 flex-1"
              />
              <Button type="submit" disabled={actMut.isPending}>Añadir</Button>
            </form>
            <div className="grid gap-2">
              {(actsQ.data ?? []).map((a) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{a.tipo} · {a.autor_nombre ?? "—"}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Tareas del contacto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (tituloTarea.trim()) tareaMut.mutate();
            }}
          >
            <Input
              value={tituloTarea}
              onChange={(e) => setTituloTarea(e.target.value)}
              placeholder="Nueva tarea…"
              className="max-w-md"
            />
            <Button type="submit" disabled={tareaMut.isPending}>Crear</Button>
          </form>
          {(tareasQ.data ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>{t.titulo}</span>
              <Button size="sm" variant="outline" onClick={() => completarMut.mutate(t.id)}>
                Completar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
