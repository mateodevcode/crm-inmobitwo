import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerUsuarios({ q, pagina, limite }) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
  });
  if (q) params.set("q", q);
  const res = await apiBackend(`/usuarios?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar los usuarios.");
  return res;
}

export async function desbloquearUsuario(id) {
  const res = await apiBackend(`/usuarios/${id}/desbloquear`, "PATCH");
  if (!res.success) throw new Error(res.error || "No se pudo desbloquear.");
  return res.data;
}
