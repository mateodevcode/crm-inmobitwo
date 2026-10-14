import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { PORTAL_URL } from "@/config/config.js";
import {
  activarDominio,
  actualizarOrganizacion,
  aprobarOrganizacion,
  crearOrganizacion,
  desactivarDominio,
  eliminarOrganizacion,
  obtenerOrganizaciones,
  quitarDominio,
  suspenderOrganizacion,
} from "@/features/admin/api.js";

const FILTROS = ["pendiente", "aprobada", "suspendida", "todas"];
const VACIO = {
  nombre: "",
  email: "",
  telefono: "",
  website: "",
  ciudad: "",
  departamento: "",
  descripcion: "",
};

function FormOrg({ valores, setValores, onGuardar, guardando, textoBoton }) {
  const set = (k, v) => setValores((f) => ({ ...f, [k]: v }));
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar();
      }}
    >
      <Input placeholder="Nombre *" value={valores.nombre} onChange={(e) => set("nombre", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Correo" value={valores.email} onChange={(e) => set("email", e.target.value)} />
        <Input placeholder="Teléfono" value={valores.telefono} onChange={(e) => set("telefono", e.target.value)} />
      </div>
      <Input placeholder="Sitio web" value={valores.website} onChange={(e) => set("website", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Ciudad" value={valores.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
        <Input placeholder="Departamento" value={valores.departamento} onChange={(e) => set("departamento", e.target.value)} />
      </div>
      <Textarea placeholder="Descripción" value={valores.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
      <Button type="submit" disabled={guardando || !valores.nombre.trim()}>
        {guardando ? "Guardando…" : textoBoton}
      </Button>
    </form>
  );
}

export default function AdminPage() {
  const { usuario } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState("pendiente");
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nueva, setNueva] = useState(VACIO);
  const [editando, setEditando] = useState(null);
  const [editValores, setEditValores] = useState(VACIO);
  const [suspender, setSuspender] = useState(null);
  const [eliminar, setEliminar] = useState(null);

  const clave = ["admin-orgs", filtro];
  const { data, isLoading } = useQuery({
    queryKey: clave,
    queryFn: () => obtenerOrganizaciones(filtro === "todas" ? "" : filtro),
  });

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
  const useAccion = (fn, ok) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => {
        toast.success(ok);
        refrescar();
      },
      onError: (err) => toast.error(err.message),
    });
  // Hooks de mutación (orden fijo)
  const mAprobar = useAccion(aprobarOrganizacion, "Inmobiliaria aprobada.");
  const mSuspender = useAccion(suspenderOrganizacion, "Inmobiliaria suspendida.");
  const mActivar = useAccion(activarDominio, "Dominio activado.");
  const mDesactivar = useAccion(desactivarDominio, "Dominio pausado.");
  const mQuitar = useAccion(quitarDominio, "Dominio eliminado.");
  const mEliminar = useAccion(eliminarOrganizacion, "Inmobiliaria eliminada.");
  const mCrear = useMutation({
    mutationFn: () => crearOrganizacion({ ...nueva, creada_por_id: usuario.id }),
    onSuccess: () => {
      toast.success("Inmobiliaria creada (pendiente de aprobación).");
      setNueva(VACIO);
      setCrearAbierto(false);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const mEditar = useMutation({
    mutationFn: () => actualizarOrganizacion(editando.id, editValores),
    onSuccess: () => {
      toast.success("Inmobiliaria actualizada.");
      setEditando(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const orgs = data ?? [];

  const abrirEditar = (o) => {
    setEditando(o);
    setEditValores({
      nombre: o.nombre ?? "",
      email: o.email ?? "",
      telefono: o.telefono ?? "",
      website: o.website ?? "",
      ciudad: o.ciudad ?? "",
      departamento: o.departamento ?? "",
      descripcion: o.descripcion ?? "",
    });
  };

  return (
    <>
      <PageHeader
        titulo="Admin"
        descripcion="Inmobiliarias: crear, aprobar, suspender y editar. Solo superadmin."
        acciones={<Button onClick={() => setCrearAbierto(true)}>Nueva inmobiliaria</Button>}
      />

      <Tabs value={filtro} onValueChange={setFiltro} className="mb-4">
        <TabsList>
          {FILTROS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : orgs.length === 0 ? (
        <EmptyState titulo="Sin inmobiliarias" descripcion="No hay en este estado." />
      ) : (
        <div className="grid gap-3">
          {orgs.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {o.nombre} <span className="text-muted-foreground text-xs">ID {o.id}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    /inmobiliarias/{o.slug} · {o.ciudad ?? "—"}
                  </p>
                  {o.custom_domain ? (
                    <p className="text-muted-foreground text-xs">
                      Dominio: {o.custom_domain} ({o.dominio_estado})
                    </p>
                  ) : null}
                  <div className="mt-1">
                    <EstadoBadge estado={o.estado} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`${PORTAL_URL}/inmobiliarias/${o.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </a>
                  <Button size="sm" variant="outline" onClick={() => abrirEditar(o)}>
                    Editar
                  </Button>
                  {o.estado !== "aprobada" ? (
                    <Button size="sm" onClick={() => mAprobar.mutate(o.id)}>
                      Aprobar
                    </Button>
                  ) : null}
                  {o.estado !== "suspendida" ? (
                    <Button size="sm" variant="outline" onClick={() => setSuspender(o)}>
                      Suspender
                    </Button>
                  ) : null}
                  {o.custom_domain && o.dominio_estado === "pendiente_dns" ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => mActivar.mutate(o.id)}>
                        Activar dominio
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => mQuitar.mutate(o.id)}>
                        Cancelar solicitud
                      </Button>
                    </>
                  ) : null}
                  {o.custom_domain && o.dominio_estado === "activo" ? (
                    <Button size="sm" variant="outline" onClick={() => mDesactivar.mutate(o.id)}>
                      Pausar dominio
                    </Button>
                  ) : null}
                  <Button size="sm" variant="destructive" onClick={() => setEliminar(o)}>
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={crearAbierto} onOpenChange={setCrearAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva inmobiliaria</DialogTitle>
          </DialogHeader>
          <FormOrg valores={nueva} setValores={setNueva} onGuardar={() => mCrear.mutate()} guardando={mCrear.isPending} textoBoton="Crear" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {editando?.nombre}</DialogTitle>
          </DialogHeader>
          {editando ? (
            <FormOrg valores={editValores} setValores={setEditValores} onGuardar={() => mEditar.mutate()} guardando={mEditar.isPending} textoBoton="Guardar" />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        abierto={!!suspender}
        titulo="Suspender inmobiliaria"
        descripcion={`"${suspender?.nombre}" dejará de operar y sus miembros perderán acceso.`}
        confirmarTexto="Suspender"
        onCancelar={() => setSuspender(null)}
        onConfirmar={() => {
          mSuspender.mutate(suspender.id);
          setSuspender(null);
        }}
      />
      <ConfirmDialog
        abierto={!!eliminar}
        titulo="Eliminar inmobiliaria"
        descripcion={`Se eliminará "${eliminar?.nombre}" y sus membresías. Esta acción no se puede deshacer.`}
        confirmarTexto="Eliminar"
        onCancelar={() => setEliminar(null)}
        onConfirmar={() => {
          mEliminar.mutate(eliminar.id);
          setEliminar(null);
        }}
      />
    </>
  );
}
