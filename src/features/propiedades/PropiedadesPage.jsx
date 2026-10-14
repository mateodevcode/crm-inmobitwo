import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PORTAL_URL } from "@/config/config.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { DataTable } from "@/components/comunes/DataTable.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { formatoFecha } from "@/utils/fechas.js";
import { obtenerPropiedades } from "@/features/propiedades/api.js";
import { cambiarEstadoProp, eliminarPropiedad } from "@/features/propiedades/wizard/api.js";

const LIMITE = 20;

export default function PropiedadesPage() {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [eliminar, setEliminar] = useState(null);

  const clave = ["crm-propiedades", espacio, pagina, estado, busqueda];
  const { data, isLoading } = useQuery({
    queryKey: clave,
    queryFn: () =>
      obtenerPropiedades({ pagina, limite: LIMITE, estado: estado || undefined, q: busqueda || undefined }),
  });

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-propiedades"] });
  const mEstado = useMutation({
    mutationFn: (p) =>
      cambiarEstadoProp(p.id, p.estado === "publicado" ? "no_publicado" : "publicado"),
    onSuccess: () => {
      toast.success("Estado actualizado.");
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

  const filas = data?.data ?? [];
  const paginacion = data?.pagination ?? { total: 0 };

  return (
    <>
      <PageHeader
        titulo="Propiedades"
        descripcion="Sus anuncios en el portal."
        acciones={
          <Link to="/propiedades/nuevo">
            <Button>Nuevo inmueble</Button>
          </Link>
        }
      />
      <div className="flex flex-wrap gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPagina(1);
            setBusqueda(q.trim());
          }}
        >
          <Input
            placeholder="Buscar por título, ciudad…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <button type="submit" className="hidden" aria-hidden />
        </form>
        <Select
          value={estado || "todos"}
          onValueChange={(v) => {
            setEstado(v === "todos" ? "" : v);
            setPagina(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="no_publicado">No publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columnas={[
          {
            key: "titulo",
            titulo: "Anuncio",
            render: (p) => (
              <div className="flex items-center gap-3">
                {p.portada ? (
                  <img src={p.portada} alt="" className="h-10 w-14 rounded object-cover" />
                ) : null}
                <div>
                  <p className="font-medium">{p.titulo}</p>
                  <p className="text-muted-foreground text-xs">{p.ciudad}</p>
                </div>
              </div>
            ),
          },
          { key: "precio", titulo: "Precio", render: (p) => <MoneyText valor={p.precio} /> },
          { key: "estado", titulo: "Estado", render: (p) => p.estado },
          {
            key: "metricas",
            titulo: "Vistas · Fav · Leads",
            render: (p) => `${p.vistas} · ${p.favoritos} · ${p.leads}`,
          },
          { key: "created_at", titulo: "Fecha", render: (p) => formatoFecha(p.created_at) },
          {
            key: "acciones",
            titulo: "Acciones",
            render: (p) => (
              <div className="flex flex-wrap gap-3 text-sm">
                <a href={`${PORTAL_URL}/inmueble/${p.id}`} target="_blank" rel="noreferrer" className="underline">
                  Ver en portal
                </a>
                <Link to={`/propiedades/${p.id}/editar`} className="underline">
                  Editar
                </Link>
                <button type="button" className="underline" onClick={() => mEstado.mutate(p)}>
                  {p.estado === "publicado" ? "Pausar" : "Publicar"}
                </button>
                <button type="button" className="text-destructive underline" onClick={() => setEliminar(p)}>
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        filas={filas}
        pagina={pagina}
        limite={LIMITE}
        total={paginacion.total}
        onPagina={setPagina}
        cargando={isLoading}
      />

      <ConfirmDialog
        abierto={!!eliminar}
        titulo="Eliminar inmueble"
        descripcion={`Se eliminará "${eliminar?.titulo}" con sus fotos. Esta acción no se puede deshacer.`}
        confirmarTexto="Eliminar"
        onCancelar={() => setEliminar(null)}
        onConfirmar={() => mEliminar.mutate(eliminar.id)}
      />
    </>
  );
}
