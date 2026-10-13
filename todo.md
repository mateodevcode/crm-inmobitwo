INFORME FINAL — crm-inmobitwo (fases 0–4)
npm run build ✓ y npm run lint (0 errores) ✓ en el CRM. Backend con sintaxis verificada y rutas /crm/* recargadas en caliente (401 sin token = montadas). graphify update . ejecutado (638 nodos).
F0.1 — Verificación y respaldo
- Rama pre-crm-backup + tag pre-crm-backup (estado limpio HEAD) y rama de trabajo trabajo-crm en el repo del frontend.
- Tabla ruta antigua → web-inmobitwo: todo tiene equivalente salvo 3: /admin (solo existen admin/organizaciones, admin/rutas), modo organización resolve-tenant como ruta (la lógica vive en TenantProvider), y temas (solo lib temaRegistry, sin ruta). Correos apuntan a: /restablecer-contrasena?email= (recovery), /leads, /usuario/tus-datos/mis-busquedas, /busquedas/baja/:token — todas existen en web-inmobitwo.
- Referencias a actualizar detectadas en dev.sh, dev-stop.sh, CLAUDE.md raíz, nginx, CI, FRONTEND_URL.
F0.2 — Auditoría España→Colombia
- ~50 hallazgos presentacionales (info-publicar con "España/pisos/chalet/VPO/Rentalia/Okupas", +34, €, es-ES, móvil/ordenador, comentarios "Idealista/RGPD"). Corregido lo presentacional dentro del CRM nuevo (todo es código nuevo CO). Sin aprobar y sin tocar: columna organizaciones.provincia, enums/rutas alquiler (operation_options, tabs_busqueda, GET /tipos-alquiler), seeds con Madrid/Sevilla/España, y decisión alquiler vs arriendo.
F0.3 — Limpieza
- Respaldo en _conservar/ (api×3, config, guards, useAuth, login, OTP/acceso ref, 4 utils, nginx, CI, CLAUDE orig). Eliminados: todo src/ restante, public/, src-tauri/ completa, estilos viejos, deps Tauri/mapas/tiptap/gsap/headless.
- package.json → crm-inmobitwo (stack maestro), vite.config.js (alias @, puerto 5174 strictPort), jsconfig.json, index.html (lang="es", "CRM inmobitwo"), envs sin VITE_MAIN_HOSTS (+VITE_PORTAL_URL).
- ⚠️ Renombrado físico pendiente (tuyo): mv bloqueado (Device busy, hay 8 procesos node con la carpeta abierta). dev.sh/dev-stop.sh ya apuntan a crm-inmobitwo:5174. Pasos en docs/VPS-PASOS-MANUALES.md §7.
F0.4 — Base visual
- npx shadcn@latest init -t vite -b radix -p nova -y (no-interactivo tras crear src/index.css; tsx:false, Radix, src/index.css). dashboard-01 añadido: 33 archivos, 11 deps. Adaptado a Vite (fuera "use client", sonner sin next-themes, cn → @/lib/utils, sin next/*).
- Tema marca: --primary #010F10, sidebar/acento #FF1053, enlaces/charts #1944c5, fondo #FAFAFA, .dark, Montserrat fontsource. Componentes extra: textarea, dialog, popover, calendar, form (form no existe en el registro nova → creado manual).
F0.5 — Sesión/espacio/layout
- AuthProvider (claves access_token/usuario, refresh-cookie → GET /auth/me), WorkspaceProvider (GET /organizaciones/mias, filtra aprobadas, persiste crm_espacio, invalida queries), X-Crm-Espacio en ambos clientes, caducada → /login?origen=.
- Login email→password→OTP (check-email/login/verificar-otp/reenviar-otp; endpoints de verificación POST /usuarios/:id/enviar-codigo|confirmar-codigo {codigo} documentados). Registro/recovery → VITE_PORTAL_URL.
- CrmLayout (sidebar + WorkspaceSwitcher + grupo portal/mensajes con GET /chat/no-leidos c/60s + NavUser con avatar, modo oscuro, salir). Rutas + placeholders + RutaAdminOrg. Probado: dev 5174 → / y /login HTTP 200.
F0.6 — Infra
- Backend: sin cambios (cors 2.x refleja X-Crm-Espacio; cookie strict mismo-site). Solo añadir a FRONTEND_URL del servidor: https://crm.inmobitwo.seventwo.tech (+ http://localhost:5174 en dev).
- nginx/crm-inmobitwo.conf (CSP + seguridad), .github/workflows/deploy-crm.yml, CLAUDE.md reescrito, docs/VPS-PASOS-MANUALES.md, raíz CLAUDE.md/dev.sh/dev-stop.sh actualizados.
F1 — Lo que ya existe
- Backend (rama crm-fase-1, commit): crmEspacio.middleware.js, lib/crmPermisos.js, validations/crm.js, crm.controllers.js (GET /crm/dashboard con caché Redis 60s, /crm/propiedades, /crm/leads, paginación máx 100), fix seguridad PATCH /leads/:id (solo propiedad propia u org aprobada; 404 ajeno) + scripts/verificar-crm-leads.mjs (2 usuarios). Métrica sin fuente inventada: ninguna (vistas/favoritos/chat existen).
- Frontend: Dashboard (KPIs, área 30 días, por estado, últimos), Propiedades (búsqueda, estado, paginación, Ver/Editar→portal), Leads (filtros, Sheet, cambio estado optimista, tel/WhatsApp/mailto), MoneyText COP, fechas es-CO, telefono.js CO.
F2 — Núcleo
- migrations/013_crm_nucleo.sql + réplica en db.sql + orden.sql (contactos/actividades/tareas, CHECK espacio, BIGINT, únicos parciales, idempotencia por lead_id). ⚠️ Aplicación pendiente: psql falló (credenciales/ACL del remoto; no insistí). Sin aplicarla, los endpoints 500.
- Backend: CRUD contactos (archivar, 409 duplicado), actividades, tareas (hoy/vencidas/próximas), POST /crm/leads/:id/convertir idempotente, PATCH .../asignar (agency_admin). Frontend: tabla+filtros, Dialog RHF+zod+Habeas Data, ficha con timeline/tareas, Tareas con tabs, "Pasar a contactos" en Leads.
F3 — Pipeline
- migrations/014_crm_pipeline.sql (+ réplica; FKs diferidas fase 2). Siembra de 8 etapas al primer uso. Backend: CRUD etapas (admin; 409 con oportunidades), oportunidades, mover transaccional + actividad cambio_etapa, cerrar ganada/perdida. Frontend: Kanban @dnd-kit (Pointer/Touch/Keyboard, optimista+rollback, totales COP, filtros), Sheet con cerrar, crear desde contacto/lead, etapas en Ajustes.
F4 — Equipo y reportes
- Backend: crm.reportes.controllers.js (embudo, conversión+tasa, valor-ganado mensual, actividad/carga por agente, leads-origen; agent solo lo suyo) + POST /crm/reasignar transaccional (contactos+oportunidades+tareas; leads heredan propiedad, sin reasignación directa — decisión propia).
- Frontend: Equipo (tabla miembros+carga, roles, alta por email registrado, retirar, reasignación masiva), Reportes (filtros fecha/agente, gráficos recharts, exportar CSV).
Variables nuevas (nombres)
VITE_PORTAL_URL, crm_espacio (localStorage), header X-Crm-Espacio. Migraciones 013/014 sin nuevas env.
Dudas
1. ¿Aplico tú las migraciones 013/014 en dev y VPS, o te preparo el psql exacto?
2. alquiler vs arriendo y columna provincia: ¿lo decidimos antes del prompt de transacciones?
3. PATCH /leads/:id legacy quedó con paridad getLeads (agent ve leads de su org); el filtro estricto propio vive en /crm/*. ¿OK?