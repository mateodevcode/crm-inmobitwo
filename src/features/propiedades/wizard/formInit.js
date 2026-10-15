// Estado inicial del wizard (equivale a FORM_DATA_PROPIEDAD_INICIAL del portal).
export const FORM_INICIAL = {
  property_type_id: "",
  operation_type_id: 1,
  operacion: "venta",
  rental_type_id: "",
  country_id: 2,
  state_id: "",
  city_id: "",
  barrio_nombre: "",
  direccion: "",
  numero_direccion: "",
  complemento: "",
  latitude: "",
  longitude: "",
  precio: "",
  administracion: "",
  estado: "publicado",
  es_de_organizacion: false,
  organizacion_id: "",
  estrato: "",
  description: "",
  cedula_catastral: "",
  matricula_inmobiliaria: "",
  constructed_area: "",
  private_area: "",
  plot_area: "",
  floor: "",
  interior_apartment_number: "",
  antiguedad_anios: "",
  room_count: 1,
  bedroom_count: 1,
  bathroom_count: 1,
  social_bathroom_count: 1,
  condition_type_id: "",
  construction_year: "",
  is_new_construction: false,
  parqueadero_tipo: "",
  parqueadero_modo: "",
  parking_space_count: "",
  parking_space_included: false,
  parking_space_price: "",
  tiene_agua: false,
  tiene_luz: false,
  tiene_gas: false,
  tiene_alcantarillado: false,
  has_elevator: false,
  has_swimming_pool: false,
  has_gym: false,
  has_security_24h: false,
  has_air_conditioning: false,
  is_furnished: false,
  zona: "residencial",
  how_to_contact: "telefono_chat",
  telefono_contacto: "",
  contactName: "",
  telefonos: [""],
};

export function mapearApi(form, api) {
  const out = { ...form };
  for (const k of Object.keys(FORM_INICIAL)) {
    if (api[k] !== undefined && api[k] !== null) out[k] = api[k];
  }
  // numero_direccion viene combinado ("32 Apto 301"): se muestra tal cual
  // en Número y el complemento arranca vacío.
  // Oferta principal → operación/precio/rental (compat Fase 4).
  const ofertas = api.ofertas ?? api.property_listings ?? [];
  const principal = Array.isArray(ofertas) ? ofertas[0] : null;
  if (principal) {
    const code = String(principal.code ?? principal.operation ?? "").toLowerCase();
    if (principal.operation_type_id) out.operation_type_id = principal.operation_type_id;
    if (code === "alquiler") out.operacion = "alquiler";
    else if (code === "venta") out.operacion = "venta";
    if (principal.rental_type_id) out.rental_type_id = principal.rental_type_id;
    if (principal.precio ?? principal.price) out.precio = principal.precio ?? principal.price;
  }
  if (api.precio ?? api.price) out.precio = api.precio ?? api.price;
  return out;
}

export const OPERACION_A_ID = { venta: 1, alquiler: 2, vacacional: 2 };
export const ID_A_OPERACION = { 1: "venta", 2: "alquiler", 3: "alquiler" };
