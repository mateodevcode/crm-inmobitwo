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
features/       auth/ dashboard/ leads/ contactos/ pipeline/ agenda/ demandas/ tareas/ propiedades/ equipo/ ajustes/
hooks/          useAuth.js (check-email → password → OTP; reenvío; verificación email)
lib/utils.js    cn() · utils/ formato COP, fechas es-CO, teléfono, agenda.js (días/horas en Bogotá, UTC−5 fijo)
lib/sanitizarHtml.js  DOMPurify con lista blanca: único camino para dangerouslySetInnerHTML
```

## Rutas

`/login` · `/` Panel · `/leads` · `/contactos`, `/contactos/:id` · `/pipeline` ·
`/agenda` (`?visita=ID` abre el detalle) · `/demandas` (`?demanda=ID`) · `/tareas` · `/propiedades` · `/equipo` (agency_admin) · `/reportes` · `/ajustes` · `*`.

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

## Agenda y visitas (`features/agenda/`)

- API `/crm/visitas` (listar por rango `desde`/`hasta` en días de Bogotá, crear, editar,
  `POST /:id/estado`, borrar). Un 409 trae `data.choques` → la UI ofrece "Agendar igualmente" (`forzar`).
- Fechas: siempre con `utils/agenda.js` (`isoBogota`, `claveDia`, `minutosDelDia`…), nunca con
  la zona del navegador. Al backend se manda ISO con `-05:00`.
- Al editar, enviar `inicio_at`/`duracion_min`/`recordatorio_minutos` solo si cambiaron: el backend
  trata un cambio de horario como reprogramación (vuelve a `programada`, reinicia el recordatorio).
- `TarjetaVisitas` es reutilizable (panel: visitas de hoy; ficha de contacto: historial con `ocultarContacto`).
- Estados y colores en `features/agenda/estados.js`.

## Demandas y cruce (`features/demandas/`)

- API `/crm/demandas` (+ `/:id/coincidencias?alcance=cartera|portal`, `/:id/vistas`,
  `PUT|DELETE /:id/propiedades/:propiedadId` con `estado` enviada|descartada) y
  `/crm/propiedades/:id/demandas` (interesados). Catálogos livianos: `/crm/catalogos/ciudades?q=`,
  `/crm/catalogos/barrios?city_id=`; tipos de inmueble desde `/catalogos/tipos-inmueble`.
- La demanda devuelve `ciudades`, `barrios` y `tipos` como `[{ id, nombre }]`.
- El cruce acepta hasta 10 % sobre el precio máximo (`sobre_presupuesto`). "Portal" excluye la
  cartera propia y solo trae publicados. Visita desde una coincidencia: solo cartera.
- Componentes: `DemandasPage`, `DemandaDialog`, `Coincidencias`, `TarjetaDemandas` (ficha de
  contacto), `InteresadosSheet` (tabla de propiedades). Textos en `criterios.js`.

## Pruebas locales

- `.claude/launch.json` (raíz del monorepo): `backend-crons-apagados` (puerto 3001, con
  `PAGOS_CRON_ENABLED`, `VISITAS_CRON_ENABLED`, `DEMANDAS_CRON_ENABLED` y `CRON_BUSQUEDAS_ENABLED`
  en `false`, vía `.claude/crons-off.env`) y `crm` (5173).
- **El `.env` del backend apunta a la BD de producción**: no crear datos sin permiso y limpiarlos al terminar.
