export function EnConstruccion({ seccion }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
      <p className="font-medium">{seccion} en construcción</p>
      <p className="text-muted-foreground max-w-md text-sm">
        Esta sección del CRM estará disponible en su fase correspondiente.
      </p>
    </div>
  );
}
