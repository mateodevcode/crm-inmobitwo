import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { apiBackend } from "@/api/apiBackend.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import Paso1 from "@/features/propiedades/wizard/Paso1.jsx";
import Paso2 from "@/features/propiedades/wizard/Paso2.jsx";
import Paso3 from "@/features/propiedades/wizard/Paso3.jsx";
import { FORM_INICIAL, mapearApi } from "@/features/propiedades/wizard/formInit.js";
import {
  guardarProgreso,
  guardarSnapshot,
  leerProgreso,
  leerSnapshot,
  limpiarTodo,
} from "@/features/propiedades/wizard/progreso.js";
import {
  actualizarPropiedad,
  crearPublicacion,
  cuerpoPropiedad,
  guardarCaractsProp,
  obtenerCaractsProp,
  obtenerPropiedad,
} from "@/features/propiedades/wizard/api.js";
import { normalizarTelefonoColombia } from "@/utils/telefono.js";

const PASOS = ["Datos", "Detalles", "Fotos"];

export default function WizardPage() {
  const { id } = useParams();
  const esEdicion = id != null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const { usuario } = useContext(AuthContext);
  const { organizacion, esPersonal } = useContext(WorkspaceContext);

  const [paso, setPaso] = useState(() => {
    const p = Number(params.get("paso"));
    return Number.isInteger(p) && p >= 0 && p <= 2 ? p : 0;
  });
  // Progreso guardado (solo al crear): se restaura una vez al montar.
  const [progresoInicial] = useState(() => (esEdicion ? null : leerProgreso()));
  const [modalContinuar, setModalContinuar] = useState(() => !!progresoInicial?.id);
  const [form, setForm] = useState(() => {
    const base = { ...FORM_INICIAL, contactName: usuario?.name ?? "" };
    if (!esEdicion) {
      const snap = leerSnapshot();
      if (snap) return { ...base, ...snap };
    }
    return base;
  });

  // Retomar paso guardado (sin id creado) al montar.
  useEffect(() => {
    if (esEdicion || !progresoInicial || progresoInicial.id || modalContinuar) return;
    if (progresoInicial.step === 1 || progresoInicial.step === 0) {
      queueMicrotask(() => setPaso(progresoInicial.step));
    }
  }, [esEdicion, progresoInicial, modalContinuar]);

  const [featuresSel, setFeaturesSel] = useState([]);
  const [telsPaso1, setTelsPaso1] = useState([]);
  const [anuncioId, setAnuncioId] = useState(id ?? null);
  const [principal, setPrincipal] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [galeriaActual, setGaleriaActual] = useState([]);
  const [quitarOrdenes, setQuitarOrdenes] = useState([]);

  // Autosave pasos 0-1 (igual que el portal, cada 500ms).
  useEffect(() => {
    if (esEdicion || modalContinuar || paso >= 2) return undefined;
    const t = setTimeout(() => {
      guardarSnapshot(form);
      guardarProgreso({ id: anuncioId, step: paso });
    }, 500);
    return () => clearTimeout(t);
  });

  // Cada paso arranca arriba del todo.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [paso]);

  // Precarga en edición.
  const detalleQ = useQuery({
    queryKey: ["wiz-detalle", id],
    queryFn: () => obtenerPropiedad(id),
    enabled: esEdicion,
  });
  useEffect(() => {
    if (!detalleQ.data) return;
    (async () => {
      const d = detalleQ.data;
      setForm(mapearApi({ ...FORM_INICIAL, contactName: usuario?.name ?? "" }, d));
      const fotos = d.galeria ?? [];
      const mejores = new Map();
      for (const ft of fotos) {
        if (!mejores.has(ft.orden)) mejores.set(ft.orden, ft);
      }
      setGaleriaActual([...mejores.values()]);
      try {
        const caracts = await obtenerCaractsProp(id);
        const planosSel = Object.values(caracts ?? {}).flat().map((c) => c.id ?? c.feature_id).filter(Boolean);
        setFeaturesSel(planosSel);
      } catch {
        /* sin características previas: se empieza vacío */
      }
      setAnuncioId(d.id);
    })();
  }, [detalleQ.data, id, usuario?.name]);

  // Org por defecto según espacio (diferido tras el render).
  useEffect(() => {
    if (!esPersonal && organizacion && !esEdicion) {
      queueMicrotask(() => {
        setForm((f) =>
          f.organizacion_id
            ? f
            : { ...f, es_de_organizacion: true, organizacion_id: String(organizacion.id) },
        );
      });
    }
  }, [esPersonal, organizacion, esEdicion]);

  const listo = !esEdicion || detalleQ.data;

  const guardarPaso2 = async () => {
    if (!form.precio || Number(form.precio) <= 0) {
      toast.error("Indique el precio del inmueble.");
      throw new Error("Falta el precio.");
    }
    if (telsPaso1.length > 0) {
      try {
        await apiBackend(`/usuarios/${usuario.id}`, "PATCH", { telefonos: telsPaso1 });
      } catch {
        /* best-effort: no bloquea la publicación */
      }
    }
    const cuerpo = {
      ...cuerpoPropiedad(form),
      estado: "publicado",
      publicado_por_id: usuario.id,
      telefono_contacto: form.telefono_contacto || telsPaso1[0] || "",
    };
    // Claves solo-UI que el backend no espera.
    delete cuerpo.operacion;
    delete cuerpo.contactName;
    delete cuerpo.telefonos;
    delete cuerpo.featuresSel;
    // Número + complemento se guardan juntos en numero_direccion.
    if (cuerpo.complemento) {
      cuerpo.numero_direccion = `${cuerpo.numero_direccion ?? ""} ${cuerpo.complemento}`.trim();
    }
    delete cuerpo.complemento;
    if (cuerpo.es_de_organizacion && !cuerpo.organizacion_id && organizacion && !esPersonal) {
      cuerpo.organizacion_id = organizacion.id;
    }
    let pid = anuncioId;
    if (esEdicion || pid) {
      // En edición el precio va suelto (compatibilidad Fase 4 del PATCH).
      await actualizarPropiedad(pid, cuerpo);
    } else {
      // Al crear, la oferta vive en property_listings (Fase 4): venta exige
      // precio, alquiler exige precio + rental_type_id.
      const oferta = { operation: form.operacion, operation_type_id: form.operation_type_id };
      if (form.precio !== "" && form.precio != null) oferta.precio = Number(form.precio);
      if (form.operacion !== "venta" && form.rental_type_id) {
        oferta.rental_type_id = Number(form.rental_type_id);
      }
      if (form.administracion !== "" && form.administracion != null) {
        oferta.administracion = Number(form.administracion);
      }
      cuerpo.ofertas = JSON.stringify([oferta]);
      delete cuerpo.precio;
      delete cuerpo.administracion;
      const creado = await crearPublicacion(cuerpo, {});
      pid = creado?.id ?? creado?.propiedad_id ?? null;
      if (!pid) throw new Error("No se obtuvo el id del anuncio.");
      setAnuncioId(pid);
    }
    try {
      await guardarCaractsProp(
        pid,
        featuresSel.map((fid) => ({ feature_id: fid, bool_value: true })),
      );
    } catch {
      /* best-effort: no bloquea */
    }
    return pid;
  };

  const mGuardar = useMutation({
    mutationFn: guardarPaso2,
    onSuccess: (pid) => {
      queryClient.invalidateQueries({ queryKey: ["crm-propiedades"] });
      if (!esEdicion) guardarProgreso({ id: pid, step: 2 });
      setPaso(2);
    },
    onError: (err) => toast.error(err.message),
  });

  const finalizarFotos = async (conFotos) => {
    if (!anuncioId) {
      toast.error("Guarde los detalles primero.");
      return;
    }
    const archivos = {
      principal: principal?.file ?? null,
      galeria: galeria.map((g) => g.file),
      planos: planos.map((p) => p.file),
    };
    if (conFotos && (archivos.principal || archivos.galeria.length > 0 || archivos.planos.length > 0)) {
      await actualizarPropiedad(
        anuncioId,
        {},
        archivos,
        quitarOrdenes.length > 0 ? { imagesToDelete: JSON.stringify(quitarOrdenes) } : {},
      );
    }
    queryClient.invalidateQueries({ queryKey: ["crm-propiedades"] });
    if (!esEdicion) limpiarTodo();
    toast.success(esEdicion ? "Anuncio actualizado." : "Anuncio publicado.");
    navigate("/propiedades");
  };

  const mFotos = useMutation({
    mutationFn: () => finalizarFotos(true),
    onError: (err) => toast.error(err.message),
  });

  if (!listo) {
    return (
      <>
        <PageHeader titulo={esEdicion ? "Editar inmueble" : "Nuevo inmueble"} descripcion="" />
        <p className="text-muted-foreground text-sm">Cargando…</p>
      </>
    );
  }

  const empezarNuevo = () => {
    limpiarTodo();
    setModalContinuar(false);
    setForm({ ...FORM_INICIAL, contactName: usuario?.name ?? "" });
    setFeaturesSel([]);
    setTelsPaso1([]);
    setAnuncioId(null);
    setPrincipal(null);
    setGaleria([]);
    setPlanos([]);
    setGaleriaActual([]);
    setQuitarOrdenes([]);
    setPaso(0);
  };

  return (
    <>
      <PageHeader
        titulo={esEdicion ? `Editar inmueble ${id}` : "Nuevo inmueble"}
        descripcion="Wizard completo: datos, detalles y fotos."
      />
      <div className="mb-6 flex gap-2">
        {PASOS.map((p, i) => (
          <Button
            key={p}
            size="sm"
            variant={i === paso ? "default" : "outline"}
            onClick={() => {
              if (i < paso || (i === 2 && anuncioId)) setPaso(i);
            }}
          >
            {i + 1}. {p}
          </Button>
        ))}
      </div>

      <Dialog open={modalContinuar} onOpenChange={(v) => !v && setModalContinuar(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiene un anuncio sin terminar</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Quedó en el paso {((progresoInicial?.step ?? 0) + 1)} de 3. ¿Desea continuarlo o empezar uno nuevo?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={empezarNuevo}>
              Empezar nuevo
            </Button>
            <Button
              onClick={() => {
                const pid = progresoInicial.id;
                const step = progresoInicial.step ?? 2;
                setModalContinuar(false);
                limpiarTodo();
                navigate(`/propiedades/${pid}/editar?paso=${step}`);
              }}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {paso === 0 ? (
        <Paso1
          form={form}
          set={setForm}
          siguiente={({ tels }) => {
            setTelsPaso1(tels.map((t) => normalizarTelefonoColombia(t)).filter(Boolean));
            setPaso(1);
          }}
        />
      ) : null}
      {paso === 1 ? (
        <Paso2
          form={form}
          set={setForm}
          featuresSel={featuresSel}
          setFeaturesSel={setFeaturesSel}
          atras={() => setPaso(0)}
          guardar={() => mGuardar.mutate()}
          guardando={mGuardar.isPending}
        />
      ) : null}
      {paso === 2 ? (
        <Paso3
          galeriaActual={galeriaActual}
          onQuitarActual={(orden) => {
            setGaleriaActual((g) => g.filter((f) => f.orden !== orden));
            setQuitarOrdenes((q) => [...q, orden]);
          }}
          principal={principal}
          setPrincipal={setPrincipal}
          galeria={galeria}
          setGaleria={setGaleria}
          planos={planos}
          setPlanos={setPlanos}
          atras={() => setPaso(1)}
          finalizar={() => mFotos.mutate()}
          finalizando={mFotos.isPending}
          omitir={() => finalizarFotos(false)}
        />
      ) : null}
    </>
  );
}
