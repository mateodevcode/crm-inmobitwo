// Formulario de demanda: lo que busca un cliente.
// - contacto: { id, etiqueta } fijo (desde la ficha) o se elige con el buscador.
// - demanda: si viene, edita.
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.jsx";
import { obtenerContactos } from "@/features/contactos/api.js";
import { obtenerMiembros } from "@/features/equipo/api.js";
import { SelectorBusqueda } from "@/features/agenda/components/SelectorBusqueda.jsx";
import {
  actualizarDemanda,
  buscarCiudades,
  crearDemanda,
  obtenerBarrios,
  obtenerTiposInmueble,
} from "@/features/demandas/api.js";
import { MINIMOS, OPERACIONES } from "@/features/demandas/criterios.js";
import { formatPrecioCompleto } from "@/utils/formatPrecio.js";
import { mostrarTelefono } from "@/utils/telefono.js";

const buscarContactos = async (q) => {
  const res = await obtenerContactos({ pagina: 1, limite: 20, q: q || undefined });
  return (res.data ?? []).map((c) => ({
    id: c.id,
    etiqueta: c.nombre,
    detalle: [c.telefono ? mostrarTelefono(c.telefono) : null, c.email].filter(Boolean).join(" · "),
  }));
};

const buscarCiudadesOpciones = async (q) =>
  (await buscarCiudades(q)).map((c) => ({ id: c.id, etiqueta: c.nombre, detalle: c.departamento }));

// "450000000" ↔ "450.000.000" para los campos de precio.
const soloDigitos = (v) => String(v ?? "").replace(/\D/g, "");
const conPuntos = (v) => (v ? Number(v).toLocaleString("es-CO") : "");

function estadoInicial(demanda, contacto) {
  if (!demanda) {
    return {
      contacto: contacto ?? null,
      operacion: "venta",
      tipos: [],
      ciudades: [],
      barrios: [],
      estratos: [],
      precio_min: "",
      precio_max: "",
      habitaciones_min: "",
      banos_min: "",
      parqueaderos_min: "",
      area_min: "",
      area_max: "",
      notas: "",
      avisar: true,
      agente: "",
    };
  }
  return {
    contacto: { id: demanda.contacto_id, etiqueta: demanda.contacto_nombre },
    operacion: demanda.operacion,
    tipos: (demanda.property_type_ids ?? []).map(String),
    ciudades: (demanda.ciudades ?? []).map((c) => ({ id: c.id, etiqueta: c.nombre })),
    barrios: (demanda.barrio_ids ?? []).map(String),
    estratos: (demanda.estratos ?? []).map(String),
    precio_min: demanda.precio_min ? String(demanda.precio_min) : "",
    precio_max: demanda.precio_max ? String(demanda.precio_max) : "",
    habitaciones_min: demanda.habitaciones_min ? String(demanda.habitaciones_min) : "",
    banos_min: demanda.banos_min ? String(demanda.banos_min) : "",
    parqueaderos_min: demanda.parqueaderos_min ? String(demanda.parqueaderos_min) : "",
    area_min: demanda.area_min ? String(demanda.area_min) : "",
    area_max: demanda.area_max ? String(demanda.area_max) : "",
    notas: demanda.notas ?? "",
    avisar: demanda.avisar,
    agente: demanda.asignado_a_id ? String(demanda.asignado_a_id) : "",
  };
}

