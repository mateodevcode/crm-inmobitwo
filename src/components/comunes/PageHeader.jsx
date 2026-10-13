export function PageHeader({ titulo, descripcion, acciones }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{titulo}</h2>
        {descripcion ? (
          <p className="text-muted-foreground text-sm">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="flex gap-2">{acciones}</div> : null}
    </div>
  );
}
