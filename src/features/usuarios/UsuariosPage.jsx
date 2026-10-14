import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { DataTable } from "@/components/comunes/DataTable.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { formatoFecha } from "@/utils/fechas.js";
import { desbloquearUsuario, obtenerUsuarios } from "@/features/usuarios/api.js";

const LIMITE = 20;

function OrgsCell({ orgs }) {
  if (!orgs || orgs.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span>
      {orgs.map((o) => (
        <span key={o.id} className="mr-1 rounded bg-muted px-1.5 py-0.5 text-xs">
          {o.nombre} ({o.rol_en_org === "agency_admin" ? "admin" : "agente"})
        </span>
      ))}
    </span>
  );
}

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [aplicada, setAplicada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [desbloqueo, setDesbloqueo] = useState(null);

  const clave = ["admin-usuarios", aplicada, pagina];
  const { data, isLoading } = useQuery({
    queryKey: clave,
    queryFn: () => obtenerUsuarios({ q: aplicada, pagina, limite: LIMITE }),
  });

  const mDesbloquear = useMutation({
    mutationFn: (id) => desbloquearUsuario(id),
    onSuccess: () => {
      toast.success("Usuario desbloqueado.");
      setDesbloqueo(null);
      queryClient.invalidateQueries({ queryKey: clave });
    },
    onError: (err) => toast.error(err.message),
  });

  const filas = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const columnas = [
    { key: "nombre", titulo: "Nombre", render: (u) => <span className="font-medium">{u.name}</span> },
    {
      key: "contacto",
      titulo: "Correo / Teléfono",
      render: (u) => (
        <span>
          {u.email}
          <br />
          <span className="text-muted-foreground text-xs">{u.telefono ?? "—"}</span>
        </span>
      ),
    },
    { key: "rol", titulo: "Rol", render: (u) => (u.rol === "superadmin" ? "superadmin" : "user") },
    {
      key: "inmuebles",
      titulo: "Inmuebles",
      render: (u) => (u.inmuebles > 0 ? u.inmuebles : <span className="text-muted-foreground">0</span>),
    },
    { key: "orgs", titulo: "Organización", render: (u) => <OrgsCell orgs={u.orgs} /> },
    {
      key: "fechas",
      titulo: "Registro / Último login",
      render: (u) => (
        <span className="text-xs">
          {formatoFecha(u.created_at)}
          <br />
          <span className="text-muted-foreground">{u.ultimo_login ? formatoFecha(u.ultimo_login) : "nunca"}</span>
        </span>
      ),
    },
    {
      key: "estado",
      titulo: "Estado",
      render: (u) =>
        u.bloqueado ? (
          <EstadoBadge estado="bloqueado" />
        ) : (
          <span className="text-xs">
            activo{u.email_verificado ? " · verificado" : " · sin verificar"}
          </span>
        ),
    },
    {
      key: "accion",
      titulo: "",
      render: (u) =>
        u.bloqueado ? (
          <Button size="sm" variant="outline" onClick={() => setDesbloqueo(u)}>
            Desbloquear
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader titulo="Usuarios" descripcion="Todos los usuarios del sistema. Solo superadmin." />
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setAplicada(q.trim());
        }}
      >
        <Input
          placeholder="Buscar nombre, correo o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading && filas.length === 0 ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : filas.length === 0 ? (
        <EmptyState titulo="Sin usuarios" descripcion="Ajuste la búsqueda." />
      ) : (
        <DataTable
          columnas={columnas}
          filas={filas}
          pagina={pagina}
          limite={LIMITE}
          total={total}
          onPagina={setPagina}
          cargando={isLoading}
        />
      )}

      <ConfirmDialog
        abierto={!!desbloqueo}
        titulo="Desbloquear usuario"
        descripcion={`"${desbloqueo?.email}" podrá volver a iniciar sesión.`}
        confirmarTexto="Desbloquear"
        onCancelar={() => setDesbloqueo(null)}
        onConfirmar={() => mDesbloquear.mutate(desbloqueo.id)}
      />
    </>
  );
}
