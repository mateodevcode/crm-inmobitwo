import { Badge } from "@/components/ui/badge.jsx";

const VARIANTES = {
  nuevo: "default",
  contactado: "secondary",
  en_negociacion: "outline",
  cerrado: "default",
  descartado: "destructive",
};

const ETIQUETAS = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_negociacion: "En negociación",
  cerrado: "Cerrado",
  descartado: "Descartado",
};

export function EstadoBadge({ estado }) {
  return <Badge variant={VARIANTES[estado] ?? "secondary"}>{ETIQUETAS[estado] ?? estado}</Badge>;
}
