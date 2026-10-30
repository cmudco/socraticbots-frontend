# Socratic Bots frontend: build the SPA with Node, serve dist/ with nginx.
# VITE_* values are compiled into the bundle, so pass them as build args and rebuild to change them.

FROM node:22-alpine AS build

WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_URL=http://localhost:8001/api
ARG VITE_DARE_SOCKET_URL=http://localhost:8000
ARG VITE_DARE_FRONTEND_URL=http://localhost:5173
ARG VITE_SENTRY_DSN=
ARG VITE_SENTRY_ENVIRONMENT=production
ENV VITE_API_URL=$VITE_API_URL \
    VITE_DARE_SOCKET_URL=$VITE_DARE_SOCKET_URL \
    VITE_DARE_FRONTEND_URL=$VITE_DARE_FRONTEND_URL \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT

RUN npm run build


FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1
