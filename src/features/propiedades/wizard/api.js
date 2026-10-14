import { apiBackend } from "@/api/apiBackend.js";
import { apiBackendFormData } from "@/api/apiBackendFormData.js";

// Catálogos y geo (públicos)
export const getTiposInmueble = () =>
  apiBackend("/catalogos/tipos-inmueble").then((r) => {
    if (!r.success) throw new Error("No se cargaron los tipos.");
    return r.data;
  });
export const getOperaciones = () =>
  apiBackend("/catalogos/operaciones").then((r) => {
    if (!r.success) throw new Error("No se cargaron las operaciones.");
    return r.data;
  });
export const getEstados = () =>
  apiBackend("/catalogos/estados").then((r) => {
    if (!r.success) throw new Error("No se cargaron los estados.");
    return r.data;
  });
export const getTiposAlquiler = () =>
  apiBackend("/catalogos/tipos-alquiler").then((r) => {
    if (!r.success) throw new Error("No se cargaron los tipos de alquiler.");
    return r.data;
  });
export const getCaracteristicas = () =>
  apiBackend("/catalogos/caracteristicas").then((r) => {
    if (!r.success) throw new Error("No se cargaron las características.");
    return r.data;
  });
export const getStates = () =>
  apiBackend("/api/states?countryId=2").then((r) => {
    if (!r.success) throw new Error("No se cargaron los departamentos.");
    return r.data;
  });
export const getCities = (stateId) =>
  apiBackend(`/api/cities?stateId=${stateId}`).then((r) => {
    if (!r.success) throw new Error("No se cargaron las ciudades.");
    return r.data;
  });
// Nombres de barrios de la ciudad (GeoJSON: properties.NOMB_BARR).
export const getBarrios = (cityDaneCode) =>
  apiBackend(`/api/barrios?cityDaneCode=${cityDaneCode}`).then((r) => {
    if (!r.success) throw new Error("No se cargaron los barrios.");
    return (r.data?.features ?? []).map((f) => f.properties?.NOMB_BARR).filter(Boolean);
  });
export const geocodear = (address) =>
  apiBackend(`/api/geocode?address=${encodeURIComponent(address)}`).then((r) => {
    if (!r.success) throw new Error(r.error || r.message || "No se pudo geocodificar.");
    return r.data;
  });
export const sugerirTitulo = (params) =>
  apiBackend(`/api/titulo-sugerido?${params.toString()}`).then((r) => {
    if (!r.success) throw new Error("No se pudo sugerir el título.");
    return r.data;
  });
export const calcularPrecio = (payload) =>
  apiBackend("/propiedades/calcular-precio-sugerido", "POST", payload).then((r) => {
    if (!r.success) throw new Error(r.error || "No se pudo calcular.");
    return r.data;
  });
export const validarPrecio = (precio_usuario, datos_propiedad) =>
  apiBackend("/propiedades/validar-precio", "POST", { precio_usuario, datos_propiedad }).then((r) => {
    if (!r.success) throw new Error(r.error || "No se pudo evaluar.");
    return r.data;
  });
export const generarDescripcionIA = (payload) =>
  apiBackend("/ia/generar-descripcion", "POST", payload).then((r) => {
    if (!r.success) throw new Error(r.error || "La IA no respondió.");
    return r.data;
  });

// Propiedad
export const obtenerPropiedad = (id) =>
  apiBackend(`/propiedades/${id}`).then((r) => {
    if (!r.success) throw new Error(r.error || "No se pudo cargar el anuncio.");
    return r.data;
  });
export const obtenerCaractsProp = (id) =>
  apiBackend(`/propiedades/${id}/caracteristicas`).then((r) => (r.success ? r.data || {} : {}));
export const guardarCaractsProp = (id, features) =>
  apiBackend(`/propiedades/${id}/caracteristicas`, "POST", { features }).then((r) => {
    if (!r.success) throw new Error(r.error || "No se guardaron las características.");
    return r.data;
  });

// Cuerpo plano v5.0: omite vacíos, normaliza coordenadas.
export function cuerpoPropiedad(form) {
  const out = {};
  for (const [k, v] of Object.entries(form)) {
    if (v === "" || v === null || v === undefined) continue;
    if (k === "galeria" || k === "featuresSel") continue;
    out[k] =
      k === "latitude" || k === "longitude" ? Number(v) : v;
  }
  return out;
}

export function formDataDe(cuerpo, archivos = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(cuerpo)) {
    if (v === "" || v === null || v === undefined) continue;
    fd.append(k, typeof v === "boolean" ? String(v) : v);
  }
  if (archivos.principal) fd.append("imagenPrincipal", archivos.principal);
  (archivos.galeria ?? []).forEach((f) => fd.append("galeria", f));
  (archivos.planos ?? []).forEach((f) => fd.append("planos", f));
  return fd;
}

export const crearPublicacion = (cuerpo, archivos) =>
  apiBackendFormData("/publicar-anuncios", formDataDe(cuerpo, archivos), "POST").then((r) => {
    if (!r.success) throw new Error(r.error || r.message || "No se pudo publicar.");
    return r.data;
  });

export const actualizarPropiedad = (id, cuerpo, archivos = {}, extras = {}) => {
  const fd = formDataDe(cuerpo, archivos);
  for (const [k, v] of Object.entries(extras)) fd.append(k, v);
  return apiBackendFormData(`/propiedades/${id}`, fd, "PATCH").then((r) => {
    if (!r.success) throw new Error(r.error || r.message || "No se pudo actualizar.");
    return r.data;
  });
};

export const eliminarPropiedad = (id) =>
  apiBackend(`/propiedades/${id}`, "DELETE").then((r) => {
    if (!r.success) throw new Error(r.error || "No se pudo eliminar.");
    return r.data;
  });

export const cambiarEstadoProp = (id, estado) =>
  apiBackend(`/propiedades/${id}`, "PATCH", { estado }).then((r) => {
    if (!r.success) throw new Error(r.error || "No se pudo cambiar el estado.");
    return r.data;
  });
