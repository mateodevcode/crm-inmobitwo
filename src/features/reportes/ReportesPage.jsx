import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import {
  obtenerActividad,
  obtenerConversion,
  obtenerEmbudo,
  obtenerLeadsOrigen,
  obtenerReporteAgentes,
  obtenerReporteInmuebles,
  obtenerReporteRespuesta,
  obtenerValorGanado,
} from "@/features/reportes/api.js";
import { obtenerMiembros } from "@/features/equipo/api.js";
import { TablaAgentes, TablaInmuebles, TiemposRespuesta } from "@/features/reportes/components/BloquesReportes.jsx";
import { aCsv, descargarArchivo, hoyBogota } from "@/utils/csv.js";

// Rangos rápidos en días de Bogotá.
function rangoRapido(clave) {
  const hoy = hoyBogota();
  const [a, m] = hoy.split("-").map(Number);
  const dia = (d) => d.toISOString().slice(0, 10);
  if (clave === "mes") return { desde: `${hoy.slice(0, 7)}-01`, hasta: hoy };
  if (clave === "mes_pasado") {
    return { desde: dia(new Date(Date.UTC(a, m - 2, 1))), hasta: dia(new Date(Date.UTC(a, m - 1, 0))) };
  }
  if (clave === "30d") return { desde: dia(new Date(Date.parse(`${hoy}T12:00:00Z`) - 29 * 86400000)), hasta: hoy };
  if (clave === "anio") return { desde: `${a}-01-01`, hasta: hoy };
  return { desde: "", hasta: "" };
}
const RANGOS = [
  { clave: "mes", etiqueta: "Este mes" },
  { clave: "mes_pasado", etiqueta: "Mes pasado" },
  { clave: "30d", etiqueta: "Últimos 30 días" },
  { clave: "anio", etiqueta: "Este año" },
  { clave: "todo", etiqueta: "Todo" },
];

export default function ReportesPage() {
  const { espacio, esAgente, esPersonal, organizacion } = useContext(WorkspaceContext);
  const [filtros, setFiltros] = useState(() => ({ ...rangoRapido("mes"), asignado: "" }));
  const [aplicados, setAplicados] = useState(filtros);

  const embudoQ = useQuery({ queryKey: ["rep-embudo", espacio, aplicados], queryFn: () => obtenerEmbudo(aplicados) });
  const convQ = useQuery({ queryKey: ["rep-conv", espacio, aplicados], queryFn: () => obtenerConversion(aplicados) });
  const valorQ = useQuery({ queryKey: ["rep-valor", espacio, aplicados], queryFn: () => obtenerValorGanado(aplicados) });
  const actQ = useQuery({ queryKey: ["rep-act", espacio, aplicados], queryFn: () => obtenerActividad(aplicados) });
  const origenQ = useQuery({ queryKey: ["rep-origen", espacio, aplicados], queryFn: () => obtenerLeadsOrigen(aplicados) });
  const rango = { desde: aplicados.desde, hasta: aplicados.hasta };
  const respuestaQ = useQuery({ queryKey: ["rep-respuesta", espacio, rango], queryFn: () => obtenerReporteRespuesta(rango) });
  const inmueblesQ = useQuery({ queryKey: ["rep-inmuebles", espacio, rango], queryFn: () => obtenerReporteInmuebles(rango) });
  const agentesQ = useQuery({
    queryKey: ["rep-agentes", espacio, rango],
    queryFn: () => obtenerReporteAgentes(rango),
    enabled: !esPersonal,
  });
  const miembrosQ = useQuery({
    queryKey: ["crm-miembros", espacio],
    queryFn: () => obtenerMiembros(organizacion.id),
    enabled: !esPersonal && !esAgente && !!organizacion,
    select: (ms) => ms.filter((m) => m.estado === "activo"),
  });
  const aplicarRango = (clave) => {
    const nuevo = { ...filtros, ...rangoRapido(clave) };
    setFiltros(nuevo);
    setAplicados(nuevo);
  };

  const set = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));
  const conv = convQ.data ?? {};

  return (
    <>
      <PageHeader
        titulo="Reportes"
        descripcion="Embudo, conversión, tiempos de respuesta, inmuebles y equipo."
        acciones={
          <Button
            variant="outline"
            onClick={() =>
              descargarArchivo(
                `embudo-${hoyBogota()}.csv`,
                aCsv(embudoQ.data ?? [], [
                  { clave: "nombre", titulo: "Etapa" },
                  { clave: "tipo", titulo: "Tipo" },
                  { clave: "total", titulo: "Oportunidades" },
                  { clave: "valor", titulo: "Valor" },
                ]),
              )
            }
          >
            Exportar embudo (CSV)
          </Button>
        }
      />
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setAplicados(filtros);
        }}
      >
        <div className="flex flex-wrap gap-1" role="group" aria-label="Rangos rápidos">
          {RANGOS.map((r) => (
            <Button key={r.clave} type="button" size="sm" variant="ghost" onClick={() => aplicarRango(r.clave)}>
              {r.etiqueta}
            </Button>
          ))}
        </div>
        <Input type="date" aria-label="Desde" value={filtros.desde} onChange={(e) => set("desde", e.target.value)} className="w-40" />
        <Input type="date" aria-label="Hasta" value={filtros.hasta} min={filtros.desde || undefined} onChange={(e) => set("hasta", e.target.value)} className="w-40" />
        {!esPersonal && !esAgente ? (
          <Select value={filtros.asignado || "todos"} onValueChange={(v) => set("asignado", v === "todos" ? "" : v)}>
            <SelectTrigger className="w-48" aria-label="Agente">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo el equipo</SelectItem>
              {(miembrosQ.data ?? []).map((m) => (
                <SelectItem key={m.usuario_id} value={String(m.usuario_id)}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Button type="submit" variant="outline">Aplicar</Button>
      </form>
      {[embudoQ, convQ, respuestaQ].find((x) => x.isError) ? (
        <p role="alert" className="text-destructive text-sm">
          {[embudoQ, convQ, respuestaQ].find((x) => x.isError).error.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Ganadas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{conv.ganadas ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tasa de conversión</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{conv.tasa != null ? `${conv.tasa}%` : "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Valor ganado</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold"><MoneyText valor={conv.valor_ganado} /></p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Embudo por etapa</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ total: { label: "Total", color: "var(--chart-1)" } }}>
              <BarChart data={embudoQ.data ?? []} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Valor ganado por mes</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ valor: { label: "COP", color: "var(--chart-2)" } }}>
              <AreaChart data={valorQ.data ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="periodo" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="valor" fill="var(--chart-2)" stroke="var(--chart-2)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Actividad por agente</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead>Contactos</TableHead>
                  <TableHead>Oport.</TableHead>
                  <TableHead>Vencidas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(actQ.data ?? []).map((a) => (
                  <TableRow key={a.usuario_id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.contactos}</TableCell>
                    <TableCell>{a.oportunidades_abiertas}</TableCell>
                    <TableCell>{a.tareas_vencidas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Leads por origen</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ total: { label: "Leads", color: "var(--chart-1)" } }}>
              <BarChart data={origenQ.data ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="origen" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <TiemposRespuesta datos={respuestaQ.data} cargando={respuestaQ.isLoading} />
      <TablaInmuebles filas={inmueblesQ.data ?? []} cargando={inmueblesQ.isLoading} />
      {!esPersonal ? <TablaAgentes filas={agentesQ.data ?? []} cargando={agentesQ.isLoading} /> : null}
    </>
  );
}
