# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, hot reload)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint on all JS/JSX files
```

No test suite is configured yet.

## Tech Stack

- **React 19** + **Vite 7** (plain JS/JSX, no TypeScript)
- **Tailwind CSS 4** with custom fonts (Montserrat, Poppins)
- **react-router-dom v7** for routing
- **sonner** for toast notifications
- **motion** (Framer Motion) for animations
- **lucide-react** + **react-icons** for icons
- **@headlessui/react** for accessible UI primitives
- **MapLibre GL** + **@geoman-io/maplibre-geoman-free** for maps and drawing tools
- **gsap** + **@gsap/react** for advanced animations
- **supercluster** for map point clustering

## Architecture

### Directory structure (`src/`)

```
src/
├── api/                  # HTTP client modules
├── assets/               # Static images
├── components/           # Reusable UI components
│   ├── en-construccion/
│   ├── loader/
│   ├── login/
│   ├── modales/
│   ├── principal/        # Home feed (actividad, card-propiedad, header-principal)
│   ├── propiedades/      # Property forms and detail views
│   ├── publicar-anuncio/ # Publishing wizard (components/, info-publicar/)
│   ├── registro/
│   ├── sidebar/
│   └── usuario/          # User profile, favoritos, anuncios
├── config/               # App config constants
├── context/              # React Context providers
├── data/                 # Static data/config for UI
├── features/             # Domain feature modules
│   ├── mapa-inmuebles/   # Map with property clusters
│   └── seleccionar-zona/ # Zone selection with drawing tools
├── hooks/                # Custom React hooks (17 hooks)
├── lib/                  # Pure utility functions
├── pages/                # Page-level components
│   ├── admin/
│   ├── anuncio/
│   ├── inicio/           # Landing page
│   ├── lista-propiedades/
│   └── organizacion/     # Org management + themes
├── router/               # Route definitions + guards
└── utils/                # Formatting utilities
```

### Path alias

`@/` maps to `src/` (configured in `vite.config.mjs`).

### Entry point ([src/main.jsx](src/main.jsx))

Provider hierarchy rendered into `#root`:

```
<StrictMode>
  <AppProvider>              # Global state: auth, properties, orgs, modals
    <TenantProvider>         # Detects red-social vs custom-domain org
      <App>                  # Shows "Cargando..." while tenant resolves → <AppRouter />
      <LoaderGlobal />       # Full-screen ref-counted spinner
      <ConsentimientoBanner /> # Cookie/tracking consent
      <ModalContactoLead />  # Lead contact form modal
      <Toaster />            # sonner notifications
    </TenantProvider>
  </AppProvider>
</StrictMode>
```

CSS imports: `index.css` (Tailwind + custom) and `maplibre-gl/dist/maplibre-gl.css`.

### Routing ([src/router/AppRouter.jsx](src/router/AppRouter.jsx))

The router has two modes determined by `TenantProvider`:

#### MODO RED-SOCIAL (default platform)

