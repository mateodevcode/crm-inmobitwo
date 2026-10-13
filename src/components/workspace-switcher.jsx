// src/components/workspace-switcher.jsx — selector Personal | org:{id}
import { useContext } from "react";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { ESPACIO_PERSONAL } from "@/context/espacio.js";

export function WorkspaceSwitcher() {
  const { espacio, organizaciones, cargandoOrgs, cambiarEspacio } =
    useContext(WorkspaceContext);

  return (
    <Select
      value={espacio}
      onValueChange={cambiarEspacio}
      disabled={cargandoOrgs}
    >
      <SelectTrigger aria-label="Espacio de trabajo" className="w-full">
        <SelectValue placeholder="Espacio…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ESPACIO_PERSONAL}>Personal</SelectItem>
        {organizaciones.map((org) => (
          <SelectItem key={org.id} value={`org:${org.id}`}>
            {org.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