export function DemandaDialog({ abierto, onCerrar, demanda = null, contacto = null, onGuardada }) {
  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {abierto ? (
          <Formulario
            key={demanda?.id ?? "nueva"}
            demanda={demanda}
            contacto={contacto}
            onCerrar={onCerrar}
            onGuardada={onGuardada}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Minimo({ id, etiqueta, valor, onChange }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Select value={valor || "x"} onValueChange={(v) => onChange(v === "x" ? "" : v)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINIMOS.map((m) => (
            <SelectItem key={m || "x"} value={m || "x"}>
              {m ? `${m}+` : "Indiferente"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Formulario({ demanda, contacto, onCerrar, onGuardada }) {
  const { espacio, organizacion, puedeAdministrar, esPersonal } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [f, setF] = useState(() => estadoInicial(demanda, contacto));
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const editando = !!demanda;
  const eligeAgente = !esPersonal && puedeAdministrar && organizacion;

  const tiposQ = useQuery({ queryKey: ["catalogo-tipos-inmueble"], queryFn: obtenerTiposInmueble, staleTime: Infinity });
  const miembrosQ = useQuery({
    queryKey: ["crm-miembros", espacio],
    queryFn: () => obtenerMiembros(organizacion.id),
    enabled: !!eligeAgente,
    select: (ms) => ms.filter((m) => m.estado === "activo"),
  });
  // Barrios: solo si hay exactamente una ciudad (en varias ciudades sería una lista inmanejable).
  const unaCiudad = f.ciudades.length === 1 ? f.ciudades[0] : null;
  const barriosQ = useQuery({
    queryKey: ["catalogo-barrios", unaCiudad?.id],
    queryFn: () => obtenerBarrios(unaCiudad.id),
    enabled: !!unaCiudad,
    staleTime: Infinity,
  });

  const guardar = useMutation({
    mutationFn: () => {
      const num = (v) => (v === "" ? null : Number(v));
      const datos = {
        operacion: f.operacion,
        property_type_ids: f.tipos.map(Number),
        city_ids: f.ciudades.map((c) => Number(c.id)),
        barrio_ids: unaCiudad ? f.barrios.map(Number) : [],
        estratos: f.estratos.map(Number),
        precio_min: num(f.precio_min),
        precio_max: num(f.precio_max),
        habitaciones_min: num(f.habitaciones_min),
        banos_min: num(f.banos_min),
        parqueaderos_min: num(f.parqueaderos_min),
        area_min: num(f.area_min),
        area_max: num(f.area_max),
        notas: f.notas,
        avisar: f.avisar,
        ...(eligeAgente && f.agente ? { asignado_a_id: Number(f.agente) } : {}),
      };
      return editando ? actualizarDemanda(demanda.id, datos) : crearDemanda({ ...datos, contacto_id: f.contacto.id });
    },
    onSuccess: (d) => {
      toast.success(editando ? "Demanda actualizada." : "Demanda creada.");
      queryClient.invalidateQueries({ queryKey: ["crm-demandas"] });
      onGuardada?.(d);
      onCerrar();
    },
    onError: (err) => toast.error(err.message),
  });

  const precioInvalido =
    f.precio_min && f.precio_max && Number(f.precio_max) < Number(f.precio_min);

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (f.contacto && !precioInvalido) guardar.mutate();
      }}
    >
      <DialogHeader>
        <DialogTitle>{editando ? "Editar demanda" : "Nueva demanda"}</DialogTitle>
        <DialogDescription>Qué busca el cliente. Se cruza con tus inmuebles y con el portal.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <Label htmlFor="demanda-contacto">Cliente</Label>
        <SelectorBusqueda
          id="demanda-contacto"
          value={f.contacto}
          onChange={set("contacto")}
          buscar={buscarContactos}
          claveQuery="crm-buscar-contactos"
          placeholder="Buscar contacto…"
          vacio="No hay contactos con ese nombre."
          disabled={editando || !!contacto}
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Busca para</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={f.operacion}
          onValueChange={(v) => v && set("operacion")(v)}
          className="justify-start"
          aria-label="Operación"
        >
          {OPERACIONES.map((o) => (
            <ToggleGroupItem key={o.valor} value={o.valor} className="px-4">
              {o.etiqueta}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-1.5">
        <Label>Tipo de inmueble</Label>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={f.tipos}
          onValueChange={set("tipos")}
          className="flex flex-wrap justify-start"
          aria-label="Tipos de inmueble"
        >
          {(tiposQ.data ?? []).map((t) => (
            <ToggleGroupItem key={t.id} value={String(t.id)} className="flex-none px-3">
              {t.label_es}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground text-xs">Sin marcar = cualquier tipo.</p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="demanda-ciudad">Ciudades</Label>
        <SelectorBusqueda
          id="demanda-ciudad"
          value={null}
          onChange={(c) =>
            c &&
            setF((p) =>
              p.ciudades.some((x) => String(x.id) === String(c.id))
                ? p
                : { ...p, ciudades: [...p.ciudades, { id: c.id, etiqueta: c.etiqueta }], barrios: [] },
            )
          }
          buscar={buscarCiudadesOpciones}
          claveQuery="crm-buscar-ciudades"
          placeholder="Agregar ciudad…"
          vacio="Escribe al menos 2 letras."
        />
        {f.ciudades.length ? (
          <div className="flex flex-wrap gap-1.5">
            {f.ciudades.map((c) => (
              <Badge key={c.id} variant="secondary" className="gap-1 pr-1">
                {c.etiqueta}
                <button
                  type="button"
                  aria-label={`Quitar ${c.etiqueta}`}
                  className="hover:bg-muted rounded-sm p-0.5"
                  onClick={() => setF((p) => ({ ...p, ciudades: p.ciudades.filter((x) => x.id !== c.id), barrios: [] }))}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Sin ciudades = en cualquier ciudad.</p>
        )}
      </div>

      {unaCiudad && (barriosQ.data ?? []).length > 0 ? (
        <div className="grid gap-1.5">
          <Label>Barrios de {unaCiudad.etiqueta} (opcional)</Label>
          <div className="grid max-h-40 grid-cols-2 gap-x-3 gap-y-1.5 overflow-y-auto rounded-lg border p-2 sm:grid-cols-3">
            {barriosQ.data.map((b) => {
              const id = String(b.id);
              const marcado = f.barrios.includes(id);
              return (
                <label key={b.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={marcado}
                    onCheckedChange={(v) =>
                      setF((p) => ({ ...p, barrios: v ? [...p.barrios, id] : p.barrios.filter((x) => x !== id) }))
                    }
                  />
                  <span className="truncate">{b.nombre}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="demanda-pmin">Precio mínimo</Label>
          <Input
            id="demanda-pmin"
            inputMode="numeric"
            placeholder="$ 0"
            value={conPuntos(f.precio_min)}
            onChange={(e) => set("precio_min")(soloDigitos(e.target.value))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="demanda-pmax">Precio máximo</Label>
          <Input
            id="demanda-pmax"
            inputMode="numeric"
            placeholder="Sin tope"
            value={conPuntos(f.precio_max)}
            onChange={(e) => set("precio_max")(soloDigitos(e.target.value))}
            aria-invalid={precioInvalido || undefined}
          />
        </div>
        <p className="text-muted-foreground col-span-2 -mt-1 text-xs">
          {precioInvalido
            ? "El máximo debe ser mayor o igual al mínimo."
            : f.precio_max
              ? `También se muestran inmuebles hasta ${formatPrecioCompleto(Number(f.precio_max) * 1.1)} (10 % más), marcados.`
              : "Pesos colombianos."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Minimo id="demanda-hab" etiqueta="Habitaciones" valor={f.habitaciones_min} onChange={set("habitaciones_min")} />
        <Minimo id="demanda-banos" etiqueta="Baños" valor={f.banos_min} onChange={set("banos_min")} />
        <Minimo id="demanda-parq" etiqueta="Parqueaderos" valor={f.parqueaderos_min} onChange={set("parqueaderos_min")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="demanda-amin">Área mínima (m²)</Label>
          <Input id="demanda-amin" inputMode="numeric" value={f.area_min} onChange={(e) => set("area_min")(soloDigitos(e.target.value))} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="demanda-amax">Área máxima (m²)</Label>
          <Input id="demanda-amax" inputMode="numeric" value={f.area_max} onChange={(e) => set("area_max")(soloDigitos(e.target.value))} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Estrato</Label>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={f.estratos}
          onValueChange={set("estratos")}
          className="justify-start"
          aria-label="Estratos"
        >
          {["1", "2", "3", "4", "5", "6"].map((e) => (
            <ToggleGroupItem key={e} value={e} className="w-9 flex-none">
              {e}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {eligeAgente ? (
        <div className="grid gap-1.5">
          <Label htmlFor="demanda-agente">Agente responsable</Label>
          <Select value={f.agente || "yo"} onValueChange={(v) => set("agente")(v === "yo" ? "" : v)}>
            <SelectTrigger id="demanda-agente" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yo">Yo</SelectItem>
              {(miembrosQ.data ?? []).map((m) => (
                <SelectItem key={m.usuario_id} value={String(m.usuario_id)}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="demanda-notas">Notas</Label>
        <Textarea
          id="demanda-notas"
          rows={3}
          maxLength={4000}
          value={f.notas}
          onChange={(e) => set("notas")(e.target.value)}
          placeholder="Cerca del colegio, que reciba mascotas, crédito aprobado…"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={f.avisar} onCheckedChange={(v) => set("avisar")(!!v)} />
        Avisarme por correo cuando entre un inmueble que coincida
      </label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
        <Button type="submit" disabled={!f.contacto || precioInvalido || guardar.isPending}>
          {guardar.isPending ? "Guardando…" : editando ? "Guardar cambios" : "Crear demanda"}
        </Button>
      </DialogFooter>
    </form>
  );
}
