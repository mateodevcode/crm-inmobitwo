import { formatPrecioCompleto } from "@/utils/formatPrecio.js";

export function MoneyText({ valor, className }) {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) return <span className={className}>—</span>;
  return <span className={className}>{formatPrecioCompleto(n)}</span>;
}
