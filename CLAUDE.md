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
router/         AppRouter.jsx (páginas con lazy + Suspense/CargandoPagina) + guards.jsx (RutaPrivada, RutaPublica, RutaAdminOrg)
layouts/        CrmLayout.jsx (SidebarProvider + AppSidebar + SiteHeader + Outlet)
components/ui/  shadcn (button, card, dialog, table, form, sonner…)
components/     app-sidebar, nav-main, nav-user, workspace-switcher, site-header (campana de avisos)
components/comunes/ PageHeader, EmptyState, ConfirmDialog, EnConstruccion
features/       auth/ dashboard/ leads/ contactos/ bandeja/ pipeline/ agenda/ demandas/ captaciones/ tareas/ propiedades/ equipo/ importacion/ notificaciones/ habeas/ ajustes/
hooks/          useAuth.js (check-email → password → OTP; reenvío; verificación email)
lib/utils.js    cn() · utils/ formato COP, fechas es-CO, teléfono, agenda.js (días/horas en Bogotá, UTC−5 fijo)
lib/sanitizarHtml.js  DOMPurify con lista blanca: único camino para dangerouslySetInnerHTML
```

## Rutas

`/login` · `/` Panel · `/bandeja` · `/leads` · `/contactos`, `/contactos/:id` · `/pipeline` ·
`/agenda` (`?visita=ID` abre el detalle) · `/demandas` (`?demanda=ID`) · `/captaciones` · `/tareas` · `/propiedades` · `/equipo` (agency_admin; `?tab=miembros|reparto|metas`) · `/reportes` · `/importar` (`?tipo=contactos|inmuebles`) · `/notificaciones` · `/habeas-data` (`?contacto=ID`; personal o agency_admin) · `/ajustes` · `*`.

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

## Captación y propietarios (`features/captaciones/`)

- API `/crm/captaciones` (filtros `estado`, `vence_en_dias`, `propietario_id`, `asignado`),
  `/crm/propiedades/:id/captacion` (o `null`), documentos en `/crm/captaciones/:id/documentos[/:docId]`.
- Una captación por inmueble; se registra desde Propiedades → "Captación" (`CaptacionSheet`).
- Fechas `inicio_el`/`vence_el` llegan como texto `aaaa-mm-dd`; `dias_para_vencer` en días de Bogotá.
- Documentos privados: subir con `apiBackendFormData` (campo `archivo` + `tipo`), descargar SOLO con
  `descargarDocumento()` (fetch con token → blob). Nunca hay URL pública.

## Cartera (`features/propiedades/`)

- `GET /crm/propiedades` trae `ofertas` (`[{ operacion, precio, estado }]`, estado = listing_status) y
  `captacion`; filtros `estado` (publicado|no_publicado) y `oferta` (active|sold|rented|inactive|sin_oferta).
- Masivo: `POST /crm/propiedades/acciones { ids, accion: publicar|pausar }` → `{ actualizados, omitidos }`.
- Duplicar: `POST /crm/propiedades/:id/duplicar` (sin fotos ni ubicación oculta; queda sin publicar).
- Vendido/arrendado/reactivar: endpoint existente `PUT /propiedades/:id/ofertas/:operacion { listing_status }`
  (venta→sold, alquiler→rented). No existe "reservado".
- Rendimiento: `GET /crm/propiedades/:id/rendimiento` (`RendimientoSheet`). Ficha imprimible:
  `/propiedades/:id/ficha` (fuera del layout). CSV en `cartera.js` (BOM, `;`, sin fórmulas).

## Bandeja (`features/bandeja/`)

- `GET /crm/bandeja?filtro=todos|pendientes|chat|leads&q=` → `{ items: [{ tipo: chat|lead, id, nombre, propiedad_titulo, texto, at, pendiente, contacto_id, … }], pendientes }`.
  Chats: solo los de MIS anuncios del espacio; del interesado solo nombre e imagen (nunca correo/teléfono).
- `POST /crm/bandeja/chat/:id/contacto` (idempotente por conversación, guarda solo el nombre).
- Plantillas: `/crm/plantillas` (CRUD + `POST /:id/uso`), variables `{nombre}`, `{inmueble}`, `{agente}`,
  `{inmobiliaria}` reemplazadas en el cliente con `aplicarPlantilla()` (`plantillas.js`).
- El chat reutiliza `features/mensajes/api.js` (mensajes, enviar, marcar leída).

## Equipo (`features/equipo/`, solo espacio org)

- Reparto: `GET|PUT /crm/equipo/reparto { modo: manual|rotacion, agentes: [ids en orden] }`,
  `POST /crm/equipo/repartir-leads`. Con rotación, el admin que convierte un lead asigna al
  siguiente agente; un agente se lo queda.
- Metas: `GET /crm/equipo/metas?mes=aaaa-mm` (admin: todo el equipo; agente: solo él) y
  `PUT /crm/equipo/metas { mes, usuario_id, metricas: { clave: objetivo|null } }`. Lo logrado se calcula
  en el backend (visitas realizadas, captaciones, contactos nuevos, negocios ganados y su valor).
- `FilaMetas` se reutiliza en el panel (`TarjetaMisMetas`).

## Reportes (`features/reportes/`)

- Rango `desde`/`hasta` en días de Bogotá (por defecto "Este mes"; rangos rápidos en la página).
- Nuevos: `/crm/reportes/agentes` (solo org; el agente ve su fila), `/crm/reportes/inmuebles` (top 50 por
  vistas) y `/crm/reportes/respuesta` (primera respuesta al chat y tiempo hasta convertir leads).
- CSV siempre con `utils/csv.js` (`aCsv` + `descargarArchivo`): BOM, `;` y protección contra fórmulas.

## Importación (`features/importacion/`)

- El navegador lee el archivo: `.xlsx` con `read-excel-file/browser` (import dinámico, versión fijada)
  o CSV con `parsearCsv` (detecta `;`, `,` o tabulador). Encabezados → campos con `mapearEncabezados`
  (sinónimos en `CAMPOS`); el usuario corrige el mapeo.
- `POST /crm/importar/contactos { filas, modo: omitir|actualizar, autorizacion_confirmada, simular }` (máx. 500)
  y `POST /crm/importar/inmuebles { filas, simular }` (máx. 200). Cada fila lleva `fila` (línea del archivo).
  Respuesta `{ simulado, resumen: { creados, actualizados, omitidos, errores }, filas: [{ fila, resultado, mensaje, id }] }`.
- Primero siempre `simular: true` (vista previa); importar exige la casilla de Habeas Data en contactos.
- "Actualizar" solo completa datos vacíos y suma etiquetas; un agente no toca contactos de otro agente.
- Inmuebles: borradores `no_publicado`, sin fotos; ciudad por nombre (+ departamento si hay varias).

## Avisos (`features/notificaciones/`)

- Campana en `SiteHeader` (`CampanaNotificaciones`): contador cada 60 s y al volver a la pestaña,
  últimos 8 en un popover; página `/notificaciones` con "Sin leer" y "Ver anteriores" (cursor `antes`).
- API `/crm/notificaciones` (`?solo_no_leidas=1&limite=&antes=`) → `{ items, hay_mas, no_leidas, otros_espacios }`,
  `/contador`, `POST /:id/leida`, `POST /leer-todas`. Siempre del espacio activo (personal = sin organización).
- Abrir un aviso lo marca leído y navega a su `url` (ruta interna). Todas las claves de query empiezan por `crm-notif`.
- Iconos por tipo en `tipos.js` (`IconoTipo`).

## Habeas Data (`features/habeas/`)

- Ficha de contacto → `TarjetaDatosPersonales`: registrar/retirar autorización (`PUT /crm/contactos/:id/autorizacion
  { autorizado, origen }`), descargar sus datos en JSON (`GET /crm/contactos/:id/datos-personales`, derecho de acceso)
  y suprimir (`POST /crm/contactos/:id/suprimir { confirmar: true, motivo }`, solo personal o agency_admin; pide escribir
  SUPRIMIR). Rectificar = editar el contacto (el backend audita qué campos cambiaron).
- Registro: `GET /crm/habeas-data/registro?contacto_id=&pagina=` → página `/habeas-data` (enlace en Ajustes).
  Sin datos personales: solo acción, actor, id del contacto y conteos (`textoDetalle` en `textos.js`).

## Panel, ficha y pipeline (pulido Fase 3)

- `GET /crm/dashboard` trae además `crm: { contactos: { total, nuevos_30, sin_autorizacion }, oportunidades:
  { abiertas, valor_abierto, ganadas_mes }, tareas: { vencidas, hoy, pendientes } }` (tareas = las mías) y la serie
  de leads en días de Bogotá. Cada indicador del panel enlaza a su módulo.
- Tareas: `GET /crm/tareas` acepta `contacto_id`, `oportunidad_id` e `incluir_completadas=1`; `POST` acepta
  `oportunidad_id` (hereda el contacto). Componente `features/tareas/components/TarjetaTareas` (ficha y pipeline).
- Oportunidades: `GET /crm/oportunidades?contacto_id=` devuelve todas (abiertas, ganadas, perdidas); el listado
  normal trae `proxima_visita_at`, `tareas_pendientes`, `tareas_vencidas`. `TarjetaOportunidades` en la ficha.
- Visitas: filtro `oportunidad_id`; `VisitaDialog` acepta `inicial.oportunidad_id`.
- Pipeline: `/pipeline?oportunidad=ID` abre el detalle (visitas, tareas y cierre); `?crear=CONTACTO` abre el alta.
- Ficha de contacto: WhatsApp, llamar y correo en la cabecera; textos de tipo, origen y actividad en español.

## Pruebas locales

- `.claude/launch.json` (raíz del monorepo): `backend-crons-apagados` (puerto 3001, con
  `PAGOS_CRON_ENABLED`, `VISITAS_CRON_ENABLED`, `DEMANDAS_CRON_ENABLED`, `NOTIFICACIONES_CRON_ENABLED` y `CRON_BUSQUEDAS_ENABLED`
  en `false`, vía `.claude/crons-off.env`) y `crm` (5173).
- **El `.env` del backend apunta a la BD de producción**: no crear datos sin permiso y limpiarlos al terminar.
