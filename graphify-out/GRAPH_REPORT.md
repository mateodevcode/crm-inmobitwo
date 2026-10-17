# Graph Report - crm-inmobitwo  (2026-10-17)

## Corpus Check
- 127 files · ~52,982 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 719 nodes · 2067 edges · 66 communities (28 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `014a8563`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- CLAUDE.md — crm-inmobitwo
- PortadaPage.jsx
- WizardPage.jsx
- data-table.jsx
- cn
- dependencies
- sidebar.jsx
- nav-user.jsx
- devDependencies
- AjustesPage.jsx
- components.json
- app-sidebar.jsx
- CrmLayout.jsx
- VPS — pasos manuales para crm.inmobitwo.seventwo.tech
- utils.js
- jsconfig.json
- popover.jsx
- clsx
- lint-fix-04.mjs
- lint-report.mjs
- @fontsource-variable/montserrat
- react-router-dom
- @tanstack/react-query
- @tiptap/extension-link
- @tiptap/react
- @tiptap/starter-kit
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
- react-hook-form
- sonner
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- @tanstack/react-table
- tw-animate-css
- vaul
- zod
- TODO crm-inmobitwo — pendiente (fases 0–4 y auditoría ES→CO terminadas)
- apiBackend
- EquipoPage.jsx
- AppRouter.jsx
- vite.config.js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 144 edges
2. `apiBackend()` - 112 edges
3. `Button()` - 33 edges
4. `Input()` - 23 edges
5. `PageHeader()` - 19 edges
6. `WorkspaceContext` - 18 edges
7. `Card()` - 17 edges
8. `WizardPage()` - 16 edges
9. `react` - 15 edges
10. `CardContent()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ChartAreaInteractive()` --references--> `react`  [EXTRACTED]
  src/components/chart-area-interactive.jsx → package.json
- `DataTable()` --references--> `react`  [EXTRACTED]
  src/components/data-table.jsx → package.json
- `SidebarMenuSkeleton()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.jsx → package.json
- `SidebarProvider()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.jsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.jsx → package.json

## Import Cycles
- None detected.

## Communities (66 total, 38 thin omitted)

### Community 0 - "react"
Cohesion: 0.12
Nodes (21): react, react, DataTable(), CalendarDayButton(), ChartContainer(), ChartContext, ChartLegendContent(), ChartTooltipContent() (+13 more)

### Community 1 - "CLAUDE.md — crm-inmobitwo"
Cohesion: 0.18
Nodes (10): Arquitectura src/, Backend relacionado, CLAUDE.md — crm-inmobitwo, Comandos, Convenciones Colombia (obligatorias), Despliegue, Reglas repo, Rutas (+2 more)

### Community 2 - "PortadaPage.jsx"
Cohesion: 0.10
Nodes (29): ChartAreaInteractive(), chartConfig, chartData, description, TableCellViewer(), Badge(), badgeVariants, Card() (+21 more)

### Community 3 - "WizardPage.jsx"
Cohesion: 0.10
Nodes (37): actualizarPropiedad(), calcularPrecio(), crearPublicacion(), cuerpoPropiedad(), formDataDe(), generarDescripcionIA(), geocodear(), getBarrios() (+29 more)

### Community 4 - "data-table.jsx"
Cohesion: 0.07
Nodes (52): ConfirmDialog(), DataTable(), EmptyState(), EstadoBadge(), ETIQUETAS, VARIANTES, MoneyText(), PageHeader() (+44 more)

### Community 5 - "cn"
Cohesion: 0.10
Nodes (28): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Breadcrumb(), BreadcrumbEllipsis() (+20 more)

### Community 6 - "dependencies"
Cohesion: 0.18
Nodes (11): class-variance-authority, maplibre-gl, dependencies, class-variance-authority, maplibre-gl, @radix-ui/react-dialog, react-dom, recharts (+3 more)

### Community 7 - "sidebar.jsx"
Cohesion: 0.09
Nodes (22): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SidebarContext, SidebarGroupAction() (+14 more)

### Community 8 - "nav-user.jsx"
Cohesion: 0.12
Nodes (20): NavDocuments(), iniciales(), NavUser(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.08
Nodes (24): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+16 more)

### Community 10 - "AjustesPage.jsx"
Cohesion: 0.35
Nodes (10): AjustesPage(), actualizarEtapa(), cerrarOportunidad(), crearEtapa(), crearOportunidad(), eliminarEtapa(), moverOportunidad(), obtenerEtapas() (+2 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "app-sidebar.jsx"
Cohesion: 0.15
Nodes (12): NAV_PRINCIPAL, Logo(), NavMain(), SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent(), SidebarGroupLabel() (+4 more)

### Community 13 - "CrmLayout.jsx"
Cohesion: 0.22
Nodes (8): AppSidebar(), SiteHeader(), Separator(), SidebarInset(), SidebarProvider(), SidebarTrigger(), CrmLayout(), TITULOS

### Community 14 - "VPS — pasos manuales para crm.inmobitwo.seventwo.tech"
Cohesion: 0.22
Nodes (8): 1. DNS, 2. Código, 3. Certificado, 4. Nginx antiguo, 5. Backend, 6. Limpieza, 7. Renombrado local pendiente, VPS — pasos manuales para crm.inmobitwo.seventwo.tech

### Community 15 - "utils.js"
Cohesion: 0.29
Nodes (6): Textarea(), ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 16 - "jsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, include, src

### Community 17 - "popover.jsx"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 44 - "frontend-inmobitwo"
Cohesion: 0.14
Nodes (13): Checklist al implementar cualquier loader, Cómo está organizado (`src/`), Cómo funciona, Cómo se conecta al backend, Deploy, Estándar de Loaders (obligatorio para cualquier implementación), frontend-inmobitwo, LoaderGlobal (overlay full-screen) (+5 more)

### Community 48 - "Optimización de Rendimiento — InmobiTwo"
Cohesion: 0.22
Nodes (8): Checklist para CADA nuevo endpoint, Herramientas disponibles, Matriz de decisión (por tipo de dato), Optimización de Rendimiento — InmobiTwo, Plantilla, Principios, Referencias de implementación, Reglas para el estado

### Community 61 - "TODO crm-inmobitwo — pendiente (fases 0–4 y auditoría ES→CO terminadas)"
Cohesion: 0.13
Nodes (14): Hecho baja + sección Inmobiliarias (2026-10-14, no reabrir), Hecho fix Propiedades (2026-10-14, no reabrir), Hecho módulo Admin (2026-10-14, no reabrir), Hecho módulo Dominios (2026-10-14, no reabrir), Hecho módulo Mensajes (2026-10-14, no reabrir), Hecho módulo Mi inmobiliaria (2026-10-14, no reabrir), Hecho módulo Portada (2026-10-14, no reabrir), Hecho módulo Usuarios (2026-10-14, no reabrir) (+6 more)

### Community 70 - "apiBackend"
Cohesion: 0.07
Nodes (54): apiBackend(), PORTAL_URL, AdminPage(), FILTROS, VACIO, activarDominio(), actualizarOrganizacion(), aprobarOrganizacion() (+46 more)

### Community 71 - "EquipoPage.jsx"
Cohesion: 0.15
Nodes (28): Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader(), TableRow() (+20 more)

### Community 74 - "AppRouter.jsx"
Cohesion: 0.07
Nodes (42): CLAVE_ESPACIO, construirHeaders(), formatearRespuesta(), obtenerEspacio(), redirigirLogin(), apiBackendFormData(), construirHeaders(), formatearRespuesta() (+34 more)

## Knowledge Gaps
- **167 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `react`, `devDependencies`, `clsx`, `@fontsource-variable/montserrat`, `react-router-dom`, `@tanstack/react-query`, `@tiptap/extension-link`, `@tiptap/react`, `@tiptap/starter-kit`, `date-fns`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@hookform/resolvers`, `lucide-react`, `radix-ui`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-hook-form`, `sonner`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `@tanstack/react-table`, `tw-animate-css`, `vaul`, `zod`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `PortadaPage.jsx`, `dependencies`, `sidebar.jsx`, `nav-user.jsx`, `CrmLayout.jsx`, `utils.js`?**
  _High betweenness centrality (0.214) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `react`, `PortadaPage.jsx`, `data-table.jsx`, `sidebar.jsx`, `nav-user.jsx`, `EquipoPage.jsx`, `app-sidebar.jsx`, `CrmLayout.jsx`, `utils.js`, `popover.jsx`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `PortadaPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10384615384615385 - nodes in this community are weakly interconnected._
- **Should `WizardPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09872241579558652 - nodes in this community are weakly interconnected._