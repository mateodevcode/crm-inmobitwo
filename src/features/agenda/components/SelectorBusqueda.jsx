// Selector con búsqueda remota (contactos o inmuebles del espacio activo).
// value = { id, etiqueta } | null. La consulta se lanza 300 ms después de
// dejar de escribir.
import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDownIcon, SearchIcon, XIcon } from "lucide-react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { cn } from "@/lib/utils.js";

function useDebounce(valor, ms = 300) {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}

export function SelectorBusqueda({
  id,
  value,
  onChange,
  buscar, // async (q) => [{ id, etiqueta, detalle }]
  claveQuery,
  placeholder = "Seleccionar…",
  vacio = "Sin resultados.",
  permitirQuitar = false,
  disabled = false,
}) {
  const { espacio } = useContext(WorkspaceContext);
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q.trim());

  const { data = [], isFetching } = useQuery({
    queryKey: [claveQuery, espacio, qDebounced],
    queryFn: () => buscar(qDebounced),
    enabled: abierto,
    staleTime: 30000,
  });

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <div className="flex gap-1">
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={abierto}
            disabled={disabled}
            className="min-w-0 flex-1 justify-between font-normal"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value?.etiqueta ?? placeholder}
            </span>
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        {permitirQuitar && value && !disabled ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Quitar" onClick={() => onChange(null)}>
            <XIcon />
          </Button>
        ) : null}
      </div>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-2" align="start">
        <div className="relative mb-2">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
            className="pl-8"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto" role="listbox">
          {data.map((op) => (
            <li key={op.id}>
              <button
                type="button"
                role="option"
                aria-selected={String(value?.id) === String(op.id)}
                className="hover:bg-accent aria-selected:bg-accent w-full rounded-md px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onChange(op);
                  setAbierto(false);
                  setQ("");
                }}
              >
                <span className="block truncate font-medium">{op.etiqueta}</span>
                {op.detalle ? (
                  <span className="text-muted-foreground block truncate text-xs">{op.detalle}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        {!isFetching && data.length === 0 ? (
          <p className="text-muted-foreground px-2 py-3 text-sm">{vacio}</p>
        ) : null}
        {isFetching ? <p className="text-muted-foreground px-2 py-1 text-xs">Buscando…</p> : null}
      </PopoverContent>
    </Popover>
  );
}