| Route | Component | Guard | File |
|---|---|---|---|
| `/` | `<PageInicio>` | Public | `pages/inicio/PagePrincipal.jsx` |
| `/feed` | `<Home>` | **RutaPrivada** | `pages/Home.jsx` |
| `/login` | `<Login>` | **RutaPublica** | `components/login/Login.jsx` |
| `/registro` | `<Registro>` | **RutaPublica** | `components/registro/Registro.jsx` |
| `/info/publicar-anuncio` | `<InfoPublicarAnuncio>` | **RutaPrivada** | `pages/InfoPublicarAnuncio.jsx` |
| `/info/publicar-anuncio/publicar` | `<PublicarAnuncio>` | **RutaPrivada** | `pages/PublicarAnuncio.jsx` |
| `/usuario/favoritos` | `<MisFavoritos>` | **RutaPrivada** | `pages/MisFavoritos.jsx` |
| `/usuario/mis-anuncios` | `<MisAnuncios>` | **RutaPrivada** | `pages/MisAnuncios.jsx` |
| `/usuario/mis-anuncios/anuncio/:id` | `<Anuncio>` | **RutaPrivada** | `pages/Anuncio.jsx` |
| `/usuario/tus-datos/perfil` | `<MiPerfil>` | **RutaPrivada** | `pages/MiPerfil.jsx` |
| `/usuario/tus-datos/acceso` | `<SeguridadAcceso>` | **RutaPrivada** | `pages/SeguridadAcceso.jsx` |
| `/propiedades/:id` | `<PagePropiedadId>` | **RutaPrivada** | `pages/PagePropiedadId.jsx` |
| `/leads` | `<Leads>` | **RutaPrivada** | `pages/Leads.jsx` |
| `/logs` | `<Logs>` | **RutaPrivada** | `pages/Logs.jsx` |
| `/admin` | `<Admin>` | **RutaAdmin** | `pages/Admin.jsx` |
| `/admin/rutas` | `<AdminRutasPage>` | **RutaAdmin** | `pages/admin/AdminRutasPages.jsx` |
| `/admin/organizaciones` | `<AdminOrganizacionesPage>` | **RutaAdmin** | `pages/admin/AdminOrganizacionesPage.jsx` |
| `/inmobiliarias/nueva` | `<CrearOrganizacionForm>` | **RutaPrivada** | `pages/organizacion/CrearOrganizacionForm.jsx` |
| `/inmobiliarias/:slug` | `<LayoutPublicoResolver>` → `<HomeTemaSlot>` | Public | `pages/organizacion/paginas/` |
| `/inmobiliarias/:slug/sobre-nosotros` | `<SobreNosotrosTemaSlot>` | Public | tema-slot |
| `/inmobiliarias/:slug/contacto` | `<ContactoTemaSlot>` | Public | tema-slot |
| `/organizaciones/agentes` | `<AgentesPanel>` | **RutaPrivada** | `pages/organizacion/AgentesPanel.jsx` |
| `/organizaciones/ajustes` | `<MiInmobiliariaPanel>` | **RutaPrivada** | `pages/organizacion/MiInmobiliariaPanel.jsx` |
| `/organizaciones/estadisticas/:id` | `<EstadisticasPanel>` | **RutaPrivada** | `pages/organizacion/EstadisticasPanel.jsx` |
| `/busqueda-multizona/:operationAndType` | `<SeleccionarZonaPage>` | Public | `features/seleccionar-zona/index.jsx` |
| `/:operationAndType/:cityAndDepartment/mapa` | `<MapaInmueblesPage>` | Public | `pages/MapaInmueblesPage.jsx` |
| `/:operationAndType/zona-personalizada` | `<ListaPropiedades>` | Public | `pages/lista-propiedades/ListaPropiedades.jsx` |
| `/:operationAndType/:cityAndDepartment` | `<ListaPropiedades>` | Public | `pages/lista-propiedades/ListaPropiedades.jsx` |
| `/inmueble/:id` | `<PageAnuncio>` | Public | `pages/anuncio/PageAnuncio.jsx` |
| `/inmueble/:id/foto/:fotoIndex` | `<FotoVisor>` | Public | `pages/anuncio/FotoVisor.jsx` |
| `/lista-propiedades` | `<ListaPruebaPropiedades>` | Public | `pages/ListaPruebaPropiedades.jsx` |
| `*` | `<NotFound>` | Public | `pages/NotFound.jsx` |

#### MODO ORGANIZACION (custom domain)

| Route | Component |
|---|---|
| `/` | `<LayoutResolver>` → `<HomeTemaSlot>` |
| `/sobre-nosotros` | `<SobreNosotrosTemaSlot>` |
| `/contacto` | `<ContactoTemaSlot>` |
| `*` | redirect to `/` |

#### Guard components ([src/router/guards.jsx](src/router/guards.jsx))

- **`RutaPrivada`** — redirects to `/login` if not authenticated
- **`RutaAdmin`** — requires `superadmin` role, otherwise redirects to `/feed` or `/login`
- **`RutaPublica`** — redirects to `/feed` if already authenticated (for login/register pages)

Auth state comes from `useAppContext().estaAutenticado`.

### Multi-tenant system ([src/context/TenantProvider.jsx](src/context/TenantProvider.jsx))

`TenantProvider` determines the app mode at mount:
- Compares `window.location.hostname` against `VITE_MAIN_HOSTS` env var
- **Mode `"red-social"`**: main platform — shows full SPA with all routes
- **Mode `"organizacion"`**: custom domain — renders organization-specific themed pages only
- Sends `?host=<domain>` to `GET /organizaciones/resolve-tenant` to fetch org data
- Exposes `useTenant()` → `{ modo, organizacion, cargandoTenant, error }`

