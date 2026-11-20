// Tarjeta reutilizable de captaciones:
// - ficha del contacto: inmuebles de los que es propietario (filtros.propietario_id).
// - panel: mandatos por vencer (filtros.vence_en_dias).
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { obtenerCaptaciones } from "@/features/captaciones/api.js";
import { ListaCaptaciones } from "@/features/captaciones/components/ListaCaptaciones.jsx";
import { CaptacionSheet } from "@/features/captaciones/components/CaptacionSheet.jsx";

export function TarjetaCaptaciones({ titulo, filtros, vacio, ocultarPropietario = false, ocultarSiVacia = false }) {
  const { espacio } = useContext(WorkspaceContext);
  const [abierta, setAbierta] = useState(null);
  const q = useQuery({
    queryKey: ["crm-captaciones", espacio, "tarjeta", filtros],
    queryFn: () => obtenerCaptaciones(filtros),
  });
  if (ocultarSiVacia && q.isSuccess && q.data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link to="/captaciones">Ver captaciones</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {q.isLoading ? <p className="text-muted-foreground text-sm">Cargando…</p> : null}
        {q.isError ? <p className="text-destructive text-sm">{q.error.message}</p> : null}
        {q.isSuccess ? (
          <ListaCaptaciones
            captaciones={q.data.slice(0, 8)}
            vacio={vacio}
            ocultarPropietario={ocultarPropietario}
            onElegir={(k) => setAbierta({ id: k.propiedad_id, titulo: k.propiedad_titulo })}
          />
        ) : null}
      </CardContent>
      <CaptacionSheet propiedad={abierta} onCerrar={() => setAbierta(null)} />
    </Card>
  );
}
