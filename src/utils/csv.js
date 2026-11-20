// src/utils/csv.js — exportar a CSV listo para Excel en es-CO:
// BOM (tildes), separador ";" y celdas protegidas contra fórmulas
// (=, +, -, @ al inicio se prefijan con ' para que Excel no las ejecute).
const celda = (v) => {
  const s = v == null ? "" : String(v);
  const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${seguro.replace(/"/g, '""')}"`;
};

// columnas: [{ clave, titulo, valor?(fila) }]
export function aCsv(filas, columnas) {
  const cab = columnas.map((c) => celda(c.titulo));
  const lineas = filas.map((f) => columnas.map((c) => celda(c.valor ? c.valor(f) : f[c.clave])).join(";"));
  return "﻿" + [cab.join(";"), ...lineas].join("\r\n");
}

export function descargarArchivo(nombre, contenido, tipo = "text/csv;charset=utf-8") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revocar después: hacerlo en el acto puede cancelar la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

export const hoyBogota = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
