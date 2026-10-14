# TODO crm-inmobitwo — pendiente (fases 0–4 y auditoría ES→CO terminadas)

## Hecho (no reabrir)
- F0–F4 CRM completo: sesión/espacios, dashboard, propiedades, leads, contactos,
  tareas, pipeline Kanban, equipo, reportes. Build + lint OK.
- Migraciones 013/014/015 aplicadas en VPS. Tema shadcn por defecto.
  Sidebar: transparente, hover gris, activo negro + sombra.
- Auditoría ES→CO: provincia→departamento, solo Colombia en países,
  sin Idealista/RGPD/España, info-publicar CO, textos ES→CO, es-CO,
  mapa en Bogotá, seeds verificados, **todo en `alquiler`** (016 lista).
- VPS: `crm.inmobitwo.seventwo.tech` responde 200, resto de
  frontend-inmobitwo eliminado. Ramas de trabajo eliminadas (todo en `main`).
- `_conservar/` eliminado.

## Hecho sesión roles (2026-10-14, no reabrir)
- Roles fijados: superadmin=sudo, user=base web+CRM personal,
  agent=user en su org sin admin, agency_admin=user+admin de su org.
- Usuarios prueba (password `CrmPrueba123*`): user id=4, agent id=5,
  agency_admin id=6, org 1 `Inmobiliaria Prueba CRM` aprobada.
- Fix `GET /crm/dashboard` 500 (renumerado de `$n` en 6 bloques).
- Fix `PATCH /crm/contactos/:id/asignar` 500 (`whereEspacioPropio(crm,"c",3)`).
- Guards verificados: agent 403 en asignar/etapas, admin OK.

## Hecho módulo Admin (2026-10-14, no reabrir)
- `/admin` del portal ELIMINADO (`src/app/admin/`, `src/views/admin/`,
  `mapaRutas.js`, `RutaAdmin`, `items_admin`, entrada Rutas del sidebar,
  `/admin/` del robots). Cero referencias restantes.
- Nuevo módulo CRM `/admin` tras Portada, solo superadmin (`RutaSuperadmin`
  + sidebar `ShieldCheckIcon`): tabs por estado, crear, editar, aprobar,
  suspender, eliminar, dominio activar/pausar/quitar, enlace a ficha portal.
- Fix backend `aprobarOrganizacion`: nunca hacía el UPDATE (404 siempre).
  Ahora `UPDATE estado='aprobada' RETURNING *`.
- Botón "Administrar inmobiliarias" del portal apunta a `${URL_CRM}/admin`.
- Probado E2E (crear→aprobar→suspender→eliminar). Lint CRM+portal OK, build OK.

## Hecho módulo Mi inmobiliaria (2026-10-14, no reabrir)
- Ruta CRM `/mi-inmobiliaria` (todos los roles, incl. superadmin), sidebar
  al final. Sin orgs → crear (nace pendiente + agency_admin). Con org →
  datos, editar (solo admin), dominio solicitar/estado, tema, miembros
  (lectura + link a Equipo), resumen stats + links Propiedades/Reportes.
- Estadísticas/reportes NO se agregaron: ya existen en Reportes, Equipo y
  Dashboard del CRM (superan al panel del portal).
- `WorkspaceProvider` expone `recargarOrgs` (fetch extraído a función
  externa por la regla set-state-in-effect del lint).
- Probado: miembros/stats 200 como agent, editar agent 403, editar admin
  200, crear user 201 pendiente. Nota: solo superadmin puede eliminar orgs.
- Portal intacto (pendiente tu OK para migrar/borrar CrearOrganizacionForm,
  MiInmobiliariaPanel, AgentesPanel, EstadisticasPanel).

## Hecho módulo Dominios (2026-10-14, no reabrir)
- Remoto total: desde `/dominios` (solo superadmin, tras Admin) se ejecuta
  alta/baja en el VPS; el log llega en vivo (poll 2s) y al terminar en OK la
  BD pasa sola a `activo` / `sin_dominio`. Cloudflare sigue manual + check
  DNS previo que frena sin DNS.
- Scripts v2 no-interactivos en `backend/scripts-dominios/` (plantilla nginx
  proxy al Next :3000, certbot non-interactive, salida [OK]/[ERROR], exit
  codes). Viejos de `crm/scripts/` eliminados. OJO: FRONT_ROOT viejo
  corregido de paso (era dist estático, hoy es proxy).
