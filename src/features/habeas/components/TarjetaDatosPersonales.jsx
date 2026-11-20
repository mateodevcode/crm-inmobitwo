// Ficha de contacto → derechos del titular (Ley 1581): autorización,
// acceso (descargar sus datos), supresión y enlace al registro.
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
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
import { actualizarAutorizacion, exportarDatosContacto, suprimirContacto } from "@/features/habeas/api.js";
import { MOTIVOS_SUPRESION, ORIGENES, textoOrigen } from "@/features/habeas/textos.js";
import { descargarArchivo, hoyBogota } from "@/utils/csv.js";
import { formatoFechaHora } from "@/utils/fechas.js";

const PALABRA = "SUPRIMIR";

export function TarjetaDatosPersonales({ contacto }) {
  const { espacio, puedeAdministrar } = useContext(WorkspaceContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [origen, setOrigen] = useState("verbal");
  const [suprimir, setSuprimir] = useState(false);
  const [motivo, setMotivo] = useState("solicitud_titular");
  const [confirmacion, setConfirmacion] = useState("");
  const autorizado = !!contacto.autorizacion_datos_at;

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-contacto", espacio, String(contacto.id)] });

  const autorizacion = useMutation({
    mutationFn: (valor) => actualizarAutorizacion(contacto.id, { autorizado: valor, origen: valor ? origen : undefined }),
    onSuccess: (_, valor) => {
      toast.success(valor ? "Autorización registrada." : "Autorización retirada.");
      refrescar();
    },
    onError: (e) => toast.error(e.message),
  });

  const exportar = useMutation({
    mutationFn: () => exportarDatosContacto(contacto.id),
    onSuccess: (datos) => {
      descargarArchivo(
        `datos-contacto-${contacto.id}-${hoyBogota()}.json`,
        JSON.stringify(datos, null, 2),
        "application/json;charset=utf-8",
      );
      toast.success("Datos descargados. La consulta quedó registrada.");
    },
    onError: (e) => toast.error(e.message),
  });

  const borrar = useMutation({
    mutationFn: () => suprimirContacto(contacto.id, motivo),
    onSuccess: () => {
      toast.success("Datos suprimidos. Quedó constancia en el registro.");
      queryClient.invalidateQueries({ queryKey: ["crm-contactos"] });
      navigate("/contactos", { replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  const cerrarSupresion = () => {
    if (borrar.isPending) return;
    setSuprimir(false);
    setConfirmacion("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
        <CardDescription>
          Ley 1581 de 2012 (Habeas Data): autorización y derechos de acceso, rectificación y supresión. Para rectificar,
          edita el contacto desde Contactos.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-start gap-3">
          {autorizado ? (
            <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <ShieldOffIcon className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden="true" />
          )}
          <div className="grid gap-0.5">
            <p className="font-medium">{autorizado ? "Autorizó el tratamiento de sus datos" : "Sin autorización registrada"}</p>
            <p className="text-muted-foreground">
              {autorizado
                ? `${formatoFechaHora(contacto.autorizacion_datos_at)} · ${textoOrigen(contacto.autorizacion_origen)}`
                : "Pide y registra su autorización antes de enviarle publicidad u ofertas."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          {autorizado ? (
            <Button variant="outline" disabled={autorizacion.isPending} onClick={() => autorizacion.mutate(false)}>
              Retirar autorización
            </Button>
          ) : (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="origen-autorizacion">Cómo la dio</Label>
                <Select value={origen} onValueChange={setOrigen}>
                  <SelectTrigger id="origen-autorizacion" className="w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGENES.map((o) => (
                      <SelectItem key={o.valor} value={o.valor}>{o.etiqueta}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={autorizacion.isPending} onClick={() => autorizacion.mutate(true)}>
                Registrar autorización
              </Button>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button variant="outline" disabled={exportar.isPending} onClick={() => exportar.mutate()}>
            <DownloadIcon /> {exportar.isPending ? "Preparando…" : "Descargar sus datos"}
          </Button>
          {puedeAdministrar ? (
            <>
              <Button variant="ghost" asChild>
                <Link to={`/habeas-data?contacto=${contacto.id}`}>Ver registro</Link>
              </Button>
              <Button variant="destructive" className="ml-auto" onClick={() => setSuprimir(true)}>
                <Trash2Icon /> Suprimir datos
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>

      <Dialog open={suprimir} onOpenChange={(v) => !v && cerrarSupresion()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suprimir los datos de {contacto.nombre}</DialogTitle>
            <DialogDescription>
              Se borran para siempre el contacto, sus actividades, tareas, oportunidades, visitas y demandas, y se anonimiza
              la solicitud del portal de la que salió. Las captaciones quedan sin propietario. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="motivo-supresion">Motivo</Label>
              <Select value={motivo} onValueChange={setMotivo}>
                <SelectTrigger id="motivo-supresion" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_SUPRESION.map((m) => (
                    <SelectItem key={m.valor} value={m.valor}>{m.etiqueta}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmar-supresion">Escribe {PALABRA} para confirmar</Label>
              <Input
                id="confirmar-supresion"
                value={confirmacion}
                autoComplete="off"
                onChange={(e) => setConfirmacion(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cerrarSupresion} disabled={borrar.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={confirmacion.trim().toUpperCase() !== PALABRA || borrar.isPending}
              onClick={() => borrar.mutate()}
            >
              {borrar.isPending ? "Suprimiendo…" : "Suprimir para siempre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
