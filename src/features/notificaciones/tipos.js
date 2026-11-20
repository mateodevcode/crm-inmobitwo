// Icono por tipo de aviso.
import { createElement } from "react";
import {
  BellIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  KeyRoundIcon,
  ListChecksIcon,
  SearchCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

const ICONO_TIPO = {
  lead_nuevo: UsersIcon,
  lead_asignado: UserPlusIcon,
  contacto_asignado: UserPlusIcon,
  tarea_asignada: ListChecksIcon,
  visita_asignada: CalendarDaysIcon,
  visita_cambiada: CalendarClockIcon,
  demanda_coincidencias: SearchCheckIcon,
  captacion_por_vencer: KeyRoundIcon,
};

export const IconoTipo = ({ tipo, ...props }) => createElement(ICONO_TIPO[tipo] ?? BellIcon, props);