- BD: `dominios_jobs` (018 aplicada + db.sql + orden.sql + drop_all.sql).
- Backend: `dominios.controllers.js` + `routes` + `lib/sshDominios.js`
  (una ejecución a la vez: 409; sin SSH conf: 503). Dockerfile +ssh/dig.
  Deploy sync scripts + mount `.ssh` + `.env.example` + `docs/DOMINIOS-VPS.md`
  (clave, sudoers, env). Falta una vez en VPS: pasos del doc.
- Probado: lectura 200, 403 no-sudo, 400/404 validaciones, 503 sin SSH.
  Ejecución real pendiente de la instalación VPS (pasos del doc).

## Hecho módulo Usuarios (2026-10-14, no reabrir)
- Ruta CRM `/usuarios` tras Dominios, solo superadmin (`RutaSuperadmin` +
  sidebar `UserCogIcon`): tabla con buscador + paginación servidor (nombre,
  correo/teléfono, rol, inmuebles propios, orgs con rol, registro/último
  login, estado + verificado) y Desbloquear con confirmación.
- Backend: `GET /usuarios` ahora solo superadmin con q/paginación/conteos;
  `PATCH /usuarios/:id/desbloquear` nuevo (resetea bloqueo + intentos).
- Seguridad (crítico, verificado 403): `PATCH /:id` solo propio o superadmin
  y `rol/bloqueado/intentos/email_verificado/provider` solo superadmin
  (cualquiera se hacía superadmin); `DELETE /:id` propio o superadmin.
  Portal intacto (perfil propio sigue 200; nadie usaba el DELETE).
- Probado: lista, bloqueo visible, desbloquear 200, escalada 403.
  Lint + build OK.

## Hecho baja + sección Inmobiliarias (2026-10-14, no reabrir)
- Backend `DELETE /organizaciones/:id/baja` (agency_admin propio o
  superadmin): 409 con {agentes, inmuebles} si hay pendientes, si no borra.
  `GET /organizaciones` suma miembros_activos/agentes_activos/inmuebles.
  NOTA: un intento borró la org 1 con agente activo y no se pudo explicar
  (fixtures restauradas id 1 + miembros; re-verificado 409 correcto). Si se
  repite un 200 indebido, avisar antes de usar en producción.
- Mi inmobiliaria: card Dar de baja (conteos en vivo, links a Equipo y a
  mis-anuncios del portal, botón bloqueado si hay pendientes, 2 diálogos).
- Nueva sección `/inmobiliarias` (solo superadmin, tras Usuarios): todas con
  estado, dominio, miembros, inmuebles, **suscripción hardcodeada
  "pendiente" (TODO pagos)**, aprobar/suspender/baja con 2 pasos.
- Admin/Eliminar ahora usa la baja con candados.
- Probado: 403 agent, 409 con agente, 200 limpia + 404 después. Lint+build OK.

## Hecho módulo Mensajes (2026-10-14, no reabrir)
- Ruta CRM `/mensajes` (todos los roles): lista con no-leídos + ventana
  (burbujas, hora, ✓✓, cargar anteriores, enviar con UUID, eliminar con
  confirmación, link a la ficha). Polling 10s/3s (sin socket en v1).
- Sidebar "Mensajes" ahora es NavLink interno con contador (fuera el
  redirect al portal). Sin cambios de backend (endpoints intactos).
- Probado ciclo completo (crear 201, enviar 201, listar, leer, eliminar;
  datos de prueba limpiados). Lint + build OK.

## Hecho fix Propiedades (2026-10-14, no reabrir)
- `GET /crm/propiedades` daba 500 a todos (`p.ciudad` no existe): ahora
  `LEFT JOIN cities` + búsqueda por título/ciudad/dirección/barrio.
  Verificado 200 con las 3 del superadmin + filtro q.
- Nota: el superadmin ve las suyas en personal; ver TODAS (sudo) queda para
  la puerta de entrada pendiente.

## Hecho wizard Propiedades completo (2026-10-14, no reabrir)
- (igual que antes, más correcciones:)
- Precio en paso 2 con precálculo (sugerido + evaluar veredicto), mismo
  orden que el portal. Barrios por ciudad (select + Otro manual).
- Mapa con error visible (si WebGL falla muestra el motivo en vez de nada).
  Geocode verificado 200. Si "Verificar mapa" sigue fallando, pedir el texto
  del toast/modal al usuario.
