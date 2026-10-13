// src/components/nav-main.jsx — navegación principal del CRM con NavLink
import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.jsx";
import { cn } from "@/lib/utils.js";

export function NavMain({ items, label }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const activo =
              item.url === "/"
                ? pathname === "/"
                : pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  data-active={activo || undefined}
                  className={cn(
                    activo &&
                      "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs hover:bg-sidebar-primary hover:text-sidebar-primary-foreground data-active:bg-sidebar-primary! data-active:text-sidebar-primary-foreground!",
                  )}
                >
                  <NavLink to={item.url} end={item.url === "/"}>
                    {item.icon ? <item.icon /> : null}
                    <span>{item.title}</span>
                    {item.badge != null ? (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 text-xs",
                          activo
                            ? "bg-sidebar-primary-foreground text-sidebar-primary"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
