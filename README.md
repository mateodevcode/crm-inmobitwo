# frontend-inmobitwo

Red social inmobiliaria + sitios web para inmobiliarias (multi-tenant por dominio). React 19 + Vite 7, JS plano (sin TypeScript), Tailwind CSS 4.

## Stack

| Capa | Tech |
|---|---|
| UI | React 19, react-router-dom v7, Tailwind 4, motion, gsap, headlessui, sonner, lucide + react-icons |
| Mapas | MapLibre GL, Geoman (dibujo de zonas), supercluster (clusters) |
| Editor | TipTap + DOMPurify |
| Build | Vite 7 (`@/` → `src/`) |
| Desktop | Tauri (opcional, `npm run tauri`) |

## Scripts

```bash
npm run dev      # Vite en http://localhost:5173 (usa .env.development)
npm run build    # Build producción → dist/
npm run preview  # Previsualizar el build
npm run lint     # ESLint
```

En la raíz del proyecto hay `dev.sh` que levanta todo (Docker + backend + frontend) y `dev-stop.sh` para apagar.

## Cómo está organizado (`src/`)

```
src/
├── api/                  # Cliente HTTP (apiBackend.js JSON, apiBackendFormData.js uploads, refreshToken.js)
├── assets/               # Imágenes estáticas
├── components/           # UI reutilizable (principal/feed, propiedades, publicar-anuncio, login, registro, sidebar, usuario, modales, loader…)
├── config/               # config.js (URL_BACKEND), tenantConfig.js (MAIN_HOSTS)
├── context/              # AppProvider (estado global) + TenantProvider (modo red-social / organización)
├── data/                 # Catálogos estáticos de UI (opciones, frases, tabs, data Colombia…)
├── features/             # mapa-inmuebles (mapa + clusters) y seleccionar-zona (dibujo Geoman)
├── hooks/                # 17 hooks (useAuth, usePropiedades, useOrganizaciones, useGeo, useFavoritos, useLeads, useTracking…)
├── lib/ / utils/         # Funciones puras (formatos, fechas, validación, scroll…)
├── pages/                # Páginas por ruta (inicio, feed, anuncio, lista-propiedades, usuario, admin, organizacion…)
└── router/               # AppRouter.jsx + guards.jsx (RutaPrivada, RutaAdmin, RutaPublica)
```

## Cómo funciona

**Arranque** (`main.jsx`): `AppProvider` → `TenantProvider` → `App` → `AppRouter`, más `LoaderGlobal`, banner de consentimiento, modal de contacto y `Toaster`.

**Doble modo por dominio** (`TenantProvider`): compara `window.location.hostname` con `VITE_MAIN_HOSTS`.
- **red-social** (dominio principal): SPA completa con todas las rutas.
- **organizacion** (dominio propio de una inmobiliaria): solo Home / Sobre nosotros / Contacto con el tema de esa org (4 temas en `pages/organizacion/paginas/tema*`, seleccionados por slots `*TemaSlot`).

**Rutas** (`router/AppRouter.jsx`): públicas (`/`, `/inmueble/:id`, búsquedas, mapas), privadas (`/feed`, publicar, perfil, favoritos, leads…), admin (`/admin/*`, rol `superadmin`). Guards en `router/guards.jsx` redirigen a `/login` o `/feed` según sesión.

**Estado global** (`AppProvider`, vía `useAppContext()`): auth (`usuario`, `estaAutenticado`, `esSuperAdmin`), propiedades, organizaciones, modales, wizard de publicación (`contentNumber` 0-2) y loader global con contador de referencias.

**Wizard publicar anuncio** (`/info/publicar-anuncio/publicar`): 3 pasos (básicos → detalles → fotos), crea borrador en el paso 1 y ofrece continuar (`ModalContinuarAnuncio`) si vuelves sin `?id=`.

## Cómo se conecta al backend

