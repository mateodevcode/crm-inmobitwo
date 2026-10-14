import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { PORTAL_URL } from "@/config/config.js";
import {
  actualizarMiOrganizacion,
  crearMiOrganizacion,
  darDeBajaOrganizacion,
  obtenerEstadisticas,
  obtenerMiembros,
  solicitarDominio,
} from "@/features/inmobiliaria/api.js";

const VACIO = {
  nombre: "",
  email: "",
  telefono: "",
  website: "",
  ciudad: "",
  departamento: "",
  descripcion: "",
};
const TEMAS = ["tema1", "tema2", "tema3", "tema4"];

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

export default function InmobiliariaPage() {
  const { usuario } = useContext(AuthContext);
  const { organizaciones, organizacion, esPersonal, puedeAdministrar, rolEnOrg, cargandoOrgs, recargarOrgs, cambiarEspacio } =
    useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nueva, setNueva] = useState(VACIO);
  const [editando, setEditando] = useState(false);
  const [editValores, setEditValores] = useState(VACIO);
  const [dominio, setDominio] = useState("");
  const [bajaPaso1, setBajaPaso1] = useState(false);
  const [bajaPaso2, setBajaPaso2] = useState(false);

  const orgId = organizacion?.id;
  const miembrosQ = useQuery({
    queryKey: ["mi-org-miembros", orgId],
    queryFn: () => obtenerMiembros(orgId),
    enabled: orgId != null,
  });
  const statsQ = useQuery({
    queryKey: ["mi-org-stats", orgId],
    queryFn: () => obtenerEstadisticas(orgId),
    enabled: orgId != null,
  });

  const refrescarOrg = () => {
    recargarOrgs();
    queryClient.invalidateQueries({ queryKey: ["mi-org-miembros"] });
    queryClient.invalidateQueries({ queryKey: ["mi-org-stats"] });
  };

  const mCrear = useMutation({
    mutationFn: () => crearMiOrganizacion({ ...nueva, creada_por_id: usuario.id }),
    onSuccess: () => {
      toast.success("Inmobiliaria registrada. Queda pendiente de aprobación.");
      setNueva(VACIO);
      setCrearAbierto(false);
      refrescarOrg();
    },
    onError: (err) => toast.error(err.message),
  });
  const mEditar = useMutation({
    mutationFn: (datos) => actualizarMiOrganizacion(orgId, datos),
    onSuccess: () => {
      toast.success("Datos actualizados.");
      setEditando(false);
      refrescarOrg();
    },
    onError: (err) => toast.error(err.message),
  });
  const mDominio = useMutation({
    mutationFn: () => solicitarDominio(orgId, dominio.trim()),
    onSuccess: (data) => {
      toast.success("Dominio solicitado. Pendiente de verificación DNS.");
      setDominio("");
      refrescarOrg();
      void data;
    },
    onError: (err) => toast.error(err.message),
  });
  const mTema = useMutation({
    mutationFn: (tema) => actualizarMiOrganizacion(orgId, { tema }),
    onSuccess: () => {
      toast.success("Tema actualizado.");
      refrescarOrg();
    },
    onError: (err) => toast.error(err.message),
  });
  const mBaja = useMutation({
    mutationFn: () => darDeBajaOrganizacion(orgId),
    onSuccess: () => {
      toast.success("Inmobiliaria dada de baja.");
      setBajaPaso2(false);
      cambiarEspacio("personal");
      refrescarOrg();
    },
    onError: (err) => toast.error(err.message),
  });

  if (cargandoOrgs) {
    return (
      <>
        <PageHeader titulo="Mi inmobiliaria" descripcion="Su organización." />
        <p className="text-muted-foreground text-sm">Cargando…</p>
      </>
    );
  }

  // Sin organizaciones: registrar (aquí el user nace como agency_admin).
  if (organizaciones.length === 0) {
    return (
      <>
        <PageHeader titulo="Mi inmobiliaria" descripcion="Aún no pertenece a ninguna inmobiliaria." />
        <Card>
          <CardContent className="grid gap-3 p-6">
            <p className="text-sm">
              Registre su inmobiliaria para operar como agencia. Quedará pendiente de aprobación.
            </p>
            <div>
              <Button onClick={() => setCrearAbierto(true)}>Crear inmobiliaria</Button>
            </div>
          </CardContent>
        </Card>
        <Dialog open={crearAbierto} onOpenChange={setCrearAbierto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva inmobiliaria</DialogTitle>
            </DialogHeader>
            <FormOrg valores={nueva} setValores={setNueva} onGuardar={() => mCrear.mutate()} guardando={mCrear.isPending} textoBoton="Registrar" />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Con espacio personal pero con orgs: invitar a cambiar de espacio.
  if (esPersonal || !organizacion) {
    return (
      <>
        <PageHeader titulo="Mi inmobiliaria" descripcion="Seleccione su inmobiliaria." />
        <Card>
          <CardContent className="p-6 text-sm">
            <p className="mb-2">Pertenece a {organizaciones.length} inmobiliaria(s). Use el selector de espacio (arriba) para ver cada una.</p>
            <ul className="grid gap-2">
              {organizaciones.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <span>
                    {o.nombre} ({o.rol_en_org === "agency_admin" ? "Administrador" : "Agente"})
                  </span>
                  <Button size="sm" onClick={() => cambiarEspacio(`org:${o.id}`)}>
                    Ver
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </>
    );
  }

  const o = organizacion;
  const miembros = miembrosQ.data ?? [];
  const stats = statsQ.data;
  const esSuper = usuario?.rol === "superadmin";

  const abrirEditar = () => {
    setEditValores({
      nombre: o.nombre ?? "",
      email: o.email ?? "",
      telefono: o.telefono ?? "",
      website: o.website ?? "",
      ciudad: o.ciudad ?? "",
      departamento: o.departamento ?? "",
      descripcion: o.descripcion ?? "",
    });
    setEditando(true);
  };

  return (
    <>
      <PageHeader
        titulo="Mi inmobiliaria"
        descripcion={`${o.nombre} · ${rolEnOrg === "agency_admin" ? "Administrador" : "Agente"}`}
        acciones={
          puedeAdministrar ? <Button onClick={abrirEditar}>Editar datos</Button> : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Estado: </span>
              <EstadoBadge estado={o.estado} />
            </p>
            <p><span className="text-muted-foreground">Correo: </span>{o.email ?? "—"}</p>
            <p><span className="text-muted-foreground">Teléfono: </span>{o.telefono ?? "—"}</p>
            <p><span className="text-muted-foreground">Web: </span>{o.website ?? "—"}</p>
            <p><span className="text-muted-foreground">Ciudad: </span>{o.ciudad ?? "—"} · {o.departamento ?? "—"}</p>
            {o.descripcion ? <p className="mt-2">{o.descripcion}</p> : null}
            <a href={`${PORTAL_URL}/inmobiliarias/${o.slug}`} target="_blank" rel="noreferrer" className="mt-2 text-sm underline">
              Ver página pública
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            {statsQ.isLoading ? (
              <p className="text-muted-foreground">Cargando…</p>
            ) : stats ? (
              <>
                <p>Anuncios: {stats.propiedades.total} ({stats.propiedades.publicadas} publicados)</p>
                <p>Miembros: {stats.miembros.activos} activos ({stats.miembros.administradores} admin · {stats.miembros.agentes} agentes)</p>
                {stats.ultimaPropiedad ? <p>Último anuncio: {stats.ultimaPropiedad.titulo}</p> : null}
              </>
            ) : (
              <p className="text-muted-foreground">Sin estadísticas.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/propiedades"><Button size="sm" variant="outline">Propiedades</Button></Link>
              <Link to="/reportes"><Button size="sm" variant="outline">Reportes</Button></Link>
              {puedeAdministrar ? (
                <Link to="/equipo"><Button size="sm" variant="outline">Equipo</Button></Link>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Miembros ({miembros.length})</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {miembrosQ.isLoading ? (
              <p className="text-muted-foreground">Cargando…</p>
            ) : (
              miembros.map((m) => (
                <p key={m.id}>
                  {m.name ?? m.email} · {m.rol_en_org === "agency_admin" ? "Administrador" : "Agente"} · {m.estado}
                </p>
              ))
            )}
            {puedeAdministrar ? (
              <Link to="/equipo"><Button size="sm" variant="outline">Gestionar en Equipo</Button></Link>
            ) : (
              <p className="text-muted-foreground text-xs">Solo un administrador gestiona miembros.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dominio y tema</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <p>
              <span className="text-muted-foreground">Dominio: </span>
              {o.custom_domain ? `${o.custom_domain} (${o.dominio_estado})` : "Sin dominio propio"}
            </p>
            {puedeAdministrar && !o.custom_domain ? (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (dominio.trim()) mDominio.mutate();
                }}
              >
                <Input placeholder="midominio.com" value={dominio} onChange={(e) => setDominio(e.target.value)} />
                <Button type="submit" disabled={mDominio.isPending}>Solicitar</Button>
              </form>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tema:</span>
              <Select value={o.tema ?? "tema1"} onValueChange={(v) => mTema.mutate(v)} disabled={!puedeAdministrar}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMAS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!puedeAdministrar && !esSuper ? (
              <p className="text-muted-foreground text-xs">Solo un administrador cambia dominio y tema.</p>
            ) : null}
          </CardContent>
        </Card>

        {puedeAdministrar ? (
          <Card className="border-destructive lg:col-span-2">
            <CardHeader>
              <CardTitle>Dar de baja</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                Para eliminar la inmobiliaria primero retire todos los agentes y borre
                todos los inmuebles. Ahora:{" "}
                <strong>{stats?.miembros.agentes ?? "…"} agentes</strong>,{" "}
                <strong>{stats?.propiedades.total ?? "…"} inmuebles</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/equipo"><Button size="sm" variant="outline">Retirar agentes</Button></Link>
                <a href={`${PORTAL_URL}/usuario/mis-anuncios`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">Borrar inmuebles</Button>
                </a>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={(stats?.miembros.agentes ?? 1) > 0 || (stats?.propiedades.total ?? 1) > 0}
                  onClick={() => setBajaPaso1(true)}
                >
                  Dar de baja
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {o.nombre}</DialogTitle>
          </DialogHeader>
          <FormOrg valores={editValores} setValores={setEditValores} onGuardar={() => mEditar.mutate(editValores)} guardando={mEditar.isPending} textoBoton="Guardar" />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        abierto={bajaPaso1}
        titulo="Dar de baja la inmobiliaria (1/2)"
        descripcion={`"${o.nombre}" se eliminará con sus membresías. Confirme que ya retiró agentes y borró inmuebles.`}
        confirmarTexto="Continuar"
        onCancelar={() => setBajaPaso1(false)}
        onConfirmar={() => {
          setBajaPaso1(false);
          setBajaPaso2(true);
        }}
      />
      <ConfirmDialog
        abierto={bajaPaso2}
        titulo="Confirmación final (2/2)"
        descripcion="Esta acción elimina la inmobiliaria y no se puede deshacer."
        confirmarTexto="Sí, dar de baja"
        onCancelar={() => setBajaPaso2(false)}
        onConfirmar={() => mBaja.mutate()}
      />
    </>
  );
}
