# VPS — pasos manuales para crm.inmobitwo.seventwo.tech

Hacer en el VPS (no ejecutar desde la IA).

## 1. DNS

Crear registro A (o CNAME) de `crm.inmobitwo.seventwo.tech` al VPS.

## 2. Código

```bash
mkdir -p /srv/infra/inmobitwo
git clone <repo-crm>.git /srv/infra/inmobitwo/crm-inmobitwo
cd /srv/infra/inmobitwo/crm-inmobitwo
# crear .env.production desde .env.example:
#   VITE_API_URL=https://api.inmobitwo.seventwo.tech
#   VITE_PORTAL_URL=https://inmobitwo.seventwo.tech
```

El workflow `deploy-crm.yml` hace el resto (npm ci, build, nginx, certbot).

## 3. Certificado

Lo genera el workflow con certbot (`--nginx -d crm.inmobitwo.seventwo.tech`).
Verificar: `sudo certbot certificates`.

## 4. Nginx antiguo

Retirar `app.inmobitwo.seventwo.tech` o redirigirlo al CRM:

```bash
sudo rm /etc/nginx/sites-enabled/app-inmobitwo
# o redirigir: editar app-inmobitwo.conf con return 301 https://crm.inmobitwo.seventwo.tech$request_uri;
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Backend

Añadir a `FRONTEND_URL` en el `.env` del servidor:

```
https://crm.inmobitwo.seventwo.tech
```

Reiniciar el backend. No se cambian las opciones de la cookie `refresh_token`.

## 6. Limpieza

Cuando el CRM responda en `https://crm.inmobitwo.seventwo.tech/`:

```bash
rm -rf /srv/infra/inmobitwo/frontend-inmobitwo
```

## 7. Renombrado local pendiente

La carpeta local aún se llama `frontend-inmobitwo` (el renombrado a
`crm-inmobitwo` estaba bloqueado por procesos en uso). Para hacerlo:

1. Cerrar IDE, terminales y procesos (Vite, Tauri, cargo) con la carpeta abierta.
2. Renombrar `frontend-inmobitwo` → `crm-inmobitwo`.
3. `dev.sh` y `dev-stop.sh` ya apuntan a `crm-inmobitwo` y al puerto 5174.