- **URL base**: `VITE_API_URL` (`src/config/config.js` → `URL_BACKEND`). Solo hay dos valores válidos: `http://localhost:3001` (`.env.development`) y `https://api.inmobitwo.seventwo.tech` (`.env.production`). En producción el backend vive en el subdominio `api`, con proxy nginx al contenedor `:3001`.
- **Cliente** (`src/api/apiBackend.js`): `fetch` JSON con `{ success, message, data, error, status }` normalizado. Siempre envía `credentials: "include"` (cookie `refresh_token` httpOnly), `Authorization: Bearer <access_token>` (guardado en `localStorage`) y `X-Tenant-Host` con el dominio actual (el backend lo usa para resolver la organización).
- **Refresh automático**: ante un `401` con token existente, llama `POST /auth/refresh`, guarda el nuevo access token y reintenta una vez; si falla, limpia sesión y manda a `/login`.
- **Login/registro** (`useAuth`): `POST /auth/login|registro` → guarda `usuario` + `accessToken`; la sesión se restaura desde `localStorage` al cargar. Logout: `POST /auth/logout`.
- **Uploads** (`apiBackendFormData.js`): multipart para fotos/planos (el backend los sube a S3, nunca se sirven desde el frontend).
- **CORS/cookies**: el backend solo acepta el origen del frontend (`FRONTEND_URL`) más los dominios propios activos en DB; la cookie `refresh_token` es `Secure` + `SameSite=Strict`, por eso frontend y API van en HTTPS bajo el mismo dominio padre (`seventwo.tech`).

## Variables de entorno

| Archivo | Cuándo se usa | Contenido |
|---|---|---|
| `.env.development` | `npm run dev` | `VITE_API_URL=http://localhost:3001` |
| `.env.production` | `npm run build` en el VPS (**manual, gitignored**) | `VITE_API_URL=https://api.inmobitwo.seventwo.tech`, `VITE_MAIN_HOSTS=inmobitwo.seventwo.tech,localhost:5173` |
| `.env.production.example` | Plantilla commiteable | Mismo contenido sin secretos (no hay secretos, son URLs públicas) |

## Deploy

Push a `main` → GitHub Actions (`.github/workflows/deploy-frontend.yml`, secrets `VPS_HOST/VPS_USER/VPS_SSH_KEY`):
1. Clona/actualiza en `/srv/infra/inmobitwo/frontend-inmobitwo` (preserva `.env.production`, falla si no existe).
2. `npm ci` + `npm run build` en el VPS.
3. Certbot `--nginx` (certificado independiente, solo si no existe) + copia `nginx/inmobitwo.conf` a sites-available y `reload`.

## Estándar de Loaders (obligatorio para cualquier implementación)

Cada vez que se agregue o modifique un flujo con carga de datos, seguir estas reglas. Si no, se genera el bug de "doble loader" y parpadeo del overlay global.

### Regla principal: cargas de página usan loader LOCAL, no el overlay global

- Las **cargas de datos de una página/vista** (feed, mis-anuncios, favoritos, búsqueda, detalle) NO deben llamar a `iniciarCarga()`/`terminarCarga()`.
- Cada página muestra su propio loader local:
  - `<SmartLoader delay={300} />` (spinner inteligente: solo aparece si tarda >delay) para listas/búsquedas.
  - `<Loading type="opcion2" />` para estados locales propios de una página.
- El **estado local de carga** viene de un store externo, no de `cargandoGlobal`:
  - Feed: `useFeed().loading` (y `cargandoMas` para el botón "Ver más").
  - Favoritos: `useFavoritosLoadingStore()`.

### LoaderGlobal (overlay full-screen)

- Se usa SOLO para **mutaciones / acciones pesadas** que requieren bloquear la UI (crear/editar/eliminar anuncio, cambiar password, guardar contacto, etc.).
- Tiene `delay = 250ms` integrado: no aparece en operaciones rápidas. No volver a quitar ese delay.
- Si una función de "carga de página" llama `iniciarCarga()`, es un bug: mover ese estado a un loader local/store.

### Reglas de caché para evitar cargas repetidas

- Datos **estáticos** (catálogos, geo, barrios): `usePreloadData` / `fetchStaticJson` (`src/hooks/staticCache.js`). Nunca fetch on-demand.
- Datos dinámicos repetidos: caché a nivel de módulo keyed por id/combo (ver `useDetalles.js`, `propiedadCache` en `usePropiedades.js`).
- `cargarCountMisAnuncios`: tiene caché por usuario (TTL 30s). No cambiar a fetch sin caché.

### Checklist al implementar cualquier loader

1. ¿Es carga de página? → loader local (SmartLoader o store), NUNCA `iniciarCarga()`.
2. ¿Es mutación pesada? → `iniciarCarga()`/`terminarCarga()` (dispara LoaderGlobal con delay).
3. ¿El estado de carga viene de `cargandoGlobal` en una página? → reemplazarlo por el loader local del store.
4. ¿Hay datos estáticos pidiéndose on-demand? → precarga/caché.
5. Referencia completa de patrones: ver `README_OPTIMIZACION.md`.
