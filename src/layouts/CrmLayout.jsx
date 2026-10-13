// src/layouts/CrmLayout.jsx — SidebarProvider + AppSidebar + SiteHeader + Outlet
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SiteHeader } from "@/components/site-header.jsx";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.jsx";

const TITULOS = {
  "/": "Panel",
  "/leads": "Leads",
  "/contactos": "Contactos",
  "/pipeline": "Pipeline",
  "/tareas": "Tareas",
  "/propiedades": "Propiedades",
  "/equipo": "Equipo",
  "/reportes": "Reportes",
  "/ajustes": "Ajustes",
};

export default function CrmLayout() {
  const { pathname } = useLocation();
  const base = `/${pathname.split("/")[1] ?? ""}`;
  const titulo = TITULOS[base] ?? TITULOS[pathname] ?? "CRM";

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader titulo={titulo} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
