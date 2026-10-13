import { Button } from "@/components/ui/button.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";

// Tabla servidor: columnas [{ key, titulo, render?(fila) }], paginación controlada.
export function DataTable({ columnas, filas, pagina, limite, total, onPagina, cargando }) {
  const totalPaginas = Math.max(1, Math.ceil((total ?? 0) / (limite || 20)));
  return (
    <div className="grid gap-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columnas.map((c) => (
                <TableHead key={c.key}>{c.titulo}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={columnas.length}>Cargando…</TableCell>
              </TableRow>
            ) : filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas.length}>Sin resultados.</TableCell>
              </TableRow>
            ) : (
              filas.map((f) => (
                <TableRow key={f.id}>
                  {columnas.map((c) => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(f) : (f[c.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Página {pagina} de {totalPaginas} · {total ?? 0} registros
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagina <= 1 || cargando}
            onClick={() => onPagina(pagina - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina >= totalPaginas || cargando}
            onClick={() => onPagina(pagina + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
