import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { PORTAL_URL } from "@/config/config.js";
import {
  buscarAnuncios,
  guardarPortada,
  obtenerDetalleAnuncio,
  obtenerPortada,
} from "@/features/portada/api.js";

const LIMITE = 12;
const ORDEN_TAMANO = { xlarge: 0, large: 1, medium: 2, small: 3, thumbnail: 4 };

// Una foto = varias filas (una por tamaño, mismo orden). Nos quedamos con la mejor.
function fotosUnicas(galeria) {
  const porOrden = new Map();
  for (const f of galeria ?? []) {
    const actual = porOrden.get(f.orden);
    if (!actual || (ORDEN_TAMANO[f.tamaño] ?? 9) < (ORDEN_TAMANO[actual.tamaño] ?? 9)) {
      porOrden.set(f.orden, f);
    }
  }
  return [...porOrden.entries()].sort((a, b) => a[0] - b[0]).map(([, f]) => f);
}

export default function PortadaPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [aplicada, setAplicada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [anuncioId, setAnuncioId] = useState(null);
  const [imagen, setImagen] = useState(null);

  const actualQ = useQuery({ queryKey: ["portada-actual"], queryFn: obtenerPortada });

  const busquedaQ = useQuery({
    queryKey: ["portada-buscar", aplicada, pagina],
    queryFn: () => buscarAnuncios({ q: aplicada, pagina, limite: LIMITE }),
  });

  const detalleQ = useQuery({
    queryKey: ["portada-detalle", anuncioId],
    queryFn: () => obtenerDetalleAnuncio(anuncioId),
    enabled: anuncioId != null,
  });

  const guardar = useMutation({
    mutationFn: () => guardarPortada({ propiedad_id: anuncioId, imagen_url: imagen }),
    onSuccess: () => {
      toast.success("Portada actualizada.");
      queryClient.invalidateQueries({ queryKey: ["portada-actual"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const resultados = busquedaQ.data?.data ?? [];
  const total = busquedaQ.data?.pagination?.total ?? 0;
  const fotos = fotosUnicas(detalleQ.data?.galeria);
  const actual = actualQ.data;

  const elegir = (a) => {
    setAnuncioId(a.id);
    setImagen(null);
  };

  return (
    <>
      <PageHeader
        titulo="Portada"
        descripcion="Anuncio destacado del hero de la página principal. Solo visible para superadmin."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actual en el portal</CardTitle>
        </CardHeader>
        <CardContent>
          {actualQ.isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : actual ? (
            <div className="flex flex-wrap items-center gap-4">
              {actual.imagen ? (
                <img src={actual.imagen} alt="" className="h-24 w-40 rounded object-cover" />
              ) : null}
              <div>
                <p className="font-medium">{actual.etiqueta}</p>
                <a
                  href={`${PORTAL_URL}${actual.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  Ver en el portal
                </a>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Sin selección: el portal muestra su imagen por defecto.
            </p>
          )}
        </CardContent>
      </Card>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setAplicada(q.trim());
        }}
      >
        <Input
          placeholder="Buscar por título, ciudad o id…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit">Buscar</Button>
      </form>

      {busquedaQ.isLoading ? (
        <p className="text-muted-foreground text-sm">Buscando…</p>
      ) : resultados.length === 0 ? (
        <EmptyState titulo="Sin resultados" descripcion="Ajuste la búsqueda." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((a) => (
              <Card
                key={a.id}
                className={anuncioId === a.id ? "ring-2 ring-primary" : undefined}
              >
                <CardContent className="grid gap-2 p-4">
                  {a.portada ? (
                    <img src={a.portada} alt="" className="h-40 w-full rounded object-cover" />
                  ) : null}
                  <p className="font-medium">{a.titulo ?? `Anuncio ${a.id}`}</p>
                  <p className="text-muted-foreground text-xs">ID {a.id}</p>
                  <p className="text-muted-foreground text-sm">
                    {a.ciudad ?? "—"} · <MoneyText valor={a.precio} /> · {a.estado}
                  </p>
                  <Button
                    size="sm"
                    variant={anuncioId === a.id ? "default" : "outline"}
                    onClick={() => elegir(a)}
                  >
                    {anuncioId === a.id ? "Seleccionado" : "Elegir"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-muted-foreground text-sm">
              Página {pagina} · {total} anuncios
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={pagina * LIMITE >= total}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}

      {anuncioId != null ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Imagen del anuncio {anuncioId}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {detalleQ.isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando galería…</p>
            ) : fotos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Este anuncio no tiene fotos.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {fotos.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setImagen(f.url)}
                      className={`overflow-hidden rounded border-2 ${imagen === f.url ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={f.url} alt="" className="h-32 w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div>
                  <Button disabled={!imagen || guardar.isPending} onClick={() => guardar.mutate()}>
                    {guardar.isPending ? "Guardando…" : "Publicar en portada"}
                  </Button>
                  {!imagen ? (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Elija una imagen para activar el botón.
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
