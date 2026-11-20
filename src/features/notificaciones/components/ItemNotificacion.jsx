// Un aviso: icono, título, detalle y hace cuánto. Al abrirlo se marca leído.
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils.js";
import { IconoTipo } from "@/features/notificaciones/tipos.js";
import { tiempoRelativo } from "@/utils/fechas.js";

export function ItemNotificacion({ n, onLeer, onAbrir }) {
  const navigate = useNavigate();
  const noLeida = !n.leida_at;
  const abrir = () => {
    if (noLeida) onLeer(n.id);
    onAbrir?.();
    if (n.url) navigate(n.url);
  };
  return (
    <button
      type="button"
      onClick={abrir}
      className={cn(
        "hover:bg-accent focus-visible:ring-ring flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left outline-none focus-visible:ring-2",
        noLeida && "bg-primary/5",
      )}
    >
      <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
        <IconoTipo tipo={n.tipo} className="size-4" aria-hidden="true" />
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className={cn("text-sm leading-snug", noLeida ? "font-medium" : "text-muted-foreground")}>{n.titulo}</span>
        {n.cuerpo ? <span className="text-muted-foreground line-clamp-2 text-xs">{n.cuerpo}</span> : null}
        <span className="text-muted-foreground text-xs">
          {tiempoRelativo(n.created_at)}
          {n.actor_nombre ? ` · ${n.actor_nombre}` : ""}
        </span>
      </span>
      {noLeida ? <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" aria-label="Sin leer" /> : null}
    </button>
  );
}
