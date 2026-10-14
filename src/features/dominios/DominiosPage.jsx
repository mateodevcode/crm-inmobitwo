import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { EmptyState } from "@/components/comunes/EmptyState.jsx";
import { EstadoBadge } from "@/components/comunes/EstadoBadge.jsx";
import { ConfirmDialog } from "@/components/comunes/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import {
  ejecutarAgregar,
  ejecutarQuitar,
  obtenerJob,
  obtenerJobs,
  obtenerSolicitudes,
} from "@/features/dominios/api.js";

// Poll del job cada 2s mientras está en curso.
function useJobEnVivo(jobId) {
  return useQuery({
    queryKey: ["dominio-job", jobId],
    queryFn: () => obtenerJob(jobId),
    enabled: jobId != null,
    refetchInterval: (query) => {
      const estado = query.state.data?.estado;
      return estado === "pendiente" || estado === "ejecutando" ? 2000 : false;
    },
  });
}

function LogJob({ job }) {
  if (!job) return null;
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          Ejecución #{job.id} · {job.tipo} {job.dominio} · <EstadoBadge estado={job.estado} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-80 overflow-auto rounded bg-black p-3 font-mono text-xs whitespace-pre-wrap text-green-300">
          {job.log || "Iniciando…"}
        </pre>
      </CardContent>
    </Card>
  );
}

export default function DominiosPage() {
  const queryClient = useQueryClient();
  const [elegida, setElegida] = useState(null);
  const [dominio, setDominio] = useState("");
  const [conWww, setConWww] = useState(true);
  const [baja, setBaja] = useState(null);
  const [jobId, setJobId] = useState(null);

  const solQ = useQuery({ queryKey: ["dominios-solicitudes"], queryFn: obtenerSolicitudes });
  const jobsQ = useQuery({ queryKey: ["dominios-jobs"], queryFn: () => obtenerJobs(20) });
  const jobQ = useJobEnVivo(jobId);

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["dominios-solicitudes"] });
    queryClient.invalidateQueries({ queryKey: ["dominios-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
  };

  const mAgregar = useMutation({
    mutationFn: () => ejecutarAgregar({ organizacion_id: elegida.id, dominio: dominio.trim(), con_www: conWww }),
    onSuccess: (job) => {
      toast.success(`Ejecución #${job.id} iniciada en el VPS.`);
      setElegida(null);
      setJobId(job.id);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });
  const mQuitar = useMutation({
    mutationFn: () => ejecutarQuitar({ organizacion_id: baja.id }),
    onSuccess: (job) => {
      toast.success(`Baja #${job.id} iniciada en el VPS.`);
      setBaja(null);
      setJobId(job.id);
      refrescar();
    },
    onError: (err) => toast.error(err.message),
  });

  const solicitudes = solQ.data ?? [];
  const jobs = jobsQ.data ?? [];

  const abrirAgregar = (o) => {
    setElegida(o);
    setDominio((o.custom_domain ?? "").replace(/^www\./, ""));
    setConWww(true);
  };

  return (
    <>
      <PageHeader
        titulo="Dominios"
        descripcion="Alta y baja de dominios propios en el VPS (nginx + SSL). Al terminar en OK, la BD se actualiza sola. Solo superadmin."
      />

      <h2 className="mb-2 font-semibold">Solicitudes</h2>
      {solQ.isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : solicitudes.length === 0 ? (
        <EmptyState titulo="Sin solicitudes" descripcion="Ninguna inmobiliaria aprobada tiene dominio solicitado." />
      ) : (
        <div className="grid gap-3">
          {solicitudes.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {o.nombre} <span className="text-muted-foreground text-xs">ID {o.id}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {o.custom_domain ?? "—"} · <EstadoBadge estado={o.dominio_estado} />
                    {o.ultimo_job ? ` · último job #${o.ultimo_job_id}: ${o.ultimo_job}` : null}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Antes de ejecutar: registre el dominio en Cloudflare apuntando al VPS.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => abrirAgregar(o)}>
                    Configurar en VPS
                  </Button>
                  {o.custom_domain ? (
                    <Button size="sm" variant="destructive" onClick={() => setBaja(o)}>
                      Dar de baja
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LogJob job={jobQ.data} />

      <h2 className="mt-6 mb-2 font-semibold">Historial</h2>
      {jobsQ.isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin ejecuciones todavía.</p>
      ) : (
        <div className="grid gap-2">
          {jobs.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => setJobId(j.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm hover:bg-muted"
            >
              <span>
                #{j.id} · {j.tipo} <strong>{j.dominio}</strong> · {j.organizacion_nombre ?? `org ${j.organizacion_id ?? "—"}`}
              </span>
              <EstadoBadge estado={j.estado} />
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!elegida} onOpenChange={(v) => !v && setElegida(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar dominio de {elegida?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="midominio.com"
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={conWww} onCheckedChange={(v) => setConWww(!!v)} />
              Incluir www (midominio.com + www.midominio.com)
            </label>
            <p className="text-muted-foreground text-xs">
              Verifica DNS, crea el bloque nginx, emite el SSL y al terminar marca el dominio
              como activo en la BD. Tarda unos minutos; puede seguir navegando.
            </p>
            <Button disabled={!dominio.trim() || mAgregar.isPending} onClick={() => mAgregar.mutate()}>
              {mAgregar.isPending ? "Iniciando…" : "Ejecutar en el VPS"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        abierto={!!baja}
        titulo="Dar de baja el dominio"
        descripcion={`Se eliminará nginx + SSL de "${baja?.custom_domain}" y la BD volverá a sin dominio.`}
        confirmarTexto="Ejecutar baja"
        onCancelar={() => setBaja(null)}
        onConfirmar={() => mQuitar.mutate()}
      />
    </>
  );
}
