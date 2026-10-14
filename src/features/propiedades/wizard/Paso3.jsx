import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

const MAX_MB = 10;

function leer(files) {
  return [...(files ?? [])].filter((f) => {
    if (!f.type.startsWith("image/")) {
      toast.error(`${f.name}: solo imágenes.`);
      return false;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`${f.name}: máximo ${MAX_MB} MB.`);
      return false;
    }
    return true;
  });
}

export default function Paso3({
  galeriaActual,
  onQuitarActual,
  principal,
  setPrincipal,
  galeria,
  setGaleria,
  planos,
  setPlanos,
  atras,
  finalizar,
  finalizando,
  omitir,
}) {
  const [sinFotos, setSinFotos] = useState(false);

  const hayNuevas = principal || galeria.length > 0;
  const hayActuales = (galeriaActual?.length ?? 0) > 0;

  return (
    <div className="grid gap-6">
      {hayActuales ? (
        <section className="grid gap-3">
          <h3 className="font-semibold">Fotos actuales</h3>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
            {galeriaActual.map((f) => (
              <div key={`${f.orden}-${f.tamaño}-${f.id}`} className="relative">
                <img src={f.url} alt="" className="h-28 w-full rounded object-cover" />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1"
                  onClick={() => onQuitarActual(f.orden)}
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3">
        <h3 className="font-semibold">Foto principal</h3>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const [f] = leer(e.target.files);
            if (f) setPrincipal(f);
            e.target.value = "";
          }}
        />
        {principal ? <p className="text-sm">{principal.name}</p> : null}
        <p className="text-muted-foreground text-xs">O marque una de la galería como principal.</p>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Galería (máx. 10)</h3>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setGaleria((g) => [...g, ...leer(e.target.files)].slice(0, 10));
            e.target.value = "";
          }}
        />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {galeria.map((f, i) => (
            <div key={`${f.name}-${i}`} className="relative">
              <img src={URL.createObjectURL(f)} alt="" className="h-28 w-full rounded object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setGaleria((g) => {
                      const resto = g.filter((_, j) => j !== i);
                      return principal ? [...resto, principal] : resto;
                    });
                    setPrincipal(f);
                  }}
                >
                  ★
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => setGaleria((g) => g.filter((_, j) => j !== i))}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Planos (opcional)</h3>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setPlanos((p) => [...p, ...leer(e.target.files)].slice(0, 10));
            e.target.value = "";
          }}
        />
        {planos.length > 0 ? <p className="text-sm">{planos.length} plano(s).</p> : null}
      </section>

      <div className="flex justify-between">
        <Button variant="outline" onClick={atras}>Atrás</Button>
        <div className="flex gap-2">
          {!hayNuevas && !hayActuales ? (
            <Button variant="outline" onClick={() => setSinFotos(true)}>
              Continuar sin fotos
            </Button>
          ) : null}
          <Button disabled={finalizando || (!hayNuevas && !hayActuales)} onClick={finalizar}>
            {finalizando ? "Subiendo…" : "Publicar"}
          </Button>
        </div>
      </div>

      {sinFotos ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">Los anuncios con fotos reciben más contactos. ¿Continuar sin fotos?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSinFotos(false)}>Añadir fotos</Button>
            <Button size="sm" onClick={omitir}>Continuar sin fotos</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
