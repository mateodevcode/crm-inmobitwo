// Resumen y detalle por fila de una vista previa o importación.
import { Badge } from "@/components/ui/badge.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";

const ETIQUETAS = {
  creado: { texto: "Nuevo", variant: "secondary" },
  actualizado: { texto: "Actualiza", variant: "outline" },
  omitido: { texto: "Omitido", variant: "outline" },
  error: { texto: "Error", variant: "destructive" },
};
const PASADO = { creado: "Creado", actualizado: "Actualizado" };

export function ResumenImportacion({ resumen, simulado }) {
  const items = [
    { clave: "creados", texto: simulado ? "se crearán" : "creados" },
    { clave: "actualizados", texto: simulado ? "se actualizarán" : "actualizados" },
    { clave: "omitidos", texto: "omitidos" },
    { clave: "errores", texto: "con errores" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Resumen">
      {items.map((i) => (
        <li key={i.clave}>
          <span className={`text-lg font-semibold tabular-nums ${i.clave === "errores" && resumen.errores ? "text-destructive" : ""}`}>
            {resumen[i.clave]}
          </span>{" "}
          <span className="text-muted-foreground">{i.texto}</span>
        </li>
      ))}
    </ul>
  );
}

// Muestra primero errores y omitidos; los creados solo si no hay problemas que revisar.
export function TablaResultados({ filas, simulado }) {
  const problemas = filas.filter((f) => f.resultado === "error" || f.resultado === "omitido");
  const visibles = (problemas.length ? problemas : filas).slice(0, 100);
  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground text-xs">
        {problemas.length
          ? `Filas para revisar (${problemas.length}${problemas.length > 100 ? ", se muestran 100" : ""}). Las demás están bien.`
          : `Todas las filas están bien${filas.length > 100 ? " (se muestran 100)" : ""}.`}
      </p>
      <div className="max-h-96 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Fila</TableHead>
              <TableHead className="w-28">Resultado</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((f) => {
              const e = ETIQUETAS[f.resultado] ?? ETIQUETAS.error;
              return (
                <TableRow key={f.fila}>
                  <TableCell className="tabular-nums">{f.fila}</TableCell>
                  <TableCell>
                    <Badge variant={e.variant}>{!simulado && PASADO[f.resultado] ? PASADO[f.resultado] : e.texto}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm">{f.mensaje ?? ""}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
