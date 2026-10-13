import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import {
  actualizarMiembro,
  agregarMiembro,
  eliminarMiembro,
  obtenerCarga,
  obtenerMiembros,
  reasignarMasivo,
} from "@/features/equipo/api.js";

export default function EquipoPage() {
  const { espacio, organizacion } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const orgId = organizacion?.id;
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("agent");
  const [eliminar, setEliminar] = useState(null);
  const [desde, setDesde] = useState("");
  const [hacia, setHacia] = useState("");

  const clave = ["equipo", espacio];
  const miembrosQ = useQuery({
    queryKey: clave,
    queryFn: () => obtenerMiembros(orgId),
    enabled: !!orgId,
  });
  const cargaQ = useQuery({
    queryKey: ["equipo-carga", espacio],
    queryFn: obtenerCarga,
    enabled: !!orgId,
  });

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: clave });
    queryClient.invalidateQueries({ queryKey: ["equipo-carga", espacio] });
  };

  const agregar = useMutation({
    mutationFn: () => agregarMiembro(orgId, { email: email.trim(), rol_en_org: rol }),
    onSuccess: () => {
      toast.success("Miembro agregado. Debe tener cuenta registrada.");
      setEmail("");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const cambiarRol = useMutation({
    mutationFn: ({ id, rol_en_org }) => actualizarMiembro(id, { rol_en_org }),
    onSuccess: () => {
      toast.success("Rol actualizado.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const borrar = useMutation({
    mutationFn: (id) => eliminarMiembro(id),
    onSuccess: () => {
      toast.success("Miembro retirado.");
      setEliminar(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const reasignar = useMutation({
    mutationFn: () => reasignarMasivo(Number(desde), Number(hacia)),
    onSuccess: (d) => {
      toast.success(`Reasignado: ${d.contactos} contactos, ${d.oportunidades} oportunidades, ${d.tareas} tareas.`);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const cargaPorUsuario = Object.fromEntries(
    (cargaQ.data ?? []).map((c) => [c.usuario_id, c]),
  );
  const miembros = miembrosQ.data ?? [];

  return (
    <>
      <PageHeader titulo="Equipo" descripcion={`Miembros de ${organizacion?.nombre ?? ""}.`} />
      <Card>
        <CardHeader>
          <CardTitle>Miembros y carga</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Contactos</TableHead>
                <TableHead>Oport. abiertas</TableHead>
                <TableHead>Tareas vencidas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {miembros.map((m) => {
                const carga = cargaPorUsuario[m.usuario_id] ?? {};
                return (
                  <TableRow key={m.id}>
                    <TableCell>{m.name} · {m.email}</TableCell>
                    <TableCell>
                      <Select
                        value={m.rol_en_org}
                        onValueChange={(v) => cambiarRol.mutate({ id: m.id, rol_en_org: v })}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">agent</SelectItem>
                          <SelectItem value="agency_admin">agency_admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{carga.contactos ?? "—"}</TableCell>
                    <TableCell>{carga.oportunidades_abiertas ?? "—"}</TableCell>
                    <TableCell>{carga.tareas_vencidas ?? "—"}</TableCell>
                    <TableCell>
                      <button type="button" className="text-sm underline" onClick={() => setEliminar(m)}>
                        Retirar
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agregar miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) agregar.mutate();
              }}
            >
              <Input
                type="email"
                required
                placeholder="correo@registrado.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-xs"
              />
              <Select value={rol} onValueChange={setRol}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">agent</SelectItem>
                  <SelectItem value="agency_admin">agency_admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={agregar.isPending}>Agregar</Button>
            </form>
            <p className="text-muted-foreground mt-2 text-xs">
              El usuario debe tener cuenta registrada en el portal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reasignación masiva</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (desde && hacia && desde !== hacia) reasignar.mutate();
              }}
            >
              <Select value={desde} onValueChange={setDesde}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Desde" />
                </SelectTrigger>
                <SelectContent>
                  {miembros.map((m) => (
                    <SelectItem key={m.id} value={String(m.usuario_id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={hacia} onValueChange={setHacia}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Hacia" />
                </SelectTrigger>
                <SelectContent>
                  {miembros.map((m) => (
                    <SelectItem key={m.id} value={String(m.usuario_id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={reasignar.isPending}>Reasignar todo</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        abierto={!!eliminar}
        titulo="Retirar miembro"
        descripcion={`${eliminar?.name} perderá acceso a la organización.`}
        confirmarTexto="Retirar"
        onCancelar={() => setEliminar(null)}
        onConfirmar={() => borrar.mutate(eliminar.id)}
      />
    </>
  );
}
