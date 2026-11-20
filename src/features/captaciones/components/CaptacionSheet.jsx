// Panel lateral con la captación de un inmueble: datos del mandato y
// documentos privados del propietario. Si el inmueble no tiene captación,
// el mismo formulario la registra.
import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, FileTextIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Separator } from "@/components/ui/separator.jsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.jsx";
import { obtenerContactos } from "@/features/contactos/api.js";
import { obtenerMiembros } from "@/features/equipo/api.js";
import { SelectorBusqueda } from "@/features/agenda/components/SelectorBusqueda.jsx";
import {
  actualizarCaptacion,
  captacionDePropiedad,
  crearCaptacion,
  descargarDocumento,
  eliminarDocumento,
  subirDocumento,
} from "@/features/captaciones/api.js";
import {
  CLASE_TONO,
  ESTADOS_CAPTACION,
  ETIQUETA_DOCUMENTO,
  MANDATOS,
  TIPOS_DOCUMENTO,
  estadoVencimiento,
  textoTamano,
} from "@/features/captaciones/textos.js";
import { formatoFecha } from "@/utils/fechas.js";
import { mostrarTelefono } from "@/utils/telefono.js";

const MARCADO =
  "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";
const soloDigitos = (v) => String(v ?? "").replace(/\D/g, "");
const conPuntos = (v) => (v ? Number(v).toLocaleString("es-CO") : "");

const buscarContactos = async (q) => {
  const res = await obtenerContactos({ pagina: 1, limite: 20, q: q || undefined });
  return (res.data ?? []).map((c) => ({
    id: c.id,
    etiqueta: c.nombre,
    detalle: [c.telefono ? mostrarTelefono(c.telefono) : null, c.tipo].filter(Boolean).join(" · "),
  }));
};

