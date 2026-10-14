// src/components/app-sidebar.jsx — sidebar del CRM
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext.js";
import { WorkspaceContext } from "@/context/WorkspaceContext.js";
import { PORTAL_URL } from "@/config/config.js";
import { apiBackend } from "@/api/apiBackend.js";
import { NavMain } from "@/components/nav-main.jsx";
import { NavUser } from "@/components/nav-user.jsx";
import { WorkspaceSwitcher } from "@/components/workspace-switcher.jsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.jsx";
import {
  LayoutDashboardIcon,
  ImageIcon,
  ShieldCheckIcon,
  UserCogIcon,
  LandmarkIcon,
  GlobeIcon,
  BuildingIcon,
  UsersIcon,
  ContactRoundIcon,
  KanbanIcon,
  ListChecksIcon,
  Building2Icon,
  UsersRoundIcon,
  ChartBarIcon,
  Settings2Icon,
  MessagesSquareIcon,
} from "lucide-react";
import Logo from "./comunes/Logo";

const NAV_PRINCIPAL = [
  { title: "Panel", url: "/", icon: LayoutDashboardIcon },
  { title: "Leads", url: "/leads", icon: UsersIcon },
  { title: "Contactos", url: "/contactos", icon: ContactRoundIcon },
  { title: "Pipeline", url: "/pipeline", icon: KanbanIcon },
  { title: "Tareas", url: "/tareas", icon: ListChecksIcon },
  { title: "Propiedades", url: "/propiedades", icon: Building2Icon },
  { title: "Reportes", url: "/reportes", icon: ChartBarIcon },
  { title: "Ajustes", url: "/ajustes", icon: Settings2Icon },
  { title: "Mi inmobiliaria", url: "/mi-inmobiliaria", icon: BuildingIcon },
];

export function AppSidebar(props) {
  const { usuario } = useContext(AuthContext);
  const { puedeAdministrar, esPersonal } = useContext(WorkspaceContext);
  const { data: noLeidos } = useQuery({
    queryKey: ["chat-no-leidos"],
    queryFn: async () => {
      const res = await apiBackend("/chat/no-leidos");
      return res.success ? Number(res.data?.total ?? 0) : 0;
    },
    refetchInterval: 60_000,
  });

  const principal = [...NAV_PRINCIPAL];
  if (usuario?.rol === "superadmin") {
    principal.splice(1, 0, {
      title: "Portada",
      url: "/portada",
      icon: ImageIcon,
    });
    principal.splice(2, 0, {
      title: "Admin",
      url: "/admin",
      icon: ShieldCheckIcon,
    });
    principal.splice(3, 0, {
      title: "Dominios",
      url: "/dominios",
      icon: GlobeIcon,
    });
    principal.splice(4, 0, {
      title: "Usuarios",
      url: "/usuarios",
      icon: UserCogIcon,
    });
    principal.splice(5, 0, {
      title: "Inmobiliarias",
      url: "/inmobiliarias",
      icon: LandmarkIcon,
    });
  }
  if (!esPersonal && puedeAdministrar) {
    principal.splice(6, 0, {
      title: "Equipo",
      url: "/equipo",
      icon: UsersRoundIcon,
    });
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="mb-4">
              <Logo />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <WorkspaceSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={principal} label="CRM" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Ir al portal"
                  data-active={undefined}
                >
                  <a href={PORTAL_URL} target="_blank" rel="noreferrer">
                    <GlobeIcon />
                    <span>Ir al portal</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Mensajes"
                  data-active={undefined}
                >
                  <a
                    href={`${PORTAL_URL}/usuario/chat`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessagesSquareIcon />
                    <span>Mensajes</span>
                    {noLeidos > 0 ? (
                      <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 text-xs">
                        {noLeidos}
                      </span>
                    ) : null}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