- Paridad portal (2026-10-14): precio en paso 2 (ya estaba), +número,
  +alquiler vacacional, +preferencia contacto (cómo + cuál número), org del
  espacio, +plot condicional lote/finca, +piso/interior, +antigüedad auto,
  +título sugerido visible, +★ principal en galería, rental en mapearApi.
  Verificado publicar con todos los campos nuevos (título autogenerado OK).
- Rutas `/propiedades/nuevo` y `/propiedades/:id/editar` (wizard 3 pasos
  shadcn): tipo/operación/org/precio, ubicación (depto→ciudad, geocode +
  mapa MapLibre con pin arrastrable), contacto con validación CO, detalles
  (dimensiones, estado, parqueadero, servicios, 6 flags + N:M por grupo,
  docs, precio, título sugerido, descripción con IA), fotos (principal,
  galería 10, planos, quitar actuales, continuar sin fotos).
- Lista: Nuevo, Editar interno, Publicar/Pausar, Eliminar con confirm,
  Ver en portal. Fuera "Editar en el portal".
- Backend: `agency_admin` puede editar/eliminar anuncios de su org
  (antes 403; verificado 200/200/403). Sin migración.
- Ofertas Fase 4: al crear van en `ofertas[]`, al editar precio suelto.
- Dep nueva: `maplibre-gl` (commitear package.json).
- Probado E2E sin fotos (crear 201, caracts, patch, delete limpiado).
  Fotos pendientes de probar con Rust media arriba (no corre en local).
  Lint + build OK.

## Pendiente sesión roles
1. **Puerta de entrada CRM**: hoy entra cualquiera logueado. Falta exigir
   ≥1 anuncio propio o membresía activa en org aprobada + página `Sin acceso`.
2. **Superadmin sudo**: `resolverEspacioCrm` le da 404 en orgs donde no es
   miembro. Falta rama `rol==='superadmin'` (org existe+aprobada → pasa).
3. **Datos prueba de aislamiento**: cargar propiedad/lead/contacto del admin
   y del agent mezclados y verificar qué ve cada rol (hoy todo en 0).
4. **Módulos uno a uno**: Dashboard → Leads → Contactos → Pipeline →
   Tareas → Propiedades → Equipo → Reportes → Ajustes.
5. **OJO módulo Propiedades**: `GET /crm/propiedades` selecciona `p.ciudad`
   y esa columna NO existe (ciudad va por `city_id`→`cities`). Mismo bug
   que tenía Portada. Corregir al entrar a ese módulo.

## Hecho módulo Portada (2026-10-14, no reabrir)
- Solo `superadmin`. Ruta CRM `/portada` entre Panel y Leads
  (`RutaSuperadmin` + item sidebar con `ImageIcon`).
- BD: tabla `portada_destacada` (una fila id=1), migración
  `017_portada.sql` aplicada + replicada en `db.sql` + `orden.sql`.
- Backend: `GET /portada` público, `GET /portada/buscar` y `PUT /portada`
  solo superadmin (`portada.controllers.js` + `portada.routes.js`).
  Etiqueta generada: `{tipo} en {ciudad} - $ {COP}`.
- Portal: `Hero.jsx` consume `/portada`; fallback `/propiedades/casa_verano.jpg`
  sin etiqueta (fuera el hardcode de Alicante/euros).
- Probado E2E: buscar, PUT, GET público, 400 imagen ajena, 404 id
  inexistente, 403 no-superadmin. Lint CRM+portal OK, build CRM OK.
- Destacado actual (prueba): propiedad 3, Casa en Barranquilla.
- Fix portal `UbicacionMapa.jsx`: revertido al original (el fallo WebGL era
  del navegador, verificado con página de diagnóstico ya borrada).

## Pendiente
1. **Sus commits/push** (web ~21 archivos, crm varios, backend 016+alquiler).
2. **Repo GitHub**: borrar `frontend-inmobitwo`, crear `crm-inmobitwo`,
   cambiar remote, push, copiar secrets. Verificar.
3. **Deploy backend + migración 016 juntos** (código `alquiler` ↔ columna/códigos).
   Comando VPS listo (ver chat).
4. **Probar CRM con datos reales**: panel, leads, propiedades, Kanban,
   permisos agent vs agency_admin, reportes, equipo.
5. **`deploy-crm.yml` con reintentos** (cambio local sin commitear).
6. **Fases futuras**: transacciones/comisiones, notificaciones, chat en CRM,
   importación CSV, IA, firma digital.
o estricto propio vive en /crm/*. ¿OK?