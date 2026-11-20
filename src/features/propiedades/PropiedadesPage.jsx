// /propiedades — la cartera: filtros (publicación y estado comercial),
// selección múltiple (publicar, pausar, exportar CSV) y por inmueble:
// rendimiento, editar, ficha imprimible, captación, interesados, duplicar,
// marcar vendido/arrendado, publicar/pausar y eliminar.
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PORTAL_URL } from "@/config/config.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { DataTable } from "@/components/comunes/DataTable.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { InteresadosSheet } from "@/features/demandas/components/InteresadosSheet.jsx";
import { CaptacionSheet } from "@/features/captaciones/components/CaptacionSheet.jsx";
import { RendimientoSheet } from "@/features/propiedades/components/RendimientoSheet.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { formatoFecha } from "@/utils/fechas.js";
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";
import {
  accionMasiva,
  cambiarEstadoOferta,
  duplicarPropiedad,
  obtenerPropiedades,
} from "@/features/propiedades/api.js";
import { eliminarPropiedad } from "@/features/propiedades/wizard/api.js";
import {
  CIERRE,
  ESTADO_OFERTA,
  FILTROS_OFERTA,
  OPERACION,
  csvCartera,
  descargarTexto,
} from "@/features/propiedades/cartera.js";
import { CLASE_TONO, ETIQUETA_MANDATO, estadoVencimiento } from "@/features/captaciones/textos.js";

const LIMITE = 20;