### State management ([src/context/AppProvider.jsx](src/context/AppProvider.jsx))

Single `AppContext` (React Context) holds all global state:

- **Auth**: `usuario`, `estaAutenticado`, `esSuperAdmin`, `guardarSesion()`, `cerrarSesion()`
- **Properties**: `propiedades[]`, `propiedad`, `formDataPropiedad`, CRUD state
- **Organizations**: `organizaciones[]`
- **Modals**: boolean flags for `openModalUser`, `openModalAgregarPropiedad`, `openModalConfirmarEliminarPropiedad`, `openModalHamburguesa`, `openModalCambiarPassword`
- **Publishing wizard**: `contentNumber` (current step 0-2), `comprobarDireccion`, `confirmedLocation`
- **Global loader**: `cargandoGlobal`, `iniciarCarga()`, `terminarCarga()` — ref-counted so overlapping requests don't flicker the overlay

Access via `useAppContext()` from [src/context/AppContext.js](src/context/AppContext.js).

### API layer ([src/api/](src/api/))

| Module | Purpose | Auth method |
|---|---|---|
| `apiBackend.js` | JSON requests | JWT access token in `Authorization` header, auto-refreshes via cookie on 401 |
| `apiBackendFormData.js` | Multipart file uploads | Same JWT + refresh pattern |

All return a normalized shape: `{ success, message, data, error, status }`.

**Token refresh flow**: When a 401 is received and a token exists, both modules call `POST /auth/refresh` (with `credentials: "include"` to send the httpOnly refresh cookie), store the new access token in `localStorage`, and retry the original request once. On failure, they clear storage and redirect to `/login`.

### Auth flow

- Login: `POST /auth/login` → stores `usuario` + `accessToken` in localStorage
- Register: `POST /auth/registro` → auto-logs in
- Logout: `POST /auth/logout` → clears localStorage
- Session is restored on page load from localStorage (see `AppProvider` constructor)

### Custom hooks ([src/hooks/](src/hooks/))

| Hook | Purpose |
|---|---|
| **`useAuth`** | Login, register, logout handlers; form state management for auth forms |
| **`usePropiedades`** | CRUD for properties (create with images, publish announcement, update, delete, photo upload). Includes `publicarAnuncio()` for the wizard flow |
| **`useUsuarios`** | User profile updates (`actualizarUsuario`), password change, email verification (send/confirm/disable codes) |
| **`useOrganizaciones`** | Organization CRUD: create, update, manage custom domain, approve/suspend, fetch public orgs, resolve tenant |
| **`useGeo`** | Generic hook that fetches from backend endpoints, used for cascading country→state→city→barrio selects. Accepts `null` endpoint to skip fetching |
| **`useFavoritos`** | Toggle favorite property (`toggleFavorito`) and fetch user's favorites |
| **`useLeads`** | Lead pipeline: fetch leads, update lead status, contact lead |
| **`useTracking`** | Session and event tracking: `iniciarSesion()`, `registrarEvento()` |
| **`useLogsTracking`** | Fetch tracking logs from backend |
| **`usePropertySearch`** | Property search with filters: `buscarPorFiltros()`, `buscarPropiedadesMapa()`, `buscarEnBbox()` |
| **`usePropiedadesOrganizacionData`** | Fetches properties scoped to a specific organization by slug |
| **`useLocationInfo`** | Reverse geocode: get location info from coordinates |
| **`useSlugParser`** | Parses URL route segments into typed parameters (tipo, operacion, ciudad, departamento) for search routes |
| **`useModalUser`** | Controls user profile modal open/close state |
| **`useResetForm`** | Resets `formDataPropiedad` and `formDataUsuario` to initial values |
| **`useTypingPlaceholder`** | Animated typewriter effect for search placeholder |
| **`useTiempoRelativo`** | Relative time formatting (e.g., "Hace 3 h") |

### Utility modules

#### `src/lib/` — Pure utility functions

