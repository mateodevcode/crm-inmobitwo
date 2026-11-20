// Panel: "Mis metas del mes" (solo en inmobiliarias y si el agente tiene metas).
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { obtenerMetas } from "@/features/equipo/api.js";
import { FilaMetas } from "@/features/equipo/components/MetasTab.jsx";

export function TarjetaMisMetas() {
  const { usuario } = useContext(AuthContext);
  const { espacio, esPersonal, puedeAdministrar } = useContext(WorkspaceContext);
  const q = useQuery({
    queryKey: ["equipo-metas", espacio, "mias"],
    queryFn: () => obtenerMetas(),
    enabled: !esPersonal,
  });
  const mia = q.data?.equipo?.find((a) => a.usuario_id === usuario?.id);
  if (esPersonal || !mia || mia.avance == null) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis metas del mes</CardTitle>
        {puedeAdministrar ? (
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link to="/equipo?tab=metas">Ver equipo</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <FilaMetas agente={mia} />
      </CardContent>
    </Card>
  );
}
