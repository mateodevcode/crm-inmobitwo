// Campos importables, lectura de CSV y mapeo automático de encabezados.
// La validación real la hace el backend (vista previa con `simular`).

export const CAMPOS = {
  contactos: [
    { clave: "nombre", titulo: "Nombre", requerido: true, sinonimos: ["nombre completo", "cliente", "contacto", "name", "nombres"] },
    { clave: "email", titulo: "Correo", sinonimos: ["correo", "correo electronico", "e mail", "mail"] },
    { clave: "telefono", titulo: "Teléfono", sinonimos: ["celular", "movil", "whatsapp", "tel", "telefono celular", "phone"] },
    { clave: "tipo", titulo: "Tipo", sinonimos: ["tipo de cliente", "tipo contacto", "perfil"] },
    { clave: "presupuesto_min", titulo: "Presupuesto mínimo", sinonimos: ["presupuesto min", "precio minimo", "desde"] },
    { clave: "presupuesto_max", titulo: "Presupuesto máximo", sinonimos: ["presupuesto", "presupuesto max", "precio maximo", "hasta"] },
    { clave: "zona_interes", titulo: "Zona de interés", sinonimos: ["zona", "sector", "barrio de interes"] },
    { clave: "etiquetas", titulo: "Etiquetas", sinonimos: ["tags", "etiqueta"] },
    { clave: "notas", titulo: "Notas", sinonimos: ["nota", "observaciones", "comentarios"] },
  ],
  inmuebles: [
    { clave: "tipo", titulo: "Tipo de inmueble", requerido: true, sinonimos: ["tipo", "tipo inmueble", "clase"] },
    { clave: "operacion", titulo: "Operación", requerido: true, sinonimos: ["negocio", "tipo de negocio", "venta o arriendo"] },
    { clave: "precio", titulo: "Precio", requerido: true, sinonimos: ["valor", "canon", "precio venta", "precio arriendo"] },
    { clave: "ciudad", titulo: "Ciudad", requerido: true, sinonimos: ["municipio"] },
    { clave: "departamento", titulo: "Departamento", sinonimos: ["depto"] },
    { clave: "direccion", titulo: "Dirección", requerido: true, sinonimos: ["ubicacion"] },
    { clave: "barrio", titulo: "Barrio", sinonimos: ["sector"] },
    { clave: "estrato", titulo: "Estrato", sinonimos: [] },
    { clave: "area", titulo: "Área construida (m²)", sinonimos: ["area", "area construida", "area m2", "area construida m2", "area construida m", "metros", "m2", "mts"] },
    { clave: "area_privada", titulo: "Área privada (m²)", sinonimos: ["area privada", "area privada m2", "area privada m"] },
    { clave: "habitaciones", titulo: "Habitaciones", sinonimos: ["alcobas", "cuartos", "hab"] },
    { clave: "banos", titulo: "Baños", sinonimos: ["banos", "bano"] },
    { clave: "parqueaderos", titulo: "Parqueaderos", sinonimos: ["parqueadero", "garajes", "garaje"] },
    { clave: "administracion", titulo: "Administración", sinonimos: ["admin", "cuota de administracion"] },
    { clave: "descripcion", titulo: "Descripción", sinonimos: ["detalle", "observaciones"] },
  ],
};

export const MAXIMO = { contactos: 500, inmuebles: 200 };

export const EJEMPLO = {
  contactos: {
    nombre: "Ana Gómez",
    email: "ana@ejemplo.com",
    telefono: "3101234567",
    tipo: "comprador",
    presupuesto_min: "300000000",
    presupuesto_max: "450000000",
    zona_interes: "El Poblado",
    etiquetas: "referido, vip",
    notas: "Busca apartamento con balcón",
  },
  inmuebles: {
    tipo: "Apartamento",
    operacion: "venta",
    precio: "450000000",
    ciudad: "Medellín",
    departamento: "Antioquia",
    direccion: "Carrera 43A # 1-50",
    barrio: "El Poblado",
    estrato: "5",
    area: "85",
    area_privada: "80",
    habitaciones: "3",
    banos: "2",
    parqueaderos: "1",
    administracion: "450000",
    descripcion: "Apartamento iluminado con vista a la ciudad.",
  },
};

// "Correo electrónico" → "correo electronico"
export function claveEncabezado(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Devuelve { [clave]: índiceDeColumna | null } adivinando por título o sinónimos.
export function mapearEncabezados(encabezados, campos) {
  const claves = encabezados.map(claveEncabezado);
  const usados = new Set();
  const mapa = {};
  for (const campo of campos) {
    const opciones = [campo.clave.replace(/_/g, " "), claveEncabezado(campo.titulo), ...campo.sinonimos.map(claveEncabezado)];
    const i = claves.findIndex((c, idx) => !usados.has(idx) && opciones.includes(c));
    mapa[campo.clave] = i >= 0 ? i : null;
    if (i >= 0) usados.add(i);
  }
  return mapa;
}

// CSV con separador ; , o tabulador (se detecta en la primera línea), comillas y saltos dentro de comillas.
export function parsearCsv(texto) {
  const t = String(texto).replace(/^\uFEFF/, "");
  const primera = t.slice(0, t.search(/\r?\n|$/));
  const cuenta = (c) => primera.split(c).length - 1;
  const sep = [";", ",", "\t"].sort((a, b) => cuenta(b) - cuenta(a))[0];
  const filas = [];
  let fila = [];
  let celda = "";
  let comillas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (comillas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          celda += '"';
          i++;
        } else comillas = false;
      } else celda += c;
    } else if (c === '"' && celda === "") comillas = true;
    else if (c === sep) {
      fila.push(celda);
      celda = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else celda += c;
  }
  if (celda !== "" || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas;
}

// Celda de Excel → texto (fechas a aaaa-mm-dd, números sin notación rara).
export function textoCelda(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

// Lee CSV o Excel → { encabezados, filas: [[texto]] } sin filas vacías.
export async function leerArchivo(archivo) {
  const nombre = archivo.name.toLowerCase();
  let datos;
  if (nombre.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/browser");
    datos = (await readSheet(archivo)).map((f) => f.map(textoCelda));
  } else if (nombre.endsWith(".csv") || nombre.endsWith(".txt")) {
    datos = parsearCsv(await archivo.text()).map((f) => f.map((c) => c.trim()));
  } else {
    throw new Error("Usa un archivo .xlsx o .csv (en Excel: Guardar como → CSV UTF-8).");
  }
  const llenas = datos.map((f, i) => ({ f, linea: i + 1 })).filter(({ f }) => f.some((c) => c !== ""));
  if (llenas.length < 2) throw new Error("El archivo necesita una fila de encabezados y al menos una fila de datos.");
  const [cab, ...resto] = llenas;
  return { encabezados: cab.f, filas: resto };
}

// Filas leídas + mapa → objetos para el backend ({ fila: línea del archivo, ...campos }).
export function construirFilas(filas, mapa) {
  return filas.map(({ f, linea }) => {
    const obj = { fila: linea };
    for (const [clave, idx] of Object.entries(mapa)) {
      if (idx != null && f[idx] != null && f[idx] !== "") obj[clave] = String(f[idx]).slice(0, 5000);
    }
    return obj;
  });
}
