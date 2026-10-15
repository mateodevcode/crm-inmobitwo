import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

const MAX_MB = 10;
const MAX_FOTOS = 10;

const vistaPrevia = (f) => ({ file: f, url: URL.createObjectURL(f) });

function leer(files) {
  const validos = [];
  for (const f of files ?? []) {
    if (!f.type.startsWith("image/")) {
      toast.error(`${f.name}: solo imágenes.`);
      continue;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`${f.name}: máximo ${MAX_MB} MB.`);
      continue;
    }
    validos.push(vistaPrevia(f));
  }
  return validos;
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

  const hayNuevas = principal || galeria.length > 0 || planos.length > 0;
  const hayActuales = (galeriaActual?.length ?? 0) > 0;

  const soltar = (lista, setLista, tope) => (e) => {
    e.preventDefault();
    agregar(lista, setLista, leer(e.dataTransfer.files), tope);
  };

  // La primera foto que se sube es la principal (igual que el portal).
  const agregar = (lista, setLista, nuevos, tope = MAX_FOTOS) => {
    if (nuevos.length === 0) return;
    if (!principal && lista === galeria) {
      const [primera, ...resto] = nuevos;
      setPrincipal(primera);
      setLista((g) => [...g, ...resto].slice(0, tope));
      return;
    }
    setLista((g) => [...g, ...nuevos].slice(0, tope));
  };

  const quitar = (lista, setLista, i) => {
    URL.revokeObjectURL(lista[i].url);
    setLista((g) => g.filter((_, j) => j !== i));
  };

  const hacerPrincipal = (i) => {
    const nueva = galeria[i];
    setGaleria((g) => {
      const resto = g.filter((_, j) => j !== i);
      return principal ? [...resto, principal] : resto;
    });
    setPrincipal(nueva);
  };

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
        {principal ? (
          <div className="relative max-w-xs">
            <img src={principal.url} alt="" className="h-40 w-full rounded object-cover" />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1"
              onClick={() => {
                URL.revokeObjectURL(principal.url);
                setPrincipal(null);
              }}
            >
              Quitar
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const n = leer(e.dataTransfer.files);
              if (n.length > 0) setPrincipal(n[0]);
            }}
            className="grid gap-2 rounded-lg border border-dashed p-4"
          >
            <p className="text-muted-foreground text-sm">Arrastre una foto o selecciónela:</p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const [f] = leer(e.target.files);
                if (f) setPrincipal(f);
                e.target.value = "";
              }}
            />
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Galería ({galeria.length}/{MAX_FOTOS})</h3>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={soltar(galeria, setGaleria)}
          className="grid gap-2 rounded-lg border border-dashed p-4"
        >
          <p className="text-muted-foreground text-sm">Arrastre fotos o selecciónelas. La primera será la principal si no hay una.</p>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              agregar(galeria, setGaleria, leer(e.target.files));
              e.target.value = "";
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {galeria.map((f, i) => (
            <div key={`${f.file.name}-${i}`} className="relative">
              <img src={f.url} alt="" className="h-28 w-full rounded object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <Button type="button" size="sm" variant="secondary" onClick={() => hacerPrincipal(i)} title="Hacer principal">
                  ★
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => quitar(galeria, setGaleria, i)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Planos ({planos.length}/{MAX_FOTOS})</h3>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={soltar(planos, setPlanos)}
          className="grid gap-2 rounded-lg border border-dashed p-4"
        >
          <p className="text-muted-foreground text-sm">Arrastre los planos o selecciónelos.</p>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              agregar(planos, setPlanos, leer(e.target.files));
              e.target.value = "";
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {planos.map((f, i) => (
            <div key={`${f.file.name}-${i}`} className="relative">
              <img src={f.url} alt="" className="h-28 w-full rounded object-cover" />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1"
                onClick={() => quitar(planos, setPlanos, i)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
        La primera foto que suba será la principal — puede cambiarla marcando otra con la ★.
      </div>

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
