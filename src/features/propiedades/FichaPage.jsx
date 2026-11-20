// /propiedades/:id/ficha — ficha del inmueble para imprimir o guardar en PDF
// (Imprimir → "Guardar como PDF"). Fuera del layout del CRM para que la hoja
// salga limpia. Lleva los datos de contacto del agente o la inmobiliaria.
import { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PrinterIcon } from "lucide-react";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { obtenerDetalle } from "@/features/propiedades/api.js";
import { OPERACION } from "@/features/propiedades/cartera.js";
import { urlPortalInmueble } from "@/features/demandas/criterios.js";
import { sanitizarHtml } from "@/lib/sanitizarHtml.js";
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";
import { mostrarTelefono } from "@/utils/telefono.js";

// Una URL por foto (prefiere tamaño large para la principal, medium para el resto).
function fotos(p) {
  const porOrden = new Map();
  for (const g of p.galeria ?? []) {
    const actual = porOrden.get(g.orden);
    const rango = { large: 3, medium: 2, xlarge: 1, small: 0, thumbnail: -1 };
    if (!actual || (rango[g.tamaño] ?? 0) > (rango[actual.tamaño] ?? 0)) porOrden.set(g.orden, g);
  }
  const lista = [...porOrden.values()].sort((a, b) => Number(b.es_portada) - Number(a.es_portada) || a.orden - b.orden);
  return lista.map((g) => g.url);
}

const Dato = ({ etiqueta, valor }) =>
  valor == null || valor === "" ? null : (
    <div className="rounded-md border px-3 py-2 print:break-inside-avoid">
      <dt className="text-muted-foreground text-xs">{etiqueta}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  );

export default function FichaPage() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);
  const { organizacion } = useContext(WorkspaceContext);
  const q = useQuery({ queryKey: ["ficha-inmueble", id], queryFn: () => obtenerDetalle(id) });
  const p = q.data;

  if (q.isLoading) return <p className="p-8 text-sm">Cargando ficha…</p>;
  if (q.isError || !p) {
    return (
      <div className="grid gap-3 p-8">
        <p role="alert" className="text-destructive">{q.error?.message ?? "Inmueble no encontrado."}</p>
        <Link to="/propiedades" className="underline">Volver a Propiedades</Link>
      </div>
    );
  }

  const imgs = fotos(p);
  const ofertas = (p.ofertas ?? []).filter((o) => o.listing_status === "active" && o.precio);
  const caracteristicas = Object.values(p.caracteristicas ?? {}).flat().map((c) => c.label_es);
  const ubicacion = [p.barrio ?? p.barrio_nombre, p.ciudad, p.departamento].filter(Boolean).join(", ");

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to="/propiedades"><ArrowLeftIcon /> Propiedades</Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <PrinterIcon /> Imprimir o guardar PDF
        </Button>
      </div>

      <article className="mx-auto grid max-w-4xl gap-5 px-4 pb-10 print:max-w-none print:px-0 print:pb-0">
        <header className="grid gap-1">
          <p className="text-muted-foreground text-sm">
            {[p.tipo_inmueble, ofertas.map((o) => OPERACION[o.operation] ?? o.operation).join(" y ")].filter(Boolean).join(" en ")}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{p.titulo}</h1>
          {ubicacion ? <p className="text-muted-foreground">{ubicacion}</p> : null}
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
            {ofertas.map((o) => (
              <p key={o.operation} className="text-xl font-semibold">
                {formatPrecioCompleto(Number(o.precio))}
                <span className="text-muted-foreground text-sm font-normal"> · {OPERACION[o.operation] ?? o.operation}</span>
              </p>
            ))}
          </div>
        </header>

        {imgs.length ? (
          <div className="grid gap-2 sm:grid-cols-3 print:grid-cols-3">
            <img src={imgs[0]} alt="" className="aspect-[4/3] w-full rounded-lg object-cover sm:col-span-2 sm:row-span-2 print:col-span-2 print:row-span-2" />
            {imgs.slice(1, 5).map((u) => (
              <img key={u} src={u} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
            ))}
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 print:grid-cols-4">
          <Dato etiqueta="Área construida" valor={p.constructed_area ? `${p.constructed_area} m²` : null} />
          <Dato etiqueta="Área privada" valor={p.private_area ? `${p.private_area} m²` : null} />
          <Dato etiqueta="Habitaciones" valor={p.bedroom_count} />
          <Dato etiqueta="Baños" valor={p.bathroom_count} />
          <Dato etiqueta="Parqueaderos" valor={p.parking_space_count} />
          <Dato etiqueta="Estrato" valor={p.estrato} />
          <Dato etiqueta="Administración" valor={p.administracion ? formatPrecioCompleto(Number(p.administracion)) : null} />
          <Dato etiqueta="Antigüedad" valor={p.antiguedad_anios != null ? `${p.antiguedad_anios} años` : null} />
        </dl>

        {p.description ? (
          <section className="grid gap-1">
            <h2 className="font-semibold">Descripción</h2>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizarHtml(p.description) }} />
          </section>
        ) : null}

        {caracteristicas.length ? (
          <section className="grid gap-1">
            <h2 className="font-semibold">Características</h2>
            <ul className="grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3 print:grid-cols-3">
              {caracteristicas.map((c) => <li key={c}>• {c}</li>)}
            </ul>
          </section>
        ) : null}

        <footer className="grid gap-1 border-t pt-4 text-sm print:break-inside-avoid">
          <p className="font-semibold">{organizacion?.nombre ?? usuario?.name}</p>
          {organizacion ? <p>Asesor: {usuario?.name}</p> : null}
          <p className="text-muted-foreground">
            {[usuario?.telefono ? mostrarTelefono(usuario.telefono) : null, usuario?.email].filter(Boolean).join(" · ")}
          </p>
          {p.estado === "publicado" ? (
            <p className="text-muted-foreground break-all">Más fotos y detalles: {urlPortalInmueble(p.id)}</p>
          ) : null}
        </footer>
      </article>
    </div>
  );
}
