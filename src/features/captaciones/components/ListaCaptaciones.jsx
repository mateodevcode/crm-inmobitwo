// Lista compacta de captaciones (página, panel y ficha del propietario).
import { Badge } from "@/components/ui/badge.jsx";
import {
  CLASE_TONO,
  ETIQUETA_ESTADO,
  ETIQUETA_MANDATO,
  estadoVencimiento,
  textoComision,
} from "@/features/captaciones/textos.js";

export function ListaCaptaciones({ captaciones, onElegir, ocultarPropietario = false, vacio }) {
  if (!captaciones.length) {
    return <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">{vacio}</p>;
  }
  return (
    <ul className="grid gap-2">
      {captaciones.map((k) => {
        const venc = estadoVencimiento(k);
        const comision = textoComision(k);
        return (
          <li key={k.id}>
            <button
              type="button"
              onClick={() => onElegir(k)}
              className="hover:bg-accent grid w-full gap-1 rounded-lg border p-3 text-left text-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex flex-wrap items-start justify-between gap-2">
                <span className="min-w-0 flex-1 font-medium">{k.propiedad_titulo}</span>
                {venc ? (
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${CLASE_TONO[venc.tono]}`}>
                    {venc.texto}
                  </span>
                ) : (
                  <Badge variant="outline" className="shrink-0">{ETIQUETA_ESTADO[k.estado]}</Badge>
                )}
              </span>
              <span className="text-muted-foreground text-xs">
                {[
                  ETIQUETA_MANDATO[k.tipo_mandato],
                  !ocultarPropietario ? (k.propietario_nombre ?? "Sin propietario") : null,
                  comision ? `Comisión ${comision}` : null,
                  `${k.documentos.length} ${k.documentos.length === 1 ? "documento" : "documentos"}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
