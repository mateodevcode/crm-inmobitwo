// Importar contactos o inmuebles desde Excel (.xlsx) o CSV:
// archivo → columnas → revisión (simulada en el backend) → importar.
import { useContext, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, FileSpreadsheetIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { importar } from "@/features/importacion/api.js";
import { CAMPOS, EJEMPLO, MAXIMO, construirFilas, leerArchivo, mapearEncabezados } from "@/features/importacion/columnas.js";
import { ResumenImportacion, TablaResultados } from "@/features/importacion/components/TablaResultados.jsx";
import { aCsv, descargarArchivo, hoyBogota } from "@/utils/csv.js";

const NINGUNA = "ninguna";

export default function ImportarPage() {
  const { espacio, esAgente } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const tipo = params.get("tipo") === "inmuebles" ? "inmuebles" : "contactos";
  const campos = CAMPOS[tipo];
  const inputRef = useRef(null);

  const [archivo, setArchivo] = useState(null); // { nombre, encabezados, filas }
  const [mapa, setMapa] = useState({});
  const [modo, setModo] = useState("omitir");
  const [autorizacion, setAutorizacion] = useState(false);
  const [previa, setPrevia] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [leyendo, setLeyendo] = useState(false);

  // Al cambiar de espacio la vista previa ya no vale (los duplicados dependen del espacio).
  const [espacioVisto, setEspacioVisto] = useState(espacio);
  if (espacioVisto !== espacio) {
    setEspacioVisto(espacio);
    setPrevia(null);
    setResultado(null);
  }

  const reiniciar = () => {
    setArchivo(null);
    setMapa({});
    setPrevia(null);
    setResultado(null);
    setAutorizacion(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const cambiarTipo = (t) => {
    reiniciar();
    setParams({ tipo: t }, { replace: true });
  };

  const alElegir = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPrevia(null);
    setResultado(null);
    setLeyendo(true);
    try {
      const leido = await leerArchivo(f);
      if (leido.filas.length > MAXIMO[tipo]) {
        throw new Error(`El archivo tiene ${leido.filas.length} filas; el máximo es ${MAXIMO[tipo]}. Divídelo en varios archivos.`);
      }
      setArchivo({ nombre: f.name, ...leido });
      setMapa(mapearEncabezados(leido.encabezados, campos));
    } catch (err) {
      setArchivo(null);
      toast.error(err.message || "No se pudo leer el archivo.");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLeyendo(false);
    }
  };

  const cuerpo = (simular) => ({
    filas: construirFilas(archivo.filas, mapa),
    simular,
    ...(tipo === "contactos" ? { modo, autorizacion_confirmada: autorizacion } : {}),
  });

  const revisar = useMutation({
    mutationFn: () => importar(tipo, cuerpo(true)),
    onSuccess: setPrevia,
    onError: (e) => toast.error(e.message),
  });

  const ejecutar = useMutation({
    mutationFn: () => importar(tipo, cuerpo(false)),
    onSuccess: (data) => {
      setResultado(data);
      setPrevia(null);
      queryClient.invalidateQueries({ queryKey: tipo === "contactos" ? ["crm-contactos"] : ["crm-propiedades"] });
      const r = data.resumen;
      toast.success(`Importación lista: ${r.creados} creados${r.actualizados ? `, ${r.actualizados} actualizados` : ""}.`);
    },
    onError: (e) => toast.error(e.message),
  });

  const cambiarMapa = (clave, valor) => {
    setMapa((m) => ({ ...m, [clave]: valor === NINGUNA ? null : Number(valor) }));
    setPrevia(null);
  };

  const plantilla = () =>
    descargarArchivo(
      `plantilla-${tipo}.csv`,
      aCsv([EJEMPLO[tipo]], campos.map((c) => ({ clave: c.clave, titulo: c.titulo }))),
    );

  const descargarProblemas = () => {
    const filas = resultado.filas.filter((f) => f.resultado === "error" || f.resultado === "omitido");
    descargarArchivo(
      `importacion-${tipo}-revisar-${hoyBogota()}.csv`,
      aCsv(filas, [
        { clave: "fila", titulo: "Fila del archivo" },
        { clave: "resultado", titulo: "Resultado" },
        { clave: "mensaje", titulo: "Detalle" },
      ]),
    );
  };

  const faltantes = campos.filter((c) => c.requerido && mapa[c.clave] == null);
  const importables = previa ? previa.resumen.creados + previa.resumen.actualizados : 0;
  const ejemplo = archivo?.filas[0]?.f ?? [];

  return (
    <>
      <PageHeader
        titulo="Importar"
        descripcion="Trae tus contactos o tu cartera desde Excel o CSV."
        acciones={
          <Button variant="outline" onClick={plantilla}>
            <DownloadIcon /> Plantilla de {tipo}
          </Button>
        }
      />

      <Tabs value={tipo} onValueChange={cambiarTipo}>
        <TabsList>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="inmuebles">Inmuebles</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>1. Archivo</CardTitle>
          <CardDescription>
            Excel (.xlsx, primera hoja) o CSV, con una fila de encabezados. Hasta {MAXIMO[tipo]} filas por archivo.
            {tipo === "inmuebles"
              ? " Los inmuebles quedan como borradores sin publicar y sin fotos: complétalos y publícalos desde Propiedades."
              : esAgente
                ? " Los contactos nuevos quedan asignados a ti."
                : " Los contactos nuevos quedan sin asignar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            id="archivo-importar"
            type="file"
            accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={alElegir}
          />
          <Button asChild variant="secondary" disabled={leyendo}>
            <label htmlFor="archivo-importar" className="cursor-pointer">
              <UploadIcon /> {leyendo ? "Leyendo…" : archivo ? "Cambiar archivo" : "Elegir archivo"}
            </label>
          </Button>
          {archivo ? (
            <p className="flex min-w-0 items-center gap-2 text-sm">
              <FileSpreadsheetIcon className="text-muted-foreground size-4 shrink-0" />
              <span className="truncate">{archivo.nombre}</span>
              <span className="text-muted-foreground shrink-0">· {archivo.filas.length} filas</span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {archivo && !resultado ? (
        <Card>
          <CardHeader>
            <CardTitle>2. Columnas</CardTitle>
            <CardDescription>Revisa qué columna de tu archivo corresponde a cada dato. Las marcadas con * son obligatorias.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {campos.map((c) => {
              const idx = mapa[c.clave];
              return (
                <div key={c.clave} className="grid gap-1.5">
                  <Label htmlFor={`col-${c.clave}`}>
                    {c.titulo}
                    {c.requerido ? " *" : ""}
                  </Label>
                  <Select value={idx == null ? NINGUNA : String(idx)} onValueChange={(v) => cambiarMapa(c.clave, v)}>
                    <SelectTrigger id={`col-${c.clave}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NINGUNA}>— No importar —</SelectItem>
                      {archivo.encabezados.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {h || `Columna ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground truncate text-xs">
                    {idx != null && ejemplo[idx] ? `Ej.: ${ejemplo[idx]}` : " "}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {archivo && !resultado ? (
        <Card>
          <CardHeader>
            <CardTitle>3. Revisión</CardTitle>
            <CardDescription>Validamos cada fila antes de guardar nada.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {tipo === "contactos" ? (
              <div className="grid gap-1.5 sm:max-w-sm">
                <Label htmlFor="modo-importar">Si el contacto ya existe (mismo correo o teléfono)</Label>
                <Select
                  value={modo}
                  onValueChange={(v) => {
                    setModo(v);
                    setPrevia(null);
                  }}
                >
                  <SelectTrigger id="modo-importar" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="omitir">Omitirlo</SelectItem>
                    <SelectItem value="actualizar">Completar sus datos vacíos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {faltantes.length ? (
              <p role="alert" className="text-destructive text-sm">
                Falta elegir la columna de: {faltantes.map((c) => c.titulo).join(", ")}.
              </p>
            ) : null}

            <div>
              <Button variant="outline" onClick={() => revisar.mutate()} disabled={faltantes.length > 0 || revisar.isPending}>
                {revisar.isPending ? "Revisando…" : previa ? "Revisar de nuevo" : "Revisar filas"}
              </Button>
            </div>

            {previa ? (
              <>
                <ResumenImportacion resumen={previa.resumen} simulado />
                <TablaResultados filas={previa.filas} simulado />
                {tipo === "contactos" ? (
                  <div className="flex items-start gap-2">
                    <Checkbox id="autorizacion" checked={autorizacion} onCheckedChange={(v) => setAutorizacion(!!v)} className="mt-0.5" />
                    <Label htmlFor="autorizacion" className="font-normal leading-snug">
                      Confirmo que estas personas autorizaron el tratamiento de sus datos personales (Ley 1581 de 2012).
                      Quedará registrado como autorización por importación.
                    </Label>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => ejecutar.mutate()}
                    disabled={importables === 0 || ejecutar.isPending || (tipo === "contactos" && !autorizacion)}
                  >
                    {ejecutar.isPending ? "Importando…" : `Importar ${importables} ${tipo === "contactos" ? "contactos" : "inmuebles"}`}
                  </Button>
                  {previa.resumen.errores ? (
                    <p className="text-muted-foreground text-sm">Las filas con error no se importan.</p>
                  ) : null}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {resultado ? (
        <Card>
          <CardHeader>
            <CardTitle>Importación terminada</CardTitle>
            <CardDescription>{archivo?.nombre}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ResumenImportacion resumen={resultado.resumen} simulado={false} />
            <TablaResultados filas={resultado.filas} simulado={false} />
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to={tipo === "contactos" ? "/contactos" : "/propiedades"}>
                  Ver {tipo === "contactos" ? "contactos" : "borradores"}
                </Link>
              </Button>
              {resultado.resumen.errores + resultado.resumen.omitidos > 0 ? (
                <Button variant="outline" onClick={descargarProblemas}>
                  <DownloadIcon /> Filas para revisar (CSV)
                </Button>
              ) : null}
              <Button variant="ghost" onClick={reiniciar}>
                Importar otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
