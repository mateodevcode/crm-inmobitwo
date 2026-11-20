import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ShieldAlertIcon } from "lucide-react";
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
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard.js";
import { TarjetaVisitas } from "@/features/agenda/components/TarjetaVisitas.jsx";
import { TarjetaCaptaciones } from "@/features/captaciones/components/TarjetaCaptaciones.jsx";
import { TarjetaMisMetas } from "@/features/equipo/components/TarjetaMisMetas.jsx";
import { hoy } from "@/utils/agenda.js";

// "2026-11-20" → "20/11"
const diaMes = (f) => `${f.slice(8, 10)}/${f.slice(5, 7)}`;

function Indicador({ titulo, valor, detalle, a, alerta }) {
  return (
    <Link to={a} className="focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2">
      <Card className="hover:bg-accent/50 h-full transition-colors">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-medium">{titulo}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1">
          <p className={`text-2xl font-semibold tabular-nums ${alerta ? "text-destructive" : ""}`}>{valor}</p>
          {detalle ? <p className="text-muted-foreground text-xs">{detalle}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}

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
          descripcion="Inténtalo de nuevo."
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
  const crm = data.crm ?? {};
  const tareas = crm.tareas ?? {};
  const ops = crm.oportunidades ?? {};
  const contactos = crm.contactos ?? {};
  const num = (v) => (v == null ? "—" : Number(v).toLocaleString("es-CO"));

  const hoyTarjetas = [
    {
      titulo: "Tareas vencidas",
      valor: num(tareas.vencidas),
      detalle: `${num(tareas.hoy)} para hoy · ${num(tareas.pendientes)} pendientes`,
      a: "/tareas",
      alerta: tareas.vencidas > 0,
    },
    { titulo: "Mensajes sin leer", valor: num(kpis.mensajes_sin_leer), detalle: "Chat del portal", a: "/bandeja" },
    { titulo: "Leads nuevos (7 días)", valor: num(kpis.leads_nuevos_7), detalle: `${num(kpis.leads_nuevos_30)} en 30 días`, a: "/leads" },
    { titulo: "Contactos", valor: num(contactos.total), detalle: `${num(contactos.nuevos_30)} nuevos en 30 días`, a: "/contactos" },
  ];
  const negocioTarjetas = [
    {
      titulo: "Oportunidades abiertas",
      valor: num(ops.abiertas),
      detalle: ops.valor_abierto ? `${formatPrecioCompleto(ops.valor_abierto)} en juego` : "Sin valor registrado",
      a: "/pipeline",
    },
    { titulo: "Ganadas este mes", valor: num(ops.ganadas_mes), detalle: "Oportunidades cerradas como ganadas", a: "/reportes" },
    {
      titulo: "Anuncios publicados",
      valor: `${num(kpis.anuncios_publicados)} de ${num(kpis.anuncios_totales)}`,
      detalle: `${num(kpis.vistas_totales)} vistas · ${num(kpis.favoritos_totales)} favoritos`,
      a: "/propiedades",
    },
  ];

  return (
    <>
      <PageHeader titulo="Panel" descripcion="Lo que necesita tu atención hoy y cómo va el negocio." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hoyTarjetas.map((t) => (
          <Indicador key={t.titulo} {...t} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {negocioTarjetas.map((t) => (
          <Indicador key={t.titulo} {...t} />
        ))}
      </div>
      {contactos.sin_autorizacion > 0 ? (
        <p className="flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <ShieldAlertIcon className="text-destructive size-4 shrink-0" aria-hidden="true" />
          {contactos.sin_autorizacion === 1
            ? "1 contacto no tiene autorización de tratamiento de datos registrada."
            : `${num(contactos.sin_autorizacion)} contactos no tienen autorización de tratamiento de datos registrada.`}
          <span className="text-muted-foreground">Regístrala en su ficha antes de enviarles ofertas.</span>
        </p>
      ) : null}

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
                <XAxis dataKey="fecha" tickLine={false} tickMargin={8} minTickGap={24} tickFormatter={diaMes} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => diaMes(String(v))} />} />
                <Area dataKey="total" fill="var(--chart-1)" stroke="var(--chart-1)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads por estado</CardTitle>
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

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
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
                    <TableCell>
                      <Link to="/leads" className="hover:underline">{l.nombre || l.email || l.telefono || `Lead ${l.id}`}</Link>
                    </TableCell>
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
        <TarjetaVisitas
          titulo="Visitas de hoy"
          filtros={{ desde: hoy(), hasta: hoy() }}
          vacio="No tienes visitas hoy."
          verAgenda
        />
      </div>

      <TarjetaMisMetas />

      <TarjetaCaptaciones
        titulo="Mandatos por vencer (30 días)"
        filtros={{ vence_en_dias: 30 }}
        vacio="Ningún mandato vence en los próximos 30 días."
        ocultarSiVacia
      />
    </>
  );
}
