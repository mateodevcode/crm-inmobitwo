// src/utils/telefono.js — normalización colombiana
// Celular: 10 dígitos desde 3. Acepta +57, 0057, espacios, guiones.
export function normalizarTelefonoColombia(valor) {
  if (!valor) return null;
  let d = String(valor).replace(/\D/g, "");
  if (d.startsWith("0057")) d = d.slice(4);
  else if (d.startsWith("57") && d.length === 12) d = d.slice(2);
  if (/^3\d{9}$/.test(d)) return d;
  return null;
}

export function enlaceWhatsApp(valor, texto = "") {
  const n = normalizarTelefonoColombia(valor);
  if (!n) return null;
  const url = `https://wa.me/57${n}`;
  return texto ? `${url}?text=${encodeURIComponent(texto)}` : url;
}

export function mostrarTelefono(valor) {
  const n = normalizarTelefonoColombia(valor);
  if (!n) return valor || "—";
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}
