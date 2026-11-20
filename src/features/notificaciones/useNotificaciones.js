// Contador de avisos sin leer del espacio activo y acciones de lectura.
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { marcarLeida, marcarTodasLeidas, obtenerContador } from "@/features/notificaciones/api.js";

export function useContadorNotificaciones() {
  const { espacio } = useContext(WorkspaceContext);
  return useQuery({
    queryKey: ["crm-notif", "contador", espacio],
    queryFn: obtenerContador,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useLeerNotificaciones() {
  const queryClient = useQueryClient();
  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["crm-notif"] });
  const una = useMutation({ mutationFn: marcarLeida, onSuccess: refrescar });
  const todas = useMutation({ mutationFn: marcarTodasLeidas, onSuccess: refrescar });
  return { leerUna: una.mutate, leerTodas: todas.mutate, leyendoTodas: todas.isPending };
}
