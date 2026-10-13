# Graph Report - frontend-inmobitwo  (2026-08-15)

## Corpus Check
- 371 files · ~292,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1153 nodes · 1314 edges · 189 communities (138 shown, 51 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20157ec7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FormFiltros.jsx
- Architecture
- temaRegistry.js
- ModalHamburguesa.jsx
- DetallePropiedad.jsx
- SelectZonaMap.jsx
- dependencies
- usePropiedades
- descargas/DescargarApp.jsx
- devDependencies
- tauri.conf.json
- useFavoritos.js
- galeriaUtils.js
- BarraNavegacionTauri.jsx
- MapaInmuebles.jsx
- DatosBasicos.jsx
- Fotos.jsx
- main.jsx
- tema1/home/Home.jsx
- Sidebar.jsx
- AppRouter.jsx
- hero/Hero.jsx
- PropertySearchWidget.jsx
- anuncioProgreso.js
- useDatosBasicos
- tema1/home/FooterSection.jsx
- tema2/home/Home.jsx
- tema2/home/FooterSection.jsx
- DownloadAppSection.jsx
- GetInTouchSection.jsx
- default.json
- info-publicar.js
- useResetForm.js
- Header.jsx
- tabs_busqueda.js
- useDetalles.js
- tema1/home/PropertyGrid.jsx
- tema2/home/PropertyGrid.jsx
- FloorDoorBlockForm.jsx
- Acceso.jsx
- PropertySearchScreen.jsx
- validatePassword.js
- FAQSection.jsx
- FeaturedPropertyHero.jsx
- React + Vite
- colombia-data.js
- descargas.jsx
- ParqueaderoServicios
- Optimización de Rendimiento — InmobiTwo
- AgentsSlider.jsx
- PillarHelpSection.jsx
- ClientTestimonials.jsx
- MeetOurAgents.jsx
- WhyChooseUs.jsx
- validatePhone.js
- ModalCambiarPassword.jsx
- ESTRATOS
- items_sidebar.jsx
- ZONAS
- useAbrirFotoVisorDesdeState
- Logs.jsx
- feedStore.js
- PropertySlider.jsx
- MarketProperty.jsx
- tema2/home/TopHeader.jsx
- AdvantagesSection.jsx
- PublishingGuideSection.jsx
- ServicesSection.jsx
- components/Precio.jsx
- MiniMapaUbicacion.jsx
- formatPrecio.js
- getSessionId.js
- apiBackend.js
- apiBackendFormData.js
- refreshToken.js
- favoritosStore.js
- AppContext.js
- TenantContext.js
- logo.js
- mapaRutas.js
- mappings_busqueda.js
- useTiempoRelativo.js
- getRandomTailwindColors.js
- PagePrincipal.jsx
- Leads.jsx
- CrearOrganizacionForm.jsx
- organizacionRoutes.jsx
- PropertyMap.jsx
- staticCache.js
- config.js
- barrios.js
- caracteristicas_inmueble.js
- data_perfil_usuario.js
- data.styles.scrollbar.js
- estados_inmueble.js
- filtros_propiedades.js
- fotos.jsx
- frases_buscar.js
- frases.hero.js
- infocards.js
- items_menu.jsx
- items-nav-hamburguer.js
- links_inicio.js
- menus.js
- search_tipo_options.js
- skills_data.js
- suggestions.search.jsx
- tipos_vivienda.js
- useOrganizaciones.js
- DetalleDeAnuncio.jsx
- usePreloadData.js
- BotonUsuario.jsx

## God Nodes (most connected - your core abstractions)
1. `Architecture` - 16 edges
2. `SectionTitle()` - 13 edges
3. `usePropiedades()` - 11 edges
4. `Page layout` - 11 edges
5. `CheckboxFiltro()` - 10 edges
6. `BarraNavegacionTauri()` - 8 edges
7. `Loading()` - 8 edges
8. `scripts` - 7 edges
9. `Logo()` - 7 edges
10. `Optimización de Rendimiento — InmobiTwo` - 7 edges

## Surprising Connections (you probably didn't know these)
- `MapaInmuebles()` --references--> `supercluster`  [EXTRACTED]
  src/pages/mapa-inmuebles/MapaInmuebles.jsx → package.json
- `useDatosBasicos()` --references--> `COUNTRY_CODES`  [EXTRACTED]
  src/hooks/useDatosBasicos.js → src/data/contact_options.js
- `useDatosBasicos()` --references--> `CONTACT_PREFERENCES`  [EXTRACTED]
  src/hooks/useDatosBasicos.js → src/data/contact_options.js
- `useDatosBasicos()` --references--> `OPERATION_OPTIONS`  [EXTRACTED]
  src/hooks/useDatosBasicos.js → src/data/operation_options.js
- `useDatosBasicos()` --references--> `RENTAL_TYPE_OPTIONS`  [EXTRACTED]
  src/hooks/useDatosBasicos.js → src/data/rental_type_options.js

## Import Cycles
- None detected.

## Communities (189 total, 51 thin omitted)

### Community 0 - "FormFiltros.jsx"
Cohesion: 0.08
Nodes (31): INDICE_ORDEN, ordenarPropertyTypes(), PROPERTY_TYPES_DESCRIPCIONES, PROPERTY_TYPES_FALLBACK, Alcobas(), OPCIONES, Banos(), OPCIONES (+23 more)

### Community 1 - "Architecture"
Cohesion: 0.05
Nodes (36): Admin pages (`/admin/*`) — requires superadmin, API layer ([src/api/](src/api/)), Architecture, Auth flow, Commands, Custom hooks ([src/hooks/](src/hooks/)), Data files ([src/data/](src/data/)), Directory structure (`src/`) (+28 more)

### Community 3 - "ModalHamburguesa.jsx"
Cohesion: 0.05
Nodes (28): Logo(), ConLogin(), DescargarApp(), EnlacesHamburguesa(), SinLogin(), OPCIONES_ORDEN, BotonGuardarBusqueda(), BreadcrumbUbicacion() (+20 more)

### Community 4 - "DetallePropiedad.jsx"
Cohesion: 0.18
Nodes (9): BarraNavegacion(), BotonDescartar(), BotonFavorito(), CardPrincipal(), DetalleInmuble(), GaleriaInmuebles(), HeaderDinamico(), SidebarContacto() (+1 more)

### Community 5 - "SelectZonaMap.jsx"
Cohesion: 0.11
Nodes (23): expandTipoInmueble(), fetchBarrios(), fetchCitiesGeoJSON(), fetchGeoCount(), fetchInmueblesEnPoligono(), fetchRegionsGeoJSON(), fetchStatesGeoJSON(), LocationControl() (+15 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (31): @geoman-io/maplibre-geoman-free, gsap, @gsap/react, @headlessui/react, lucide-react, maplibre-gl, motion, dependencies (+23 more)

### Community 7 - "usePropiedades"
Cohesion: 0.10
Nodes (18): ModalUserPropiedadId(), HeaderPropiedadId(), PropiedadId(), appendCamposPropiedad(), CAMPOS_PROPIEDAD, camposPropiedad(), normalizarCoord(), propiedadCache (+10 more)

### Community 8 - "descargas/DescargarApp.jsx"
Cohesion: 0.12
Nodes (13): AllInstallers(), Audiences(), audiencias, CliInstall(), DownloadHero(), LogoLink(), MobileApp(), ventajas (+5 more)

### Community 9 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+20 more)

### Community 10 - "tauri.conf.json"
Cohesion: 0.08
Nodes (24): icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, debugApplicationIdSuffix, app, security (+16 more)

### Community 12 - "galeriaUtils.js"
Cohesion: 0.16
Nodes (13): PropertyImage(), CardPropiedad(), ImagenesCard(), HeaderFiltros(), HeaderPrincipal(), InputSearchPrincipal(), agruparPorOrden(), ANCHOS_PX (+5 more)

### Community 13 - "BarraNavegacionTauri.jsx"
Cohesion: 0.08
Nodes (8): BarraNavegacionTauri(), ModalInformativo(), ESTADOS, OrganizacionNav(), Loading(), ListaFavoritos(), SinFavoritos(), isTauri()

### Community 14 - "MapaInmuebles.jsx"
Cohesion: 0.18
Nodes (13): supercluster, expandTipoInmueble(), fetchInmueblesEnBbox(), fetchPropiedadResumen(), MapaInmuebles(), slugify(), createClusterIcon(), createPricePin() (+5 more)

### Community 15 - "DatosBasicos.jsx"
Cohesion: 0.18
Nodes (7): CheckBoxUnico(), RadioGroupInput(), TipoSelect(), CheckPublicarPorInmobiliaria(), Operacion(), TipoAlquiler(), TipoInmueble()

### Community 16 - "Fotos.jsx"
Cohesion: 0.18
Nodes (7): GaleriaDropzone(), GaleriaPreviewGrid(), InfoBannerBlue(), NoPhotosWarningModal(), PrincipalDropzone(), TipsList(), WizardFooter()

### Community 17 - "main.jsx"
Cohesion: 0.19
Nodes (7): App(), ConsentimientoBanner(), LoaderGlobal(), ModalContactoLead(), MAIN_HOSTS, AppProvider(), TenantProvider()

### Community 18 - "tema1/home/Home.jsx"
Cohesion: 0.13
Nodes (9): items, Navbar(), neighborhoods, NeighborhoodsSection(), ScrollToTop(), testimonials, TestimonialsSection(), contactItems (+1 more)

### Community 19 - "Sidebar.jsx"
Cohesion: 0.22
Nodes (6): BotonAdminOrganizaciones(), FooterSidebar(), HeaderSidebar(), ItemsSidebar(), MiOrganizacionesSidebar(), toCapitalize()

### Community 20 - "AppRouter.jsx"
Cohesion: 0.16
Nodes (9): NuevoProfesional(), OlvidastePassword(), DescargarApp, FotoVisor, ListaPropiedades, MapaInmueblesPage, PageAnuncio, PublicarAnuncio (+1 more)

### Community 21 - "hero/Hero.jsx"
Cohesion: 0.23
Nodes (6): AnimatedTitle(), TIPO_DEFAULT, InputSearchPrincipal(), ModalSuggestionsMenu(), DEFAULT, SelectorTipo()

### Community 22 - "PropertySearchWidget.jsx"
Cohesion: 0.18
Nodes (10): BEDROOMS, formatPrice(), LOCATIONS, MAX_AREAS, MIN_AREAS, PriceRangeSlider(), PROPERTY_TYPES, PropertySearchWidget() (+2 more)

### Community 23 - "anuncioProgreso.js"
Cohesion: 0.23
Nodes (9): actualizarPaso(), guardarProgreso(), leerProgreso(), limpiarProgreso(), limpiarSnapshot(), limpiarTodo(), PASO_DATOS_BASICOS, PASO_DETALLES (+1 more)

### Community 24 - "useDatosBasicos"
Cohesion: 0.20
Nodes (7): CONTACT_PREFERENCES, COUNTRY_CODES, OPERATION_OPTIONS, OPERATION_TYPE_IDS, RENTAL_TYPE_IDS, RENTAL_TYPE_OPTIONS, useDatosBasicos()

### Community 25 - "tema1/home/FooterSection.jsx"
Cohesion: 0.18
Nodes (6): featuredHouses, FooterSection(), partnerLogos, QR_PATTERN, quickLinks, supportLinks

### Community 26 - "tema2/home/Home.jsx"
Cohesion: 0.24
Nodes (5): CITIES, ExploreNeighborhoods(), avatars, Hero(), ScrollToTop()

### Community 27 - "tema2/home/FooterSection.jsx"
Cohesion: 0.18
Nodes (6): featuredHouses, FooterSection(), partnerLogos, QR_PATTERN, quickLinks, supportLinks

### Community 29 - "GetInTouchSection.jsx"
Cohesion: 0.22
Nodes (3): GetInTouchSection(), marqueeItems, repeatedItems

### Community 30 - "default.json"
Cohesion: 0.25
Nodes (7): core:default, main, description, identifier, permissions, $schema, windows

### Community 31 - "info-publicar.js"
Cohesion: 0.25
Nodes (7): AYUDA_LINKS, BUSCAS_INMUEBLE_LINKS, LANGUAGES, PAISES_LINKS, PROFESIONAL_LINKS, SOBRE_LINKS, TIENES_INMUEBLE_LINKS

### Community 32 - "useResetForm.js"
Cohesion: 0.32
Nodes (4): useAuth(), FORM_DATA_PROPIEDAD_INICIAL, FORM_DATA_USUARIO_INICIAL, useResetForm()

### Community 33 - "Header.jsx"
Cohesion: 0.32
Nodes (5): Header(), links, Navbar(), socials, TopBar()

### Community 34 - "tabs_busqueda.js"
Cohesion: 0.29
Nodes (4): TAB_ALQUILAR, TAB_COMPRAR, TAB_OBRA_NUEVA, TAB_VACACIONAL

### Community 35 - "useDetalles.js"
Cohesion: 0.43
Nodes (6): cargarCatalogos(), cargarFeaturesDePropiedad(), featuresCache, getTituloSugerido(), tituloCache, useDetalles()

### Community 36 - "tema1/home/PropertyGrid.jsx"
Cohesion: 0.33
Nodes (5): CATEGORIES, formatPrice(), properties, PropertyCard(), PropertyGrid()

### Community 37 - "tema2/home/PropertyGrid.jsx"
Cohesion: 0.33
Nodes (5): CATEGORIES, formatPrice(), properties, PropertyCard(), PropertyGrid()

### Community 38 - "FloorDoorBlockForm.jsx"
Cohesion: 0.29
Nodes (3): BLOCK_OPTIONS, DOOR_OPTIONS, FLOOR_OPTIONS

### Community 39 - "Acceso.jsx"
Cohesion: 0.29
Nodes (3): Acceso(), HeadPerfilAcceso(), Perfil()

### Community 40 - "PropertySearchScreen.jsx"
Cohesion: 0.47
Nodes (4): usePropertySearch(), MAPPING_OPERACIONES, MAPPING_TIPOS, PropertySearchScreen()

### Community 43 - "FeaturedPropertyHero.jsx"
Cohesion: 0.40
Nodes (3): FeaturedPropertyHero(), formatPrice(), slides

### Community 44 - "React + Vite"
Cohesion: 0.40
Nodes (4): Expanding the ESLint configuration, frontend-inmobitwo, React Compiler, React + Vite

### Community 45 - "colombia-data.js"
Cohesion: 0.40
Nodes (4): agentes, departamentosCiudades, estadosPropiedad, tiposPropiedad

### Community 46 - "descargas.jsx"
Cohesion: 0.40
Nodes (3): cliCommands, descargas, ordenSO

### Community 47 - "ParqueaderoServicios"
Cohesion: 0.50
Nodes (3): PARQUEADERO_MODOS, PARQUEADERO_TIPOS, ParqueaderoServicios()

### Community 48 - "Optimización de Rendimiento — InmobiTwo"
Cohesion: 0.22
Nodes (8): Checklist para CADA nuevo endpoint, Herramientas disponibles, Matriz de decisión (por tipo de dato), Optimización de Rendimiento — InmobiTwo, Plantilla, Principios, Referencias de implementación, Reglas para el estado

### Community 49 - "AgentsSlider.jsx"
Cohesion: 0.50
Nodes (3): agents, AgentsSlider(), getItemsPerView()

### Community 50 - "PillarHelpSection.jsx"
Cohesion: 0.50
Nodes (3): getItemsPerView(), items, PillarHelpSection()

### Community 52 - "MeetOurAgents.jsx"
Cohesion: 0.40
Nodes (3): AGENTS, MeetOurAgents(), SOCIALS

### Community 53 - "WhyChooseUs.jsx"
Cohesion: 0.40
Nodes (3): AVATARS, SERVICES, WhyChooseUs()

### Community 54 - "validatePhone.js"
Cohesion: 0.80
Nodes (4): filtrarTelefonosValidosColombia(), limpiarTelefono(), normalizarTelefonoColombia(), validarTelefonoColombia()

### Community 55 - "ModalCambiarPassword.jsx"
Cohesion: 0.67
Nodes (3): getPasswordChecklist(), ModalCambiarPassword(), REQUISITOS

### Community 57 - "items_sidebar.jsx"
Cohesion: 0.50
Nodes (3): items_admin, items_organizacion, items_sidebar

### Community 60 - "Logs.jsx"
Cohesion: 0.67
Nodes (3): COLOR_POR_TIPO, formatearHora(), Logs()

### Community 61 - "feedStore.js"
Cohesion: 0.32
Nodes (6): feedActions, getFeedSnapshot(), listeners, state, subscribeFeed(), useFeed()

### Community 62 - "PropertySlider.jsx"
Cohesion: 0.67
Nodes (3): getItemsPerView(), PropertySlider(), propertyTypes

### Community 68 - "components/Precio.jsx"
Cohesion: 0.67
Nodes (3): COLORES_NIVEL, formato(), Precio()

### Community 72 - "getSessionId.js"
Cohesion: 0.83
Nodes (3): generarSessionId(), generarUUIDFallback(), getSessionId()

### Community 76 - "favoritosStore.js"
Cohesion: 0.38
Nodes (5): favoritos, getFavoritosSnapshot(), listeners, subscribeFavoritos(), useFavoritosStore()

### Community 99 - "PropertyMap.jsx"
Cohesion: 0.38
Nodes (5): Hero(), formatPrice(), properties, PropertyMap(), PropertyPopup()

### Community 100 - "staticCache.js"
Cohesion: 0.47
Nodes (5): fetchStaticJson(), inFlight, memory, readStaticCache(), writeStaticCache()

### Community 127 - "useOrganizaciones.js"
Cohesion: 0.60
Nodes (4): invalidarMisOrgCache(), misOrgCache, misOrgCacheKey(), useOrganizaciones()

### Community 146 - "usePreloadData.js"
Cohesion: 0.67
Nodes (3): preloadStaticData(), STATIC_ENDPOINTS, usePreloadData()

## Knowledge Gaps
- **264 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+259 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logo()` connect `ModalHamburguesa.jsx` to `BarraNavegacionTauri.jsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `BarraNavegacionTauri()` connect `BarraNavegacionTauri.jsx` to `usePropiedades`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _264 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `FormFiltros.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07547169811320754 - nodes in this community are weakly interconnected._
- **Should `Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `temaRegistry.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `ModalHamburguesa.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054426705370101594 - nodes in this community are weakly interconnected._