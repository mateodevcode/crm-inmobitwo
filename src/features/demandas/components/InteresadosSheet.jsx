// "¿A quién le ofrezco este inmueble?": demandas activas que lo cumplen.
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.jsx";
import { interesadosDePropiedad } from "@/features/demandas/api.js";
import { textoRangoPrecio } from "@/features/demandas/criterios.js";
import { mostrarTelefono } from "@/utils/telefono.js";

export function InteresadosSheet({ propiedad, onCerrar }) {
  return (
    <Sheet open={!!propiedad} onOpenChange={(v) => !v && onCerrar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {propiedad ? <Contenido propiedad={propiedad} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function Contenido({ propiedad }) {
  const q = useQuery({
    queryKey: ["crm-demandas", "interesados", propiedad.id],
    queryFn: () => interesadosDePropiedad(propiedad.id),
  });
  const lista = q.data ?? [];

  return (
    <>
      <SheetHeader>
        <SheetTitle>Clientes interesados</SheetTitle>
        <SheetDescription>
          Demandas activas que encajan con «{propiedad.titulo}».
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-2 px-4 pb-4">
        {q.isLoading ? <p className="text-muted-foreground text-sm">Buscando…</p> : null}
        {q.isError ? <p role="alert" className="text-destructive text-sm">{q.error.message}</p> : null}
        {!q.isLoading && !q.isError && lista.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
            Ninguna demanda activa encaja con este inmueble (o no tiene una oferta activa).
          </p>
        ) : null}
        {lista.map((d) => (
          <Link
            key={d.id}
            to={`/demandas?demanda=${d.id}`}
            className="hover:bg-accent grid gap-0.5 rounded-lg border p-3 text-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{d.contacto_nombre}</span>
              <span className="flex gap-1">
                {d.sobre_presupuesto ? <Badge variant="outline">Sobre presupuesto</Badge> : null}
                {d.seguimiento === "enviada" ? <Badge variant="secondary">Ya enviado</Badge> : null}
                {d.seguimiento === "descartada" ? <Badge variant="outline">Descartado</Badge> : null}
              </span>
            </span>
            <span className="text-muted-foreground text-xs">
              {[
                d.contacto_telefono ? mostrarTelefono(d.contacto_telefono) : null,
                textoRangoPrecio(d.precio_min, d.precio_max),
                d.agente_nombre,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
