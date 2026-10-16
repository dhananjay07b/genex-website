# syntax=docker/dockerfile:1
# The frontend image: builds the React app, then serves it with Nginx to both
# frontend hostnames (the app picks marketing or GeLearn from the hostname, see
# src/lib/host.ts). The same Nginx is the server's front door: HTTPS for every
# hostname, and the CMS hostname proxied to the backend (nginx/templates/).
# Build context is this folder (docker-compose.yml); see .dockerignore.

# --- 1. Build the frontend -------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /src

# Husky's git hooks are for developers' machines; there's no .git here.
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./

# Baked into the JavaScript at build time, so changing a hostname means rebuilding
# this image. An empty value would break the app, hence the check.
ARG VITE_API_BASE_URL
ARG VITE_GELEARN_URL
ARG VITE_MARKETING_URL
ARG VITE_GOOGLE_OAUTH_CLIENT_ID
RUN test -n "$VITE_API_BASE_URL" && test -n "$VITE_GELEARN_URL" && test -n "$VITE_MARKETING_URL" \
    || { echo "VITE_API_BASE_URL, VITE_GELEARN_URL and VITE_MARKETING_URL are required" >&2; exit 1; }
RUN npm run build

# --- 2. Serve React and proxy requests through Nginx -----------------------------
FROM nginx:1.27-alpine

ENV NGINX_ENVSUBST_FILTER="^(MARKETING_HOST|GELEARN_HOST|CMS_HOST|SEO_MODE|CERT_NAME)$" \
    SEO_MODE=hidden \
    CERT_NAME=genex

RUN rm /etc/nginx/conf.d/default.conf \
    && rm -rf /usr/share/nginx/html/*

COPY nginx/templates/ /etc/nginx/templates/
COPY --from=build /src/dist /usr/share/nginx/html
