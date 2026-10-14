import { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {
  geocodear,
  getBarrios,
  getCities,
  getStates,
  getTiposAlquiler,
  getTiposInmueble,
} from "@/features/propiedades/wizard/api.js";
import { OPERACION_A_ID } from "@/features/propiedades/wizard/formInit.js";
import { mostrarTelefono, normalizarTelefonoColombia as normalizarTelefono } from "@/utils/telefono.js";

const PIN =
  `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="#FF1B1C"/>` +
  `<circle cx="16" cy="16" r="6" fill="white"/></svg>`;

function MapaConfirmado({ lat, lng, onEditar }) {
  const contRef = useRef(null);

  useEffect(() => {
    if (!contRef.current) return;
    let map = null;
    queueMicrotask(() => {
      if (!contRef.current) return;
      try {
        map = new maplibregl.Map({
          container: contRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
              },
            },
            layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
          },
          center: [lng, lat],
          zoom: 17,
          attributionControl: false,
          interactive: false,
        });
        const el = document.createElement("div");
        el.innerHTML = PIN;
        new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .addTo(map);
      } catch {
        /* si falla, quedan las coordenadas + editar */
      }
    });
    return () => {
      try {
        map?.remove();
      } catch {
        /* limpieza best-effort */
      }
    };
  }, [lat, lng]);

  return (
    <div className="grid gap-2">
      <div className="h-48 w-full overflow-hidden rounded-md border">
        <div ref={contRef} className="h-full w-full" />
      </div>
      <p className="text-muted-foreground text-xs">
        Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
      <div>
        <Button type="button" variant="outline" onClick={onEditar}>
          Editar ubicación
        </Button>
      </div>
    </div>
  );
}

