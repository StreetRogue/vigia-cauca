# ============================
# STAGE 1 — Build (Vite)
# ============================
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias primero (aprovecha la caché de Docker)
COPY package.json package-lock.json ./
RUN npm ci

# Variables de Vite: se inyectan en tiempo de BUILD (import.meta.env.VITE_*)
# Valores por defecto vacíos => el frontend usa rutas relativas y nginx
# hace de reverse proxy hacia el gateway y keycloak (mismo origen, sin CORS).
ARG VITE_API_GATEWAY_URL=""
ARG VITE_KEYCLOAK_URL=""
ARG VITE_KEYCLOAK_REALM="security-realm-dev"
ARG VITE_KEYCLOAK_CLIENT_ID="api-gateway"

ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL \
    VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

# Compilar el bundle de producción
COPY . .
RUN npm run build

# ============================
# STAGE 2 — Runtime (nginx)
# ============================
FROM nginx:1.27-alpine

# Configuración del servidor (SPA + reverse proxy /api y /realms)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Bundle estático generado por Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
