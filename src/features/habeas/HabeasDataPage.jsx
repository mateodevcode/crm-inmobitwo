// Registro de auditoría de datos personales (Ley 1581): quién exportó,
// rectificó o suprimió datos y los cambios de autorización.
import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { obtenerRegistro } from "@/features/habeas/api.js";
import { ACCIONES, textoDetalle } from "@/features/habeas/textos.js";
import { aCsv, descargarArchivo, hoyBogota } from "@/utils/csv.js";
import { formatoFechaHora } from "@/utils/fechas.js";

const LIMITE = 50;
const VARIANTE = { supresion: "destructive", autorizacion_retirada: "outline", exportacion: "secondary" };

export default function HabeasDataPage() {
  const { espacio, puedeAdministrar } = useContext(WorkspaceContext);
  const [params, setParams] = useSearchParams();
  const contactoId = params.get("contacto") || undefined;
  const [pagina, setPagina] = useState(1);
  const q = useQuery({
    queryKey: ["crm-habeas-registro", espacio, contactoId, pagina],
    queryFn: () => obtenerRegistro({ pagina, limite: LIMITE, contactoId }),
    enabled: puedeAdministrar,
    placeholderData: keepPreviousData,
  });
  const filas = q.data?.data ?? [];
  const total = q.data?.pagination?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / LIMITE));

  const exportar = () =>
    descargarArchivo(
      `registro-datos-personales-${hoyBogota()}.csv`,
      aCsv(filas, [
        { clave: "created_at", titulo: "Fecha", valor: (f) => formatoFechaHora(f.created_at) },
        { clave: "accion", titulo: "Acción", valor: (f) => ACCIONES[f.accion] ?? f.accion },
        { clave: "contacto_id", titulo: "ID contacto" },
        { clave: "actor_nombre", titulo: "Hecho por" },
        { clave: "detalle", titulo: "Detalle", valor: (f) => textoDetalle(f.accion, f.detalle) },
      ]),
    );

  if (!puedeAdministrar) {
    return (
      <>
        <PageHeader titulo="Datos personales" />
        <p className="text-muted-foreground text-sm">Solo un administrador de la inmobiliaria puede ver este registro.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Datos personales"
        descripcion="Constancia de consultas, rectificaciones, supresiones y autorizaciones (Ley 1581 de 2012). No guarda datos personales."
        acciones={
          <Button variant="outline" onClick={exportar} disabled={!filas.length}>
            Exportar página (CSV)
          </Button>
        }
      />
      {contactoId ? (
        <div className="flex items-center gap-2 text-sm">
          <span>Solo el contacto #{contactoId}.</span>
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => {
              setPagina(1);
              setParams({});
            }}
          >
            Ver todo
          </Button>
        </div>
      ) : null}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Fecha</TableHead>
                <TableHead className="w-48">Acción</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Hecho por</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.isLoading ? (
                <TableRow><TableCell colSpan={5}>Cargando…</TableCell></TableRow>
              ) : q.isError ? (
                <TableRow><TableCell colSpan={5} className="text-destructive">{q.error.message}</TableCell></TableRow>
              ) : filas.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-muted-foreground">Aún no hay registros.</TableCell></TableRow>
              ) : (
                filas.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">{formatoFechaHora(f.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={VARIANTE[f.accion] ?? "outline"}>{ACCIONES[f.accion] ?? f.accion}</Badge>
                    </TableCell>
                    <TableCell>
                      {f.contacto_nombre ? (
                        <Link to={`/contactos/${f.contacto_id}`} className="hover:underline">{f.contacto_nombre}</Link>
                      ) : (
                        <span className="text-muted-foreground">#{f.contacto_id} (suprimido)</span>
                      )}
                    </TableCell>
                    <TableCell>{f.actor_nombre ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground min-w-56 whitespace-normal">{textoDetalle(f.accion, f.detalle)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {paginas > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>Anterior</Button>
          <span className="tabular-nums">{pagina} / {paginas}</span>
          <Button variant="outline" size="sm" disabled={pagina >= paginas} onClick={() => setPagina((p) => p + 1)}>Siguiente</Button>
        </div>
      ) : null}
    </>
  );
}
