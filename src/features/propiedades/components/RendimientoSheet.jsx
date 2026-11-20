// Rendimiento de un inmueble: vistas de los últimos 30 días, interés del
// público (favoritos, descartes, leads) y trabajo comercial (visitas,
// demandas que encajan, envíos a clientes) más el historial de precio.
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.jsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { obtenerRendimiento } from "@/features/propiedades/api.js";
import { formatoFecha } from "@/utils/fechas.js";

const Cifra = ({ titulo, valor, detalle }) => (
  <div className="rounded-lg border p-3">
    <p className="text-muted-foreground text-xs">{titulo}</p>
    <p className="text-xl font-semibold tabular-nums">{valor}</p>
    {detalle ? <p className="text-muted-foreground text-xs">{detalle}</p> : null}
  </div>
);

const suma = (obj) => Object.values(obj ?? {}).reduce((s, n) => s + n, 0);

export function RendimientoSheet({ propiedad, onCerrar }) {
  return (
    <Sheet open={!!propiedad} onOpenChange={(v) => !v && onCerrar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {propiedad ? <Contenido propiedad={propiedad} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function Contenido({ propiedad }) {
  const q = useQuery({
    queryKey: ["crm-propiedades", "rendimiento", propiedad.id],
    queryFn: () => obtenerRendimiento(propiedad.id),
  });
  const r = q.data;
  const vistas30 = (r?.serie_vistas ?? []).reduce((s, d) => s + d.vistas, 0);
  const serie = (r?.serie_vistas ?? []).map((d) => ({ ...d, dia: d.fecha.slice(8, 10) + "/" + d.fecha.slice(5, 7) }));

  return (
    <>
      <SheetHeader>
        <SheetTitle>Rendimiento</SheetTitle>
        <SheetDescription className="line-clamp-2">{propiedad.titulo}</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-4 pb-6">
        {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {q.isError ? <p role="alert" className="text-destructive text-sm">{q.error.message}</p> : null}
        {r ? (
          <>
            <p className="text-muted-foreground text-sm">
              {r.dias_en_cartera} {r.dias_en_cartera === 1 ? "día" : "días"} en cartera ·{" "}
              {r.estado === "publicado" ? "publicado" : "sin publicar"}
            </p>

            <section aria-labelledby="rend-vistas" className="grid gap-2">
              <h3 id="rend-vistas" className="text-sm font-medium">
                Vistas en el portal (30 días): <span className="tabular-nums">{vistas30}</span>
              </h3>
              {vistas30 > 0 ? (
                <ChartContainer config={{ vistas: { label: "Vistas", color: "var(--chart-1)" } }} className="h-40 w-full">
                  <AreaChart data={serie} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="dia" tickLine={false} tickMargin={6} minTickGap={24} />
                    <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="vistas" fill="var(--chart-1)" fillOpacity={0.25} stroke="var(--chart-1)" />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                  Sin vistas en los últimos 30 días{r.estado !== "publicado" ? " (no está publicado)" : ""}.
                </p>
              )}
            </section>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Cifra titulo="Vistas totales" valor={r.totales.vistas} detalle={`${r.totales.visitantes} visitantes`} />
              <Cifra titulo="Favoritos" valor={r.totales.favoritos} />
              <Cifra titulo="Descartado por" valor={r.totales.descartes} detalle="usuarios del portal" />
              <Cifra
                titulo="Leads"
                valor={suma(r.leads)}
                detalle={r.leads.nuevo ? `${r.leads.nuevo} sin atender` : null}
              />
              <Cifra
                titulo="Visitas"
                valor={suma(r.visitas)}
                detalle={r.visitas.realizada ? `${r.visitas.realizada} realizadas` : null}
              />
              <Cifra
                titulo="Clientes interesados"
                valor={r.demandas.interesadas}
                detalle={`${r.demandas.enviada} con envío · ${r.demandas.descartada} lo descartaron`}
              />
            </div>

            {r.historial_precio.length ? (
              <section aria-labelledby="rend-precio" className="grid gap-1.5">
                <h3 id="rend-precio" className="text-sm font-medium">Cambios de precio</h3>
                <ul className="grid gap-1 text-sm">
                  {r.historial_precio.map((h, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-2 rounded-md border px-3 py-1.5">
                      <span>
                        <MoneyText valor={h.old_price} /> → <MoneyText valor={h.new_price} />
                        {h.change_percent != null ? (
                          <span className="text-muted-foreground"> ({Number(h.change_percent) > 0 ? "+" : ""}{Number(h.change_percent).toFixed(1).replace(".", ",")} %)</span>
                        ) : null}
                      </span>
                      <span className="text-muted-foreground text-xs">{formatoFecha(h.detected_at)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {r.demandas.interesadas > 0 ? (
              <p className="text-sm">
                Hay {r.demandas.interesadas} {r.demandas.interesadas === 1 ? "cliente" : "clientes"} con demandas que encajan.{" "}
                <Link to="/demandas" className="underline">Ver demandas</Link>
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}
