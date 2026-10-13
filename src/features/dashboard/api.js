import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerDashboard() {
  const res = await apiBackend("/crm/dashboard");
  if (!res.success) throw new Error(res.error || "No se pudo cargar el panel.");
  return res.data;
}
