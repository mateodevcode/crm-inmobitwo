import { apiBackend } from "@/api/apiBackend.js";

const mensaje = (res, porDefecto) => [].concat(res.error || porDefecto).join(" ");

// tipo: "contactos" | "inmuebles"; cuerpo: { filas, simular, modo?, autorizacion_confirmada? }
export async function importar(tipo, cuerpo) {
  const res = await apiBackend(`/crm/importar/${tipo}`, "POST", cuerpo);
  if (!res.success) throw new Error(mensaje(res, "No se pudo procesar el archivo."));
  return res.data;
}
