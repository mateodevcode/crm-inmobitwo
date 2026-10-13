import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { DataTable } from "@/components/comunes/DataTable.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { mostrarTelefono } from "@/utils/telefono.js";
import {
  actualizarContacto,
  archivarContacto,
  crearContacto,
  obtenerContactos,
} from "@/features/contactos/api.js";
import { contactoSchema } from "@/features/contactos/schema.js";

const LIMITE = 20;
const TIPOS = ["comprador", "vendedor", "arrendatario", "inversor", "otro"];

export default function ContactosPage() {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [dialogo, setDialogo] = useState(null); // null | { modo: 'crear' } | { modo: 'editar', contacto }
  const [archivar, setArchivar] = useState(null);

  const clave = ["crm-contactos", espacio, pagina, busqueda, tipo];
  const { data, isLoading } = useQuery({
    queryKey: clave,
    queryFn: () => obtenerContactos({ pagina, limite: LIMITE, q: busqueda || undefined, tipo: tipo || undefined }),
  });

  const form = useForm({
    resolver: zodResolver(contactoSchema),
    defaultValues: { nombre: "", email: "", telefono: "", tipo: "otro", origen: "manual", autorizacion: false },
  });

  const abrirCrear = () => {
    form.reset({ nombre: "", email: "", telefono: "", tipo: "otro", origen: "manual", autorizacion: false });
    setDialogo({ modo: "crear" });
  };
  const abrirEditar = (contacto) => {
    form.reset({
      nombre: contacto.nombre ?? "",
      email: contacto.email ?? "",
      telefono: contacto.telefono ?? "",
      tipo: contacto.tipo ?? "otro",
      origen: contacto.origen ?? "manual",
      autorizacion: !!contacto.autorizacion_datos_at,
    });
    setDialogo({ modo: "editar", contacto });
  };

  const guardar = useMutation({
    mutationFn: (datos) =>
      dialogo.modo === "crear"
        ? crearContacto(datos)
        : actualizarContacto(dialogo.contacto.id, datos),
    onSuccess: () => {
      toast.success("Contacto guardado.");
      setDialogo(null);
      queryClient.invalidateQueries({ queryKey: ["crm-contactos"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const eliminar = useMutation({
    mutationFn: (id) => archivarContacto(id),
    onSuccess: () => {
      toast.success("Contacto archivado.");
      setArchivar(null);
      queryClient.invalidateQueries({ queryKey: ["crm-contactos"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <PageHeader
        titulo="Contactos"
        descripcion="Personas y empresas con las que trabaja."
        acciones={<Button onClick={abrirCrear}>Nuevo contacto</Button>}
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
            placeholder="Buscar nombre, correo, teléfono…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
        </form>
        <Select
          value={tipo || "todos"}
          onValueChange={(v) => {
            setTipo(v === "todos" ? "" : v);
            setPagina(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {TIPOS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columnas={[
          {
            key: "nombre",
            titulo: "Nombre",
            render: (c) => <Link to={`/contactos/${c.id}`} className="underline">{c.nombre}</Link>,
          },
          { key: "email", titulo: "Correo", render: (c) => c.email ?? "—" },
          { key: "telefono", titulo: "Teléfono", render: (c) => mostrarTelefono(c.telefono) },
          { key: "tipo", titulo: "Tipo" },
          {
            key: "presupuesto",
            titulo: "Presupuesto",
            render: (c) =>
              c.presupuesto_min || c.presupuesto_max ? (
                <span>
                  <MoneyText valor={c.presupuesto_min} /> — <MoneyText valor={c.presupuesto_max} />
                </span>
              ) : (
                "—"
              ),
          },
          {
            key: "acciones",
            titulo: "Acciones",
            render: (c) => (
              <div className="flex gap-3 text-sm">
                <button type="button" className="underline" onClick={() => abrirEditar(c)}>
                  Editar
                </button>
                <button type="button" className="underline" onClick={() => setArchivar(c)}>
                  Archivar
                </button>
              </div>
            ),
          },
        ]}
        filas={data?.data ?? []}
        pagina={pagina}
        limite={LIMITE}
        total={data?.pagination?.total ?? 0}
        onPagina={setPagina}
        cargando={isLoading}
      />

      <Dialog open={!!dialogo} onOpenChange={(v) => !v && setDialogo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogo?.modo === "crear" ? "Nuevo contacto" : "Editar contacto"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => guardar.mutate(d))} className="grid gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="300 123 4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="autorizacion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012).
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={guardar.isPending}>
                {guardar.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        abierto={!!archivar}
        titulo="Archivar contacto"
        descripcion={`Se archivará a ${archivar?.nombre}. Podrá recuperarse más adelante.`}
        confirmarTexto="Archivar"
        cancelando={eliminar.isPending}
        onCancelar={() => setArchivar(null)}
        onConfirmar={() => eliminar.mutate(archivar.id)}
      />
    </>
  );
}
