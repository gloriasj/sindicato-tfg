# =====================================================
# Dockerfile - Plataforma de Gestión Sindical
# =====================================================
# Construcción multi-etapa:
#   1. build:   compila la app React con Vite
#   2. runtime: sirve los archivos estáticos con Nginx
#
# La imagen final pesa ~50 MB y solo contiene los
# archivos compilados, sin código fuente ni Node.
# =====================================================


# ---------- ETAPA 1: BUILD ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos primero los archivos de dependencias para
# aprovechar la caché de capas: si no cambian, npm ci
# no se vuelve a ejecutar en cada rebuild.
COPY package*.json ./

# 'npm ci' es como 'npm install' pero más estricto y
# rápido, ideal para entornos de CI/CD y Docker.
RUN npm ci

# Ahora copiamos el resto del código fuente
COPY . .

# Las variables de entorno se inyectan en build-time
# porque Vite las "fija" en los archivos JS al compilar.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Compilar la app: genera la carpeta /app/dist
RUN npm run build


# ---------- ETAPA 2: RUNTIME ----------
FROM nginx:alpine AS runtime

# Configuración personalizada de Nginx (soporta SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos solo los archivos compilados desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx escucha en el puerto 80 dentro del contenedor
EXPOSE 80

# Comando por defecto de la imagen de Nginx (lo dejamos explícito)
CMD ["nginx", "-g", "daemon off;"]