| Module | Purpose |
|---|---|
| `formatFirstTwoNames.js` | Truncates full name to first two names |
| `getInitials.js` | Extracts initials from a name string |
| `getRandomTailwindColors.js` | Returns random Tailwind color classes |
| `getUsernameFromEmail.js` | Derives username from email address |
| `phoneFormatter.js` | Formats phone numbers |
| `tiempoRelativo.js` | Relative time string generator (backup to hook) |
| `toCapitalize.js` | Capitalizes first letter |

#### `src/utils/` — App utilities

| Module | Purpose |
|---|---|
| `formatPrecio.js` | Formats price to COP currency display |
| `getSessionId.js` | Generates/retrieves UUID session ID from localStorage |
| `irArriba.js` | Scroll-to-top helper |
| `validatePassword.js` | Client-side password strength validation |

#### `src/config/` — Configuration

| Module | Purpose |
|---|---|
| `config.js` | Exports `URL_BACKEND` from `import.meta.env.VITE_API_URL` |
| `tenantConfig.js` | Defines `MAIN_HOSTS` from `import.meta.env.VITE_MAIN_HOSTS` to distinguish platform vs custom org domains |

### Features ([src/features/](src/features/))

#### `mapa-inmuebles/` — Property Map
- **`MapaInmuebles.jsx`** — Full-screen MapLibre GL map with supercluster-based property markers, bounding-box search, zoom-to-location
- **`PropertyCard.jsx`** — Property preview card overlaid on map
- **`api.js`** — Map-specific API calls (fetch properties in bbox, by polygon)
- **`mapPins.js`** — Pin/cluster rendering logic with supercluster

#### `seleccionar-zona/` — Zone Selection with Drawing
- **`index.jsx`** — Page wrapper: search for a location, draw polygon on map to select custom zone
- **`api.js`** — Fetches suggestions, properties within drawn polygon
- **`components/`**: `InputSearchZona.jsx`, `MapControls.jsx`, `MapHintBanner.jsx`, `MiniMapaUbicacion.jsx`, `SelectZonaMap.jsx` (Geoman drawing tools)
- **`hooks/useSelectZona.js`** — Zone selection state management
- **`utils/urlBuilder.js`** — Builds URL with zone parameters

### Page layout

#### Home (`/`) — Landing page
- `PagePrincipal.jsx` → `Hero.jsx` + `InfoCards.jsx` + `NavbarHome.jsx` + search modal
- GSAP-animated title (`AnimatedTitle.jsx`)

#### Feed (`/feed`) — Authenticated home
- Three-column layout: `Sidebar` (left, fixed 384px) + `Principal` (center feed) + `Actividad` (right)
- `Principal.jsx` renders `HeaderPrincipal` (top bar + filters) + `CardPropiedad` list
- `Sidebar.jsx` contains `HeaderSidebar`, `ItemsSidebar`, `MiOrganizacionesSidebar`, `FooterSidebar`

#### Publishing wizard (`/info/publicar-anuncio/publicar`)
- 3-step wizard controlled by `contentNumber` state:
  - **0 = DatosBasicos**: TipoSelect + OperationForm + Locationcascadeselect + LoactionForm + Addressmapmodal
  - **1 = Detalles**: PropertyCharacteristicsForm + FloorDoorBlockForm + ContactForm + Informacion
  - **2 = Fotos**: AddPhotosStep (image upload with preview, ordenamiento, eliminación)
- Step 1 creates a draft propiedad, saves `"ultimoAnuncioId"` to localStorage
- On revisiting without `?id=`, `ModalContinuarAnuncio` offers to resume or start fresh
- `HeaderPublicarAnuncio` shows progress across all 3 steps

#### Organization themes
- 4 themes (`tema1`-`tema4`) registered in `temaRegistry.js` with layout + page components
- Each theme has: `Layout.jsx`, `Home.jsx`, `Contacto.jsx`, `SobreNosotros.jsx` + `index.js`
- Temas 1 and 2 have full `home/` subdirectories with dedicated component sets (hero, agents, testimonials, property grids, maps, etc.)
- Temas 3 and 4 are scaffolded (5 files each, no `home/` subdirectory)
- Tema-selection via `TemaSelector.jsx` in org settings
- **Slot pattern**: `LayoutResolver.jsx`, `HomeTemaSlot.jsx`, `SobreNosotrosTemaSlot.jsx`, `ContactoTemaSlot.jsx` dynamically render the active theme's components

