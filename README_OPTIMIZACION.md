# Optimización de Rendimiento — InmobiTwo

Guía de estándares y patrones para evitar re-renders en cascada y requests duplicados.

## Principios

1. **Dato estático ≠ request por red.** Si no cambia, vívelo en `src/data/` o precárgalo.
2. **Estado compartido sin contexto gigante.** Si solo lo usan pocos componentes, usa un store externo (`useSyncExternalStore`) o estado local — no el `AppContext`.
3. **Caché a nivel de módulo** para datos pedidos desde varios componentes a la vez (patrón `useDetalles.js`).
4. **Loader solo si tarda.** `SmartLoader` con delay por tipo de carga.

## Herramientas disponibles

| Archivo | Qué hace | Cuándo usarlo |
|---|---|---|
| `src/hooks/useAsyncState.js` | Estado asíncrono con caché (memoria + sessionStorage) | Datos dinámicos por filtros / detalle / listas |
| `src/hooks/usePreloadData.js` | Precarga estáticos en background (catálogos + geo) | Ya conectado en `App.jsx`; no hace falta tocarlo |
| `src/hooks/staticCache.js` | Caché compartida estática (usa `fetchStaticJson`) | Para leer catálogos/geo desde cualquier hook |
| `src/components/loader/SmartLoader.jsx` | Spinner con delay anti-flicker | Sustituir `"Cargando..."` crudo |
| `src/hooks/feedStore.js` | Store externo del feed (propiedades/paginación) | `useFeed()` en Principal / Admin / MisAnuncios |
| `src/hooks/favoritosStore.js` | Store externo de favoritos | `useFavoritosStore()` en tarjetas/botones |

## Matriz de decisión (por tipo de dato)

| Endpoint / dato | Frecuencia | Estático? | Estrategia | Delay spinner |
|---|---|---|---|---|
| `/catalogos/tipos-inmueble` | Nunca | Sí | `usePreloadData` (sessionStorage) | N/A |
| `/catalogos/estados`, `/catalogos/caracteristicas` | Nunca | Sí | `usePreloadData` | N/A |
| `/api/countries`, `/api/states`, `/api/cities` | Nunca | Sí | `usePreloadData` + `useGeo` (lee caché) | N/A |
| Barrios / estratos / operaciones / tipos locales | Nunca | Sí | `src/data/*` (0 requests) | N/A |
| `/propiedades/search-slugs` / `search-vivienda` | C/ filtro | No | `usePropertySearch` (local) + caché por combo | 300ms |
| `/propiedades/inicio` (feed) | 1x + paginación | No | `useFeed()` (store externo) | 300ms |
| `/propiedades/:id` (detalle) | On-demand | No | `cargarPropiedad` (caché módulo por id) | 200ms |
| `/propiedades/mis-anuncios` | On-demand | No | `useFeed()` + `cargarPropiedadesMisAnuncios` | 300ms |
| `/organizaciones/mias` | 1x/sesión | Parcial | Caché módulo + refresh on demand | 150ms |
| `/favoritos/mis-favoritos` | C/ toggle | No | `favoritosStore` + update optimista | 0ms |
| `/leads`, `/tracking/logs`, `/usuarios/:id` | On-demand | No | `useAsyncState` local | 150-300ms |

## Checklist para CADA nuevo endpoint

Antes de agregar un endpoint, responde:

1. **¿Estático o dinámico?** Si no cambia → `src/data/` o `usePreloadData`. Prohibido pedirlo on-demand.
2. **¿Ya existe en `/catalogos` + `/api/geo` o en `src/data/`?** Verifica antes de crear uno nuevo.
3. **¿Lo consume >1 componente?** → caché a nivel de módulo, NO contexto.
4. **¿Caché?** Memoria (módulo) para dinámicos por id; `sessionStorage` + timestamp para estáticos.
5. **¿SmartLoader?** delay por tipo: estáticos N/A, búsquedas 300ms, detalle 200ms, favoritos 0ms.
6. **¿Refetch manual?** `refetch(true)` (o `forceRefresh`) tras mutaciones.
7. **¿Error handling?** Respuesta ya normalizada `{ success, message, error }`; toast en el componente, nunca en el hook.

### Plantilla

```javascript
// 1) Estático → usePreloadData / staticCache
import { fetchStaticJson } from "@/hooks/staticCache";
const datos = await fetchStaticJson("/catalogos/mi-endpoint-estatico");

// 2) Dinámico → useAsyncState local
const { data, loading, error, refetch } = useAsyncState(
  async () => (await apiBackend("/mi-endpoint?filtro=x")).data,
  [filtroX],
);

// 3) SmartLoader
{loading && <SmartLoader delay={300} label="Cargando..." />}
```

## Reglas para el estado

- **NO** guardar en `AppContext` datos que cambian con frecuencia (listas, paginación, favoritos).
- `AppContext` queda reservado para: auth, formularios del wizard, modales, organizaciones, loader global, consentimiento.
- Para estado compartido entre pocos componentes: **store externo** (`useSyncExternalStore`) o **props**.
- Invalidar caché de módulo tras mutaciones (PATCH/POST/DELETE).

## Referencias de implementación

- Caché de módulo ya existente como modelo: `src/hooks/useDetalles.js` (`catalogoCache`, `tituloCache`, `featuresCache`).
- Store externo: `src/hooks/feedStore.js`, `src/hooks/favoritosStore.js`.
- Dedupe de `cargarMisOrganizaciones`: `src/hooks/useOrganizaciones.js`.
- Dedupe del wizard paso 1: `src/hooks/useGeo.js` (vía `staticCache`) y `src/hooks/useDatosBasicos.js`.
