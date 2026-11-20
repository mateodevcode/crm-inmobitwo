// Botón "Plantillas": elige una respuesta y la devuelve ya con las variables
// rellenadas (onElegir(texto)). Incluye el acceso a gestionarlas.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareTextIcon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { obtenerPlantillas, usarPlantilla } from "@/features/bandeja/api.js";
import { aplicarPlantilla } from "@/features/bandeja/plantillas.js";
import { PlantillasDialog } from "@/features/bandeja/components/PlantillasDialog.jsx";

export function SelectorPlantillas({ valores, onElegir, tamano = "sm" }) {
  const [abierto, setAbierto] = useState(false);
  const [gestionar, setGestionar] = useState(false);
  const q = useQuery({ queryKey: ["crm-plantillas"], queryFn: obtenerPlantillas, enabled: abierto });
  const lista = q.data ?? [];

  return (
    <>
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size={tamano}>
            <MessageSquareTextIcon /> Plantillas
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-2">
          <ul className="grid max-h-72 gap-1 overflow-y-auto">
            {lista.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="hover:bg-accent grid w-full gap-0.5 rounded-md px-2 py-1.5 text-left"
                  onClick={() => {
                    onElegir(aplicarPlantilla(t.contenido, valores));
                    usarPlantilla(t.id);
                    setAbierto(false);
                  }}
                >
                  <span className="text-sm font-medium">{t.titulo}</span>
                  <span className="text-muted-foreground line-clamp-2 text-xs">{aplicarPlantilla(t.contenido, valores)}</span>
                </button>
              </li>
            ))}
          </ul>
          {q.isLoading ? <p className="text-muted-foreground px-2 py-2 text-sm">Cargando…</p> : null}
          {q.isSuccess && lista.length === 0 ? (
            <p className="text-muted-foreground px-2 py-2 text-sm">Aún no hay plantillas.</p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start"
            onClick={() => {
              setAbierto(false);
              setGestionar(true);
            }}
          >
            <Settings2Icon /> Gestionar plantillas
          </Button>
        </PopoverContent>
      </Popover>
      <PlantillasDialog abierto={gestionar} onCerrar={() => setGestionar(false)} />
    </>
  );
}