#### Organization management pages (`/organizaciones/*`)
| Page | Route | Purpose |
|---|---|---|
| `MiInmobiliariaPanel.jsx` | `/organizaciones/ajustes` | Edit org profile, theme, domain |
| `AgentesPanel.jsx` | `/organizaciones/agentes` | Manage org members (add/remove/change role) |
| `EstadisticasPanel.jsx` | `/organizaciones/estadisticas/:id` | Property and leads stats |
| `CrearOrganizacionForm.jsx` | `/inmobiliarias/nueva` | Create new organization |
| `SolicitarDominioForm.jsx` | (embedded) | Request custom domain for org |

#### Property search and listing
- `PropertySearchScreen.jsx` — Full-screen map search with filters
- `/:operationAndType/:cityAndDepartment` — Search results list with filters
  - `ListaPropiedades.jsx` → `EncabezadoBusqueda` + `FiltrosPrincipal` + `BreadcrumbUbicacion` + `CardAnuncio` grid
- `/:operationAndType/:cityAndDepartment/mapa` — Map view (`MapaInmueblesPage.jsx`)
- `ListaPruebaPropiedades.jsx` — `/lista-propiedades` with filter form (`FormFiltros.jsx`)

#### Property detail pages
| Route | Component | Purpose |
|---|---|---|
| `/inmueble/:id` | `PageAnuncio.jsx` | Public property listing page |
| `/inmueble/:id/foto/:fotoIndex` | `FotoVisor.jsx` | Fullscreen photo viewer with MapLibre GL map |
| `/propiedades/:id` | `PagePropiedadId.jsx` | Authenticated property detail with edit capabilities |

#### User pages
- `/usuario/tus-datos/perfil` — `MiPerfil.jsx` (Perfil component: avatar, name, email, phone)
- `/usuario/tus-datos/acceso` — `SeguridadAcceso.jsx` (Acceso component: password change, email verification, 2FA status)
- `/usuario/mis-anuncios` — `MisAnuncios.jsx` (ListaAnuncios / SinAnuncios)
- `/usuario/mis-anuncios/anuncio/:id` — `Anuncio.jsx` (DetalleDeAnuncio)
- `/usuario/favoritos` — `MisFavoritos.jsx` (ListaFavoritos / SinFavoritos)

#### Admin pages (`/admin/*`) — requires superadmin
| Route | Component |
|---|---|
| `/admin` | `Admin.jsx` |
| `/admin/rutas` | `AdminRutasPages.jsx` |
| `/admin/organizaciones` | `AdminOrganizacionesPage.jsx` — manage all orgs: approve, suspend, activate/disable domains |

#### Other pages
- `/leads` — `Leads.jsx` — Lead pipeline with contact modal
- `/logs` — `Logs.jsx` — Tracking log viewer

### Global loader

[LoaderGlobal.jsx](src/components/loader/LoaderGlobal.jsx) renders a full-screen translucent overlay with spinner. It's driven by a ref-counter (`contadorPeticiones`) in AppProvider — call `iniciarCarga()` before any async work and `terminarCarga()` in finally. The overlay only hides when the counter reaches 0, preventing flicker during overlapping requests.

### Data files ([src/data/](src/data/))

Static configuration for the UI (21 files):
- **Sidebar/menu**: `items_sidebar.jsx`, `items_menu.jsx`, `menus.js`, `links_inicio.js`
- **Search**: `frases_buscar.js`, `suggestions.search.jsx`, `tabs_busqueda.js`, `mappings_busqueda.js`, `search_tipo_options.js`
- **Properties**: `property_types.js`, `operation_options.js`, `rental_type_options.js`, `filtros_propiedades.js`
- **Location**: `colombia-data.js` (departments/cities)
- **Profile**: `data_perfil_usuario.js`
- **Publishing guide**: `info-publicar.js`
- **Styles**: `data.styles.scrollbar.js`
- **Other**: `infocards.js`, `skills_data.js`, `logo.js`, `mapaRutas.js`

### Environment

Backend URL is read from `VITE_API_URL` env var, defaulting to `http://localhost:3001`. Tenant mode distinction uses `VITE_MAIN_HOSTS`.
