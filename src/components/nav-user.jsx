// src/components/nav-user.jsx — menú de usuario: avatar, modo oscuro, salir
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext.js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar.jsx";
import {
  EllipsisVerticalIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

function iniciales(nombre, email) {
  const base = (nombre || email || "?").trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function alternarTema() {
  document.documentElement.classList.toggle("dark");
}

export function NavUser() {
  const { usuario, cerrarSesion } = useContext(AuthContext);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const salir = async () => {
    await cerrarSesion();
    toast.success("Sesión cerrada.");
    navigate("/login", { replace: true });
  };

  const nombre = usuario?.name || usuario?.email || "Usuario";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {iniciales(usuario?.name, usuario?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{nombre}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {usuario?.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {iniciales(usuario?.name, usuario?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{nombre}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {usuario?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={alternarTema}>
              <SunIcon className="dark:hidden" />
              <MoonIcon className="hidden dark:block" />
              Modo oscuro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={salir}>
              <LogOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
