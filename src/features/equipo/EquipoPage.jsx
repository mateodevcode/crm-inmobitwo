// /equipo (solo admin de inmobiliaria): miembros, reparto de leads y metas.
import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PageHeader } from "@/components/comunes/PageHeader.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { MiembrosTab } from "@/features/equipo/components/MiembrosTab.jsx";
import { RepartoTab } from "@/features/equipo/components/RepartoTab.jsx";
import { MetasTab } from "@/features/equipo/components/MetasTab.jsx";

const PESTANAS = ["miembros", "reparto", "metas"];

export default function EquipoPage() {
  const { organizacion } = useContext(WorkspaceContext);
  const [params, setParams] = useSearchParams();
  const tab = PESTANAS.includes(params.get("tab")) ? params.get("tab") : "miembros";

  return (
    <>
      <PageHeader titulo="Equipo" descripcion={`Miembros, reparto de leads y metas de ${organizacion?.nombre ?? "la inmobiliaria"}.`} />
      <Tabs
        value={tab}
        onValueChange={(v) => {
          params.set("tab", v);
          setParams(params, { replace: true });
        }}
      >
        <TabsList>
          <TabsTrigger value="miembros">Miembros</TabsTrigger>
          <TabsTrigger value="reparto">Reparto de leads</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
        </TabsList>
        <TabsContent value="miembros" className="grid gap-4 pt-2">
          <MiembrosTab />
        </TabsContent>
        <TabsContent value="reparto" className="pt-2">
          <RepartoTab />
        </TabsContent>
        <TabsContent value="metas" className="pt-2">
          <MetasTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
