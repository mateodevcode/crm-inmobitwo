import { apiBackend } from "@/api/apiBackend.js";

export async function obtenerPortada() {
  const res = await apiBackend("/portada");
  if (!res.success) throw new Error(res.error || "No se pudo cargar la portada.");
  return res.data;
}

export async function buscarAnuncios({ q, pagina, limite }) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
  });
  if (q) params.set("q", q);
  const res = await apiBackend(`/portada/buscar?${params.toString()}`);
  if (!res.success) throw new Error(res.error || "No se pudieron buscar anuncios.");
  return res;
}

export async function obtenerDetalleAnuncio(id) {
  const res = await apiBackend(`/propiedades/${id}`);
  if (!res.success) throw new Error(res.error || "No se pudo cargar el anuncio.");
  return res.data;
}

export async function guardarPortada({ propiedad_id, imagen_url }) {
  const res = await apiBackend("/portada", "PUT", { propiedad_id, imagen_url });
  if (!res.success) throw new Error(res.error || "No se pudo guardar la portada.");
  return res.data;
}
