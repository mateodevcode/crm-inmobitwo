import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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
  calcularPrecio,
  generarDescripcionIA,
  getCaracteristicas,
  getEstados,
  getTiposInmueble,
  sugerirTitulo,
  validarPrecio,
} from "@/features/propiedades/wizard/api.js";
import { MoneyText } from "@/components/comunes/MoneyText.jsx";
import { DescriptionEditor } from "@/features/propiedades/wizard/DescriptionEditor.jsx";

const BOOLS_SERV = [
  ["tiene_agua", "Agua"],
  ["tiene_luz", "Luz"],
  ["tiene_gas", "Gas"],
  ["tiene_alcantarillado", "Alcantarillado"],
];
const BOOLS_CARACT = [
  ["has_elevator", "Ascensor"],
  ["has_swimming_pool", "Piscina"],
  ["has_gym", "Gimnasio"],
  ["has_security_24h", "Seguridad 24h"],
  ["has_air_conditioning", "Aire acondicionado"],
  ["is_furnished", "Amoblado"],
];
const ESTRATOS = ["", "1", "2", "3", "4", "5", "6"];
const ZONAS = ["residencial", "comercial", "mixta", "rural", "industrial"];

function Numero({ label, valor, onChange, min = 0 }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange(Math.max(min, (Number(valor) || 0) - 1))}
        >
          −
        </Button>
        <Input
          inputMode="numeric"
          className="w-20 text-center"
          value={valor}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        />
        <Button type="button" size="sm" variant="outline" onClick={() => onChange((Number(valor) || 0) + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}

export default function Paso2({ form, set, featuresSel, setFeaturesSel, atras, guardar, guardando }) {
  const [iaLoading, setIaLoading] = useState(false);
  const [formatosIA, setFormatosIA] = useState([]);
  const [sugerencia, setSugerencia] = useState(null);
  const [veredicto, setVeredicto] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const estadosQ = useQuery({ queryKey: ["wiz-estados"], queryFn: getEstados });
  const caractsQ = useQuery({ queryKey: ["wiz-caracts"], queryFn: getCaracteristicas });
  const tiposQ = useQuery({ queryKey: ["wiz-tipos"], queryFn: getTiposInmueble });
  const [tituloSug, setTituloSug] = useState("");

  const setF = (k, v) => set((f) => ({ ...f, [k]: v }));
  const toggleFeat = (id, on) =>
    setFeaturesSel((s) => (on ? [...s, id] : s.filter((x) => x !== id)));

  const pedirTitulo = async () => {
    try {
      const params = new URLSearchParams({
        propertyTypeId: String(form.property_type_id),
        cityId: String(form.city_id),
        stateId: String(form.state_id),
        direccion: form.direccion,
        operacion: form.operacion,
      });
      const data = await sugerirTitulo(params);
      setTituloSug(data?.titulo ?? "");
      if (!data?.titulo) toast.success("Título sugerido por el sistema.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pedirIA = async () => {
    setIaLoading(true);
    setFormatosIA([]);
    try {
      const data = await generarDescripcionIA({
        property_type_id: form.property_type_id,
        operacion: form.operacion,
        city_id: form.city_id,
        barrio: form.barrio_nombre,
        estrato: form.estrato,
        private_area: form.private_area,
        constructed_area: form.constructed_area,
        bedroom_count: form.bedroom_count,
        bathroom_count: form.bathroom_count,
        condition_type_id: form.condition_type_id,
        parqueadero_tipo: form.parqueadero_tipo,
        administracion: form.administracion,
        features: featuresSel,
        precio: form.precio,
      });
      if (data?.formatos?.length > 0) {
        setFormatosIA(data.formatos);
        toast.success(`${data.formatos.length} estilos generados. Elija uno.`);
      } else {
        toast.error("La IA no devolvió estilos.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIaLoading(false);
    }
  };

  const sinHtml = (html) => String(html ?? "").replace(/<[^>]*>/g, "");

  const grupos = caractsQ.data ?? {};
  const tipoCode = (tiposQ.data ?? []).find((t) => Number(t.id) === Number(form.property_type_id))?.code;
  const pideLote = ["lote", "casa_lote", "finca"].includes(tipoCode);
  const anoActual = new Date().getFullYear();

  const setAno = (v) => {
    const ano = v.replace(/\D/g, "").slice(0, 4);
    set((f) => ({
      ...f,
      construction_year: ano,
      antiguedad_anios: ano.length === 4 ? String(Math.max(0, anoActual - Number(ano))) : f.antiguedad_anios,
    }));
  };

  const datosPrecio = () => ({
    city_id: form.city_id,
    estrato: form.estrato === "" ? undefined : Number(form.estrato),
    private_area: form.private_area === "" ? undefined : Number(form.private_area),
    constructed_area: form.constructed_area === "" ? undefined : Number(form.constructed_area),
    condition_type_id: form.condition_type_id || undefined,
    construction_year: form.construction_year === "" ? undefined : Number(form.construction_year),
    features: featuresSel,
    parqueadero_tipo: form.parqueadero_tipo || undefined,
    parqueadero_modo: form.parqueadero_modo || undefined,
    zona: form.zona || undefined,
  });

  const pedirSugerencia = async () => {
    setCalcLoading(true);
    setVeredicto(null);
    try {
      setSugerencia(await calcularPrecio(datosPrecio()));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  const evaluarPrecio = async () => {
    if (!form.precio || Number(form.precio) <= 0) {
      toast.error("Escriba primero el precio.");
      return;
    }
    setCalcLoading(true);
    try {
      setVeredicto(await validarPrecio(Number(form.precio), datosPrecio()));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h3 className="font-semibold">Dimensiones</h3>
        <div className="grid gap-2">
          <Label>Estrato</Label>
          <Select value={String(form.estrato || "")} onValueChange={(v) => setF("estrato", v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {ESTRATOS.map((e) => (
                <SelectItem key={e || "x"} value={e}>{e || "—"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Numero label="Área privada (m²)" valor={form.private_area} onChange={(v) => setF("private_area", v)} />
          <Numero label="Área construida (m²)" valor={form.constructed_area} onChange={(v) => setF("constructed_area", v)} />
          {pideLote ? (
            <Numero label="Área lote (m²)" valor={form.plot_area} onChange={(v) => setF("plot_area", v)} />
          ) : null}
          <Numero label="Alcobas" valor={form.bedroom_count} onChange={(v) => setF("bedroom_count", v)} />
          <Numero label="Baños" valor={form.bathroom_count} onChange={(v) => setF("bathroom_count", v)} />
          <Numero label="Ambientes" valor={form.room_count} onChange={(v) => setF("room_count", v)} />
          <Numero label="Baños sociales" valor={form.social_bathroom_count} onChange={(v) => setF("social_bathroom_count", v)} />
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Estado y antigüedad</h3>
        <div className="grid gap-2">
          <Label>Estado del inmueble</Label>
          <Select value={String(form.condition_type_id || "")} onValueChange={(v) => setF("condition_type_id", Number(v))}>
            <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
            <SelectContent>
              {(estadosQ.data ?? []).map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.label_es ?? e.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Año de construcción</Label>
            <Input
              inputMode="numeric"
              value={form.construction_year}
              onChange={(e) => setAno(e.target.value)}
              placeholder="2015"
            />
          </div>
          <div className="grid gap-2">
            <Label>Antigüedad (años)</Label>
            <Input value={form.antiguedad_anios} readOnly placeholder="Se calcula del año" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.is_new_construction} onCheckedChange={(v) => setF("is_new_construction", !!v)} />
          Para estrenar
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Piso</Label>
            <Input value={form.floor} onChange={(e) => setF("floor", e.target.value)} placeholder="3" />
          </div>
          <div className="grid gap-2">
            <Label>Apto / interior</Label>
            <Input value={form.interior_apartment_number} onChange={(e) => setF("interior_apartment_number", e.target.value)} placeholder="301" />
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Ubicación física y parqueadero</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Zona</Label>
            <Select value={form.zona} onValueChange={(v) => setF("zona", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ZONAS.map((z) => (
                  <SelectItem key={z} value={z} className="capitalize">{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Administración (COP)</Label>
            <Input inputMode="numeric" value={form.administracion} onChange={(e) => setF("administracion", e.target.value.replace(/\D/g, ""))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Parqueadero</Label>
            <Select value={form.parqueadero_tipo || ""} onValueChange={(v) => setF("parqueadero_tipo", v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cubierto">Cubierto</SelectItem>
                <SelectItem value="descubierto">Descubierto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Uso</Label>
            <Select value={form.parqueadero_modo || ""} onValueChange={(v) => setF("parqueadero_modo", v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="privado">Privado</SelectItem>
                <SelectItem value="comunal">Comunal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {BOOLS_SERV.map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <Checkbox checked={form[k]} onCheckedChange={(v) => setF(k, !!v)} /> {label}
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Características</h3>
        <div className="flex flex-wrap gap-4">
          {BOOLS_CARACT.map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <Checkbox checked={form[k]} onCheckedChange={(v) => setF(k, !!v)} /> {label}
            </label>
          ))}
        </div>
        {Object.entries(grupos).map(([grupo, items]) => (
          <div key={grupo} className="grid gap-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase">{grupo}</p>
            <div className="flex flex-wrap gap-4">
              {(items ?? []).filter((f) => f.data_type === "boolean").map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={featuresSel.includes(f.id)} onCheckedChange={(v) => toggleFeat(f.id, !!v)} />
                  {f.label_es}
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Documentación (opcional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Cédula catastral</Label>
            <Input value={form.cedula_catastral ?? ""} onChange={(e) => setF("cedula_catastral", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Matrícula inmobiliaria</Label>
            <Input value={form.matricula_inmobiliaria ?? ""} onChange={(e) => setF("matricula_inmobiliaria", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Precio</h3>
        <div className="grid gap-2">
          <Label>Precio (COP)</Label>
          <Input
            inputMode="numeric"
            placeholder="Ej: 450000000"
            value={form.precio}
            onChange={(e) => setF("precio", e.target.value.replace(/\D/g, ""))}
          />
        </div>
        {form.precio ? (
          <p className="text-sm"><MoneyText valor={form.precio} /></p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={calcLoading} onClick={pedirSugerencia}>
            {calcLoading ? "Calculando…" : "Calcular precio sugerido"}
          </Button>
          <Button type="button" variant="outline" disabled={calcLoading} onClick={evaluarPrecio}>
            Evaluar mi precio
          </Button>
        </div>
        {sugerencia ? (
          <div className="grid gap-1 text-sm">
            <p>
              Sugerido:{" "}
              <MoneyText
                valor={
                  sugerencia.precio_sugerido_promedio ??
                  sugerencia.precio_sugerido ??
                  sugerencia.sugerido
                }
              />
              {(sugerencia.precio_sugerido_min ?? sugerencia.min) ? (
                <span className="text-muted-foreground">
                  {" "}(rango <MoneyText valor={sugerencia.precio_sugerido_min ?? sugerencia.min} /> –{" "}
                  <MoneyText valor={sugerencia.precio_sugerido_max ?? sugerencia.max} />)
                </span>
              ) : null}
            </p>
            {sugerencia.price_per_sqm_sugerido ? (
              <p className="text-muted-foreground text-xs">
                $/m² sugerido: <MoneyText valor={sugerencia.price_per_sqm_sugerido} />
              </p>
            ) : null}
          </div>
        ) : null}
        {veredicto ? (
          <p className="text-sm">
            Su precio: <strong className="capitalize">{veredicto.nivel ?? veredicto.veredicto}</strong>
            {veredicto.mensaje ? <span className="text-muted-foreground"> — {veredicto.mensaje}</span> : null}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h3 className="font-semibold">Título y descripción</h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={pedirTitulo}>
            Sugerir título
          </Button>
          <Button type="button" variant="outline" disabled={iaLoading} onClick={pedirIA}>
            {iaLoading ? "Generando…" : "Generar descripción con IA"}
          </Button>
        </div>
        {tituloSug ? (
          <p className="rounded bg-muted p-3 text-sm">
            Título del anuncio: <strong>{tituloSug}</strong>
            <span className="text-muted-foreground"> (lo genera el sistema al publicar)</span>
          </p>
        ) : null}
        {formatosIA.length > 0 ? (
          <div className="grid gap-2">
            {formatosIA.map((f) => (
              <div key={f.id} className="rounded-lg border p-3">
                <p className="mb-1 text-sm font-semibold">{f.nombre}</p>
                <p className="text-muted-foreground mb-2 line-clamp-3 text-sm">{sinHtml(f.descripcion)}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setF("description", f.descripcion ?? "");
                    toast.success(`Estilo "${f.nombre}" aplicado.`);
                  }}
                >
                  Usar este estilo
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid gap-2">
          <Label>Descripción</Label>
          <DescriptionEditor value={form.description} onChange={(v) => setF("description", v)} />
        </div>
      </section>

      <div className="flex justify-between">
        <Button variant="outline" onClick={atras}>Atrás</Button>
        <Button
          disabled={guardando}
          onClick={() => {
            if (!form.precio || Number(form.precio) <= 0) {
              toast.error("Indique el precio del inmueble.");
              return;
            }
            if (form.operacion !== "venta" && !form.rental_type_id) {
              toast.error("Elija el tipo de alquiler (paso 1).");
              return;
            }
            guardar();
          }}
        >
          {guardando ? "Guardando…" : "Continuar a fotos"}
        </Button>
      </div>
    </div>
  );
}
