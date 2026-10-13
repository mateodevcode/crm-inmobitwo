export function EmptyState({ titulo, descripcion, accion }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
      <p className="font-medium">{titulo}</p>
      {descripcion ? (
        <p className="text-muted-foreground max-w-md text-sm">{descripcion}</p>
      ) : null}
      {accion}
    </div>
  );
}