function MapaConfirmar({ abierto, inicial, geo, onConfirmar, onCerrar }) {
  const contRef = useRef(null);
  const mapaRef = useRef(null);
  const [pos, setPos] = useState(inicial);
  const [errorMapa, setErrorMapa] = useState(null);
  const bajaConfianza = geo && geo.importance != null && geo.importance < 0.4;

  useEffect(() => {
    if (!abierto) return;
    queueMicrotask(() => setErrorMapa(null));
    queueMicrotask(() => setPos(inicial));
    let map = null;
    let cancelado = false;
    // Como el portal: espera a que el Dialog termine su animación.
    const timer = setTimeout(() => {
      if (cancelado || !contRef.current) return;
      try {
        map = new maplibregl.Map({
          container: contRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
              },
            },
            layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
          },
          center: [inicial.lng, inicial.lat],
          zoom: 17,
          attributionControl: false,
        });
      } catch (err) {
        queueMicrotask(() => {
          if (!cancelado) setErrorMapa(err?.message ?? "No se pudo crear el mapa.");
        });
        return;
      }
      const el = document.createElement("div");
      el.innerHTML = PIN;
      el.style.cursor = "grab";
      map.on("load", () => {
        if (cancelado) return;
        try {
          const marker = new maplibregl.Marker({ element: el, anchor: "bottom", draggable: true })
            .setLngLat([inicial.lng, inicial.lat])
            .addTo(map);
          marker.on("dragend", () => {
            const p = marker.getLngLat();
            setPos({ lat: p.lat, lng: p.lng });
          });
        } catch (err) {
          queueMicrotask(() => {
            if (!cancelado) setErrorMapa(err?.message ?? "No se pudo crear el mapa.");
          });
        }
      });
      mapaRef.current = map;
    }, 150);
    return () => {
      cancelado = true;
      clearTimeout(timer);
      try {
        map?.remove();
      } catch {
        /* limpieza best-effort */
      }
      mapaRef.current = null;
    };
  }, [abierto]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Confirme la ubicación</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-xs">Arrastre el pin para ajustar la ubicación exacta.</p>
        {!geo ? (
          <p className="rounded-md bg-amber-50 p-3 text-xs">
            No se localizó la dirección exacta: mapa centrado en la ciudad — arrastre el pin hasta la ubicación correcta.
          </p>
        ) : bajaConfianza ? (
          <p className="rounded-md bg-amber-50 p-3 text-xs">
            Encontrado: {geo.displayName} — verifique que el pin esté en el lugar correcto antes de confirmar.
          </p>
        ) : geo.displayName ? (
          <p className="text-muted-foreground text-xs">Encontrado: {geo.displayName}</p>
        ) : null}
        {errorMapa ? (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">
            Mapa no disponible: {errorMapa} (WebGL desactivado en este navegador).
          </p>
        ) : null}
        <div className="h-60 w-full overflow-hidden rounded-md border">
          <div ref={contRef} className="h-full w-full" />
        </div>
        <p className="text-muted-foreground text-xs">
          Coordenadas: {pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={() => onConfirmar(pos)}>Confirmar ubicación</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Paso1({ form, set, siguiente }) {
  const { usuario } = useContext(AuthContext);
  const { organizaciones, organizacion, esPersonal } = useContext(WorkspaceContext);
  const [mapaAbierto, setMapaAbierto] = useState(false);
  const [posInicial, setPosInicial] = useState({ lat: 4.711, lng: -74.0721 });
  const [geoInfo, setGeoInfo] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const tiposQ = useQuery({ queryKey: ["wiz-tipos"], queryFn: getTiposInmueble });
  const alquilerQ = useQuery({ queryKey: ["wiz-alquiler"], queryFn: getTiposAlquiler });
  const statesQ = useQuery({ queryKey: ["wiz-states"], queryFn: getStates });
  const citiesQ = useQuery({
    queryKey: ["wiz-cities", form.state_id],
    queryFn: () => getCities(form.state_id),
    enabled: !!form.state_id,
  });
  const ciudadSel = citiesQ.data?.find((c) => Number(c.id) === Number(form.city_id));
  const barriosQ = useQuery({
    queryKey: ["wiz-barrios", ciudadSel?.dane_code],
    queryFn: () => getBarrios(ciudadSel.dane_code),
    enabled: !!ciudadSel?.dane_code,
  });
  const [barrioOtro, setBarrioOtro] = useState(false);

  const setF = (k, v) => set((f) => ({ ...f, [k]: v }));
  const esAlquiler = form.operacion !== "venta";

  const elegirOperacion = (op) => {
    set((f) => ({
      ...f,
      operacion: op === "vacacional" ? "alquiler" : op,
      operation_type_id: OPERACION_A_ID[op] ?? 1,
      rental_type_id: op === "venta" ? "" : op === "vacacional" ? 3 : f.rental_type_id || 1,
    }));
  };
  const esVacacional = form.operacion === "alquiler" && Number(form.rental_type_id) === 3;
  const orgDefecto = !esPersonal && organizacion ? organizacion : organizaciones[0];

  const verificarDireccion = async () => {
    if (!form.state_id || !form.city_id || !form.direccion.trim()) {
      toast.error("Complete departamento, ciudad y dirección.");
      return;
    }
    const depto = statesQ.data?.find((s) => Number(s.id) === Number(form.state_id));
    const ciudad = citiesQ.data?.find((c) => Number(c.id) === Number(form.city_id));
    const dir = `${form.direccion} ${form.numero_direccion ?? ""}, ${ciudad?.name ?? ""}, ${depto?.name ?? ""}, Colombia`;
    setBuscando(true);
    try {
      const geo = await geocodear(dir);
      const lat = Number(geo.latitude ?? geo.lat);
      const lng = Number(geo.longitude ?? geo.lng ?? geo.lon);
      const ok = Number.isFinite(lat) && Number.isFinite(lng);
      setGeoInfo(
        ok
          ? { displayName: geo.displayName ?? "", importance: geo.importance ?? null }
          : null,
      );
      setPosInicial(
        ok
          ? { lat, lng }
          : {
              lat: Number(ciudad?.latitude ?? 4.711),
              lng: Number(ciudad?.longitude ?? -74.0721),
            },
      );
    } catch {
      // Como el portal: si no se localiza, se abre igual centrado en la ciudad.
      setGeoInfo(null);
      setPosInicial({
        lat: Number(ciudad?.latitude ?? 4.711),
        lng: Number(ciudad?.longitude ?? -74.0721),
      });
    } finally {
      setBuscando(false);
      setMapaAbierto(true);
    }
  };

  const confirmarUbicacion = (p) => {
    set((f) => ({ ...f, latitude: p.lat, longitude: p.lng }));
    setMapaAbierto(false);
  };

  const ubicado = form.latitude !== "" && form.longitude !== "";

  const setTelefono = (i, v) => {
    const tels = [...form.telefonos];
    tels[i] = v;
    setF("telefonos", tels);
  };

  const continuar = () => {
    if (!form.property_type_id) return toast.error("Elija el tipo de inmueble.");
    if (!form.state_id || !form.city_id) return toast.error("Elija departamento y ciudad.");
    if (!form.direccion.trim()) return toast.error("Escriba la dirección.");
    if (!ubicado) return toast.error("Confirme la ubicación en el mapa.");
    if (!form.contactName.trim()) return toast.error("Escriba el nombre de contacto.");
    const tels = form.telefonos.map((t) => normalizarTelefono(t)).filter(Boolean);
    if (tels.length === 0) return toast.error("Agregue al menos un celular válido (10 dígitos desde 3).");
    siguiente({ tels });
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h3 className="font-semibold">Tipo y operación</h3>
        <div className="grid gap-2">
          <Label>Tipo de inmueble</Label>
          <Select value={String(form.property_type_id || "")} onValueChange={(v) => setF("property_type_id", Number(v))}>
            <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
            <SelectContent>
              {(tiposQ.data ?? []).map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.label_es}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Operación</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={form.operacion === "venta" ? "default" : "outline"}
              onClick={() => elegirOperacion("venta")}
            >
              Venta
            </Button>
            <Button
              type="button"
              variant={form.operacion === "alquiler" && !esVacacional ? "default" : "outline"}
              onClick={() => elegirOperacion("alquiler")}
            >
              Alquiler
            </Button>
            <Button
              type="button"
              variant={esVacacional ? "default" : "outline"}
              onClick={() => elegirOperacion("vacacional")}
            >
              Alquiler vacacional
            </Button>
          </div>
        </div>
        {esAlquiler ? (
          <div className="grid gap-2">
            <Label>Tipo de alquiler</Label>
            <Select value={String(form.rental_type_id || "")} onValueChange={(v) => setF("rental_type_id", Number(v))}>
              <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
              <SelectContent>
                {(alquilerQ.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.label_es ?? t.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {organizaciones.length > 0 || orgDefecto ? (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.es_de_organizacion}
              onCheckedChange={(v) => {
                const on = !!v;
                set((f) => ({
                  ...f,
                  es_de_organizacion: on,
                  organizacion_id: on && orgDefecto ? String(orgDefecto.id) : "",
                }));
              }}
            />
            Publicar a nombre de {orgDefecto.nombre}
          </label>
        ) : null}
        </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Ubicación</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Departamento</Label>
            <Select
              value={String(form.state_id || "")}
              onValueChange={(v) => set((f) => ({ ...f, state_id: Number(v), city_id: "" }))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
              <SelectContent>
                {(statesQ.data ?? []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Ciudad</Label>
            <Select
              value={String(form.city_id || "")}
              onValueChange={(v) => setF("city_id", Number(v))}
              disabled={!form.state_id}
            >
              <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
              <SelectContent>
                {(citiesQ.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Barrio</Label>
          {barrioOtro || (barriosQ.data ?? []).length === 0 ? (
            <Input
              value={form.barrio_nombre}
              onChange={(e) => setF("barrio_nombre", e.target.value)}
              placeholder="Escriba el barrio"
            />
          ) : (
            <Select
              value={form.barrio_nombre || ""}
              onValueChange={(v) => {
                if (v === "__otro__") {
                  setBarrioOtro(true);
                  setF("barrio_nombre", "");
                } else {
                  setF("barrio_nombre", v);
                }
              }}
            >
              <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
              <SelectContent>
                {(barriosQ.data ?? []).map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
                <SelectItem value="__otro__">Otro (escribir)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={(e) => setF("direccion", e.target.value)} placeholder="Calle 45 o Avenida 80" />
          </div>
          <div className="grid gap-2">
            <Label>Número</Label>
            <Input value={form.numero_direccion} onChange={(e) => setF("numero_direccion", e.target.value)} placeholder="32" />
          </div>
          <div className="grid gap-2">
            <Label>Complemento (opcional)</Label>
            <Input value={form.complemento} onChange={(e) => setF("complemento", e.target.value)} placeholder="Apto 301" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" disabled={buscando} onClick={verificarDireccion}>
            {buscando ? "Buscando…" : ubicado ? "Verificar de nuevo" : "Verificar en mapa"}
          </Button>
        </div>
        {ubicado ? (
          <MapaConfirmado
            lat={Number(form.latitude)}
            lng={Number(form.longitude)}
            onEditar={verificarDireccion}
          />
        ) : null}
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Contacto</h3>
        <div className="grid gap-2">
          <Label>Nombre</Label>
          <Input value={form.contactName} onChange={(e) => setF("contactName", e.target.value)} placeholder={usuario?.name ?? ""} />
        </div>
        {form.telefonos.map((t, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={t}
              onChange={(e) => setTelefono(i, e.target.value)}
              placeholder="300 123 4567"
              className="max-w-xs"
            />
            {form.telefonos.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setF("telefonos", form.telefonos.filter((_, j) => j !== i))}
              >
                Quitar
              </Button>
            ) : null}
          </div>
        ))}
        <div>
          <Button type="button" variant="outline" onClick={() => setF("telefonos", [...form.telefonos, ""])}>
            Agregar teléfono
          </Button>
          <p className="text-muted-foreground mt-1 text-xs">{mostrarTelefono(form.telefonos[0])}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>¿Cómo lo contactan?</Label>
            <Select value={form.how_to_contact} onValueChange={(v) => setF("how_to_contact", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="telefono_chat">Teléfono y chat</SelectItem>
                <SelectItem value="solo_chat">Solo chat</SelectItem>
                <SelectItem value="solo_telefono">Solo teléfono</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.how_to_contact !== "solo_chat" ? (
            <div className="grid gap-2">
              <Label>Número de contacto</Label>
              <Select
                value={form.telefono_contacto || ""}
                onValueChange={(v) => setF("telefono_contacto", v === "__todos__" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__todos__">Todos</SelectItem>
                  {form.telefonos.map((t) => normalizarTelefono(t)).filter(Boolean).map((t) => (
                    <SelectItem key={t} value={t}>{mostrarTelefono(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={continuar}>Continuar a detalles</Button>
      </div>

      <MapaConfirmar
        key={`${posInicial.lat},${posInicial.lng}`}
        abierto={mapaAbierto}
        inicial={posInicial}
        geo={geoInfo}
        onCerrar={() => setMapaAbierto(false)}
        onConfirmar={confirmarUbicacion}
      />
    </div>
  );
}
