# Graph Report - crm-inmobitwo  (2026-10-13)

## Corpus Check
- 115 files · ~32,389 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 639 nodes · 1525 edges · 70 communities (33 shown, 37 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9867559`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- data-table.jsx
- CLAUDE.md — crm-inmobitwo
- ContactoDetallePage.jsx
- Architecture
- ContactosPage.jsx
- cn
- dependencies
- sidebar.jsx
- nav-user.jsx
- devDependencies
- LeadsPage.jsx
- components.json
- app-sidebar.jsx
- CrmLayout.jsx
- VPS — pasos manuales para crm.inmobitwo.seventwo.tech
- toggle-group.jsx
- compilerOptions
- _conservar/utils/formatPrecio.js
- lint-fix-04.mjs
- lint-report.mjs
- @fontsource-variable/montserrat
- _conservar/config/config.js
- date-fns
- @dnd-kit/core
- @dnd-kit/modifiers
- @dnd-kit/sortable
- @dnd-kit/utilities
- @hookform/resolvers
- lucide-react
- radix-ui
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-popover
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slot
- frontend-inmobitwo
- @radix-ui/react-tabs
- @radix-ui/react-tooltip
- react-day-picker
- Optimización de Rendimiento — InmobiTwo
- react-dom
- react-hook-form
- recharts
- sonner
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- @tanstack/react-table
- tw-animate-css
- vaul
- zod
- apiBackend
- ReportesPage.jsx
- src/api/apiBackend.js
- vite.config.js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 144 edges
2. `apiBackend()` - 57 edges
3. `Button()` - 19 edges
4. `Architecture` - 16 edges
5. `react` - 15 edges
6. `WorkspaceContext` - 15 edges
7. `Input()` - 14 edges
8. `obtenerTokenFresco()` - 12 edges
9. `PageHeader()` - 11 edges
10. `Card()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `useAuth()` --calls--> `apiBackend()`  [EXTRACTED]
  _conservar/auth/useAuth.js → src/api/apiBackend.js
- `Acceso()` --calls--> `apiBackend()`  [EXTRACTED]
  _conservar/login/Acceso.ref.jsx → src/api/apiBackend.js
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  _conservar/login/Login.jsx → src/hooks/useAuth.js
- `DataTable()` --references--> `react`  [EXTRACTED]
  src/components/data-table.jsx → package.json
- `useFormField()` --references--> `react`  [EXTRACTED]
  src/components/ui/form.jsx → package.json

## Import Cycles
- None detected.

## Communities (70 total, 37 thin omitted)

### Community 0 - "data-table.jsx"
Cohesion: 0.07
Nodes (39): react, react, ChartAreaInteractive(), chartConfig, chartData, columnHelper, columns, DataTable() (+31 more)

### Community 1 - "CLAUDE.md — crm-inmobitwo"
Cohesion: 0.18
Nodes (10): Arquitectura src/, Backend relacionado, CLAUDE.md — crm-inmobitwo, Comandos, Convenciones Colombia (obligatorias), Despliegue, Reglas repo, Rutas (+2 more)

### Community 2 - "ContactoDetallePage.jsx"
Cohesion: 0.18
Nodes (23): chartConfig, chartData, description, PageHeader(), Card(), CardAction(), CardContent(), CardDescription() (+15 more)

### Community 3 - "Architecture"
Cohesion: 0.05
Nodes (37): Admin pages (`/admin/*`) — requires superadmin, API layer ([src/api/](src/api/)), Architecture, Auth flow, CLAUDE.md, Commands, Custom hooks ([src/hooks/](src/hooks/)), Data files ([src/data/](src/data/)) (+29 more)

### Community 4 - "ContactosPage.jsx"
Cohesion: 0.13
Nodes (21): ConfirmDialog(), Button(), buttonVariants, Calendar(), Checkbox(), Dialog(), DialogContent(), DialogDescription() (+13 more)

### Community 5 - "cn"
Cohesion: 0.09
Nodes (28): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Breadcrumb(), BreadcrumbEllipsis() (+20 more)

### Community 6 - "dependencies"
Cohesion: 0.22
Nodes (9): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, react-router-dom, @tanstack/react-query, react-router-dom (+1 more)

### Community 7 - "sidebar.jsx"
Cohesion: 0.13
Nodes (15): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SidebarContext (+7 more)

### Community 8 - "nav-user.jsx"
Cohesion: 0.12
Nodes (18): NavDocuments(), iniciales(), NavUser(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+10 more)

### Community 9 - "devDependencies"
Cohesion: 0.08
Nodes (24): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+16 more)

