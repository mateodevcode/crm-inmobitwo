// src/context/WorkspaceProvider.jsx — espacio personal | org:{id}
// Fuente: GET /organizaciones/mias (membresías activas) + filtro aprobado.
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { apiBackend, CLAVE_ESPACIO, obtenerEspacio } from "@/api/apiBackend.js";
import {
  ESPACIO_PERSONAL,
  esEspacioOrg,
  idDeEspacioOrg,
} from "@/context/espacio.js";

export function WorkspaceProvider({ children }) {
  const { estaAutenticado } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [cargandoOrgs, setCargandoOrgs] = useState(true);
  const [espacioGuardado, setEspacioGuardado] = useState(() => obtenerEspacio());

  const fijarEspacio = useCallback((nuevo) => {
    localStorage.setItem(CLAVE_ESPACIO, nuevo);
    setEspacioGuardado(nuevo);
  }, []);

  useEffect(() => {
    let vivo = true;
    if (!estaAutenticado) return undefined;
    (async () => {
      setCargandoOrgs(true);
      try {
        const res = await apiBackend("/organizaciones/mias");
        if (!vivo) return;
        const rows = res.success && Array.isArray(res.data) ? res.data : [];
        // Solo orgs aprobadas (el backend ya filtra membresía activa).
        const aprobadas = rows.filter((o) => o.estado === "aprobada");
        setOrganizaciones(aprobadas);
        // Si el espacio guardado ya no es válido, vuelve a personal.
        const actual = obtenerEspacio();
        if (actual !== ESPACIO_PERSONAL) {
          const id = idDeEspacioOrg(actual);
          const valido = aprobadas.some((o) => Number(o.id) === id);
          if (!valido) fijarEspacio(ESPACIO_PERSONAL);
        }
      } catch {
        if (vivo) setOrganizaciones([]);
      } finally {
        if (vivo) setCargandoOrgs(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [estaAutenticado, fijarEspacio]);

  const cambiarEspacio = useCallback(
    (nuevo) => {
      fijarEspacio(nuevo);
      queryClient.invalidateQueries();
    },
    [fijarEspacio, queryClient],
  );

  const valor = useMemo(() => {
    const espacio = estaAutenticado ? espacioGuardado : ESPACIO_PERSONAL;
    const orgs = estaAutenticado ? organizaciones : [];
    const organizacion = esEspacioOrg(espacio)
      ? (orgs.find((o) => Number(o.id) === idDeEspacioOrg(espacio)) ?? null)
      : null;
    // Si el id guardado no existe (ej. org suspendida), trata como personal.
    const espacioEfectivo =
      esEspacioOrg(espacio) && !organizacion ? ESPACIO_PERSONAL : espacio;
    const rolEnOrg = organizacion?.rol_en_org ?? null;
    return {
      espacio: espacioEfectivo,
      esPersonal: espacioEfectivo === ESPACIO_PERSONAL,
      organizaciones: orgs,
      organizacion,
      rolEnOrg,
      esAgente: rolEnOrg === "agent",
      puedeAdministrar:
        espacioEfectivo === ESPACIO_PERSONAL
          ? true
          : rolEnOrg === "agency_admin",
      cargandoOrgs: estaAutenticado ? cargandoOrgs : false,
      cambiarEspacio,
    };
  }, [espacioGuardado, organizaciones, cargandoOrgs, estaAutenticado, cambiarEspacio]);

  return (
    <WorkspaceContext.Provider value={valor}>
      {children}
    </WorkspaceContext.Provider>
  );
}
