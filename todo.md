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