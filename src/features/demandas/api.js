import { apiBackend } from "@/api/apiBackend.js";

const mensaje = (res, porDefecto) =>
  Array.isArray(res.error) ? res.error.join(" ") : res.error || porDefecto;

async function pedir(ruta, metodo, datos, porDefecto) {
  const res = await apiBackend(ruta, metodo, datos);
  if (!res.success) throw new Error(mensaje(res, porDefecto));
  return res.data;
}

export function obtenerDemandas(filtros = {}) {
  const p = new URLSearchParams();
  for (const k of ["contacto_id", "asignado", "estado"]) if (filtros[k]) p.set(k, filtros[k]);
  return pedir(`/crm/demandas?${p}`, "GET", null, "No se pudieron cargar las demandas.").then((d) => d ?? []);
}

export const obtenerDemanda = (id) => pedir(`/crm/demandas/${id}`, "GET", null, "No se pudo cargar la demanda.");
export const crearDemanda = (datos) => pedir("/crm/demandas", "POST", datos, "No se pudo crear la demanda.");
export const actualizarDemanda = (id, datos) =>
  pedir(`/crm/demandas/${id}`, "PATCH", datos, "No se pudo actualizar la demanda.");
export const eliminarDemanda = (id) => pedir(`/crm/demandas/${id}`, "DELETE", null, "No se pudo borrar la demanda.");

export function obtenerCoincidencias(id, { alcance = "cartera", incluirDescartadas = false } = {}) {
  const p = new URLSearchParams({ alcance });
  if (incluirDescartadas) p.set("incluir_descartadas", "1");
  return pedir(`/crm/demandas/${id}/coincidencias?${p}`, "GET", null, "No se pudo hacer el cruce.").then(
    (d) => d ?? [],
  );
}

export const marcarVistas = (id) => pedir(`/crm/demandas/${id}/vistas`, "POST", null, "No se pudo marcar.");
export const marcarSeguimiento = (id, propiedadId, estado) =>
  pedir(`/crm/demandas/${id}/propiedades/${propiedadId}`, "PUT", { estado }, "No se pudo guardar.");
export const quitarSeguimiento = (id, propiedadId) =>
  pedir(`/crm/demandas/${id}/propiedades/${propiedadId}`, "DELETE", null, "No se pudo guardar.");

export const interesadosDePropiedad = (propiedadId) =>
  pedir(`/crm/propiedades/${propiedadId}/demandas`, "GET", null, "No se pudieron cargar los interesados.").then(
    (d) => d ?? [],
  );

export const buscarCiudades = (q) =>
  pedir(`/crm/catalogos/ciudades?q=${encodeURIComponent(q)}`, "GET", null, "No se pudieron buscar ciudades.").then(
    (d) => d ?? [],
  );
export const obtenerBarrios = (cityId) =>
  pedir(`/crm/catalogos/barrios?city_id=${cityId}`, "GET", null, "No se pudieron cargar los barrios.").then(
    (d) => d ?? [],
  );

// Catálogo público de tipos de inmueble (no depende del espacio).
export const obtenerTiposInmueble = () =>
  pedir("/catalogos/tipos-inmueble", "GET", null, "No se pudieron cargar los tipos.").then((d) => d ?? []);
