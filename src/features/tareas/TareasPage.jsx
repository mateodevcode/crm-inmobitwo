import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { formatoFecha } from "@/utils/fechas.js";
import { completarTarea, crearTarea, obtenerTareas } from "@/features/tareas/api.js";

const LIMITE = 20;

export default function TareasPage() {
  const { espacio } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [vista, setVista] = useState("");
  const [pagina, setPagina] = useState(1);
  const [titulo, setTitulo] = useState("");

  const clave = ["crm-tareas", espacio, vista, pagina];
  const { data, isLoading } = useQuery({
    queryKey: clave,
    queryFn: () => obtenerTareas({ pagina, limite: LIMITE, vista: vista || undefined }),
  });

  const crear = useMutation({
    mutationFn: () => crearTarea({ titulo: titulo.trim() }),
    onSuccess: () => {
      toast.success("Tarea creada.");
      setTitulo("");
      queryClient.invalidateQueries({ queryKey: ["crm-tareas", espacio] });
    },
    onError: (err) => toast.error(err.message),
  });

  const completar = useMutation({
    mutationFn: (id) => completarTarea(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: clave });
      const previo = queryClient.getQueryData(clave);
      queryClient.setQueryData(clave, (v) =>
        v?.data ? { ...v, data: v.data.filter((t) => t.id !== id) } : v,
      );
      return { previo };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.previo) queryClient.setQueryData(clave, ctx.previo);
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: clave }),
  });

  return (
    <>
      <PageHeader titulo="Tareas" descripcion="Seguimiento pendiente." />
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (titulo.trim()) crear.mutate();
        }}
      >
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nueva tarea…"
          className="max-w-md"
        />
        <Button type="submit" disabled={crear.isPending}>Crear</Button>
      </form>
      <Tabs value={vista || "todas"} onValueChange={(v) => { setVista(v === "todas" ? "" : v); setPagina(1); }}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="hoy">Hoy</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
          <TabsTrigger value="proximas">Próximas</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>Pendientes ({data?.pagination?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
          {(data?.data ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{t.titulo}</p>
                <p className="text-muted-foreground text-xs">
                  {t.contacto_nombre ? (
                    <>Contacto {t.contacto_nombre} · </>
                  ) : null}
                  Vence: {t.vence_at ? formatoFecha(t.vence_at) : "sin fecha"}
                </p>
              </div>
              <div className="flex gap-2">
                {t.contacto_id ? (
                  <Link to={`/contactos/${t.contacto_id}`} className="text-sm underline">
                    Ver contacto
                  </Link>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => completar.mutate(t.id)}>
                  Completar
                </Button>
              </div>
            </div>
          ))}
          {(data?.data ?? []).length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-sm">Sin tareas pendientes.</p>
          ) : null}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPagina(pagina + 1)}>
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
