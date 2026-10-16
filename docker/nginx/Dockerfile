# syntax=docker/dockerfile:1
# The public face of the server: builds the frontend once and serves it to both
# frontend hostnames (the app picks marketing or GeLearn from the hostname, see
# frontend/src/lib/host.ts), and proxies the CMS hostname to the backend.
# Build context is the repo root (docker-compose.yml); see the root .dockerignore.

# --- 1. Build the frontend -------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /src

# Husky's git hooks are for developers' machines; there's no .git here.
ENV HUSKY=0
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# Baked into the JavaScript at build time, so changing a hostname means rebuilding
# this image. An empty value would break the app, hence the check.
ARG VITE_API_BASE_URL
ARG VITE_GELEARN_URL
ARG VITE_MARKETING_URL
ARG VITE_GOOGLE_OAUTH_CLIENT_ID
RUN test -n "$VITE_API_BASE_URL" && test -n "$VITE_GELEARN_URL" && test -n "$VITE_MARKETING_URL" \
    || { echo "VITE_API_BASE_URL, VITE_GELEARN_URL and VITE_MARKETING_URL are required" >&2; exit 1; }
RUN npm run build

# --- 2. Serve it -------------------------------------------------------------------
FROM nginx:1.27-alpine

# The official image fills in ${...} in /etc/nginx/templates/*.template at startup,
# writing the result to /etc/nginx/conf.d/. Only these variables are filled in, so
# Nginx's own $host, $uri… are left alone.
ENV NGINX_ENVSUBST_FILTER="^(MARKETING_HOST|GELEARN_HOST|CMS_HOST|SEO_MODE|CERT_NAME)$" \
    SEO_MODE=hidden \
    CERT_NAME=genex

RUN rm /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html/*
COPY docker/nginx/conf.d/ /etc/nginx/conf.d/
COPY docker/nginx/snippets/ /etc/nginx/snippets/
COPY docker/nginx/templates/ /etc/nginx/templates/
COPY --from=frontend /src/dist /usr/share/nginx/html
