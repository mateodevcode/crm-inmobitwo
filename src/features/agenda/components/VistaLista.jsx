// Lista de visitas agrupadas por día (vista por defecto en celular).
import { CalendarPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { ESTADOS } from "@/features/agenda/estados.js";
import { claveDia, hoy, textoDiaLargo, textoRangoHora } from "@/utils/agenda.js";
import { cn } from "@/lib/utils.js";

export function VistaLista({ dias, visitas, onElegir, onCrear }) {
  const claveHoy = hoy();
  const porDia = Object.fromEntries(dias.map((d) => [d, []]));
  for (const v of visitas) porDia[claveDia(v.inicio_at)]?.push(v);

  return (
    <div className="grid gap-4">
      {dias.map((d) => (
        <section key={d} aria-labelledby={`dia-${d}`} className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 id={`dia-${d}`} className={cn("text-sm font-semibold first-letter:uppercase", d === claveHoy && "text-primary")}>
              {textoDiaLargo(d)}
              {d === claveHoy ? <span className="text-muted-foreground font-normal"> · hoy</span> : null}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onCrear(d, "10:00")}>
              <CalendarPlusIcon /> Agendar
            </Button>
          </div>
          {porDia[d].length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-sm">Sin visitas.</p>
          ) : (
            porDia[d].map((v) => {
              const est = ESTADOS[v.estado] ?? ESTADOS.programada;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onElegir(v)}
                  className={cn(
                    "grid gap-0.5 rounded-lg border-l-4 px-3 py-2 text-left text-sm shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    est.bloque,
                  )}
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold">{v.contacto_nombre}</span>
                    <span className="text-xs tabular-nums opacity-80">{textoRangoHora(v.inicio_at, v.fin_at)}</span>
                  </span>
                  {v.propiedad_titulo ? <span className="truncate text-xs opacity-80">{v.propiedad_titulo}</span> : null}
                  <span className="text-xs opacity-70">
                    {est.etiqueta}
                    {v.agente_nombre ? ` · ${v.agente_nombre}` : ""}
                  </span>
                </button>
              );
            })
          )}
        </section>
      ))}
    </div>
  );
}
