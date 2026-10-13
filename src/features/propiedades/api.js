import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerPropiedades({ pagina, limite, estado, q }) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
  });
  if (estado) params.set("estado", estado);
  if (q) params.set("q", q);
  const res = await apiBackend(`/crm/propiedades?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron cargar las propiedades.");
  return res;
}