### Community 10 - "LeadsPage.jsx"
Cohesion: 0.15
Nodes (17): DataTable(), EstadoBadge(), ETIQUETAS, VARIANTES, Badge(), badgeVariants, convertirLead(), contactoSchema (+9 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "app-sidebar.jsx"
Cohesion: 0.19
Nodes (13): NAV_PRINCIPAL, NavMain(), SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent(), SidebarGroupLabel(), SidebarHeader() (+5 more)

### Community 13 - "CrmLayout.jsx"
Cohesion: 0.24
Nodes (7): AppSidebar(), SiteHeader(), Separator(), SidebarInset(), SidebarTrigger(), CrmLayout(), TITULOS

### Community 14 - "VPS — pasos manuales para crm.inmobitwo.seventwo.tech"
Cohesion: 0.22
Nodes (8): 1. DNS, 2. Código, 3. Certificado, 4. Nginx antiguo, 5. Backend, 6. Limpieza, 7. Renombrado local pendiente, VPS — pasos manuales para crm.inmobitwo.seventwo.tech

### Community 15 - "toggle-group.jsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 16 - "compilerOptions"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, include, src

### Community 44 - "frontend-inmobitwo"
Cohesion: 0.14
Nodes (13): Checklist al implementar cualquier loader, Cómo está organizado (`src/`), Cómo funciona, Cómo se conecta al backend, Deploy, Estándar de Loaders (obligatorio para cualquier implementación), frontend-inmobitwo, LoaderGlobal (overlay full-screen) (+5 more)

### Community 48 - "Optimización de Rendimiento — InmobiTwo"
Cohesion: 0.22
Nodes (8): Checklist para CADA nuevo endpoint, Herramientas disponibles, Matriz de decisión (por tipo de dato), Optimización de Rendimiento — InmobiTwo, Plantilla, Principios, Referencias de implementación, Reglas para el estado

### Community 70 - "apiBackend"
Cohesion: 0.09
Nodes (39): useAuth(), Acceso(), apiBackend(), AjustesPage(), actualizarContacto(), archivarContacto(), asignarContacto(), crearActividad() (+31 more)

### Community 71 - "ReportesPage.jsx"
Cohesion: 0.14
Nodes (25): EmptyState(), MoneyText(), Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead() (+17 more)

### Community 74 - "src/api/apiBackend.js"
Cohesion: 0.08
Nodes (34): apiBackend(), formatearRespuesta(), apiBackendFormData(), formatearRespuesta(), obtenerTokenFresco(), renovarToken(), Login(), CLAVE_ESPACIO (+26 more)

## Knowledge Gaps
- **171 isolated node(s):** `URL_BACKEND`, `$schema`, `style`, `rsc`, `tsx` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `data-table.jsx`, `devDependencies`, `@fontsource-variable/montserrat`, `date-fns`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@hookform/resolvers`, `lucide-react`, `radix-ui`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `recharts`, `sonner`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `@tanstack/react-table`, `tw-animate-css`, `vaul`, `zod`?**
  _High betweenness centrality (0.210) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `data-table.jsx`, `ContactoDetallePage.jsx`, `ContactosPage.jsx`, `sidebar.jsx`, `nav-user.jsx`, `ReportesPage.jsx`, `LeadsPage.jsx`, `app-sidebar.jsx`, `CrmLayout.jsx`, `toggle-group.jsx`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Why does `react` connect `data-table.jsx` to `nav-user.jsx`, `ContactosPage.jsx`, `dependencies`, `toggle-group.jsx`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **What connects `URL_BACKEND`, `$schema`, `style` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `data-table.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06560283687943262 - nodes in this community are weakly interconnected._
- **Should `Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `ContactosPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12878787878787878 - nodes in this community are weakly interconnected._