# Despliegue con Docker

Este proyecto incluye configuración para desplegarse en cualquier máquina
mediante Docker. La aplicación se compila con Vite y se sirve con Nginx
en una imagen ligera (~50 MB).

## Requisitos

- Docker Desktop instalado y arrancado.
- Archivo `.env` en la raíz del proyecto con las credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu-clave
```

## Construir y levantar

Desde la raíz del proyecto:

```bash
docker compose up --build
```

El primer build tarda 1–2 minutos. Después la app estará disponible en:

**http://localhost:8080**

## Detener

```bash
docker compose down
```

## Reconstruir tras cambios

```bash
docker compose up --build --force-recreate
```

## Arquitectura del Dockerfile

Se utiliza un build multi-etapa:

1. **Etapa `build`** (`node:20-alpine`): instala dependencias y compila la
   aplicación con `npm run build`. El resultado queda en `/app/dist`.
2. **Etapa `runtime`** (`nginx:alpine`): copia los archivos compilados y los
   sirve con Nginx, que es ligero y eficiente para servir SPAs.

La imagen final **no contiene** Node.js ni el código fuente, solo los
archivos estáticos finales.

## Notas

- Las variables de entorno se inyectan en build-time (no en runtime),
  porque Vite las "fija" en el bundle JavaScript al compilar.
- Si actualizas las credenciales de Supabase, hay que reconstruir la imagen.
- El servidor Nginx está configurado para soportar React Router: cualquier
  ruta no encontrada devuelve `index.html` para que el routing del cliente
  funcione tras refrescar la página.
