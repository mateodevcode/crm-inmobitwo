import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
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
  descargarCsv,
  obtenerActividad,
  obtenerConversion,
  obtenerEmbudo,
  obtenerLeadsOrigen,
  obtenerValorGanado,
} from "@/features/reportes/api.js";

export default function ReportesPage() {
  const { espacio, esAgente } = useContext(WorkspaceContext);
  const [filtros, setFiltros] = useState({ desde: "", hasta: "", asignado: "" });
  const [aplicados, setAplicados] = useState({ desde: "", hasta: "", asignado: "" });

  const embudoQ = useQuery({ queryKey: ["rep-embudo", espacio, aplicados], queryFn: () => obtenerEmbudo(aplicados) });
  const convQ = useQuery({ queryKey: ["rep-conv", espacio, aplicados], queryFn: () => obtenerConversion(aplicados) });
  const valorQ = useQuery({ queryKey: ["rep-valor", espacio, aplicados], queryFn: () => obtenerValorGanado(aplicados) });
  const actQ = useQuery({ queryKey: ["rep-act", espacio, aplicados], queryFn: () => obtenerActividad(aplicados) });
  const origenQ = useQuery({ queryKey: ["rep-origen", espacio, aplicados], queryFn: () => obtenerLeadsOrigen(aplicados) });

  const set = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));
  const conv = convQ.data ?? {};

  return (
    <>
      <PageHeader
        titulo="Reportes"
        descripcion="Embudo, conversión, valor ganado y actividad."
        acciones={
          <Button
            variant="outline"
            onClick={() => {
              descargarCsv("embudo.csv", embudoQ.data ?? [], ["nombre", "tipo", "total", "valor"]);
              descargarCsv("actividad.csv", actQ.data ?? [], ["name", "email", "rol_en_org", "contactos", "oportunidades_abiertas", "tareas_vencidas", "actividades"]);
            }}
          >
            Exportar CSV
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
        <Input type="date" value={filtros.desde} onChange={(e) => set("desde", e.target.value)} className="w-40" />
        <Input type="date" value={filtros.hasta} onChange={(e) => set("hasta", e.target.value)} className="w-40" />
        {!esAgente ? (
          <Input
            placeholder="ID agente"
            inputMode="numeric"
            value={filtros.asignado}
            onChange={(e) => set("asignado", e.target.value)}
            className="w-32"
          />
        ) : null}
        <Button type="submit" variant="outline">Aplicar</Button>
      </form>

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
    </>
  );
}
