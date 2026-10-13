import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { obtenerDashboard } from "@/features/dashboard/api.js";

export function useDashboard() {
  const { espacio } = useContext(WorkspaceContext);
  return useQuery({
    queryKey: ["crm-dashboard", espacio],
    queryFn: obtenerDashboard,
  });
}
