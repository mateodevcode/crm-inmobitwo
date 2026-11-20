// /captaciones — acuerdos con propietarios: mandatos vigentes, por vencer y todos.
// Para registrar una captación nueva se parte del inmueble (Propiedades → Captación).
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { obtenerCaptaciones } from "@/features/captaciones/api.js";
import { ListaCaptaciones } from "@/features/captaciones/components/ListaCaptaciones.jsx";
import { CaptacionSheet } from "@/features/captaciones/components/CaptacionSheet.jsx";

const VISTAS = {
  vigentes: { filtros: { estado: "activa" }, vacio: "No hay captaciones activas." },
  vencer: { filtros: { vence_en_dias: 30 }, vacio: "Ningún mandato vence en los próximos 30 días." },
  captacion: { filtros: { estado: "en_captacion" }, vacio: "No hay inmuebles en proceso de captación." },
  todas: { filtros: {}, vacio: "Aún no hay captaciones. Regístralas desde Propiedades." },
};

export default function CaptacionesPage() {
  const { espacio } = useContext(WorkspaceContext);
  const [vista, setVista] = useState("vigentes");
  const [abierta, setAbierta] = useState(null);

  const q = useQuery({
    queryKey: ["crm-captaciones", espacio, "lista", vista],
    queryFn: () => obtenerCaptaciones(VISTAS[vista].filtros),
  });

  return (
    <>
      <PageHeader
        titulo="Captaciones"
        descripcion="Acuerdos con propietarios: mandato, vigencia, comisión y documentos."
        acciones={
          <Button asChild variant="outline">
            <Link to="/propiedades">Captar desde Propiedades</Link>
          </Button>
        }
      />
      <Tabs value={vista} onValueChange={setVista}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="vigentes">Activas</TabsTrigger>
          <TabsTrigger value="vencer">Por vencer</TabsTrigger>
          <TabsTrigger value="captacion">En captación</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>
      {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
      {q.isError ? <p role="alert" className="text-destructive text-sm">{q.error.message}</p> : null}
      {q.isSuccess ? (
        <ListaCaptaciones
          captaciones={q.data}
          vacio={VISTAS[vista].vacio}
          onElegir={(k) => setAbierta({ id: k.propiedad_id, titulo: k.propiedad_titulo })}
        />
      ) : null}
      <CaptacionSheet propiedad={abierta} onCerrar={() => setAbierta(null)} />
    </>
  );
}
