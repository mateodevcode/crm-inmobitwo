// src/utils/formatPrecio.js

export function formatPrecioCompacto(precio) {
  const n = Number(precio);
  if (!n) return "";

  if (n >= 1_000_000) {
    const millones = n / 1_000_000;
    const decimals = millones % 1 === 0 ? 0 : 1;
    return `${millones.toLocaleString("es-CO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}M`;
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1000)}K`;
  }
  return n.toLocaleString("es-CO");
}

export function formatPrecioCompleto(precio) {
  const n = Number(precio);
  if (!n) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPrecioPin(precio, operation) {
  const base = formatPrecioCompacto(precio);
  return operation === "alquiler" ? `${base}/mes` : base;
}
