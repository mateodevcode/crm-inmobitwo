// Mientras llega el código de una página (rutas cargadas bajo demanda).
export function CargandoPagina() {
  return (
    <div role="status" aria-live="polite" className="text-muted-foreground flex min-h-40 items-center justify-center p-8 text-sm">
      Cargando…
    </div>
  );
}
