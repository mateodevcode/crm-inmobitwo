# CLAUDE.md — crm-inmobitwo

CRM para anunciantes (personas con anuncios, agentes e inmobiliarias).
Vite 7 + React 19 + JS/JSX (nada de TypeScript) + Tailwind 4 CSS-first + shadcn Radix + React Router 7.

## Comandos

```bash
npm run dev       # Vite en http://localhost:5173 (strictPort)
npm run build     # Build producción a dist/
npm run preview   # Previsualiza dist/
npm run lint      # ESLint (0 errores exigido)
```

## Stack

React 19, `@tanstack/react-query` (datos servidor), `react-hook-form + zod`,
`@dnd-kit` (kanban), `recharts` (reportes), `sonner` (toasts), `lucide-react` (iconos),
Montserrat vía `@fontsource-variable/montserrat`.

## Convenciones Colombia (obligatorias)

- Moneda COP enteros `$ 72.000.000`; valores en BD `BIGINT`.
- Locale `es-CO`, zona `America/Bogota`, fechas `dd/mm/aaaa`.
- Teléfonos: 10 dígitos desde 3, país 57; WhatsApp `https://wa.me/57XXXXXXXXXX`.
- Español neutro/colombiano. Habeas Data Ley 1581: autorización registrada, rectificar/suprimir.
- Backend: JS ESM, `pg` sin ORM, SQL idempotente, kebab-case, `{ success, data | error }`.

## Arquitectura src/

```
api/            apiBackend.js (JSON) + apiBackendFormData.js — header X-Crm-Espacio
config/         URL_BACKEND, PORTAL_URL, LOCALE, ZONA_HORARIA, MONEDA
context/        AuthProvider (usuario, estaAutenticado, cargandoSesion, cerrarSesion)
                WorkspaceProvider (espacio personal|org:{id}, rolEnOrg, puedeAdministrar)
                espacio.js (helpers)
router/         AppRouter.jsx + guards.jsx (RutaPrivada, RutaPublica, RutaAdminOrg)
layouts/        CrmLayout.jsx (SidebarProvider + AppSidebar + SiteHeader + Outlet)
components/ui/  shadcn (button, card, dialog, table, form, sonner…)
components/     app-sidebar, nav-main, nav-user, workspace-switcher, site-header
components/comunes/ PageHeader, EmptyState, ConfirmDialog, EnConstruccion
features/       auth/ dashboard/ leads/ contactos/ pipeline/ tareas/ propiedades/ equipo/ ajustes/
hooks/          useAuth.js (check-email → password → OTP; reenvío; verificación email)
lib/utils.js    cn() · utils/ formato COP, fechas es-CO, teléfono
```

## Rutas

`/login` · `/` Panel · `/leads` · `/contactos`, `/contactos/:id` · `/pipeline` ·
`/tareas` · `/propiedades` · `/equipo` (agency_admin) · `/reportes` · `/ajustes` · `*`.

## Sesión y espacio

- `localStorage`: `access_token`, `usuario`, `crm_espacio`.
- Sin access → `POST /auth/refresh` (cookie httpOnly) → `GET /auth/me`.
- Login: `POST /auth/check-email` → `POST /auth/login` → (OTP `POST /auth/verificar-otp-login`)
  o sesión directa. Email no verificado: `POST /usuarios/:id/enviar-codigo|confirmar-codigo`.
- Registro y recovery viven en el portal (`VITE_PORTAL_URL`).
- Espacios: `GET /organizaciones/mias` (filtra aprobadas); cambio invalida queries.
- Todo request lleva `X-Crm-Espacio`. Caducada → `/login?origen=`.

## Backend relacionado

- CORS (`cors` 2.x) refleja headers → `X-Crm-Espacio` permitido sin cambios.
- Cookie refresh: host API, `sameSite=strict`; mismo site `seventwo.tech`, sin cambios.
- Servidor necesita en `FRONTEND_URL`: `https://crm.inmobitwo.seventwo.tech` (+ `http://localhost:5173` en dev).
- Endpoints CRM bajo `/crm` (fase 1+).

## Despliegue

- `nginx/crm-inmobitwo.conf` → `crm.inmobitwo.seventwo.tech`, root `/srv/infra/inmobitwo/crm-inmobitwo/dist`.
- `.github/workflows/deploy-crm.yml` en push a main.
- Pasos manuales VPS: `docs/VPS-PASOS-MANUALES.md`.

## Reglas repo

- Commits pequeños por paso. Tras modificar código: `graphify update .` (según AGENTS.md raíz).
- No secretos en código ni logs; textos personales nunca en logs.