export function CaptacionSheet({ propiedad, onCerrar }) {
  return (
    <Sheet open={!!propiedad} onOpenChange={(v) => !v && onCerrar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {propiedad ? <Contenido key={propiedad.id} propiedad={propiedad} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function Contenido({ propiedad }) {
  const { espacio } = useContext(WorkspaceContext);
  const q = useQuery({
    queryKey: ["crm-captaciones", espacio, "propiedad", propiedad.id],
    queryFn: () => captacionDePropiedad(propiedad.id),
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle>Captación</SheetTitle>
        <SheetDescription className="line-clamp-2">{propiedad.titulo}</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-4 pb-6">
        {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {q.isError ? <p role="alert" className="text-destructive text-sm">{q.error.message}</p> : null}
        {q.isSuccess ? (
          <>
            <FormularioCaptacion key={q.data?.id ?? "nueva"} propiedad={propiedad} captacion={q.data} />
            {q.data ? (
              <>
                <Separator />
                <Documentos captacion={q.data} />
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}

function estadoInicial(k) {
  return {
    propietario: k?.propietario_id ? { id: k.propietario_id, etiqueta: k.propietario_nombre } : null,
    tipo_mandato: k?.tipo_mandato ?? "exclusiva",
    inicio_el: k?.inicio_el ?? "",
    vence_el: k?.vence_el ?? "",
    comision_tipo: k?.comision_tipo ?? "porcentaje",
    comision_porcentaje: k?.comision_porcentaje != null ? String(Number(k.comision_porcentaje)).replace(".", ",") : "",
    comision_valor: k?.comision_valor ? String(k.comision_valor) : "",
    precio_propietario: k?.precio_propietario ? String(k.precio_propietario) : "",
    estado: k?.estado ?? "activa",
    notas: k?.notas ?? "",
    agente: k?.asignado_a_id ? String(k.asignado_a_id) : "",
  };
}

function FormularioCaptacion({ propiedad, captacion }) {
  const { espacio, organizacion, puedeAdministrar, esPersonal } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [f, setF] = useState(() => estadoInicial(captacion));
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const eligeAgente = !esPersonal && puedeAdministrar && organizacion;
  const venc = captacion ? estadoVencimiento(captacion) : null;

  const miembrosQ = useQuery({
    queryKey: ["crm-miembros", espacio],
    queryFn: () => obtenerMiembros(organizacion.id),
    enabled: !!eligeAgente,
    select: (ms) => ms.filter((m) => m.estado === "activo"),
  });

  const pct = Number(String(f.comision_porcentaje).replace(",", "."));
  const pctInvalido = f.comision_tipo === "porcentaje" && f.comision_porcentaje !== "" && !(pct >= 0 && pct <= 100);
  const fechasInvalidas = f.inicio_el && f.vence_el && f.vence_el < f.inicio_el;

  const guardar = useMutation({
    mutationFn: () => {
      const datos = {
        propietario_id: f.propietario?.id ?? null,
        tipo_mandato: f.tipo_mandato,
        inicio_el: f.inicio_el || null,
        vence_el: f.vence_el || null,
        comision_tipo: f.comision_tipo,
        comision_porcentaje: f.comision_porcentaje === "" ? null : pct,
        comision_valor: f.comision_valor === "" ? null : Number(f.comision_valor),
        precio_propietario: f.precio_propietario === "" ? null : Number(f.precio_propietario),
        estado: f.estado,
        notas: f.notas,
        ...(eligeAgente && f.agente ? { asignado_a_id: Number(f.agente) } : {}),
      };
      return captacion ? actualizarCaptacion(captacion.id, datos) : crearCaptacion({ ...datos, propiedad_id: propiedad.id });
    },
    onSuccess: () => {
      toast.success(captacion ? "Captación actualizada." : "Captación registrada.");
      queryClient.invalidateQueries({ queryKey: ["crm-captaciones"] });
      queryClient.invalidateQueries({ queryKey: ["crm-actividades"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!pctInvalido && !fechasInvalidas) guardar.mutate();
      }}
    >
      {venc ? (
        <p className={`rounded-lg px-3 py-2 text-sm font-medium ${CLASE_TONO[venc.tono]}`}>{venc.texto}</p>
      ) : null}
      {!captacion ? (
        <p className="text-muted-foreground text-sm">
          Este inmueble aún no tiene captación registrada. Anota el acuerdo con el propietario.
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="cap-propietario">Propietario</Label>
        <SelectorBusqueda
          id="cap-propietario"
          value={f.propietario}
          onChange={set("propietario")}
          buscar={buscarContactos}
          claveQuery="crm-buscar-contactos"
          placeholder="Buscar entre tus contactos…"
          vacio="No está. Créalo primero en Contactos."
          permitirQuitar
        />
        {f.propietario ? (
          <Link to={`/contactos/${f.propietario.id}`} className="text-muted-foreground text-xs underline-offset-4 hover:underline">
            Ver ficha del propietario
          </Link>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label>Mandato</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={f.tipo_mandato}
          onValueChange={(v) => v && set("tipo_mandato")(v)}
          className="flex flex-wrap justify-start"
          aria-label="Tipo de mandato"
        >
          {MANDATOS.map((m) => (
            <ToggleGroupItem key={m.valor} value={m.valor} className={`flex-none px-3 ${MARCADO}`}>
              {m.etiqueta}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="cap-inicio">Inicio</Label>
          <Input id="cap-inicio" type="date" value={f.inicio_el} onChange={(e) => set("inicio_el")(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cap-vence">Vence</Label>
          <Input
            id="cap-vence"
            type="date"
            value={f.vence_el}
            min={f.inicio_el || undefined}
            onChange={(e) => set("vence_el")(e.target.value)}
            aria-invalid={fechasInvalidas || undefined}
          />
        </div>
        {fechasInvalidas ? (
          <p className="text-destructive col-span-2 -mt-1 text-xs">El vencimiento debe ser posterior al inicio.</p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label>Comisión</Label>
        <div className="flex gap-2">
          <Select value={f.comision_tipo} onValueChange={set("comision_tipo")}>
            <SelectTrigger className="w-36" aria-label="Tipo de comisión">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="porcentaje">Porcentaje</SelectItem>
              <SelectItem value="valor">Valor fijo</SelectItem>
            </SelectContent>
          </Select>
          {f.comision_tipo === "porcentaje" ? (
            <Input
              inputMode="decimal"
              placeholder="3"
              aria-label="Porcentaje de comisión"
              value={f.comision_porcentaje}
              onChange={(e) => set("comision_porcentaje")(e.target.value.replace(/[^\d,.]/g, "").slice(0, 6))}
              aria-invalid={pctInvalido || undefined}
              className="flex-1"
            />
          ) : (
            <Input
              inputMode="numeric"
              placeholder="$ 0"
              aria-label="Valor de la comisión"
              value={conPuntos(f.comision_valor)}
              onChange={(e) => set("comision_valor")(soloDigitos(e.target.value))}
              className="flex-1"
            />
          )}
        </div>
        {pctInvalido ? <p className="text-destructive text-xs">Escribe un porcentaje entre 0 y 100.</p> : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cap-precio">Precio que pide el propietario</Label>
        <Input
          id="cap-precio"
          inputMode="numeric"
          placeholder="$ 0"
          value={conPuntos(f.precio_propietario)}
          onChange={(e) => set("precio_propietario")(soloDigitos(e.target.value))}
        />
        {captacion?.precio_publicado ? (
          <p className="text-muted-foreground text-xs">
            Publicado en {Number(captacion.precio_publicado).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cap-estado">Estado</Label>
        <Select value={f.estado} onValueChange={set("estado")}>
          <SelectTrigger id="cap-estado" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_CAPTACION.map((e) => (
              <SelectItem key={e.valor} value={e.valor}>{e.etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {eligeAgente ? (
        <div className="grid gap-1.5">
          <Label htmlFor="cap-agente">Captador</Label>
          <Select value={f.agente || "yo"} onValueChange={(v) => set("agente")(v === "yo" ? "" : v)}>
            <SelectTrigger id="cap-agente" className="w-full">
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
        <Label htmlFor="cap-notas">Notas</Label>
        <Textarea
          id="cap-notas"
          rows={3}
          maxLength={4000}
          value={f.notas}
          onChange={(e) => set("notas")(e.target.value)}
          placeholder="Llaves, horarios de visita, condiciones del propietario…"
        />
      </div>

      <Button type="submit" disabled={guardar.isPending || pctInvalido || fechasInvalidas}>
        {guardar.isPending ? "Guardando…" : captacion ? "Guardar cambios" : "Registrar captación"}
      </Button>
    </form>
  );
}

function Documentos({ captacion }) {
  const queryClient = useQueryClient();
  const input = useRef(null);
  const [tipo, setTipo] = useState("cedula");
  const [borrar, setBorrar] = useState(null);
  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-captaciones"] });

  const subir = useMutation({
    mutationFn: (archivo) => subirDocumento(captacion.id, archivo, tipo),
    onSuccess: () => {
      toast.success("Documento subido.");
      refrescar();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => {
      if (input.current) input.current.value = "";
    },
  });
  const descargar = useMutation({
    mutationFn: (doc) => descargarDocumento(captacion.id, doc),
    onError: (err) => toast.error(err.message),
  });
  const eliminar = useMutation({
    mutationFn: (doc) => eliminarDocumento(captacion.id, doc.id),
    onSuccess: () => {
      toast.success("Documento eliminado.");
      setBorrar(null);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <section className="grid gap-3" aria-labelledby="docs-titulo">
      <div>
        <h3 id="docs-titulo" className="font-medium">Documentos</h3>
        <p className="text-muted-foreground text-xs">
          Privados: solo los ve quien tiene acceso a esta captación. PDF, JPG, PNG o WEBP, máx. 10 MB.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="min-w-0 flex-1" aria-label="Tipo de documento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_DOCUMENTO.map((t) => (
              <SelectItem key={t.valor} value={t.valor}>{t.etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          ref={input}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          id={`doc-${captacion.id}`}
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (!archivo) return;
            if (archivo.size > 10 * 1024 * 1024) {
              toast.error("El archivo pesa más de 10 MB.");
              e.target.value = "";
              return;
            }
            subir.mutate(archivo);
          }}
        />
        <Button type="button" variant="outline" disabled={subir.isPending} onClick={() => input.current?.click()}>
          <UploadIcon /> {subir.isPending ? "Subiendo…" : "Subir"}
        </Button>
      </div>

      <ul className="grid gap-2">
        {captacion.documentos.map((d) => (
          <li key={d.id} className="flex items-center gap-3 rounded-lg border p-2.5 text-sm">
            <FileTextIcon className="text-muted-foreground size-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{d.nombre_archivo}</p>
              <p className="text-muted-foreground text-xs">
                {ETIQUETA_DOCUMENTO[d.tipo]} · {textoTamano(d.tamano_bytes)} · {formatoFecha(d.created_at)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Descargar ${d.nombre_archivo}`}
              disabled={descargar.isPending}
              onClick={() => descargar.mutate(d)}
            >
              <DownloadIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={`Eliminar ${d.nombre_archivo}`}
              onClick={() => setBorrar(d)}
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
        {captacion.documentos.length === 0 ? (
          <li className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
            Sin documentos. Sube la cédula, el certificado de tradición y el contrato de mandato.
          </li>
        ) : null}
      </ul>
      {captacion.documentos.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {["cedula", "certificado_tradicion", "contrato_mandato"]
            .filter((t) => !captacion.documentos.some((d) => d.tipo === t))
            .map((t) => (
              <Badge key={t} variant="outline">Falta: {ETIQUETA_DOCUMENTO[t]}</Badge>
            ))}
        </div>
      ) : null}

      <ConfirmDialog
        abierto={!!borrar}
        titulo="¿Eliminar el documento?"
        descripcion={`Se borra «${borrar?.nombre_archivo}» de forma permanente.`}
        confirmarTexto="Eliminar"
        cancelando={eliminar.isPending}
        onCancelar={() => setBorrar(null)}
        onConfirmar={() => eliminar.mutate(borrar)}
      />
    </section>
  );
}
