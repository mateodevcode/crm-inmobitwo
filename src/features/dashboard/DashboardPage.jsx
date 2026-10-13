import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { formatoFecha } from "@/utils/fechas.js";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard.js";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <>
        <PageHeader titulo="Panel" />
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <PageHeader titulo="Panel" />
        <EmptyState
          titulo="No se pudo cargar el panel"
          descripcion="Intente de nuevo."
          accion={
            <button type="button" className="text-sm underline" onClick={() => refetch()}>
              Reintentar
            </button>
          }
        />
      </>
    );
  }

  const kpis = data.kpis ?? {};
  const tarjetas = [
    { titulo: "Leads 7 días", valor: kpis.leads_nuevos_7 ?? "—" },
    { titulo: "Leads 30 días", valor: kpis.leads_nuevos_30 ?? "—" },
    { titulo: "Anuncios publicados", valor: `${kpis.anuncios_publicados ?? "—"} / ${kpis.anuncios_totales ?? "—"}` },
    { titulo: "Vistas · Favoritos · Sin leer", valor: `${kpis.vistas_totales ?? "—"} · ${kpis.favoritos_totales ?? "—"} · ${kpis.mensajes_sin_leer ?? "—"}` },
  ];

  return (
    <>
      <PageHeader titulo="Panel" descripcion="Resumen de su actividad como anunciante." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((t) => (
          <Card key={t.titulo}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{t.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Leads por día (30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ total: { label: "Leads", color: "var(--chart-1)" } }}
            >
              <AreaChart data={data.seriesLeads ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="fecha" tickLine={false} tickMargin={8} minTickGap={24} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="total" fill="var(--chart-1)" stroke="var(--chart-1)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por estado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {(data.leadsPorEstado ?? []).map((e) => (
              <div key={e.estado} className="flex items-center justify-between">
                <EstadoBadge estado={e.estado} />
                <span className="font-semibold">{e.total}</span>
              </div>
            ))}
            {(data.leadsPorEstado ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin leads aún.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.ultimosLeads ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.nombre || l.email || l.telefono || `Lead ${l.id}`}</TableCell>
                  <TableCell>{l.propiedad_titulo}</TableCell>
                  <TableCell>
                    <EstadoBadge estado={l.estado} />
                  </TableCell>
                  <TableCell>{formatoFecha(l.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(data.ultimosLeads ?? []).length === 0 ? (
            <p className="text-muted-foreground pt-2 text-sm">Sin leads aún.</p>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