export default function PropiedadesPage() {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState("");
  const [oferta, setOferta] = useState("");
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [eliminar, setEliminar] = useState(null);
  const [cerrar, setCerrar] = useState(null); // { p, oferta }
  const [panel, setPanel] = useState(null); // { tipo: interesados|captacion|rendimiento, p }
  const [exportando, setExportando] = useState(false);

  const filtros = { estado: estado || undefined, oferta: oferta || undefined, q: busqueda || undefined };
  const { data, isLoading } = useQuery({
    queryKey: ["crm-propiedades", espacio, pagina, estado, oferta, busqueda],
    queryFn: () => obtenerPropiedades({ pagina, limite: LIMITE, ...filtros }),
  });
  const filas = data?.data ?? [];
  const paginacion = data?.pagination ?? { total: 0 };

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-propiedades"] });
  const cambiarFiltro = (fn) => (v) => {
    fn(v);
    setPagina(1);
    setSeleccion(new Set());
  };

  const masiva = useMutation({
    mutationFn: ({ ids, accion }) => accionMasiva(ids, accion),
    onSuccess: (r) => {
      const n = r.actualizados.length;
      toast.success(`${n} ${n === 1 ? "inmueble actualizado" : "inmuebles actualizados"}.`, {
        description: r.omitidos.length
          ? `${r.omitidos.length} sin cambios: ${[...new Set(r.omitidos.map((o) => o.motivo))].join(" ")}`
          : undefined,
      });
      setSeleccion(new Set());
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const duplicar = useMutation({
    mutationFn: (p) => duplicarPropiedad(p.id),
    onSuccess: (r) => {
      toast.success("Anuncio duplicado sin publicar.", {
        description: "Agrega las fotos y publícalo cuando esté listo.",
        action: { label: "Editar copia", onClick: () => navigate(`/propiedades/${r.id}/editar`) },
      });
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const estadoOferta = useMutation({
    mutationFn: ({ p, operacion, nuevo }) => cambiarEstadoOferta(p.id, operacion, nuevo),
    onSuccess: (_, { nuevo }) => {
      toast.success(nuevo === "active" ? "Oferta reactivada." : "Estado comercial actualizado.");
      setCerrar(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const mEliminar = useMutation({
    mutationFn: (id) => eliminarPropiedad(id),
    onSuccess: () => {
      toast.success("Inmueble eliminado.");
      setEliminar(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  // Exporta la selección o, si no hay, todo el resultado filtrado (hasta 500).
  async function exportar() {
    setExportando(true);
    try {
      let lista = filas.filter((p) => seleccion.has(p.id));
      if (!lista.length) {
        lista = [];
        for (let pg = 1; pg <= 5; pg++) {
          const r = await obtenerPropiedades({ pagina: pg, limite: 100, ...filtros });
          lista.push(...(r.data ?? []));
          if (lista.length >= (r.pagination?.total ?? 0)) break;
        }
      }
      const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
      descargarTexto(`cartera-${hoy}.csv`, csvCartera(lista));
      toast.success(`${lista.length} ${lista.length === 1 ? "inmueble exportado" : "inmuebles exportados"}.`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setExportando(false);
    }
  }

  const idsPagina = filas.map((p) => p.id);
  const todosMarcados = idsPagina.length > 0 && idsPagina.every((id) => seleccion.has(id));
  const algunoMarcado = idsPagina.some((id) => seleccion.has(id));
  const alternar = (id) =>
    setSeleccion((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <>
      <PageHeader
        titulo="Propiedades"
        descripcion="Tu cartera: estado comercial, captación y rendimiento de cada anuncio."
        acciones={
          <>
            <Button variant="outline" asChild>
              <Link to="/importar?tipo=inmuebles">Importar</Link>
            </Button>
            <Button asChild>
              <Link to="/propiedades/nuevo">Nuevo inmueble</Link>
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            cambiarFiltro(setBusqueda)(q.trim());
          }}
        >
          <Input
            placeholder="Buscar por título, ciudad, barrio…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
            aria-label="Buscar inmuebles"
          />
          <button type="submit" className="hidden" aria-hidden />
        </form>
        <Select value={estado || "todos"} onValueChange={(v) => cambiarFiltro(setEstado)(v === "todos" ? "" : v)}>
          <SelectTrigger className="w-44" aria-label="Publicación">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Publicados y no</SelectItem>
            <SelectItem value="publicado">Publicados</SelectItem>
            <SelectItem value="no_publicado">No publicados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={oferta || "todas"} onValueChange={(v) => cambiarFiltro(setOferta)(v === "todas" ? "" : v)}>
          <SelectTrigger className="w-56" aria-label="Estado comercial">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTROS_OFERTA.map((f) => (
              <SelectItem key={f.valor || "todas"} value={f.valor || "todas"}>{f.etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportar} disabled={exportando}>
          {exportando ? "Exportando…" : seleccion.size ? `Exportar ${seleccion.size} (CSV)` : "Exportar CSV"}
        </Button>
      </div>

      {seleccion.size > 0 ? (
        <div className="bg-muted flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-sm" role="region" aria-label="Acciones sobre la selección">
          <span className="font-medium">
            {seleccion.size} {seleccion.size === 1 ? "seleccionado" : "seleccionados"}
          </span>
          <Button size="sm" disabled={masiva.isPending} onClick={() => masiva.mutate({ ids: [...seleccion], accion: "publicar" })}>
            Publicar
          </Button>
          <Button size="sm" variant="outline" disabled={masiva.isPending} onClick={() => masiva.mutate({ ids: [...seleccion], accion: "pausar" })}>
            Pausar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSeleccion(new Set())}>Quitar selección</Button>
        </div>
      ) : null}

      <DataTable
        columnas={[
          {
            key: "sel",
            titulo: (
              <Checkbox
                aria-label="Seleccionar todos los de esta página"
                checked={todosMarcados ? true : algunoMarcado ? "indeterminate" : false}
                onCheckedChange={(v) =>
                  setSeleccion((s) => {
                    const n = new Set(s);
                    idsPagina.forEach((id) => (v ? n.add(id) : n.delete(id)));
                    return n;
                  })
                }
              />
            ),
            render: (p) => (
              <Checkbox aria-label={`Seleccionar ${p.titulo}`} checked={seleccion.has(p.id)} onCheckedChange={() => alternar(p.id)} />
            ),
          },
          {
            key: "titulo",
            titulo: "Anuncio",
            render: (p) => (
              <div className="flex min-w-56 items-center gap-3">
                <img
                  src={p.portada || "/propiedades/imagen_no_disponible.png"}
                  alt={p.portada ? "" : "Imagen no disponible"}
                  className="h-10 w-14 shrink-0 rounded object-cover"
                />
                <div className="min-w-0">
                  <button type="button" className="text-left font-medium hover:underline" onClick={() => setPanel({ tipo: "rendimiento", p })}>
                    {p.titulo}
                  </button>
                  <p className="text-muted-foreground text-xs">
                    {p.ciudad}
                    {p.estado !== "publicado" ? " · No publicado" : ""}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "ofertas",
            titulo: "Oferta",
            render: (p) =>
              p.ofertas?.length ? (
                <div className="grid gap-1">
                  {p.ofertas.map((o) => (
                    <div key={o.operacion} className="flex flex-wrap items-center gap-1.5 text-sm whitespace-nowrap">
                      <span>{OPERACION[o.operacion] ?? o.operacion}</span>
                      {o.precio ? <span className="font-medium">{formatPrecioCompleto(Number(o.precio))}</span> : null}
                      <span className={`rounded px-1.5 py-0.5 text-xs ${ESTADO_OFERTA[o.estado]?.clase ?? ""}`}>
                        {ESTADO_OFERTA[o.estado]?.etiqueta ?? o.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Sin oferta</span>
              ),
          },
          {
            key: "captacion",
            titulo: "Captación",
            render: (p) => {
              if (!p.captacion) {
                return (
                  <button type="button" className="text-muted-foreground text-sm underline" onClick={() => setPanel({ tipo: "captacion", p })}>
                    Registrar
                  </button>
                );
              }
              const venc = estadoVencimiento(p.captacion);
              return (
                <button type="button" className="grid justify-items-start gap-0.5 text-left text-sm" onClick={() => setPanel({ tipo: "captacion", p })}>
                  <span>{ETIQUETA_MANDATO[p.captacion.tipo_mandato]}</span>
                  {venc ? <span className={`rounded px-1.5 py-0.5 text-xs ${CLASE_TONO[venc.tono]}`}>{venc.texto}</span> : null}
                </button>
              );
            },
          },
          {
            key: "metricas",
            titulo: "Vistas · Fav · Leads",
            render: (p) => (
              <button type="button" className="tabular-nums hover:underline" onClick={() => setPanel({ tipo: "rendimiento", p })}>
                {p.vistas} · {p.favoritos} · {p.leads}
              </button>
            ),
          },
          { key: "created_at", titulo: "Creado", render: (p) => formatoFecha(p.created_at) },
          {
            key: "acciones",
            titulo: <span className="sr-only">Acciones</span>,
            render: (p) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Acciones de ${p.titulo}`}>
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onSelect={() => setPanel({ tipo: "rendimiento", p })}>Rendimiento</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/propiedades/${p.id}/editar`}>Editar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/propiedades/${p.id}/ficha`}>Ficha para imprimir / PDF</Link>
                  </DropdownMenuItem>
                  {p.estado === "publicado" ? (
                    <DropdownMenuItem asChild>
                      <a href={`${PORTAL_URL}/inmueble/${p.id}`} target="_blank" rel="noreferrer">Ver en el portal</a>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setPanel({ tipo: "captacion", p })}>Captación</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPanel({ tipo: "interesados", p })}>Clientes interesados</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => duplicar.mutate(p)} disabled={duplicar.isPending}>Duplicar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {(p.ofertas ?? []).map((o) =>
                    CIERRE[o.operacion] && o.estado === "active" ? (
                      <DropdownMenuItem key={o.operacion} onSelect={() => setCerrar({ p, oferta: o })}>
                        Marcar {o.operacion === "venta" ? "vendido" : "arrendado"}
                      </DropdownMenuItem>
                    ) : CIERRE[o.operacion] && o.estado !== "active" ? (
                      <DropdownMenuItem
                        key={o.operacion}
                        onSelect={() => estadoOferta.mutate({ p, operacion: o.operacion, nuevo: "active" })}
                      >
                        Reactivar {OPERACION[o.operacion].toLowerCase()}
                      </DropdownMenuItem>
                    ) : null,
                  )}
                  <DropdownMenuItem
                    onSelect={() => masiva.mutate({ ids: [p.id], accion: p.estado === "publicado" ? "pausar" : "publicar" })}
                  >
                    {p.estado === "publicado" ? "Pausar" : "Publicar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => setEliminar(p)}>Eliminar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        filas={filas}
        pagina={pagina}
        limite={LIMITE}
        total={paginacion.total}
        onPagina={(n) => {
          setPagina(n);
        }}
        cargando={isLoading}
      />

      <ConfirmDialog
        abierto={!!cerrar}
        titulo={cerrar?.oferta.operacion === "venta" ? "¿Marcar como vendido?" : "¿Marcar como arrendado?"}
        descripcion={
          cerrar?.oferta.operacion === "venta"
            ? `«${cerrar?.p.titulo}» deja de mostrarse en el portal y sus demás ofertas pasan a inactivas.`
            : `«${cerrar?.p.titulo}» deja de mostrarse como disponible para arriendo. La oferta de venta, si existe, no cambia.`
        }
        confirmarTexto={cerrar?.oferta.operacion === "venta" ? "Marcar vendido" : "Marcar arrendado"}
        cancelando={estadoOferta.isPending}
        onCancelar={() => setCerrar(null)}
        onConfirmar={() =>
          estadoOferta.mutate({ p: cerrar.p, operacion: cerrar.oferta.operacion, nuevo: CIERRE[cerrar.oferta.operacion] })
        }
      />
      <ConfirmDialog
        abierto={!!eliminar}
        titulo="Eliminar inmueble"
        descripcion={`Se eliminará "${eliminar?.titulo}" con sus fotos. Esta acción no se puede deshacer.`}
        confirmarTexto="Eliminar"
        cancelando={mEliminar.isPending}
        onCancelar={() => setEliminar(null)}
        onConfirmar={() => mEliminar.mutate(eliminar.id)}
      />
      <InteresadosSheet propiedad={panel?.tipo === "interesados" ? panel.p : null} onCerrar={() => setPanel(null)} />
      <CaptacionSheet propiedad={panel?.tipo === "captacion" ? panel.p : null} onCerrar={() => setPanel(null)} />
      <RendimientoSheet propiedad={panel?.tipo === "rendimiento" ? panel.p : null} onCerrar={() => setPanel(null)} />
    </>
  );
}
