// Reportes nuevos: tiempos de respuesta, inmuebles y agentes.
import { Link } from "react-router-dom";
import { DownloadIcon } from "lucide-react";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { aCsv, descargarArchivo, hoyBogota } from "@/utils/csv.js";
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";

// "45 min", "3 h 10 min", "2 d 4 h"
function textoMinutos(min) {
  if (min == null) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h${min % 60 ? ` ${min % 60} min` : ""}`;
  const d = Math.floor(h / 24);
  return `${d} d${h % 24 ? ` ${h % 24} h` : ""}`;
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);

function Bloque({ titulo, r, vacio, nota }) {
  return (
    <div className="grid gap-2 rounded-lg border p-4">
      <p className="font-medium">{titulo}</p>
      {!r || r.total === 0 ? (
        <p className="text-muted-foreground text-sm">{vacio}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Mediana</dt>
            <dd className="text-xl font-semibold">{textoMinutos(r.mediana_min)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Atendidos en menos de 1 h</dt>
            <dd className="text-xl font-semibold">{pct(r.en_1h, r.total)} %</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Promedio</dt>
            <dd>{textoMinutos(r.promedio_min)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Sin atender</dt>
            <dd>{r.total - r.respondidas} de {r.total}</dd>
          </div>
        </dl>
      )}
      {nota ? <p className="text-muted-foreground text-xs">{nota}</p> : null}
    </div>
  );
}

export function TiemposRespuesta({ datos, cargando }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiempo de respuesta</CardTitle>
        <CardDescription>Qué tan rápido se atiende a quien escribe. La mediana es el tiempo típico; el promedio lo suben los casos muy tardíos.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {cargando ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {datos ? (
          <>
            <Bloque titulo="Chat del portal" r={datos.chat} vacio="Sin conversaciones en el periodo." nota="Del primer mensaje del interesado a la primera respuesta." />
            <Bloque titulo="Leads" r={datos.leads} vacio="Sin leads en el periodo." nota="De la llegada del lead a convertirlo en contacto." />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function TablaInmuebles({ filas, cargando }) {
  const exportar = () =>
    descargarArchivo(
      `inmuebles-${hoyBogota()}.csv`,
      aCsv(filas, [
        { clave: "id", titulo: "ID" },
        { clave: "titulo", titulo: "Inmueble" },
        { clave: "ciudad", titulo: "Ciudad" },
        { clave: "vistas", titulo: "Vistas" },
        { clave: "favoritos", titulo: "Favoritos" },
        { clave: "leads", titulo: "Leads" },
        { clave: "tasa_lead", titulo: "Leads por cada 100 vistas", valor: (f) => (f.tasa_lead != null ? String(f.tasa_lead).replace(".", ",") : "") },
        { clave: "visitas", titulo: "Visitas realizadas" },
        { clave: "enviados", titulo: "Enviado a clientes" },
      ]),
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inmuebles</CardTitle>
        <CardDescription>Los 50 con más vistas en el periodo y lo que generaron.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={exportar} disabled={!filas.length}>
            <DownloadIcon /> CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inmueble</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead className="text-right">Fav.</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right" title="Leads por cada 100 vistas">Leads/100</TableHead>
              <TableHead className="text-right">Visitas</TableHead>
              <TableHead className="text-right">Enviado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow><TableCell colSpan={7}>Cargando…</TableCell></TableRow>
            ) : filas.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-muted-foreground">Sin inmuebles.</TableCell></TableRow>
            ) : (
              filas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="max-w-72">
                    <Link to="/propiedades" className="line-clamp-1 hover:underline">{f.titulo}</Link>
                    <span className="text-muted-foreground text-xs">{f.ciudad}{f.estado !== "publicado" ? " · No publicado" : ""}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{f.vistas}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.favoritos}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.leads}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.tasa_lead != null ? String(f.tasa_lead).replace(".", ",") : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.visitas}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.enviados}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function TablaAgentes({ filas, cargando }) {
  const exportar = () =>
    descargarArchivo(
      `agentes-${hoyBogota()}.csv`,
      aCsv(filas, [
        { clave: "nombre", titulo: "Agente" },
        { clave: "rol_en_org", titulo: "Rol", valor: (f) => (f.rol_en_org === "agency_admin" ? "Administrador" : "Agente") },
        { clave: "contactos_nuevos", titulo: "Contactos nuevos" },
        { clave: "leads_asignados", titulo: "Leads asignados" },
        { clave: "visitas_realizadas", titulo: "Visitas realizadas" },
        { clave: "captaciones", titulo: "Captaciones" },
        { clave: "ganadas", titulo: "Negocios ganados" },
        { clave: "perdidas", titulo: "Negocios perdidos" },
        { clave: "tasa_conversion", titulo: "Conversión %" },
        { clave: "valor_ganado", titulo: "Valor ganado", valor: (f) => formatPrecioCompleto(f.valor_ganado) },
      ]),
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por agente</CardTitle>
        <CardDescription>Resultados del periodo, ordenados por valor ganado.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={exportar} disabled={!filas.length}>
            <DownloadIcon /> CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agente</TableHead>
              <TableHead className="text-right">Contactos</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Visitas</TableHead>
              <TableHead className="text-right">Captaciones</TableHead>
              <TableHead className="text-right">Ganados</TableHead>
              <TableHead className="text-right">Conversión</TableHead>
              <TableHead className="text-right">Valor ganado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow><TableCell colSpan={8}>Cargando…</TableCell></TableRow>
            ) : (
              filas.map((f) => (
                <TableRow key={f.usuario_id}>
                  <TableCell>{f.nombre}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.contactos_nuevos}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.leads_asignados}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.visitas_realizadas}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.captaciones}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.ganadas}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.tasa_conversion != null ? `${f.tasa_conversion} %` : "—"}</TableCell>
                  <TableCell className="text-right"><MoneyText valor={f.valor_ganado} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
