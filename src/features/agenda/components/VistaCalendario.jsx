// Grilla horaria (semana = 7 columnas, día = 1). Clic en un hueco → agendar
// a esa hora (redondeada a 30 min). Las visitas que se cruzan se reparten en
// carriles para no taparse. Línea roja = hora actual.
import { useEffect, useMemo, useRef, useState } from "react";
import { ESTADOS } from "@/features/agenda/estados.js";
import {
  claveDia,
  hoy,
  minutosDelDia,
  textoDiaCorto,
  textoHora,
} from "@/utils/agenda.js";
import { cn } from "@/lib/utils.js";

const ALTO_HORA = 52; // px
const HORA_INI = 6;
const HORA_FIN = 22;

// Reparte visitas de un día en carriles: cada una toma el primer carril libre.
function conCarriles(visitas) {
  const orden = [...visitas].sort((a, b) => new Date(a.inicio_at) - new Date(b.inicio_at));
  const finCarril = [];
  const grupos = []; // grupos de visitas que se solapan entre sí
  let grupo = null;
  let finGrupo = 0;
  for (const v of orden) {
    const ini = new Date(v.inicio_at).getTime();
    const fin = new Date(v.fin_at).getTime();
    if (!grupo || ini >= finGrupo) {
      grupo = [];
      grupos.push(grupo);
      finCarril.length = 0;
      finGrupo = 0;
    }
    let carril = finCarril.findIndex((f) => f <= ini);
    if (carril === -1) carril = finCarril.length;
    finCarril[carril] = fin;
    finGrupo = Math.max(finGrupo, fin);
    grupo.push({ v, carril });
  }
  return grupos.flatMap((g) => {
    const total = Math.max(...g.map((x) => x.carril)) + 1;
    return g.map((x) => ({ ...x, total }));
  });
}

function useAhora() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return ahora;
}

export function VistaCalendario({ dias, visitas, onElegir, onCrear }) {
  const ahora = useAhora();
  const scrollRef = useRef(null);
  const claveHoy = hoy();

  // Ampliar el rango si hay visitas fuera de 6:00–22:00.
  const { horaIni, horaFin } = useMemo(() => {
    let ini = HORA_INI;
    let fin = HORA_FIN;
    for (const v of visitas) {
      ini = Math.min(ini, Math.floor(minutosDelDia(v.inicio_at) / 60));
      const mf = minutosDelDia(v.fin_at);
      fin = Math.max(fin, mf === 0 ? 24 : Math.ceil(mf / 60));
    }
    return { horaIni: ini, horaFin: fin };
  }, [visitas]);
  const horas = Array.from({ length: horaFin - horaIni }, (_, i) => horaIni + i);

  const porDia = useMemo(() => {
    const m = Object.fromEntries(dias.map((d) => [d, []]));
    for (const v of visitas) m[claveDia(v.inicio_at)]?.push(v);
    return Object.fromEntries(Object.entries(m).map(([d, vs]) => [d, conCarriles(vs)]));
  }, [dias, visitas]);

  // Al abrir, desplazar a las 8:00 (o a la hora actual si es más tarde).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const objetivo = Math.max(8, Math.min(minutosDelDia(new Date()) / 60 - 1, horaFin - 8));
    el.scrollTop = (objetivo - horaIni) * ALTO_HORA;
  }, [horaIni, horaFin]);

  const top = (fecha) => ((minutosDelDia(fecha) - horaIni * 60) / 60) * ALTO_HORA;
  const unaColumna = dias.length === 1;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <div className={cn(unaColumna ? "min-w-0" : "min-w-[720px]")}>
        {/* Cabecera de días */}
        <div className="bg-muted/40 grid border-b" style={{ gridTemplateColumns: `3.5rem repeat(${dias.length}, minmax(0, 1fr))` }}>
          <div />
          {dias.map((d) => (
            <div
              key={d}
              className={cn(
                "border-l px-2 py-2 text-center text-xs font-medium capitalize",
                d === claveHoy && "text-primary",
              )}
            >
              {textoDiaCorto(d)}
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="max-h-[calc(100dvh-16rem)] min-h-96 overflow-y-auto">
          <div className="relative grid" style={{ gridTemplateColumns: `3.5rem repeat(${dias.length}, minmax(0, 1fr))` }}>
            {/* Columna de horas */}
            <div>
              {horas.map((h) => (
                <div key={h} className="text-muted-foreground relative pr-2 text-right text-[11px]" style={{ height: ALTO_HORA }}>
                  <span className="relative -top-2">{h === horaIni ? "" : `${h}:00`}</span>
                </div>
              ))}
            </div>

            {dias.map((d) => (
              <div key={d} className={cn("relative border-l", d === claveHoy && "bg-primary/[0.03]")}>
                {/* Huecos de 30 min clicables */}
                {horas.map((h) =>
                  [0, 30].map((m) => (
                    <button
                      key={`${h}-${m}`}
                      type="button"
                      aria-label={`Agendar ${textoDiaCorto(d)} ${h}:${m === 0 ? "00" : "30"}`}
                      className={cn(
                        "hover:bg-accent/60 block w-full focus-visible:bg-accent focus-visible:outline-none",
                        m === 0 ? "border-t border-border/60" : "border-t border-dashed border-border/30",
                      )}
                      style={{ height: ALTO_HORA / 2 }}
                      onClick={() => onCrear(d, `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`)}
                    />
                  )),
                )}

                {/* Hora actual */}
                {d === claveHoy ? (
                  <div
                    className="pointer-events-none absolute right-0 left-0 z-20 border-t-2 border-red-500"
                    style={{ top: top(ahora) }}
                    aria-hidden
                  >
                    <span className="absolute -top-[5px] -left-[5px] size-2 rounded-full bg-red-500" />
                  </div>
                ) : null}

                {/* Visitas */}
                {porDia[d]?.map(({ v, carril, total }) => {
                  const est = ESTADOS[v.estado] ?? ESTADOS.programada;
                  const alto = Math.max(22, top(v.fin_at) - top(v.inicio_at) - 2);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onElegir(v)}
                      className={cn(
                        "absolute z-10 overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-left text-xs shadow-sm transition hover:z-30 hover:shadow-md focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        est.bloque,
                      )}
                      style={{
                        top: top(v.inicio_at) + 1,
                        height: alto,
                        left: `calc(${(carril / total) * 100}% + 2px)`,
                        width: `calc(${100 / total}% - 4px)`,
                      }}
                    >
                      <span className="block truncate font-semibold">{v.contacto_nombre}</span>
                      {alto > 34 ? (
                        <span className="block truncate opacity-80">
                          {textoHora(v.inicio_at)}
                          {v.propiedad_titulo ? ` · ${v.propiedad_titulo}` : ""}
                        </span>
                      ) : null}
                      {alto > 52 && v.agente_nombre ? (
                        <span className="block truncate opacity-70">{v.agente_nombre}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
