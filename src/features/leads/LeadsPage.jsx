import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { DataTable } from "@/components/comunes/DataTable.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.jsx";
import { formatoFechaHora } from "@/utils/fechas.js";
import { enlaceWhatsApp, mostrarTelefono } from "@/utils/telefono.js";
import { cambiarEstadoLead, obtenerLeads } from "@/features/leads/api.js";
import { convertirLead } from "@/features/contactos/api.js";

const LIMITE = 20;
const ESTADOS = ["nuevo", "contactado", "en_negociacion", "cerrado", "descartado"];
const VACIO = { estado: "", origen: "", desde: "", hasta: "", q: "" };

export default function LeadsPage() {
  const { espacio } = useContext(WorkspaceContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState(VACIO);
  const [aplicados, setAplicados] = useState(VACIO);
  const [seleccionado, setSeleccionado] = useState(null);

  const clave = ["crm-leads", espacio, pagina, aplicados];
  const { data, isLoading } = useQuery({
    queryKey: clave,
    queryFn: () => obtenerLeads({ pagina, limite: LIMITE, ...aplicados }),
  });

  const mutacion = useMutation({
    mutationFn: ({ id, estado }) => cambiarEstadoLead(id, estado),
    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: clave });
      const previo = queryClient.getQueryData(clave);
      queryClient.setQueryData(clave, (viejo) => {
        if (!viejo?.data) return viejo;
        return {
          ...viejo,
          data: viejo.data.map((l) => (l.id === id ? { ...l, estado } : l)),
        };
      });
      setSeleccionado((s) => (s && s.id === id ? { ...s, estado } : s));
      return { previo };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previo) queryClient.setQueryData(clave, ctx.previo);
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: clave }),
  });

  const setFiltro = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  const wa = seleccionado ? enlaceWhatsApp(seleccionado.telefono) : null;

  return (
    <>
      <PageHeader titulo="Leads" descripcion="Interesados en sus anuncios." />
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setAplicados(filtros);
        }}
      >
        <Input
          placeholder="Buscar nombre, correo, teléfono…"
          value={filtros.q}
          onChange={(e) => setFiltro("q", e.target.value)}
          className="w-64"
        />
        <Select value={filtros.estado || "todos"} onValueChange={(v) => setFiltro("estado", v === "todos" ? "" : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtros.origen || "todos"} onValueChange={(v) => setFiltro("origen", v === "todos" ? "" : v)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="formulario_directo">Formulario</SelectItem>
            <SelectItem value="scoring_comportamiento">Comportamiento</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={filtros.desde} onChange={(e) => setFiltro("desde", e.target.value)} className="w-40" />
        <Input type="date" value={filtros.hasta} onChange={(e) => setFiltro("hasta", e.target.value)} className="w-40" />
      </form>

      <DataTable
        columnas={[
          {
            key: "contacto",
            titulo: "Contacto",
            render: (l) => (
              <button type="button" className="text-left underline" onClick={() => setSeleccionado(l)}>
                {l.nombre || l.email || l.telefono || `Lead ${l.id}`}
              </button>
            ),
          },
          { key: "propiedad_titulo", titulo: "Propiedad" },
          { key: "score", titulo: "Score" },
          { key: "estado", titulo: "Estado", render: (l) => <EstadoBadge estado={l.estado} /> },
          { key: "created_at", titulo: "Fecha", render: (l) => formatoFechaHora(l.created_at) },
        ]}
        filas={data?.data ?? []}
        pagina={pagina}
        limite={LIMITE}
        total={data?.pagination?.total ?? 0}
        onPagina={setPagina}
        cargando={isLoading}
      />

      <Sheet open={!!seleccionado} onOpenChange={(v) => !v && setSeleccionado(null)}>
        <SheetContent>
          {seleccionado ? (
            <>
              <SheetHeader>
                <SheetTitle>{seleccionado.nombre || `Lead ${seleccionado.id}`}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-3 pt-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Propiedad: </span>
                  {seleccionado.propiedad_titulo}
                </p>
                <p>
                  <span className="text-muted-foreground">Correo: </span>
                  {seleccionado.email ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Teléfono: </span>
                  {mostrarTelefono(seleccionado.telefono)}
                </p>
                <p>
                  <span className="text-muted-foreground">Score: </span>
                  {seleccionado.score}
                </p>
                <div className="flex gap-2">
                  {seleccionado.telefono ? (
                    <a href={`tel:${seleccionado.telefono}`}>Llamar</a>
                  ) : null}
                  {wa ? (
                    <a href={wa} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  ) : null}
                  {seleccionado.email ? (
                    <a href={`mailto:${seleccionado.email}`}>Correo</a>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <span className="text-muted-foreground">Contacto CRM</span>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const r = await convertirLead(seleccionado.id);
                        toast.success("Lead pasado a contactos.");
                        navigate(`/contactos/${r.data.id}`);
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }}
                  >
                    Pasar a contactos
                  </Button>
                </div>
                <div className="grid gap-2">
                  <span className="text-muted-foreground">Estado</span>
                  <Select
                    value={seleccionado.estado}
                    onValueChange={(v) =>
                      mutacion.mutate({ id: seleccionado.id, estado: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
